"use client";
import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, MenuProps, Switch, Tooltip, Typography } from "antd";
import React, { useState } from "react";
import { Task } from "@/projects/taskTypes";
import { useTags } from "@/dashboard/TagsContext";

const { Text } = Typography;

const COLOR_PALETTE = [
  { bg: "#ede9fe", text: "#6d28d9" },
  { bg: "#dbeafe", text: "#1d4ed8" },
  { bg: "#d1fae5", text: "#065f46" },
  { bg: "#fee2e2", text: "#b91c1c" },
  { bg: "#fce7f3", text: "#9d174d" },
  { bg: "#fef9c3", text: "#92400e" },
  { bg: "#e0f2fe", text: "#0369a1" },
  { bg: "#ffedd5", text: "#c2410c" },
];

const getAvatarColor = (userId: number) => {
  const color = COLOR_PALETTE[userId % COLOR_PALETTE.length];
  return {
    backgroundColor: color.bg,
    color: color.text,
    border: `1px solid ${color.text}40`,
    fontSize: '11px',    // Explicitly set font size for the name initial
    fontWeight: '700',   // Make it bold so it stands out against the color
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
};

export interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  projectId: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, onEdit, onDelete, projectId }) => {
  const [dragging, setDragging] = useState(false);
  const { getTagsForProject } = useTags();
  
  // Logic to handle status vs column toggle
  //const isDone = task.status === "DONE";
  //const [toggled, setToggled] = useState(isDone);

  // Get the first user from the assignedUsers array (matching Java DTO)
  //const primaryAssignee = task.assignedUsers && task.assignedUsers.length > 0 
  //  ? task.assignedUsers[0] 
  //  : null;

  const menuItems: MenuProps["items"] = [
    { key: "edit", label: "Edit task", icon: <EditOutlined /> },
    { key: "delete", label: "Delete task", icon: <DeleteOutlined />, danger: true },
  ];

  return (
    <div
      draggable
      onDragStart={(e) => { 
        setDragging(true); 
        onDragStart(e, task.id); 
      }}
      onDragEnd={() => setDragging(false)}
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #f0f0f0",
        padding: "16px",
        marginBottom: 12,
        cursor: "grab",
        opacity: dragging ? 0.4 : 1,
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
        transition: "all 0.2s ease",
      }}
    >
      {/* Top Section: Tags + Menu */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {task.tags?.map((tag, index) => {
             const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
             return (
               <span 
                key={tag.id || index} 
                style={{ 
                  fontSize: 10, 
                  padding: "2px 8px", 
                  borderRadius: 4, 
                  background: color.bg, 
                  color: color.text, 
                  fontWeight: 600 
                }}
               >
                 {tag.name}
               </span>
             );
           })}
        </div>

        <Dropdown 
          menu={{ 
            items: menuItems, 
            onClick: ({ key }) => { 
              if (key === "edit") onEdit(task); 
              if (key === "delete") onDelete(task.id); 
            } 
          }} 
          trigger={["click"]}
        >
          <Button type="text" size="small" icon={<MoreOutlined />} style={{ color: "#9ca3af", padding: 0, height: 24 }} />
        </Dropdown>
      </div>

      {/* Title Section (Priority dot removed) */}
      <div style={{ marginBottom: 1 }}>
        <Text strong style={{ color: "#1f2937", fontSize: 14, lineHeight: 1.4 }}>
          {task.name}
        </Text>
      </div>

      {/* Description */}
      {task.description && (
        <Text style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 12, lineHeight: 1.5 }}>
          {task.description}
        </Text>
      )}

      {/* 4. FOOTER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f9f9f9", paddingTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {task.dueDate && (
            <Text style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center" }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </Text>
          )}
        </div>
        
        {/* AVATAR GROUP WITH FALLBACK CHECK */}
        <div style={{ minWidth: 32, display: 'flex', justifyContent: 'flex-end' }}>
            {task.assignedUsers && task.assignedUsers.length > 0 ? (
                <Avatar.Group maxCount={3} size="small">
                    {task.assignedUsers.map((user) => (
                        <Tooltip key={user.id} title={user.username}>
                          <Avatar size="small" style={{ backgroundColor: "#87d068" }}>
                            {"BORAT"}
                          </Avatar>
                        </Tooltip>
                    ))}
                </Avatar.Group>
            ) : (
                /* This will show if the array is empty - helping you debug! */
                <Avatar size="small" icon={<UserOutlined />} style={{ opacity: 0.5 }} />
            )}
        </div>
    </div>
  </div>
  ); 
};

export default TaskCard;