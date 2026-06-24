import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";

const ALLOWED_FIELDS = [
  "name",
  "phone",
  "email",
  "transport",
  "insurance",
  "emergencyName",
  "emergencyRel",
  "emergencyPhone",
  "room",
  "floor",
];

export async function DELETE(_req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id, studentId } = await params;
  const teamId = parseInt(id);

  const db = await getDb();
  // Look up the linked userId before removing the roster entry so we can cascade.
  const team = await db.collection("teams").findOne(
    { _id: teamId, "students.id": studentId },
    { projection: { "students.$": 1 } }
  );
  const linkedUserId = team?.students?.[0]?.userId || null;

  const result = await db.collection("teams").updateOne(
    { _id: teamId },
    { $pull: { students: { id: studentId } } }
  );
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "team not found" }, { status: 404 });
  }
  if (result.modifiedCount === 0) {
    return NextResponse.json({ error: "student not found" }, { status: 404 });
  }

  // Cascade: delete the linked login user (if any) and their sessions.
  if (linkedUserId) {
    try {
      const oid = new ObjectId(linkedUserId);
      await db.collection("users").deleteOne({ _id: oid });
      await db.collection("sessions").deleteMany({ userId: oid });
    } catch {}
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id, studentId } = await params;
  const teamId = parseInt(id);
  const body = await req.json();

  const $set = {};
  for (const k of ALLOWED_FIELDS) {
    if (k in body) $set[`students.$.${k}`] = body[k] === "" ? null : body[k];
  }
  if (Object.keys($set).length === 0) {
    return NextResponse.json({ error: "no valid fields to update" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection("teams").updateOne(
    { _id: teamId, "students.id": studentId },
    { $set }
  );
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "team or student not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
