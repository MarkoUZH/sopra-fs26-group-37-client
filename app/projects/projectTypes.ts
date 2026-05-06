import { Task } from "./taskTypes";

export type ProjectStatus = "active" | "on-hold" | "completed" | "planning";
export type ProjectPriority = "high" | "medium" | "low";

export interface TeamMember {
  name: string;
  username: string;
  id: number;
}

export interface Sprint {
  id: number;
  name: string;
  // Add other fields from SprintGetDTO if needed (e.g., startDate, endDate)
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  tasksTotal: number;
  tasksDone: number;
  tasksInProgress: number;
  dueDate: string;
  members: TeamMember[];
  color: string;
  originalLanguage: string;
  sprints: Sprint[];
}

export interface SprintDTO {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

export interface ProjectDTO {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    progress: number;
    tasksTotal: number;
    tasksDone: number;
    tasksInProgress: number;
    originalLanguage: string;
    dueDate: string;
    members: TeamMember[];
    color: string;
    tasks: Task[];
    sprints: Sprint[];
}

export const statusConfig: Record<ProjectStatus,
  { label: string; color: string; badgeStatus: "processing" | "default" | "success" | "warning" }
> = {
  active:    { label: "Active",    color: "#2b7fff", badgeStatus: "processing" },
  "on-hold": { label: "On Hold",   color: "#f0b100", badgeStatus: "warning"    },
  completed: { label: "Completed", color: "#00c950", badgeStatus: "success"    },
  planning:  { label: "Planning",  color: "#8c8c8c", badgeStatus: "default"    },
};

export const priorityConfig: Record<ProjectPriority, { label: string; color: string }> = {
  high:   { label: "High",   color: "red"    },
  medium: { label: "Medium", color: "orange" },
  low:    { label: "Low",    color: "blue"   },
};
