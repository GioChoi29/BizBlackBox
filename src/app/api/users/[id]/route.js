import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdmin, safeObjectId, ROLES, canonicalUsername } from "@/lib/auth";

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
  try {
    const result = await db.collection("users").updateOne({ _id: oid }, { $set: update });
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
  } catch (e) {
    if (e.code === 11000) {
      return NextResponse.json({ error: "username already exists" }, { status: 409 });
    }
    throw e;
  }
  // Keep the linked roster entry's display name in sync so the Students tab
  // (and check-in, teams, etc.) always show the student's real name.
  if (update.name !== undefined) {
    await db.collection("teams").updateMany(
      { "students.userId": id },
      { $set: { "students.$[s].name": update.name } },
      { arrayFilters: [{ "s.userId": id }] }
    );
  }
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

  return NextResponse.json({ ok: true });
}
