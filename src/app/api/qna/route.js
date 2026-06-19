import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireActiveUser } from "@/lib/auth";

export async function GET() {
  const { error } = await requireActiveUser();
  if (error) return error;
  const db = await getDb();
  const items = await db.collection("qna").find({}).sort({ ts: -1 }).toArray();
  return NextResponse.json(items.map((x) => ({ ...x, id: x._id.toString() })));
}

export async function POST(req) {
  const { error, user } = await requireActiveUser();
  if (error) return error;

  const { q, category } = await req.json();
  if (!q || !q.trim()) {
    return NextResponse.json({ error: "question text required" }, { status: 400 });
  }

  const db = await getDb();
  // Identity is taken from the session; client-provided `by`/`tm` is ignored
  // so students can't pose as Admin or attribute questions to another team.
  const doc = {
    q: q.trim(),
    by: user.name,
    tm: user.teamId ?? null,
    a: null,
    aBy: null,
    ts: Date.now(),
    category: category || "general",
  };
  const result = await db.collection("qna").insertOne(doc);
  return NextResponse.json({ ...doc, id: result.insertedId.toString() });
}
