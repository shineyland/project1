import { TaskItem } from "./task-item";
import type { TaskItem as TaskItemType, SavedTask } from "@/lib/types";

interface CategoryGroupProps {
  name: string;
  tasks: (TaskItemType | SavedTask)[];
  interactive?: boolean;
  planId?: string;
}

function getCategoryEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("work") || lower.includes("career")) return "💼";
  if (lower.includes("health") || lower.includes("fitness")) return "💪";
  if (lower.includes("personal")) return "🏠";
  if (lower.includes("finance") || lower.includes("money")) return "💰";
  if (lower.includes("learn") || lower.includes("education")) return "📚";
  if (lower.includes("errand") || lower.includes("shop")) return "🛒";
  if (lower.includes("social") || lower.includes("relation")) return "👥";
  if (lower.includes("creative") || lower.includes("hobby")) return "🎨";
  return "📋";
}

export function CategoryGroup({ name, tasks, interactive = false, planId }: CategoryGroupProps) {
  const doneCount = tasks.filter((t) => "status" in t && t.status === "done").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">{getCategoryEmoji(name)}</span>
          <h3 className="text-base font-semibold text-zinc-700">
            {name}
          </h3>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-500">
            {tasks.length}
          </span>
        </div>
        {interactive && doneCount > 0 && (
          <span className="text-sm text-emerald-600 font-medium">
            {doneCount}/{tasks.length} done
          </span>
        )}
      </div>
      <div className="space-y-3">
        {tasks.map((task, i) => {
          const isSaved = "id" in task;
          return (
            <TaskItem
              key={isSaved ? task.id : `task-${i}`}
              id={isSaved ? task.id : undefined}
              title={task.title}
              description={task.description}
              priority={task.priority}
              status={isSaved ? task.status : undefined}
              steps={isSaved ? task.steps : task.steps}
              interactive={interactive}
              planId={planId}
            />
          );
        })}
      </div>
    </div>
  );
}
