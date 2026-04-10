"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

interface FullTask {
  id: string;
  planId: string;
  title: string;
  priority: string;
  status: string;
  category: string | null;
  createdAt: string;
}

interface StreakDay {
  date: string;
  completed: boolean;
  tasksCompleted: number;
  totalTasks: number;
}

export default function SchedulePage() {
  const [tasks, setTasks] = useState<FullTask[]>([]);
  const [streakData, setStreakData] = useState<{ calendar: StreakDay[]; streak: number }>({ calendar: [], streak: 0 });
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/tasks").then((r) => r.json()).catch(() => []),
      fetch("/api/streak").then((r) => r.json()).catch(() => ({ calendar: [], streak: 0 })),
    ]).then(([taskData, streak]) => {
      setTasks(Array.isArray(taskData) ? taskData : []);
      setStreakData(streak);
      setLoading(false);
    });
  }, []);

  // Generate week days
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const isCurrentWeek = weekOffset === 0;
  const todayStr = today.toISOString().split("T")[0];

  // Stats
  const totalActive = tasks.filter((t) => t.status !== "done").length;
  const totalDone = tasks.filter((t) => t.status === "done").length;
  const highPriority = tasks.filter((t) => t.priority === "high" && t.status !== "done").length;

  const priorityDot: Record<string, string> = { high: "bg-red-500", medium: "bg-amber-500", low: "bg-emerald-500" };

  // Group tasks by priority for the week view
  const tasksByPriority = {
    high: tasks.filter((t) => t.priority === "high" && t.status !== "done"),
    medium: tasks.filter((t) => t.priority === "medium" && t.status !== "done"),
    low: tasks.filter((t) => t.priority === "low" && t.status !== "done"),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-violet-100 border-t-violet-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Schedule</h1>
          <p className="mt-2 text-base text-zinc-500">Weekly overview of your tasks</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="rounded-lg bg-zinc-100 px-3 py-1.5 font-medium text-zinc-600">{totalActive} active</span>
          <span className="rounded-lg bg-emerald-50 px-3 py-1.5 font-medium text-emerald-600">{totalDone} done</span>
          {highPriority > 0 && (
            <span className="rounded-lg bg-red-50 px-3 py-1.5 font-medium text-red-600">{highPriority} urgent</span>
          )}
        </div>
      </div>

      {/* Week navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => setWeekOffset((w) => w - 1)} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50">
          ← Prev
        </button>
        <div className="text-center">
          <p className="text-lg font-semibold text-zinc-800">
            {weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
          {!isCurrentWeek && (
            <button onClick={() => setWeekOffset(0)} className="text-sm text-violet-600 hover:text-violet-700 font-medium">
              Back to this week
            </button>
          )}
        </div>
        <button onClick={() => setWeekOffset((w) => w + 1)} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50">
          Next →
        </button>
      </div>

      {/* Week calendar grid */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {weekDays.map((day) => {
          const dateStr = day.toISOString().split("T")[0];
          const isToday = dateStr === todayStr;
          const streakDay = streakData.calendar.find((c) => c.date === dateStr);
          const dayName = day.toLocaleDateString("en-US", { weekday: "short" });
          const dayNum = day.getDate();

          return (
            <div
              key={dateStr}
              className={clsx(
                "rounded-2xl border p-4 text-center transition-all min-h-[100px]",
                isToday ? "border-violet-300 bg-violet-50/50 ring-2 ring-violet-200" :
                streakDay?.completed ? "border-emerald-200 bg-emerald-50/30" :
                "border-zinc-200 bg-white"
              )}
            >
              <p className="text-xs font-medium text-zinc-400">{dayName}</p>
              <p className={clsx("text-2xl font-bold mt-1", isToday ? "text-violet-700" : "text-zinc-800")}>{dayNum}</p>
              {streakDay && streakDay.totalTasks > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className={clsx("h-full rounded-full", streakDay.completed ? "bg-emerald-500" : "bg-violet-500")}
                      style={{ width: `${(streakDay.tasksCompleted / streakDay.totalTasks) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">{streakDay.tasksCompleted}/{streakDay.totalTasks}</p>
                </div>
              )}
              {streakDay?.completed && <p className="text-xs text-emerald-500 font-medium mt-1">&#10003;</p>}
            </div>
          );
        })}
      </div>

      {/* Tasks grouped by priority */}
      <div className="space-y-6">
        {(["high", "medium", "low"] as const).map((priority) => {
          const group = tasksByPriority[priority];
          if (group.length === 0) return null;
          const labels = { high: "Urgent", medium: "Medium Priority", low: "Low Priority" };
          return (
            <div key={priority}>
              <div className="flex items-center gap-2.5 mb-3">
                <span className={clsx("h-3 w-3 rounded-full", priorityDot[priority])} />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">{labels[priority]}</h2>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500">{group.length}</span>
              </div>
              <div className="space-y-1.5">
                {group.map((task) => (
                  <div key={task.id} className={clsx(
                    "flex items-center gap-4 rounded-xl border px-5 py-3",
                    task.status === "in_progress" ? "border-violet-200 bg-violet-50/20" : "border-zinc-200 bg-white"
                  )}>
                    <div className={clsx(
                      "h-2.5 w-2.5 rounded-full shrink-0",
                      task.status === "in_progress" ? "bg-violet-500" : "bg-zinc-300"
                    )} />
                    <span className="flex-1 text-base font-medium text-zinc-700">{task.title}</span>
                    {task.category && <span className="rounded-lg bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-500">{task.category}</span>}
                    <span className="text-xs text-zinc-400">{task.status === "in_progress" ? "In progress" : "To do"}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {totalActive === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white py-12 text-center">
            <p className="text-base text-zinc-500">All caught up! No active tasks.</p>
          </div>
        )}
      </div>
    </div>
  );
}
