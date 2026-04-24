import { ProjectPriority, TeamMember } from "@/projects/projectTypes";

export type TaskColumn = "TODO" | "IN_PROGRESS" | "DONE";

export interface Tag {
  id: number;
  name: string;
}

export interface Task {
  id: number;              // Changed from string to number
  name: string;
  description?: string;
  originalLanguage: string;
  priority: "LOW" | "MEDIUM" | "HIGH"; // Match backend Enum casing
  assignedUsers: TeamMember[];         // Changed from assignee to array
  dueDate?: string;
  tags?: Tag[];                        // Changed from string[] to Tag[]
  status: TaskColumn;                  // Backend uses 'status', frontend used 'column'
  timeEstimate?: number;
}
export interface KanbanColumnConfig {
  key: TaskColumn;
  label: string;
  color: string;
  bg: string;
}

export const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  { key: "TODO",       label: "To Do",       color: "#f04000", bg: "#fff5f2" },
  { key: "IN_PROGRESS", label: "In Progress", color: "#f0b100", bg: "#fffbeb" },
  { key: "DONE",       label: "Done",        color: "#00c950", bg: "#f0fdf4" },
];

export const PRIORITY_DOT_COLOR = {
  HIGH:   { label: "High",   color: "#f04000" }, 
  MEDIUM: { label: "Medium", color: "#f0a800" }, 
  LOW:    { label: "Low",    color: "#f0d400" }, 
};
