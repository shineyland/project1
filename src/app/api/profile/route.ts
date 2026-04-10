import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userProfile } from "@/lib/db/schema";
import { nanoid } from "nanoid";

export async function GET() {
  const profiles = await db.select().from(userProfile);
  if (profiles.length === 0) {
    return NextResponse.json(null);
  }
  return NextResponse.json(profiles[0]);
}

export async function POST(request: Request) {
  const body = await request.json();
  const profiles = await db.select().from(userProfile);

  if (profiles.length > 0) {
    // Update existing
    const updates: Record<string, string> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.avatarColor !== undefined) updates.avatarColor = body.avatarColor;
    await db.update(userProfile).set(updates);
    return NextResponse.json({ success: true });
  } else {
    // Create new
    const id = nanoid();
    await db.insert(userProfile).values({
      id,
      name: body.name || "User",
      avatarColor: body.avatarColor || "#7c3aed",
      createdAt: new Date(),
    });
    return NextResponse.json({ id }, { status: 201 });
  }
}
