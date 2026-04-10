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
      <div
        data-solid
        className={clsx("rounded-2xl p-8 text-center mb-5")}
        style={{
          "--solid-bg": data.todayDone ? "#059669" : "#7c3aed",
          background: data.todayDone ? "linear-gradient(135deg, #34d399, #059669)" : "linear-gradient(135deg, #8b5cf6, #6d28d9)",
          color: "white",
        } as React.CSSProperties}
      >
        <div className="text-6xl font-bold" style={{ color: "white" }}>{data.streak}</div>
        <div className="text-lg font-medium mt-1" style={{ color: "rgba(255,255,255,0.9)" }}>day{data.streak !== 1 ? "s" : ""} streak</div>
        {data.todayDone ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>&#10003; Today complete!</div>
        ) : (
          <Link href="/" className="mt-3 inline-flex rounded-xl px-5 py-2 text-sm font-semibold" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>Complete today&apos;s tasks</Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-2xl border border-zinc-200 p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: "#1a1a2e" }}>{data.streak}</p>
          <p className="text-xs font-medium" style={{ color: "#71717a" }}>Current</p>
        </div>
        <div className="rounded-2xl border p-4 text-center" style={{ borderColor: "rgba(217,119,6,0.2)" }}>
          <p className="text-2xl font-bold" style={{ color: "#b45309" }}>{data.bestStreak}</p>
          <p className="text-xs font-medium" style={{ color: "#d97706" }}>Best</p>
        </div>
        <div className="rounded-2xl border p-4 text-center" style={{ borderColor: "rgba(5,150,105,0.2)" }}>
          <p className="text-2xl font-bold" style={{ color: "#047857" }}>{data.totalDaysCompleted}</p>
          <p className="text-xs font-medium" style={{ color: "#059669" }}>Total Days</p>
        </div>
      </div>

      {/* 30-day calendar */}
      <div className="rounded-2xl border border-zinc-200 p-5 mb-5">
        <h2 className="text-base font-semibold mb-3" style={{ color: "#374151" }}>Last 30 Days</h2>
        <div className="grid grid-cols-7 gap-1.5">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="text-center text-[10px] font-medium pb-1" style={{ color: "#9ca3af" }}>{d}</div>)}
          {data.calendar.length > 0 && Array.from({ length: new Date(data.calendar[0].date).getDay() }, (_, i) => <div key={`e${i}`} />)}
          {data.calendar.map((day) => {
            const d = new Date(day.date);
            const isToday = day.date === new Date().toISOString().split("T")[0];
            return (
              <div
                key={day.date}
                data-solid
                className="flex h-10 items-center justify-center rounded-xl text-xs font-semibold"
                style={{
                  "--solid-bg": day.completed ? "#34d399" : day.totalTasks > 0 ? "#e5e7eb" : "#f3f4f6",
                  color: day.completed ? "white" : day.totalTasks > 0 ? "#374151" : "#d1d5db",
                  boxShadow: isToday && !day.completed ? "0 0 0 2px #7c3aed" : "none",
                } as React.CSSProperties}
                title={`${day.tasksCompleted}/${day.totalTasks}`}
              >{d.getDate()}</div>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-zinc-200 p-5">
        <h2 className="text-base font-semibold mb-1" style={{ color: "#374151" }}>Daily Reminders</h2>
        <p className="text-sm mb-3" style={{ color: "#9ca3af" }}>Get notified to complete tasks and keep your streak</p>
        {notifGranted ? (
          <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium" style={{ background: "rgba(5,150,105,0.1)", color: "#047857", border: "1px solid rgba(5,150,105,0.2)" }}>&#10003; Reminders enabled</div>
        ) : (
          <button
            onClick={enableNotifications}
            data-solid
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ "--solid-bg": "#7c3aed", boxShadow: "0 3px 10px rgba(124,58,237,0.25)" } as React.CSSProperties}
          >Enable Notifications</button>
        )}
      </div>
    </div>
  );
}
