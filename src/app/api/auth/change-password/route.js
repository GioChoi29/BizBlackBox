import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  requireUser,
  verifyPassword,
  hashPassword,
  deleteSessionsForUser,
  createSession,
} from "@/lib/auth";

export async function POST(req) {
  const { error, user } = await requireUser();
  if (error) return error;

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "currentPassword and newPassword required" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "new password must be at least 8 characters" }, { status: 400 });
  }

  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  const newHash = await hashPassword(newPassword);
  const db = await getDb();
  await db.collection("users").updateOne(
    { _id: user._id },
    { $set: { passwordHash: newHash, mustChangePassword: false } }
  );

  // Invalidate every other session for this user (in case of hijack), then
  // issue a fresh one for the current browser. createSession overwrites the
  // existing cookie with the new token.
  await deleteSessionsForUser(user._id);
  await createSession(user._id);

  return NextResponse.json({ ok: true });
}
