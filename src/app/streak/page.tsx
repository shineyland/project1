"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";

interface CalendarDay {
  date: string;
  completed: boolean;
  tasksCompleted: number;
  totalTasks: number;
}

interface StreakData {
  streak: number;
  bestStreak: number;
  todayDone: boolean;
  totalDaysCompleted: number;
  calendar: CalendarDay[];
}

export default function StreakPage() {
  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifGranted, setNotifGranted] = useState(false);

  useEffect(() => {
    // Sync today's status first, then fetch streak data
    fetch("/api/streak", { method: "POST" })
      .then(() => fetch("/api/streak"))
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });

    // Check notification permission
    if (typeof Notification !== "undefined") {
      setNotifGranted(Notification.permission === "granted");
    }
  }, []);

  async function enableNotifications() {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    if (result === "granted") {
      setNotifGranted(true);
      new Notification("BrainDump Reminders Enabled!", {
        body: "You'll get daily reminders to complete your tasks.",
        icon: "/favicon.ico",
      });
      // Schedule periodic check (stores in localStorage)
      localStorage.setItem("braindump-notif", "true");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-violet-100 border-t-violet-600" />
      </div>
    );
  }

  if (!data) return null;

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-zinc-900">Streak</h1>
        <p className="mt-2 text-base text-zinc-500">Complete all tasks daily to build your streak</p>
      </div>

      {/* Streak hero */}
      <div className={clsx(
        "rounded-2xl p-10 text-center mb-8",
        data.todayDone
          ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
          : "bg-gradient-to-br from-violet-500 to-violet-600 text-white"
      )}>
        <div className="text-7xl font-bold mb-2">{data.streak}</div>
        <div className="text-xl font-medium opacity-90">
          day{data.streak !== 1 ? "s" : ""} streak
        </div>
        {data.todayDone ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-base font-medium">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Today complete!
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-base opacity-80 mb-3">Complete all tasks to keep your streak</p>
            <Link
              href="/today"
              className="inline-flex rounded-xl bg-white/20 px-6 py-3 text-base font-semibold hover:bg-white/30 transition-colors"
            >
              Go to Today&apos;s Tasks
            </Link>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
          <p className="text-3xl font-bold text-zinc-900">{data.streak}</p>
          <p className="mt-1 text-sm text-zinc-400">Current Streak</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 text-center">
          <p className="text-3xl font-bold text-amber-700">{data.bestStreak}</p>
          <p className="mt-1 text-sm text-amber-500">Best Streak</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 text-center">
          <p className="text-3xl font-bold text-emerald-700">{data.totalDaysCompleted}</p>
          <p className="mt-1 text-sm text-emerald-500">Total Days</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 mb-8">
        <h2 className="text-lg font-semibold text-zinc-700 mb-6">Last 30 Days</h2>
        <div className="grid grid-cols-7 gap-2">
          {dayNames.map((d, i) => (
            <div key={i} className="text-center text-xs font-medium text-zinc-400 pb-2">{d}</div>
          ))}
          {/* Offset for first day alignment */}
          {data.calendar.length > 0 && (() => {
            const firstDay = new Date(data.calendar[0].date).getDay();
            return Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} />
            ));
          })()}
          {data.calendar.map((day) => {
            const d = new Date(day.date);
            const isToday = day.date === new Date().toISOString().split("T")[0];
            return (
              <div
                key={day.date}
                className={clsx(
                  "flex h-12 w-full items-center justify-center rounded-xl text-sm font-medium transition-all",
                  day.completed
                    ? "bg-emerald-500 text-white"
                    : day.totalTasks > 0
                    ? "bg-zinc-100 text-zinc-500"
                    : "bg-zinc-50 text-zinc-300",
                  isToday && !day.completed && "ring-2 ring-violet-400 ring-offset-2"
                )}
                title={`${day.date}: ${day.tasksCompleted}/${day.totalTasks} tasks`}
              >
                {d.getDate()}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <h2 className="text-lg font-semibold text-zinc-700 mb-2">Daily Reminders</h2>
        <p className="text-base text-zinc-400 mb-5">
          Get notified to complete your tasks and maintain your streak
        </p>
        {notifGranted ? (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-base font-medium text-emerald-700">Reminders are enabled</span>
          </div>
        ) : (
          <button
            onClick={enableNotifications}
            className="flex items-center gap-3 rounded-xl bg-violet-600 px-6 py-4 text-base font-semibold text-white hover:bg-violet-700 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            Enable Notifications
          </button>
        )}
      </div>
    </div>
  );
}
