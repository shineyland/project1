import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { plans, tasks, steps } from "@/lib/db/schema";
import { desc, eq, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { StructuredPlan } from "@/lib/types";

export async function GET() {
  const allPlans = await db
    .select({
      id: plans.id,
      title: plans.title,
      summary: plans.summary,
      createdAt: plans.createdAt,
      updatedAt: plans.updatedAt,
      taskCount: count(tasks.id),
    })
    .from(plans)
    .leftJoin(tasks, eq(plans.id, tasks.planId))
    .groupBy(plans.id)
    .orderBy(desc(plans.createdAt));

  return NextResponse.json(allPlans);
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
