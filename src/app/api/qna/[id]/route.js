import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireActiveUser, requireAdmin, safeObjectId } from "@/lib/auth";

// A private question is visible only to its author and to admins.
export function canSeeQuestion(q, user) {
  return (
    user.role === "admin" ||
    q.visibility !== "private" ||
    (q.byId && String(q.byId) === user._id.toString()) ||
    q.by === user.name
  );
}

export async function PATCH(req, { params }) {
  const { error, user } = await requireActiveUser();
  if (error) return error;

  const { id } = await params;
  const oid = safeObjectId(id);
  if (!oid) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const db = await getDb();
  const q = await db.collection("qna").findOne({ _id: oid });
  if (!q) return NextResponse.json({ error: "not found" }, { status: 404 });
  // Don't reveal the existence of a private post the requester can't see.
  if (!canSeeQuestion(q, user)) return NextResponse.json({ error: "not found" }, { status: 404 });

  const uid = user._id.toString();
  const isAdmin = user.role === "admin";
  const isAuthor = (q.byId && String(q.byId) === uid) || q.by === user.name;
  const body = await req.json();
  const set = {};

  // Only an admin can flip a question between public and private.
  if ("visibility" in body) {
    if (!isAdmin) return NextResponse.json({ error: "only an admin can change visibility" }, { status: 403 });
    set.visibility = body.visibility === "private" ? "private" : "public";
  }
  // Resolve/unresolve: the asker, any staff member, or an admin.
  if ("resolved" in body) {
    if (!(isAdmin || isAuthor || user.role !== "student")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    set.resolved = !!body.resolved;
  }
  // Edit the post itself: the author or an admin.
  if ("title" in body || "body" in body || "category" in body) {
    if (!(isAdmin || isAuthor)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    if ("title" in body) {
      const t = (body.title || "").trim();
      if (!t) return NextResponse.json({ error: "title cannot be blank" }, { status: 400 });
      set.title = t;
    }
    if ("body" in body) set.body = (body.body || "").trim();
    if ("category" in body) set.category = body.category || "general";
  }

  if (Object.keys(set).length === 0) {
    return NextResponse.json({ error: "no valid fields to update" }, { status: 400 });
  }
  await db.collection("qna").updateOne({ _id: oid }, { $set: set });
  return NextResponse.json({ ok: true });
}

// Admin-only: delete an entire question and its conversation thread.
export async function DELETE(_req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const oid = safeObjectId(id);
  if (!oid) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const db = await getDb();
  const result = await db.collection("qna").deleteOne({ _id: oid });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
