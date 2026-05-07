"use client";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { Typography } from "antd";
import React, { useState, useMemo } from "react";
import TaskCard from "@/projects/TaskCard";
import { KanbanColumnConfig, Task, TaskColumn } from "@/projects/taskTypes";
import { getKanbanTranslation } from "@/utils/dictionary_kanban"; // Import helper

const { Text } = Typography;

const columnIcon: Record<TaskColumn, React.ReactNode> = {
  TODO:       <FlagOutlined />,
  IN_PROGRESS: <ClockCircleOutlined />,
  DONE:       <CheckCircleOutlined />,
};

interface KanbanColumnProps {
    column: KanbanColumnConfig;
    tasks: Task[];
    onDragStart: (e: React.DragEvent, taskId: number) => void;
    onDrop: (e: React.DragEvent, targetStatus: TaskColumn) => void;
    onEdit: (task: Task) => void;
    onDelete: (taskId: number) => void;
    onAddTask: (column: TaskColumn) => void;
    projectId: number;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  onDragStart,
  onDrop,
  onEdit,
  onDelete,
  projectId,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  // 1. Get current language
  const targetLanguage = useMemo(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("language")?.replace(/"/g, '') || "en";
    }
    return "en";
  }, []);

  // 2. Translate the column label
  const translatedLabel = useMemo(() => 
    getKanbanTranslation(column.key, targetLanguage), 
  [column.key, targetLanguage]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { setIsDragOver(false); onDrop(e, column.key); }}
      style={{
        flex: 1,
        minWidth: 280,
        background: isDragOver ? column.bg : "#f9fafb",
        borderRadius: 14,
        border: isDragOver ? `2px dashed ${column.color}` : "2px dashed transparent",
        padding: "14px 14px 8px",
        transition: "background 0.15s, border 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 8,
              background: `${column.color}18`,
              color: column.color,
              fontSize: 13,
            }}
          >
            {columnIcon[column.key]}
          </span>
          {/* 3. Use the translated label here */}
          <Text strong style={{ fontSize: 14 }}>{translatedLabel}</Text>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: column.color,
              background: `${column.color}18`,
              borderRadius: 20,
              padding: "0 8px",
              lineHeight: "20px",
            }}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      <div style={{ minHeight: 80 }}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={onDragStart}
            onEdit={onEdit}
            onDelete={onDelete}
            projectId={String(projectId)}          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;