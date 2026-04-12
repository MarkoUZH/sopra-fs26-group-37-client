"use client";
import { CalendarOutlined, TeamOutlined } from "@ant-design/icons";
import { Avatar, Badge, Card, Col, Progress, Row, Tag, Tooltip, Typography } from "antd";
import React from "react";
import { priorityConfig, Project, statusConfig } from "@/projects/projectTypes";

const { Title, Text, Paragraph } = Typography;

export interface ProjectHeaderProps {
  project: Project;
  totalTasks: number;
  doneTasks: number;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, totalTasks, doneTasks }) => {
  const status   = statusConfig[project.status];
  const priority = priorityConfig[project.priority];
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: 14,
        border: "1px solid #f0f0f0",
        overflow: "hidden",
        boxShadow: "0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Colour bar */}
      <div style={{ height: 5, background: project.color }} />

      <div style={{ padding: "20px 24px" }}>
        <Row gutter={[24, 16]} align="middle">
          {/* Left: title + description */}
          <Col flex="1">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: `${project.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TeamOutlined style={{ fontSize: 22, color: project.color }} />
              </div>
              <div>
                <Title level={3} style={{ margin: 0 }}>{project.name}</Title>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <Badge
                    status={status.badgeStatus}
                    text={<Text style={{ fontSize: 12, color: status.color }}>{status.label}</Text>}
                  />
                  <Tag color={priority.color} style={{ fontSize: 11, margin: 0 }}>
                    {priority.label} priority
                  </Tag>
                </div>
              </div>
            </div>
            <Paragraph style={{ color: "#6b7280", fontSize: 13, margin: 0, maxWidth: 620 }}>
              {project.description}
            </Paragraph>
          </Col>

          {/* Right: stats */}
          <Col>
            <Row gutter={[20, 0]} align="middle">
              {/* Progress */}
              <Col>
                <div style={{ textAlign: "center" }}>
                  <Text strong style={{ fontSize: 22, display: "block", color: project.color }}>
                    {progress}%
                  </Text>
                  <Text style={{ fontSize: 12, color: "#9ca3af" }}>Complete</Text>
                  <Progress
                    percent={progress}
                    showInfo={false}
                    strokeColor={project.color}
                    trailColor="#f0f0f0"
                    strokeWidth={5}
                    style={{ width: 100, margin: "4px 0 0" }}
                  />
                </div>
              </Col>

              {/* Total tasks */}
              <Col>
                <div style={{ textAlign: "center" }}>
                  <Text strong style={{ fontSize: 22, display: "block" }}>{totalTasks}</Text>
                  <Text style={{ fontSize: 12, color: "#9ca3af" }}>Total tasks</Text>
                </div>
              </Col>

              {/* Due date */}
              <Col>
                <div style={{ textAlign: "center" }}>
                  <Text strong style={{ fontSize: 16, display: "block" }}>
                    <CalendarOutlined style={{ fontSize: 14, marginRight: 4, color: "#9ca3af" }} />
                    {project.dueDate}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#9ca3af" }}>Due date</Text>
                </div>
              </Col>

              {/* Team */}
              <Col>
                <div>
                  <Text style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>
                    Team
                  </Text>
                  <Avatar.Group maxCount={4} size="small">
                    {project.team.map((m) => (
                      <Tooltip key={m.name} title={m.name}>
                        <Avatar
                          size="small"
                          style={{ backgroundColor: m.color, fontSize: 9, fontWeight: 700 }}
                        >
                          {m.initials}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </Avatar.Group>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default ProjectHeader;
