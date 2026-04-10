"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

interface FullTask { id: string; title: string; priority: string; status: string; category: string | null; }
interface StreakDay { date: string; completed: boolean; tasksCompleted: number; totalTasks: number; }

export default function SchedulePage() {
  const [tasks, setTasks] = useState<FullTask[]>([]);
  const [streakData, setStreakData] = useState<{ calendar: StreakDay[]; streak: number }>({ calendar: [], streak: 0 });
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/tasks").then((r) => r.json()).catch(() => []),
      fetch("/api/streak").then((r) => r.json()).catch(() => ({ calendar: [], streak: 0 })),
    ]).then(([t, s]) => { setTasks(Array.isArray(t) ? t : []); setStreakData(s); setLoading(false); });
  }, []);

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(startOfWeek); d.setDate(startOfWeek.getDate() + i); return d; });
  const todayStr = today.toISOString().split("T")[0];

  const active = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done").length;
  const pDot: Record<string, string> = { high: "bg-red-500", medium: "bg-amber-500", low: "bg-emerald-500" };
  const groups = { high: active.filter((t) => t.priority === "high"), medium: active.filter((t) => t.priority === "medium"), low: active.filter((t) => t.priority === "low") };
  const labels: Record<string, string> = { high: "Urgent", medium: "Medium", low: "Low Priority" };

  if (loading) return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-100 border-t-violet-600" /></div>;

  return (
    <div className="mx-auto max-w-5xl px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-zinc-900">Schedule</h1>
        <div className="flex gap-2 text-xs">
          <span className="rounded-lg bg-zinc-100 px-2.5 py-1 font-medium text-zinc-600">{active.length} active</span>
          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 font-medium text-emerald-600">{done} done</span>
        </div>
      </div>

      {/* Week nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setWeekOffset((w) => w - 1)} className="rounded-xl border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50">←</button>
        <div className="text-center">
          <p className="text-base font-semibold text-zinc-800">
            {weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
          {weekOffset !== 0 && <button onClick={() => setWeekOffset(0)} className="text-xs text-violet-600 font-medium">This week</button>}
        </div>
        <button onClick={() => setWeekOffset((w) => w + 1)} className="rounded-xl border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50">→</button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-1.5 mb-5">
        {weekDays.map((day) => {
          const ds = day.toISOString().split("T")[0];
          const isToday = ds === todayStr;
          const sd = streakData.calendar.find((c) => c.date === ds);
          return (
            <div key={ds} className={clsx("rounded-2xl border p-3 text-center min-h-[90px]",
              isToday ? "border-violet-300 ring-2 ring-violet-200" : sd?.completed ? "border-emerald-200" : "border-zinc-200")}>
              <p className="text-[11px] font-medium text-zinc-400">{day.toLocaleDateString("en-US", { weekday: "short" })}</p>
              <p className={clsx("text-xl font-bold mt-0.5", isToday ? "text-violet-700" : "text-zinc-800")}>{day.getDate()}</p>
              {sd && sd.totalTasks > 0 && (
                <>
                  <div className="mt-1.5 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                    <div className={clsx("h-full rounded-full", sd.completed ? "bg-emerald-500" : "bg-violet-500")} style={{ width: `${(sd.tasksCompleted / sd.totalTasks) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{sd.tasksCompleted}/{sd.totalTasks}</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Tasks by priority */}
      <div className="space-y-4">
        {(["high", "medium", "low"] as const).map((p) => {
          if (groups[p].length === 0) return null;
          return (
            <div key={p}>
              <div className="flex items-center gap-2 mb-2">
                <span className={clsx("h-2.5 w-2.5 rounded-full", pDot[p])} />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{labels[p]}</h2>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">{groups[p].length}</span>
              </div>
              <div className="space-y-1">
                {groups[p].map((task) => (
                  <div key={task.id} className={clsx("flex items-center gap-3 rounded-xl border px-4 py-2.5",
                    task.status === "in_progress" ? "border-violet-200" : "border-zinc-200")}>
                    <div className={clsx("h-2 w-2 rounded-full shrink-0", task.status === "in_progress" ? "bg-violet-500" : "bg-zinc-300")} />
                    <span className="flex-1 text-sm font-medium text-zinc-700">{task.title}</span>
                    {task.category && <span className="rounded-lg bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500">{task.category}</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {active.length === 0 && <div className="rounded-2xl border border-zinc-200 py-8 text-center text-sm text-zinc-500">All caught up!</div>}
      </div>
    </div>
  );
}
