import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdmin, safeObjectId, ROLES, canonicalUsername } from "@/lib/auth";
import { bumpVersion } from "@/lib/version";

const ALLOWED_FIELDS = ["name", "email", "phone", "role", "teamId", "username", "room", "floor"];

export async function PATCH(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const oid = safeObjectId(id);
  if (!oid) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const body = await req.json();
  const update = {};
  for (const k of ALLOWED_FIELDS) {
    if (k in body) update[k] = body[k];
  }

  if ("role" in update && !ROLES.includes(update.role)) {
    return NextResponse.json({ error: "invalid role" }, { status: 400 });
  }
  if ("username" in update) {
    update.username = canonicalUsername(update.username);
    if (!update.username) {
      return NextResponse.json({ error: "username cannot be blank" }, { status: 400 });
    }
  }
  if ("teamId" in update) {
    if (update.teamId === "" || update.teamId == null) {
      update.teamId = null;
    } else {
      const n = parseInt(update.teamId);
      if (!Number.isInteger(n)) {
        return NextResponse.json({ error: "invalid teamId" }, { status: 400 });
      }
      update.teamId = n;
    }
  }
  if ("email" in update && update.email === "") update.email = null;
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "no valid fields to update" }, { status: 400 });
  }

  const db = await getDb();

  // Like POST: if a team is being assigned, make sure it exists before writing.
  if ("teamId" in update && update.teamId != null) {
    const teamExists = await db.collection("teams").countDocuments({ _id: update.teamId });
    if (!teamExists) {
      return NextResponse.json({ error: "team not found" }, { status: 400 });
    }
  }

  const existing = await db.collection("users").findOne({ _id: oid });
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  try {
    await db.collection("users").updateOne({ _id: oid }, { $set: update });
  } catch (e) {
    if (e.code === 11000) {
      return NextResponse.json({ error: "username already exists" }, { status: 409 });
    }
    throw e;
  }

  // Cascade team/role changes onto the embedded roster entry so Teams,
  // Students, Check-in, and Rooms agree with the Users tab.
  if ("teamId" in update || "role" in update) {
    const effRole = update.role ?? existing.role;
    const effTeamId = "teamId" in update ? update.teamId : existing.teamId ?? null;
    const holder = await db.collection("teams").findOne(
      { "students.userId": id },
      { projection: { _id: 1, "students.$": 1 } }
    );
    if (effRole !== "student" || effTeamId == null) {
      // No longer a student on a team — drop the roster entry.
      if (holder) {
        await db.collection("teams").updateOne(
          { _id: holder._id },
          { $pull: { students: { userId: id } } }
        );
      }
    } else if (holder && holder._id !== effTeamId) {
      // Team changed — move the entry, preserving check-in + contact data.
      const entry = holder.students[0];
      await db.collection("teams").updateOne(
        { _id: holder._id },
        { $pull: { students: { userId: id } } }
      );
      await db.collection("teams").updateOne(
        { _id: effTeamId },
        { $push: { students: entry } }
      );
    } else if (!holder) {
      // Student on a team with no roster entry yet (e.g. team assigned after
      // creation) — create one, same shape as POST /api/users.
      await db.collection("teams").updateOne(
        { _id: effTeamId },
        {
          $push: {
            students: {
              id: `${effTeamId}-${Date.now()}`,
              name: update.name ?? existing.name,
              checkedIn: false,
              phone: ("phone" in update ? update.phone : existing.phone) || null,
              email: ("email" in update ? update.email : existing.email) || null,
              transport: null,
              insurance: null,
              emergencyName: null,
              emergencyRel: null,
              emergencyPhone: null,
              userId: id,
            },
          },
        }
      );
    }
  }

  // Keep the linked roster entry's contact fields in sync with the user record
  // so the Students tab shows the same name / phone / email entered on the
  // Users tab.
  const rosterSync = {};
  if (update.name !== undefined) rosterSync["students.$[s].name"] = update.name;
  if (update.phone !== undefined) rosterSync["students.$[s].phone"] = update.phone || null;
  if (update.email !== undefined) rosterSync["students.$[s].email"] = update.email || null;
  if (Object.keys(rosterSync).length > 0) {
    await db.collection("teams").updateMany(
      { "students.userId": id },
      { $set: rosterSync },
      { arrayFilters: [{ "s.userId": id }] }
    );
  }
  await bumpVersion("users", "teams");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const db = await getDb();
  const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Cascade: remove the linked roster entry from any team. Students created via
  // Admin Console get `userId` stamped on the embedded entry (see /api/users POST).
  await db.collection("teams").updateMany(
    { "students.userId": id },
    { $pull: { students: { userId: id } } }
  );
  // Invalidate any active sessions for this account.
  try { await db.collection("sessions").deleteMany({ userId: new ObjectId(id) }); } catch {}

  await bumpVersion("users", "teams");
  return NextResponse.json({ ok: true });
}
