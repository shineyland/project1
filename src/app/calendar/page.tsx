"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

interface CalendarNote { id: string; date: string; content: string; emoji: string; }
const emojis = ["📌", "🎉", "🏥", "✈️", "💼", "🎂", "📞", "🏋️", "📚", "💰", "🛒", "❤️"];

export default function CalendarPage() {
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [newEmoji, setNewEmoji] = useState("📌");

  useEffect(() => {
    fetch("/api/notes").then((r) => r.json()).then((d) => { setNotes(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted" || !localStorage.getItem("braindump-notif")) return;
    const today = new Date();
    notes.forEach((note) => {
      const days = Math.ceil((new Date(note.date + "T00:00:00").getTime() - today.getTime()) / 86400000);
      if (days >= 0 && days <= 3) {
        const key = `notif-${note.id}-${today.toISOString().split("T")[0]}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, "1");
          new Notification(`${note.emoji} ${note.content}`, { body: days === 0 ? "Today!" : `In ${days} day${days > 1 ? "s" : ""}` });
        }
      }
    });
  }, [notes]);

  const now = new Date();
  const view = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = view.getFullYear(), month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = now.toISOString().split("T")[0];
  const monthName = view.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const ds = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const notesFor = (s: string) => notes.filter((n) => n.date === s);

  async function addNote() {
    if (!newNote.trim() || !selectedDate) return;
    const res = await fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: selectedDate, content: newNote.trim(), emoji: newEmoji }) });
    const data = await res.json();
    setNotes((p) => [...p, { id: data.id, date: selectedDate, content: newNote.trim(), emoji: newEmoji }]);
    setNewNote(""); setNewEmoji("📌");
  }

  async function deleteNote(id: string) {
    setNotes((p) => p.filter((n) => n.id !== id));
    await fetch("/api/notes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  }

  if (loading) return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-100 border-t-violet-600" /></div>;

  const selNotes = selectedDate ? notesFor(selectedDate) : [];

  return (
    <div className="mx-auto max-w-6xl px-5 py-5">
      <h1 className="text-2xl font-bold text-zinc-900 mb-4">Calendar</h1>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        {/* Calendar grid */}
        <div className="rounded-2xl border border-zinc-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setMonthOffset((m) => m - 1)} className="rounded-xl border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50">←</button>
            <h2 className="text-lg font-bold text-zinc-800">{monthName}</h2>
            <button onClick={() => setMonthOffset((m) => m + 1)} className="rounded-xl border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50">→</button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="text-center text-[11px] font-medium text-zinc-400 pb-1">{d}</div>)}
            {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1, dateStr = ds(day), isToday = dateStr === todayStr, isSel = dateStr === selectedDate;
              const dayNotes = notesFor(dateStr);
              return (
                <button key={day} onClick={() => setSelectedDate(dateStr)} className={clsx(
                  "relative flex flex-col items-center rounded-xl py-1.5 text-sm transition-all",
                  isSel ? "bg-violet-600 text-white" : isToday ? "bg-violet-50 text-violet-700 font-bold" : "hover:bg-zinc-50 text-zinc-700"
                )}>
                  <span className="font-medium">{day}</span>
                  {dayNotes.length > 0 && <div className="flex gap-0.5 mt-0.5">{dayNotes.slice(0, 3).map((n) => <span key={n.id} className="text-[9px] leading-none">{n.emoji}</span>)}</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day panel */}
        <div className="space-y-3">
          {selectedDate ? (
            <>
              <div className="rounded-2xl border border-zinc-200 p-5">
                <h3 className="text-base font-bold text-zinc-800">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </h3>
                {selNotes.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {selNotes.map((n) => (
                      <div key={n.id} className="flex items-start gap-2.5 rounded-xl bg-zinc-50 p-3">
                        <span className="text-lg">{n.emoji}</span>
                        <span className="flex-1 text-sm text-zinc-700">{n.content}</span>
                        <button onClick={() => deleteNote(n.id)} className="shrink-0 rounded-lg p-1 text-zinc-300 hover:text-red-500">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : <p className="mt-2 text-sm text-zinc-400">No notes</p>}
              </div>
              <div className="rounded-2xl border border-zinc-200 p-5 space-y-3">
                <h4 className="text-sm font-semibold text-zinc-700">Add Note</h4>
                <div className="flex flex-wrap gap-1.5">
                  {emojis.map((e) => (
                    <button key={e} onClick={() => setNewEmoji(e)} className={clsx("h-8 w-8 rounded-lg text-base flex items-center justify-center", newEmoji === e ? "bg-violet-100 ring-2 ring-violet-400" : "bg-zinc-50 hover:bg-zinc-100")}>{e}</button>
                  ))}
                </div>
                <input value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNote()} placeholder="What's happening?" className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-violet-300" />
                <button onClick={addNote} disabled={!newNote.trim()} className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">Add</button>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-center">
              <p className="text-sm text-zinc-500">Select a day</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
