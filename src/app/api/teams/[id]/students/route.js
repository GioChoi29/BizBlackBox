import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { bumpVersion } from "@/lib/version";

export async function POST(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const teamId = parseInt(id);
  const { name, phone, email, transport, insurance, emergencyName, emergencyRel, emergencyPhone } = await req.json();

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const db = await getDb();
  const team = await db.collection("teams").findOne({ _id: teamId });
  if (!team) return NextResponse.json({ error: "team not found" }, { status: 404 });

  const student = {
    id: `${teamId}-${Date.now()}`,
    name: name.trim(),
    checkedIn: false,
    phone: phone || null,
    email: email || null,
    transport: transport || null,
    insurance: insurance || null,
    emergencyName: emergencyName || null,
    emergencyRel: emergencyRel || null,
    emergencyPhone: emergencyPhone || null,
  };

  await db.collection("teams").updateOne(
    { _id: teamId },
    { $push: { students: student } }
  );
  await bumpVersion("teams");
  return NextResponse.json(student);
}
