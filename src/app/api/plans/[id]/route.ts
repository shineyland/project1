import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { plans, tasks, steps } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { SavedCategory } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const plan = await db.query.plans.findFirst({
    where: eq(plans.id, id),
  });

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const allTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.planId, id))
    .orderBy(tasks.sortOrder);

  const allSteps = await db
    .select()
    .from(steps)
    .where(
      eq(
        steps.taskId,
        allTasks.length > 0 ? allTasks[0].id : ""
      )
    );

  // Fetch all steps for all tasks
  const stepsByTaskId: Record<string, typeof allSteps> = {};
  for (const task of allTasks) {
    const taskSteps = await db
      .select()
      .from(steps)
      .where(eq(steps.taskId, task.id))
      .orderBy(steps.sortOrder);
    stepsByTaskId[task.id] = taskSteps;
  }

  // Group tasks by category
  const categoryMap = new Map<string, SavedCategory>();
  for (const task of allTasks) {
    const catName = task.category || "Uncategorized";
    if (!categoryMap.has(catName)) {
      categoryMap.set(catName, { name: catName, tasks: [] });
    }
    categoryMap.get(catName)!.tasks.push({
      id: task.id,
      title: task.title,
      description: task.description,
      category: catName,
      priority: task.priority as "high" | "medium" | "low",
      status: task.status as "todo" | "in_progress" | "done",
      sortOrder: task.sortOrder,
      steps: (stepsByTaskId[task.id] || []).map((s) => ({
        id: s.id,
        content: s.content,
        isComplete: s.isComplete,
        sortOrder: s.sortOrder,
      })),
    });
  }

  return NextResponse.json({
    id: plan.id,
    rawInput: plan.rawInput,
    title: plan.title,
    summary: plan.summary,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    categories: Array.from(categoryMap.values()),
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // Update task status
  if (body.taskId && body.status) {
    await db
      .update(tasks)
      .set({ status: body.status })
      .where(eq(tasks.id, body.taskId));
  }

  // Toggle step completion
  if (body.stepId !== undefined && body.isComplete !== undefined) {
    await db
      .update(steps)
      .set({ isComplete: body.isComplete })
      .where(eq(steps.id, body.stepId));
  }

  // Update plan timestamp
  await db
    .update(plans)
    .set({ updatedAt: new Date() })
    .where(eq(plans.id, id));

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Delete steps for all tasks in this plan
  const planTasks = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(eq(tasks.planId, id));

  for (const task of planTasks) {
    await db.delete(steps).where(eq(steps.taskId, task.id));
  }

  await db.delete(tasks).where(eq(tasks.planId, id));
  await db.delete(plans).where(eq(plans.id, id));

  return NextResponse.json({ success: true });
}
