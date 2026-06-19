import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin, safeObjectId } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const { error, user } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const oid = safeObjectId(id);
  if (!oid) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const { a } = await req.json();

  const db = await getDb();
  // aBy is derived from session; clients can't claim someone else answered.
  const result = await db.collection("qna").updateOne(
    { _id: oid },
    { $set: { a: a || null, aBy: a ? user.name : null } }
  );
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
