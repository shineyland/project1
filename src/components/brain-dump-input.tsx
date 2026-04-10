"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

interface BrainDumpInputProps {
  onSubmit: (items: string[]) => void;
  isProcessing: boolean;
}

export function BrainDumpInput({ onSubmit, isProcessing }: BrainDumpInputProps) {
  const [items, setItems] = useState<string[]>([""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const hasContent = items.some((item) => item.trim() !== "");

  useEffect(() => {
    const last = inputRefs.current[items.length - 1];
    if (last) last.focus();
  }, [items.length]);

  function updateItem(index: number, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, ""]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) {
      setItems([""]);
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
    setTimeout(() => {
      const focusIdx = Math.min(index, items.length - 2);
      inputRefs.current[focusIdx]?.focus();
    }, 0);
  }

  function handleKeyDown(e: KeyboardEvent, index: number) {
    if (e.key === "Enter") {
      e.preventDefault();
      setItems((prev) => [
        ...prev.slice(0, index + 1),
        "",
        ...prev.slice(index + 1),
      ]);
    }
    if (e.key === "Backspace" && items[index] === "" && items.length > 1) {
      e.preventDefault();
      removeItem(index);
    }
  }

  function handleSubmit() {
    const filled = items.filter((item) => item.trim() !== "");
    if (filled.length > 0 && !isProcessing) {
      onSubmit(filled);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <div className="space-y-1">
          {items.map((item, index) => (
            <div key={index} className="group flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-violet-400" />
              </div>
              <input
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                placeholder={index === 0 && !hasContent ? "Start brain-dumping here..." : "Add another thought..."}
                className="flex-1 border-0 bg-transparent py-2 text-[15px] text-zinc-800 placeholder-zinc-300 outline-none"
                disabled={isProcessing}
              />
              {items.length > 1 && (
                <button
                  onClick={() => removeItem(index)}
                  className="shrink-0 rounded-md p-1 text-zinc-300 opacity-0 transition-opacity hover:text-zinc-500 group-hover:opacity-100"
                  tabIndex={-1}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addItem}
          disabled={isProcessing}
          className="mt-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600 disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Add another
        </button>
      </div>

      {hasContent && (
        <div className="border-t border-zinc-100 bg-zinc-50/50 px-5 py-3 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            {items.filter((i) => i.trim()).length} item{items.filter((i) => i.trim()).length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!hasContent || isProcessing}
            className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 hover:shadow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                Organizing...
              </span>
            ) : (
              "Organize My Thoughts"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
