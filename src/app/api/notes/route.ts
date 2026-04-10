import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calendarNotes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET() {
  const notes = await db.select().from(calendarNotes).orderBy(calendarNotes.date);
  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  const body = await request.json();
  const id = nanoid();
  await db.insert(calendarNotes).values({
    id,
    date: body.date,
    content: body.content,
    emoji: body.emoji || "📌",
    createdAt: new Date(),
  });
  return NextResponse.json({ id }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  await db.delete(calendarNotes).where(eq(calendarNotes.id, id));
  return NextResponse.json({ success: true });
}
