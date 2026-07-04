import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdmin, hashPassword, generatePassword } from "@/lib/auth";
import { sendCredentialsEmail } from "@/lib/email";
import { bumpVersion } from "@/lib/version";

export async function POST(_req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const tempPassword = generatePassword();
  const passwordHash = await hashPassword(tempPassword);

  const db = await getDb();
  const result = await db.collection("users").updateOne(
    { _id: new ObjectId(id) },
    { $set: { passwordHash, mustChangePassword: true } }
  );
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "user not found" }, { status: 404 });
  }
  // Invalidate any active sessions for this user so they're forced to sign in again.
  await db.collection("sessions").deleteMany({ userId: new ObjectId(id) });

  await bumpVersion("users");

  const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
  const emailResult = await sendCredentialsEmail({
    to: user.email,
    name: user.name,
    username: user.username,
    tempPassword,
    isReset: true,
  });

  return NextResponse.json({
    ok: true,
    initialPassword: tempPassword,
    emailSent: emailResult.sent,
    emailError: emailResult.error || null,
  });
}
