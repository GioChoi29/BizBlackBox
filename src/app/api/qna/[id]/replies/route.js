import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireActiveUser, safeObjectId } from "@/lib/auth";

// Add a reply to a question's conversation thread. Allowed for staff
// (anyone who isn't a student) and for the student who asked the question.
export async function POST(req, { params }) {
  const { error, user } = await requireActiveUser();
  if (error) return error;

  const { id } = await params;
  const oid = safeObjectId(id);
  if (!oid) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const { text } = await req.json();
  if (!text || !text.trim()) {
    return NextResponse.json({ error: "reply text required" }, { status: 400 });
  }

  const db = await getDb();
  const q = await db.collection("qna").findOne({ _id: oid });
  if (!q) return NextResponse.json({ error: "not found" }, { status: 404 });

  const uid = user._id.toString();
  const isStaff = user.role !== "student";
  const isAuthor = (q.byId && String(q.byId) === uid) || q.by === user.name;
  if (!isStaff && !isAuthor) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Identity (by/byId/role) is derived from the session, never the client.
  const reply = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: text.trim(),
    by: user.name,
    byId: uid,
    role: user.role,
    ts: Date.now(),
  };
  await db.collection("qna").updateOne({ _id: oid }, { $push: { replies: reply } });
  return NextResponse.json(reply);
}
