"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";

interface CalendarDay { date: string; completed: boolean; tasksCompleted: number; totalTasks: number; }
interface StreakData { streak: number; bestStreak: number; todayDone: boolean; totalDaysCompleted: number; calendar: CalendarDay[]; }

export default function StreakPage() {
  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifGranted, setNotifGranted] = useState(false);

  useEffect(() => {
    fetch("/api/streak", { method: "POST" }).then(() => fetch("/api/streak")).then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
    if (typeof Notification !== "undefined") setNotifGranted(Notification.permission === "granted");
  }, []);

  async function enableNotifications() {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    if (result === "granted") {
      setNotifGranted(true);
      new Notification("Reminders enabled!", { body: "You'll get daily task reminders." });
      localStorage.setItem("braindump-notif", "true");
    }
  }

  if (loading || !data) return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-100 border-t-violet-600" /></div>;

  return (
    <div className="mx-auto max-w-4xl px-5 py-5">
      {/* Hero */}
      <div className={clsx("rounded-2xl p-8 text-center mb-5", data.todayDone ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white" : "bg-gradient-to-br from-violet-500 to-violet-600 text-white")}>
        <div className="text-6xl font-bold">{data.streak}</div>
        <div className="text-lg font-medium opacity-90 mt-1">day{data.streak !== 1 ? "s" : ""} streak</div>
        {data.todayDone ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium">✓ Today complete!</div>
        ) : (
          <Link href="/" className="mt-3 inline-flex rounded-xl bg-white/20 px-5 py-2 text-sm font-semibold hover:bg-white/30">Complete today&apos;s tasks</Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-2xl border border-zinc-200 p-4 text-center">
          <p className="text-2xl font-bold text-zinc-900">{data.streak}</p>
          <p className="text-xs text-zinc-400 mt-0.5">Current</p>
        </div>
        <div className="rounded-2xl border border-amber-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{data.bestStreak}</p>
          <p className="text-xs text-amber-500 mt-0.5">Best</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{data.totalDaysCompleted}</p>
          <p className="text-xs text-emerald-500 mt-0.5">Total Days</p>
        </div>
      </div>

      {/* 30-day calendar */}
      <div className="rounded-2xl border border-zinc-200 p-5 mb-5">
        <h2 className="text-base font-semibold text-zinc-700 mb-3">Last 30 Days</h2>
        <div className="grid grid-cols-7 gap-1.5">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="text-center text-[10px] font-medium text-zinc-400 pb-1">{d}</div>)}
          {data.calendar.length > 0 && Array.from({ length: new Date(data.calendar[0].date).getDay() }, (_, i) => <div key={`e${i}`} />)}
          {data.calendar.map((day) => {
            const d = new Date(day.date);
            const isToday = day.date === new Date().toISOString().split("T")[0];
            return (
              <div key={day.date} className={clsx("flex h-10 items-center justify-center rounded-xl text-xs font-medium",
                day.completed ? "bg-emerald-500 text-white" : day.totalTasks > 0 ? "bg-zinc-100 text-zinc-500" : "bg-zinc-50 text-zinc-300",
                isToday && !day.completed && "ring-2 ring-violet-400"
              )} title={`${day.tasksCompleted}/${day.totalTasks}`}>{d.getDate()}</div>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-zinc-200 p-5">
        <h2 className="text-base font-semibold text-zinc-700 mb-1">Daily Reminders</h2>
        <p className="text-sm text-zinc-400 mb-3">Get notified to complete tasks and keep your streak</p>
        {notifGranted ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm font-medium text-emerald-700">✓ Reminders enabled</div>
        ) : (
          <button onClick={enableNotifications} className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">Enable Notifications</button>
        )}
      </div>
    </div>
  );
}
