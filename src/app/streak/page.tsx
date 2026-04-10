"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    <div className="mx-auto max-w-4xl px-5 py-5" style={{ color: "#000" }}>
      {/* Hero */}
      <div
        data-solid
        className="rounded-2xl p-8 text-center mb-5"
        style={{
          "--solid-bg": data.todayDone ? "#059669" : "#7c3aed",
          background: data.todayDone ? "linear-gradient(135deg, #34d399, #059669)" : "linear-gradient(135deg, #8b5cf6, #6d28d9)",
        } as React.CSSProperties}
      >
        <div style={{ color: "#fff", fontSize: "3.5rem", fontWeight: 800 }}>{data.streak}</div>
        <div style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 500 }}>day{data.streak !== 1 ? "s" : ""} streak</div>
        {data.todayDone ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium" style={{ background: "rgba(255,255,255,0.25)", color: "#fff" }}>&#10003; Today complete!</div>
        ) : (
          <Link href="/" className="mt-3 inline-flex rounded-xl px-5 py-2 text-sm font-semibold" style={{ background: "rgba(255,255,255,0.25)", color: "#fff" }}>Complete today&apos;s tasks</Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-2xl p-4 text-center" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
          <p style={{ color: "#000", fontSize: "1.5rem", fontWeight: 700 }}>{data.streak}</p>
          <p style={{ color: "#555", fontSize: "0.75rem", fontWeight: 600 }}>Current</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: "#fff", border: "1px solid #fde68a" }}>
          <p style={{ color: "#000", fontSize: "1.5rem", fontWeight: 700 }}>{data.bestStreak}</p>
          <p style={{ color: "#555", fontSize: "0.75rem", fontWeight: 600 }}>Best</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: "#fff", border: "1px solid #a7f3d0" }}>
          <p style={{ color: "#000", fontSize: "1.5rem", fontWeight: 700 }}>{data.totalDaysCompleted}</p>
          <p style={{ color: "#555", fontSize: "0.75rem", fontWeight: 600 }}>Total Days</p>
        </div>
      </div>

      {/* 30-day calendar */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
        <h2 style={{ color: "#000", fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Last 30 Days</h2>
        <div className="grid grid-cols-7 gap-1.5">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="text-center text-[10px] font-semibold pb-1" style={{ color: "#888" }}>{d}</div>)}
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
                  "--solid-bg": day.completed ? "#34d399" : "#f3f4f6",
                  color: day.completed ? "#fff" : "#000",
                  boxShadow: isToday && !day.completed ? "inset 0 0 0 2px #7c3aed" : "none",
                } as React.CSSProperties}
              >{d.getDate()}</div>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
        <h2 style={{ color: "#000", fontSize: "1rem", fontWeight: 700, marginBottom: "0.25rem" }}>Daily Reminders</h2>
        <p style={{ color: "#666", fontSize: "0.875rem", marginBottom: "0.75rem" }}>Get notified to complete tasks and keep your streak</p>
        {notifGranted ? (
          <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" }}>&#10003; Reminders enabled</div>
        ) : (
          <button
            onClick={enableNotifications}
            data-solid
            className="rounded-xl px-5 py-2.5 text-sm font-semibold"
            style={{ "--solid-bg": "#7c3aed", color: "#fff" } as React.CSSProperties}
          >Enable Notifications</button>
        )}
      </div>
    </div>
  );
}
