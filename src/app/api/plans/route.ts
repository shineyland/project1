import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { plans, tasks, steps } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { StructuredPlan } from "@/lib/types";

export async function GET() {
  const allPlans = await db.select().from(plans).orderBy(desc(plans.createdAt));

  const result = [];
  for (const plan of allPlans) {
    const planTasks = await db.select().from(tasks).where(eq(tasks.planId, plan.id));
    const totalTasks = planTasks.length;
    const doneTasks = planTasks.filter((t) => t.status === "done").length;
    const inProgressTasks = planTasks.filter((t) => t.status === "in_progress").length;
    const highPriority = planTasks.filter((t) => t.priority === "high" && t.status !== "done").length;

    // Get unique categories
    const categories = [...new Set(planTasks.map((t) => t.category).filter(Boolean))];

    // Get upcoming tasks (not done, ordered by priority)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const upcoming = planTasks
      .filter((t) => t.status !== "done")
      .sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2))
      .slice(0, 3)
      .map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        status: t.status,
        category: t.category,
      }));

    result.push({
      id: plan.id,
      title: plan.title,
      summary: plan.summary,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      taskCount: totalTasks,
      doneTasks,
      inProgressTasks,
      highPriority,
      categories,
      upcoming,
    });
  }

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { rawInput, plan } = body as { rawInput: string; plan: StructuredPlan };

  if (!rawInput || !plan) {
    return NextResponse.json(
      { error: "rawInput and plan are required" },
      { status: 400 }
    );
  }

  const now = new Date();
  const planId = nanoid();

  await db.insert(plans).values({
    id: planId,
    rawInput,
    title: plan.title,
    summary: plan.summary,
    createdAt: now,
    updatedAt: now,
  });

  let sortOrder = 0;
  for (const category of plan.categories) {
    for (const task of category.tasks) {
      const taskId = nanoid();
      await db.insert(tasks).values({
        id: taskId,
        planId,
        title: task.title,
        description: task.description,
        category: category.name,
        priority: task.priority,
        status: "todo",
        sortOrder: sortOrder++,
        scheduledTime: task.scheduledTime || null,
        duration: task.duration || null,
        createdAt: now,
      });

      for (let i = 0; i < task.steps.length; i++) {
        await db.insert(steps).values({
          id: nanoid(),
          taskId,
          content: task.steps[i],
          isComplete: false,
          sortOrder: i,
        });
      }
    }
  }

  return NextResponse.json({ id: planId }, { status: 201 });
}
