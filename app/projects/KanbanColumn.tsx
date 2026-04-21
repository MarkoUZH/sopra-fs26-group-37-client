"use client";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Typography } from "antd";
import React, { useState } from "react";
import TaskCard from "@/projects/TaskCard";
import { KanbanColumnConfig, Task, TaskColumn } from "@/projects/taskTypes";

const { Text } = Typography;

const columnIcon: Record<TaskColumn, React.ReactNode> = {
  TODO:       <FlagOutlined />,
  IN_PROGRESS: <ClockCircleOutlined />,
  DONE:       <CheckCircleOutlined />,
};

export interface KanbanColumnProps {
  column: KanbanColumnConfig;
  tasks: Task[];
  onDragStart: (e: React.DragEvent, taskId: number) => void;
  onDrop: (e: React.DragEvent, column: TaskColumn) => void;
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
  onAddTask,
  projectId,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

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
      {/* Column header */}
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
          <Text strong style={{ fontSize: 14 }}>{column.label}</Text>
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
        <Button
          type="text"
          size="small"
          icon={<PlusOutlined />}
          style={{ color: "#9ca3af" }}
          onClick={() => onAddTask(column.key)}
        />
      </div>

      {/* Task cards */}
      <div style={{ minHeight: 80 }}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={onDragStart}
            onEdit={onEdit}
            onDelete={onDelete}
            projectId={projectId}
          />
        ))}
      </div>

      {/* Add task button */}
      <button
        onClick={() => onAddTask(column.key)}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: 8,
          border: "1px dashed #e5e7eb",
          background: "transparent",
          color: "#9ca3af",
          fontSize: 13,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          transition: "background 0.15s, color 0.15s",
          marginTop: 4,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#fff";
          (e.currentTarget as HTMLButtonElement).style.color = "#4b5563";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
        }}
      >
        <PlusOutlined style={{ fontSize: 11 }} /> Add task
      </button>
    </div>
  );
};

export default KanbanColumn;
