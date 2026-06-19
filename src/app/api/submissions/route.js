import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireActiveUser, isStaff } from "@/lib/auth";

export async function GET() {
  const { error } = await requireActiveUser();
  if (error) return error;
  const db = await getDb();
  const subs = await db.collection("submissions").find({}).sort({ teamId: 1 }).toArray();
  return NextResponse.json(subs);
}

export async function PATCH(req) {
  const { error, user } = await requireActiveUser();
  if (error) return error;

  const body = await req.json();
  const teamId = parseInt(body.teamId);
  if (!Number.isInteger(teamId)) {
    return NextResponse.json({ error: "teamId required" }, { status: 400 });
  }

  // Only event staff (admin/SM) or a member of that team can update the
  // team's submission state. The `by` field is derived from the session —
  // ignore any client-provided value to prevent identity spoofing.
  const sameTeam = user.teamId === teamId;
  if (!isStaff(user) && !sameTeam) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const db = await getDb();
  await db.collection("submissions").updateOne(
    { teamId },
    { $set: { submitted: !!body.submitted, by: user.name, ts: Date.now() } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}
