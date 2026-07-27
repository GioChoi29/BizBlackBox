import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireActiveUser, requireAdmin } from "@/lib/auth";
import { bumpVersion } from "@/lib/version";

export async function GET() {
  const { error, user } = await requireActiveUser();
  if (error) return error;
  const db = await getDb();
  // Archived announcements are admin-only — everyone else never receives
  // them, so there's no client-side gate to bypass.
  const filter = user.role === "admin" ? {} : { archived: { $ne: true } };
  const items = await db.collection("announcements").find(filter).sort({ pinned: -1, ts: -1 }).toArray();
  return NextResponse.json(items.map((x) => ({ ...x, id: x._id.toString() })));
}

export async function POST(req) {
  const { error, user } = await requireAdmin();
  if (error) return error;
  const { title, body } = await req.json();
  if (!title || !title.trim() || !body || !body.trim()) {
    return NextResponse.json({ error: "title and body required" }, { status: 400 });
  }
  const db = await getDb();
  // author is set from session, not the client.
  const doc = {
    title: title.trim(),
    body: body.trim(),
    author: user.name,
    ts: Date.now(),
    pinned: false,
    archived: false,
  };
  const result = await db.collection("announcements").insertOne(doc);
  await bumpVersion("announcements");
  return NextResponse.json({ ...doc, id: result.insertedId.toString() });
}
