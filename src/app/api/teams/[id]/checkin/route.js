import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { bumpVersion } from "@/lib/version";

// Admin-only: only an admin can mark students checked-in. Mentors and students
// get a read-only view of attendance in the UI; they never write here.
export async function PATCH(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const teamId = parseInt(id);
  if (!Number.isInteger(teamId)) {
    return NextResponse.json({ error: "invalid team id" }, { status: 400 });
  }

  const { studentId, checkedIn } = await req.json();
  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection("teams").updateOne(
    { _id: teamId, "students.id": studentId },
    { $set: { "students.$.checkedIn": !!checkedIn } }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "team or student not found" }, { status: 404 });
  }
  await bumpVersion("teams");
  return NextResponse.json({ ok: true });
}
