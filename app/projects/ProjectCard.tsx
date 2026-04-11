"use client";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EllipsisOutlined,
  FlagOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dropdown,
  MenuProps,
  Progress,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import React from "react";
import { Project, priorityConfig, statusConfig } from "@/projects/projectTypes";
import { useRouter } from "next/navigation";

const { Text } = Typography;

const cardMenuItems: MenuProps["items"] = [
  { key: "edit",    label: "Edit project" },
  { key: "archive", label: "Archive"      },
  { type: "divider"                       },
  { key: "delete",  label: "Delete", danger: true },
];

interface ProjectCardProps {
  project: Project;
  onMenuAction?: (key: string, project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onMenuAction }) => {
  const status   = statusConfig[project.status];
  const priority = priorityConfig[project.priority];
  const router = useRouter();

  const progressColor =
    project.progress === 100
      ? "#00c950"
      : project.progress >= 60
      ? "#2b7fff"
      : project.progress >= 30
      ? "#f0b100"
      : "#f04000";

  const menuItems: MenuProps["items"] = cardMenuItems;

  return (
    <Card
      hoverable
      style={{
        borderRadius: 12,
        border: "1px solid #f0f0f0",
        boxShadow:
          "0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)",
        overflow: "hidden",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onClick={() => project?.id && router.push(`/projects/${project.id}`)}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.10)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Colour accent bar */}
      <div style={{ height: 4, background: project.color, borderRadius: "12px 12px 0 0" }} />

      <div style={{ padding: "16px 20px 20px" }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: `${project.color}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FolderOutlined style={{ fontSize: 18, color: project.color }} />
            </div>
            <div>
              <Text strong style={{ fontSize: 15, display: "block", lineHeight: 1.3 }}>
                {project.name}
              </Text>
              <Badge
                status={status.badgeStatus}
                text={<Text style={{ fontSize: 12, color: status.color }}>{status.label}</Text>}
              />
            </div>
          </div>

          <Dropdown
            menu={{
              items: menuItems,
              onClick: ({ key }) => onMenuAction?.(key, project),
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<EllipsisOutlined />}
              size="small"
              style={{ color: "#8c8c8c" }}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </div>

        {/* Description */}
        <Text
          style={{
            fontSize: 13,
            color: "#6b7280",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.5,
            marginBottom: 14,
          } as React.CSSProperties}
        >
          {project.description}
        </Text>

        {/* Progress */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ fontSize: 12, color: "#8c8c8c" }}>Progress</Text>
            <Text strong style={{ fontSize: 12, color: progressColor }}>
              {project.progress}%
            </Text>
          </div>
          <Progress
            percent={project.progress}
            showInfo={false}
            strokeColor={progressColor}
            trailColor="#f0f0f0"
            strokeWidth={6}
            style={{ margin: 0 }}
          />
        </div>

        {/* Task mini-stats */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 14,
            padding: "8px 12px",
            background: "#fafafa",
            borderRadius: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <FlagOutlined style={{ fontSize: 12, color: "#f04000" }} />
            <Text style={{ fontSize: 12, color: "#4A5565" }}>
              <Text strong>{project.tasksTotal - project.tasksDone - project.tasksInProgress}</Text> to-do
            </Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <ClockCircleOutlined style={{ fontSize: 12, color: "#f0b100" }} />
            <Text style={{ fontSize: 12, color: "#4A5565" }}>
              <Text strong>{project.tasksInProgress}</Text> in progress
            </Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <CheckCircleOutlined style={{ fontSize: 12, color: "#00c950" }} />
            <Text style={{ fontSize: 12, color: "#4A5565" }}>
              <Text strong>{project.tasksDone}</Text> done
            </Text>
          </div>
        </div>

        {/* Footer: team + due date + priority */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Avatar.Group maxCount={3} size="small">
            {project.team.map((member) => (
              <Tooltip key={member.name} title={member.name}>
                <Avatar
                  size="small"
                  style={{ backgroundColor: member.color, fontSize: 10, fontWeight: 600, cursor: "pointer" }}
                >
                  {member.initials}
                </Avatar>
              </Tooltip>
            ))}
          </Avatar.Group>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Tag color={priority.color} style={{ fontSize: 11, margin: 0, padding: "0 6px" }}>
              {priority.label}
            </Tag>
            <Text style={{ fontSize: 12, color: "#8c8c8c" }}>Due {project.dueDate}</Text>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
