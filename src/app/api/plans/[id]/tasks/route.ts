import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, steps, plans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// Add a new task to a plan
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: planId } = await params;
  const body = await request.json();

  const existingTasks = await db.select().from(tasks).where(eq(tasks.planId, planId));
  const maxOrder = existingTasks.reduce((max, t) => Math.max(max, t.sortOrder), -1);

  const taskId = nanoid();
  await db.insert(tasks).values({
    id: taskId,
    planId,
    title: body.title,
    description: body.description || null,
    category: body.category || null,
    priority: body.priority || "medium",
    status: "todo",
    sortOrder: maxOrder + 1,
    createdAt: new Date(),
  });

  await db.update(plans).set({ updatedAt: new Date() }).where(eq(plans.id, planId));

  return NextResponse.json({ id: taskId }, { status: 201 });
}

// Update task (edit title, reorder) or delete task
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: planId } = await params;
  const body = await request.json();

  if (body.action === "reorder" && body.taskIds) {
    // Reorder tasks
    for (let i = 0; i < body.taskIds.length; i++) {
      await db.update(tasks).set({ sortOrder: i }).where(eq(tasks.id, body.taskIds[i]));
    }
  }

  if (body.action === "edit" && body.taskId) {
    const updates: Record<string, string> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.category !== undefined) updates.category = body.category;
    if (Object.keys(updates).length > 0) {
      await db.update(tasks).set(updates).where(eq(tasks.id, body.taskId));
    }
  }

  if (body.action === "delete" && body.taskId) {
    // Delete steps first, then task
    await db.delete(steps).where(eq(steps.taskId, body.taskId));
    await db.delete(tasks).where(eq(tasks.id, body.taskId));
  }

  await db.update(plans).set({ updatedAt: new Date() }).where(eq(plans.id, planId));

  return NextResponse.json({ success: true });
}
