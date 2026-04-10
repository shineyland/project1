import { TaskItem } from "./task-item";
import type { TaskItem as TaskItemType, SavedTask } from "@/lib/types";

interface CategoryGroupProps {
  name: string;
  tasks: (TaskItemType | SavedTask)[];
  interactive?: boolean;
  planId?: string;
}

export function CategoryGroup({ name, tasks, interactive = false, planId }: CategoryGroupProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          {name}
        </h3>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2">
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
