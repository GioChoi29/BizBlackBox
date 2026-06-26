import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireActiveUser, safeObjectId } from "@/lib/auth";

// A reply can be edited or deleted by its own author or by an admin.
function canModify(reply, user) {
  return (
    user.role === "admin" ||
    (reply.byId && String(reply.byId) === user._id.toString()) ||
    reply.by === user.name
  );
}

function canSeeQuestion(q, user) {
  return (
    user.role === "admin" ||
    q.visibility !== "private" ||
    (q.byId && String(q.byId) === user._id.toString()) ||
    q.by === user.name
  );
}

async function loadReply(db, oid, replyId, user) {
  const q = await db.collection("qna").findOne({ _id: oid });
  if (!q) return { err: NextResponse.json({ error: "not found" }, { status: 404 }) };
  // Don't reveal a reply on a private post the requester can't see.
  if (!canSeeQuestion(q, user)) return { err: NextResponse.json({ error: "not found" }, { status: 404 }) };
  const reply = (q.replies || []).find((r) => r.id === replyId);
  if (!reply) return { err: NextResponse.json({ error: "reply not found" }, { status: 404 }) };
  return { reply };
}

export async function PATCH(req, { params }) {
  const { error, user } = await requireActiveUser();
  if (error) return error;

  const { id, replyId } = await params;
  const oid = safeObjectId(id);
  if (!oid) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const { text } = await req.json();
  if (!text || !text.trim()) {
    return NextResponse.json({ error: "reply text required" }, { status: 400 });
  }

  const db = await getDb();
  const { reply, err } = await loadReply(db, oid, replyId, user);
  if (err) return err;
  if (!canModify(reply, user)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await db.collection("qna").updateOne(
    { _id: oid, "replies.id": replyId },
    { $set: { "replies.$.text": text.trim(), "replies.$.editedTs": Date.now() } }
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const { error, user } = await requireActiveUser();
  if (error) return error;

  const { id, replyId } = await params;
  const oid = safeObjectId(id);
  if (!oid) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const db = await getDb();
  const { reply, err } = await loadReply(db, oid, replyId, user);
  if (err) return err;
  if (!canModify(reply, user)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await db.collection("qna").updateOne({ _id: oid }, { $pull: { replies: { id: replyId } } });
  return NextResponse.json({ ok: true });
}
