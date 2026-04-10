import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { plans, tasks, steps } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const allTasks = await db
    .select({
      id: tasks.id,
      planId: tasks.planId,
      title: tasks.title,
      description: tasks.description,
      category: tasks.category,
      priority: tasks.priority,
      status: tasks.status,
      sortOrder: tasks.sortOrder,
      scheduledTime: tasks.scheduledTime,
      duration: tasks.duration,
      createdAt: tasks.createdAt,
      planTitle: plans.title,
    })
    .from(tasks)
    .innerJoin(plans, eq(tasks.planId, plans.id))
    .orderBy(tasks.sortOrder);

  // Fetch steps for each task
  const result = [];
  for (const task of allTasks) {
    const taskSteps = await db
      .select()
      .from(steps)
      .where(eq(steps.taskId, task.id))
      .orderBy(steps.sortOrder);

    result.push({
      ...task,
      steps: taskSteps.map((s) => ({
        id: s.id,
        content: s.content,
        isComplete: s.isComplete,
        sortOrder: s.sortOrder,
      })),
    });
  }

  return NextResponse.json(result);
}

export async function PUT(request: Request) {
  const body = await request.json();

  if (body.taskId) {
    const updates: Record<string, unknown> = {};
    if (body.status) updates.status = body.status;
    if (body.priority) updates.priority = body.priority;
    if (body.scheduledTime !== undefined) updates.scheduledTime = body.scheduledTime || null;
    if (body.duration !== undefined) updates.duration = body.duration || null;

    if (Object.keys(updates).length > 0) {
      await db.update(tasks).set(updates).where(eq(tasks.id, body.taskId));
      const task = await db.select({ planId: tasks.planId }).from(tasks).where(eq(tasks.id, body.taskId));
      if (task[0]) {
        await db.update(plans).set({ updatedAt: new Date() }).where(eq(plans.id, task[0].planId));
      }
    }
  }

  if (body.stepId !== undefined && body.isComplete !== undefined) {
    await db
      .update(steps)
      .set({ isComplete: body.isComplete })
      .where(eq(steps.id, body.stepId));
  }

  return NextResponse.json({ success: true });
}
