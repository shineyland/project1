"use client";

import { useState, useRef, useEffect } from "react";

interface BrainDumpInputProps {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
}

export function BrainDumpInput({ onSubmit, isProcessing }: BrainDumpInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.max(200, el.scrollHeight) + "px";
    }
  }, [text]);

  function handleSubmit() {
    if (text.trim() && !isProcessing) {
      onSubmit(text.trim());
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Dump your tasks, ideas, goals, reminders... anything on your mind. We'll sort it all out."
        className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        style={{ minHeight: "200px" }}
        disabled={isProcessing}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">
          {text.length.toLocaleString()} / 10,000 characters
        </span>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isProcessing || text.length > 10000}
          className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? "Organizing..." : "Organize My Thoughts"}
        </button>
      </div>
    </div>
  );
}
