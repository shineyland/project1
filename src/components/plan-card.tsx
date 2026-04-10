"use client";

import Link from "next/link";
import { clsx } from "clsx";

interface UpcomingTask {
  id: string;
  title: string;
  priority: string;
  status: string;
  category: string | null;
}

interface PlanCardProps {
  id: string;
  title: string;
  summary: string | null;
  createdAt: string;
  taskCount: number;
  doneTasks: number;
  inProgressTasks: number;
  highPriority: number;
  categories: string[];
  upcoming: UpcomingTask[];
  onDelete: (id: string) => void;
}

const priorityDot: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

export function PlanCard({
  id,
  title,
  summary,
  createdAt,
  taskCount,
  doneTasks,
  inProgressTasks,
  highPriority,
  categories,
  upcoming,
  onDelete,
}: PlanCardProps) {
  const progress = taskCount > 0 ? Math.round((doneTasks / taskCount) * 100) : 0;
  const isComplete = taskCount > 0 && doneTasks === taskCount;

  return (
    <div
      className={clsx(
        "rounded-2xl border bg-white transition-all hover:shadow-md",
        isComplete ? "border-emerald-200" : "border-zinc-200"
      )}
    >
      <Link href={`/plan/${id}`} className="block p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isComplete && <span className="text-base">&#10003;</span>}
              <h3 className={clsx(
                "font-semibold truncate",
                isComplete ? "text-emerald-700" : "text-zinc-900"
              )}>
                {title}
              </h3>
            </div>
            {summary && (
              <p className="mt-1 line-clamp-1 text-sm text-zinc-500">{summary}</p>
            )}
          </div>
          <span className="shrink-0 text-lg font-bold text-zinc-300">{progress}%</span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-500",
              isComplete ? "bg-emerald-500" : "bg-violet-500"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stats row */}
        <div className="mt-3 flex items-center gap-3 text-xs">
          <span className="text-zinc-500">
            <span className="font-semibold text-zinc-700">{doneTasks}</span>/{taskCount} done
          </span>
          {inProgressTasks > 0 && (
            <span className="text-blue-600">
              {inProgressTasks} in progress
            </span>
          )}
          {highPriority > 0 && (
            <span className="text-red-500">
              {highPriority} urgent
            </span>
          )}
        </div>

        {/* Upcoming tasks preview */}
        {upcoming.length > 0 && (
          <div className="mt-3 space-y-1.5 border-t border-zinc-100 pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Next up</p>
            {upcoming.map((task) => (
              <div key={task.id} className="flex items-center gap-2 text-sm">
                <span className={clsx("h-1.5 w-1.5 shrink-0 rounded-full", priorityDot[task.priority] || "bg-zinc-300")} />
                <span className="truncate text-zinc-600">{task.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <span key={cat} className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                {cat}
              </span>
            ))}
          </div>
        )}
      </Link>

      {/* Footer with date and delete */}
      <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-2.5">
        <span className="text-[11px] text-zinc-400">
          {new Date(createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete(id);
          }}
          className="rounded-md px-2 py-1 text-[11px] text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
