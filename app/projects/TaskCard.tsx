"use client";
import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, MenuProps, Tooltip, Typography } from "antd";
import React, { useState } from "react";
import { PRIORITY_DOT_COLOR, Task } from "@/projects/taskTypes";

const { Text } = Typography;

export interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, onEdit, onDelete }) => {
  const [dragging, setDragging] = useState(false);

  const menuItems: MenuProps["items"] = [
    { key: "edit",   label: "Edit task",   icon: <EditOutlined />                    },
    { key: "delete", label: "Delete task", icon: <DeleteOutlined />, danger: true },
  ];

  return (
    <div
      draggable
      onDragStart={(e) => { setDragging(true); onDragStart(e, task.id); }}
      onDragEnd={() => setDragging(false)}
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #f0f0f0",
        padding: "12px 14px",
        marginBottom: 10,
        cursor: "grab",
        opacity: dragging ? 0.4 : 1,
        boxShadow: dragging
          ? "0 8px 24px rgba(0,0,0,0.12)"
          : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "opacity 0.15s, box-shadow 0.15s",
        userSelect: "none",
      }}
    >
      {/* Top row: priority dot + title + menu */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flex: 1 }}>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: PRIORITY_DOT_COLOR[task.priority],
              flexShrink: 0,
              marginTop: 5,
            }}
          />
          <Text strong style={{ fontSize: 13, lineHeight: 1.4, flex: 1 }}>
            {task.title}
          </Text>
        </div>
        <Dropdown
          menu={{
            items: menuItems,
            onClick: ({ key }) => {
              if (key === "edit") onEdit(task);
              if (key === "delete") onDelete(task.id);
            },
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            style={{ color: "#bbb", flexShrink: 0 }}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      </div>

      {/* Description */}
      {task.description && (
        <Text
          style={{
            fontSize: 12,
            color: "#9ca3af",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            marginTop: 4,
            marginLeft: 16,
          } as React.CSSProperties}
        >
          {task.description}
        </Text>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8, marginLeft: 16 }}>
          {task.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 11,
                padding: "1px 7px",
                borderRadius: 20,
                background: "#f3f4f6",
                color: "#6b7280",
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: assignee + due date */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, marginLeft: 16 }}>
        {task.assignee ? (
          <Tooltip title={task.assignee.name}>
            <Avatar
              size={22}
              style={{ backgroundColor: task.assignee.color, fontSize: 9, fontWeight: 700, cursor: "pointer" }}
            >
              {task.assignee.initials}
            </Avatar>
          </Tooltip>
        ) : (
          <Avatar size={22} icon={<UserOutlined />} style={{ background: "#e5e7eb" }} />
        )}
        {task.dueDate && (
          <Text style={{ fontSize: 11, color: "#9ca3af" }}>
            <CalendarOutlined style={{ marginRight: 3 }} />
            {task.dueDate}
          </Text>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
