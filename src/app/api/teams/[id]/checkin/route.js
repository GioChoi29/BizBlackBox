import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireActiveUser, isStaff } from "@/lib/auth";

// Only event staff (admin / SM) or the JM of this specific team can mark
// students checked-in. Students never check themselves in.
export async function PATCH(req, { params }) {
  const { error, user } = await requireActiveUser();
  if (error) return error;

  const { id } = await params;
  const teamId = parseInt(id);
  if (!Number.isInteger(teamId)) {
    return NextResponse.json({ error: "invalid team id" }, { status: 400 });
  }

  const isOwnJM = user.role === "junior_mentor" && user.teamId === teamId;
  if (!isStaff(user) && !isOwnJM) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
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
  return NextResponse.json({ ok: true });
}
