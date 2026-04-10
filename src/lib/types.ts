// What the AI returns
export interface StructuredPlan {
  title: string;
  summary: string;
  categories: Category[];
}

export interface Category {
  name: string;
  tasks: TaskItem[];
}

export interface TaskItem {
  title: string;
  description: string | null;
  priority: "high" | "medium" | "low";
  scheduledTime: string; // "HH:MM"
  duration: number; // minutes
  steps: string[];
}

// After saving to DB
export interface SavedPlan {
  id: string;
  rawInput: string;
  title: string;
  summary: string | null;
  createdAt: Date;
  updatedAt: Date;
  categories: SavedCategory[];
}

export interface SavedCategory {
  name: string;
  tasks: SavedTask[];
}

export interface SavedTask {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in_progress" | "done";
  sortOrder: number;
  scheduledTime: string | null;
  duration: number | null;
  steps: SavedStep[];
}

export interface SavedStep {
  id: string;
  content: string;
  isComplete: boolean;
  sortOrder: number;
}
