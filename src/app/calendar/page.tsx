"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

interface CalendarNote {
  id: string;
  date: string;
  content: string;
  emoji: string;
}

const emojiOptions = ["📌", "🎉", "🏥", "✈️", "💼", "🎂", "📞", "🏋️", "📚", "💰", "🛒", "❤️"];

export default function CalendarPage() {
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [newEmoji, setNewEmoji] = useState("📌");

  useEffect(() => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then((data) => { setNotes(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Check for upcoming reminders
  useEffect(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    if (!localStorage.getItem("braindump-notif")) return;

    const today = new Date();
    notes.forEach((note) => {
      const noteDate = new Date(note.date + "T00:00:00");
      const daysUntil = Math.ceil((noteDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil >= 0 && daysUntil <= 3) {
        const lastKey = `notif-${note.id}-${today.toISOString().split("T")[0]}`;
        if (!localStorage.getItem(lastKey)) {
          localStorage.setItem(lastKey, "1");
          new Notification(`${note.emoji} Upcoming: ${note.content}`, {
            body: daysUntil === 0 ? "Today!" : `In ${daysUntil} day${daysUntil > 1 ? "s" : ""}`,
            icon: "/favicon.ico",
          });
        }
      }
    });
  }, [notes]);

  const now = new Date();
  const viewMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = now.toISOString().split("T")[0];

  const monthName = viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  function notesForDate(dateStr: string) {
    return notes.filter((n) => n.date === dateStr);
  }

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  async function addNote() {
    if (!newNote.trim() || !selectedDate) return;
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, content: newNote.trim(), emoji: newEmoji }),
    });
    const data = await res.json();
    setNotes((prev) => [...prev, { id: data.id, date: selectedDate, content: newNote.trim(), emoji: newEmoji }]);
    setNewNote("");
    setNewEmoji("📌");
  }

  async function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch("/api/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  const selectedNotes = selectedDate ? notesForDate(selectedDate) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-violet-100 border-t-violet-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Calendar</h1>
        <p className="mt-2 text-base text-zinc-500">Add notes and events to your days</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Calendar grid */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setMonthOffset((m) => m - 1)} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50">←</button>
            <h2 className="text-xl font-bold text-zinc-800">{monthName}</h2>
            <button onClick={() => setMonthOffset((m) => m + 1)} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50">→</button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-zinc-400 pb-2">{d}</div>
            ))}
            {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const ds = dateStr(day);
              const isToday = ds === todayStr;
              const isSelected = ds === selectedDate;
              const dayNotes = notesForDate(ds);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(ds)}
                  className={clsx(
                    "relative flex flex-col items-center rounded-xl py-2 transition-all text-sm",
                    isSelected ? "bg-violet-600 text-white" :
                    isToday ? "bg-violet-50 text-violet-700 font-bold" :
                    "hover:bg-zinc-50 text-zinc-700"
                  )}
                >
                  <span className="font-medium">{day}</span>
                  {dayNotes.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayNotes.slice(0, 3).map((n) => (
                        <span key={n.id} className="text-[10px] leading-none">{n.emoji}</span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="space-y-4">
          {selectedDate ? (
            <>
              <div className="rounded-2xl border border-zinc-200 bg-white p-6">
                <h3 className="text-lg font-bold text-zinc-800 mb-1">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  {selectedNotes.length} note{selectedNotes.length !== 1 ? "s" : ""}
                </p>

                {selectedNotes.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedNotes.map((note) => (
                      <div key={note.id} className="flex items-start gap-3 rounded-xl bg-zinc-50 p-3.5">
                        <span className="text-xl">{note.emoji}</span>
                        <span className="flex-1 text-base text-zinc-700">{note.content}</span>
                        <button onClick={() => deleteNote(note.id)} className="shrink-0 rounded-lg p-1 text-zinc-300 hover:text-red-500 hover:bg-red-50">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">No notes for this day</p>
                )}
              </div>

              {/* Add note form */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
                <h4 className="text-base font-semibold text-zinc-700">Add Note</h4>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((e) => (
                    <button
                      key={e}
                      onClick={() => setNewEmoji(e)}
                      className={clsx(
                        "h-10 w-10 rounded-xl text-xl transition-all flex items-center justify-center",
                        newEmoji === e ? "bg-violet-100 ring-2 ring-violet-400" : "bg-zinc-50 hover:bg-zinc-100"
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNote()}
                  placeholder="What's happening this day?"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-base outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-200"
                />
                <button
                  onClick={addNote}
                  disabled={!newNote.trim()}
                  className="w-full rounded-xl bg-violet-600 py-3 text-base font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  Add Note
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center">
              <p className="text-base text-zinc-500">Select a day to view or add notes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
