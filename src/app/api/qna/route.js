import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireActiveUser } from "@/lib/auth";

export async function GET() {
  const { error, user } = await requireActiveUser();
  if (error) return error;
  const db = await getDb();
  // Visibility: admins see everything; everyone else sees public questions plus
  // their own private ones. Enforced here so private posts never reach a client
  // that shouldn't see them. ($ne "private" also covers legacy docs with no
  // visibility field.)
  const uid = user._id.toString();
  const filter =
    user.role === "admin"
      ? {}
      : { $or: [{ visibility: { $ne: "private" } }, { byId: uid }, { by: user.name }] };
  const items = await db.collection("qna").find(filter).sort({ ts: -1 }).toArray();
  return NextResponse.json(items.map((x) => ({ ...x, id: x._id.toString() })));
}

export async function POST(req) {
  const { error, user } = await requireActiveUser();
  if (error) return error;

  const body = await req.json();
  const title = (body.title || body.q || "").trim();
  if (!title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const db = await getDb();
  // Identity is taken from the session; client-provided `by`/`tm` is ignored
  // so students can't pose as Admin or attribute questions to another team.
  const doc = {
    title,
    body: (body.body || "").trim(),
    by: user.name,
    byId: user._id.toString(),
    tm: user.teamId ?? null,
    ts: Date.now(),
    category: body.category || "general",
    visibility: body.visibility === "private" ? "private" : "public",
    resolved: false,
    replies: [],
  };
  const result = await db.collection("qna").insertOne(doc);
  return NextResponse.json({ ...doc, id: result.insertedId.toString() });
}
