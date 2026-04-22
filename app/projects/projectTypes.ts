export type ProjectStatus = "active" | "on-hold" | "completed" | "planning";
export type ProjectPriority = "high" | "medium" | "low";

export interface TeamMember {
  name: string;
  username: string;
  initials: string;
  id: number;
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
  team: TeamMember[];
  color: string;
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
