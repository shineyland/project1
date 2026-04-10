import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dailyCompletions, tasks } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export async function GET() {
  // Get all completions ordered by date
  const completions = await db
    .select()
    .from(dailyCompletions)
    .orderBy(desc(dailyCompletions.date));

  // Calculate current streak
  let streak = 0;
  const today = todayStr();
  const dates = completions.filter((c) => c.allDone).map((c) => c.date);

  // Check if today is completed
  const todayDone = dates.includes(today);

  // Count consecutive days backwards
  const startDate = new Date();
  if (!todayDone) {
    startDate.setDate(startDate.getDate() - 1);
  }

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split("T")[0];
    if (dates.includes(dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  if (todayDone) streak = Math.max(streak, 1);

  // Best streak
  let bestStreak = 0;
  let currentRun = 0;
  const sortedDates = [...dates].sort();
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      currentRun = 1;
    } else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      currentRun = diff === 1 ? currentRun + 1 : 1;
    }
    bestStreak = Math.max(bestStreak, currentRun);
  }

  // Last 30 days calendar data
  const calendar = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const entry = completions.find((c) => c.date === dateStr);
    calendar.push({
      date: dateStr,
      completed: entry?.allDone ?? false,
      tasksCompleted: entry?.tasksCompleted ?? 0,
      totalTasks: entry?.totalTasks ?? 0,
    });
  }

  return NextResponse.json({
    streak,
    bestStreak,
    todayDone,
    totalDaysCompleted: dates.length,
    calendar,
  });
}

// Called to update today's completion status
export async function POST() {
  const today = todayStr();
  const allTasks = await db.select().from(tasks);
  const total = allTasks.length;
  const done = allTasks.filter((t) => t.status === "done").length;
  const allDone = total > 0 && done === total;

  const existing = await db
    .select()
    .from(dailyCompletions)
    .where(eq(dailyCompletions.date, today));

  if (existing.length > 0) {
    await db
      .update(dailyCompletions)
      .set({ tasksCompleted: done, totalTasks: total, allDone })
      .where(eq(dailyCompletions.date, today));
  } else {
    await db.insert(dailyCompletions).values({
      id: nanoid(),
      date: today,
      tasksCompleted: done,
      totalTasks: total,
      allDone,
      createdAt: new Date(),
    });
  }

  return NextResponse.json({ success: true, allDone });
}
