import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireActiveUser, isStaff } from "@/lib/auth";

// Fields on each embedded student doc that count as PII. Stripped for any
// requester who isn't event staff (admin / SM) or the JM of that team.
const STUDENT_PII = [
  "phone",
  "email",
  "transport",
  "insurance",
  "emergencyName",
  "emergencyRel",
  "emergencyPhone",
];

function projectStudent(student, allowPII) {
  if (allowPII) return student;
  const out = { ...student };
  for (const k of STUDENT_PII) delete out[k];
  return out;
}

export async function GET() {
  const { error, user } = await requireActiveUser();
  if (error) return error;

  const db = await getDb();
  const teams = await db.collection("teams").find({}).sort({ _id: 1 }).toArray();

  const staff = isStaff(user);
  const myTeam = user.teamId;

  const filtered = teams.map((t) => {
    const allowPII = staff || (user.role === "junior_mentor" && t._id === myTeam);
    return {
      ...t,
      id: t._id,
      students: (t.students || []).map((st) => projectStudent(st, allowPII)),
    };
  });
  return NextResponse.json(filtered);
}
