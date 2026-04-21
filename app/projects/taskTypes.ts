import { ProjectPriority, TeamMember } from "@/projects/projectTypes";

export type TaskColumn = "todo" | "inprogress" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: ProjectPriority;
  assignee?: TeamMember;
  dueDate?: string;
  tags?: string[];
  column: TaskColumn;
}

export interface KanbanColumnConfig {
  key: TaskColumn;
  label: string;
  color: string;
  bg: string;
}

export const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  { key: "todo",       label: "To Do",       color: "#f04000", bg: "#fff5f2" },
  { key: "inprogress", label: "In Progress", color: "#f0b100", bg: "#fffbeb" },
  { key: "done",       label: "Done",        color: "#00c950", bg: "#f0fdf4" },
];

export const PRIORITY_DOT_COLOR: Record<ProjectPriority, string> = {
  high:   "#f04000",
  medium: "#f0a800",
  low:    "#f0d400",
};
