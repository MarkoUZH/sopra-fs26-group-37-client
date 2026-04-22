"use client";
import { CalendarOutlined, TeamOutlined } from "@ant-design/icons";
import { Avatar, Card, Col, Progress, Row, Tooltip, Typography } from "antd";
import { userAgent } from "next/server";
import React from "react";
const { Title, Text, Paragraph } = Typography;

export interface ProjectHeaderProps {
  project: {
    name: string;
    description: string;
    // Mapping Java's List<UserGetDTO> members
    members: { id: number; username: string; name?: string }[];
    // Mapping Java's UserGetDTO owner
    owner?: { id: number; username: string };
  };
  totalTasks: number;
  doneTasks: number;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, totalTasks, doneTasks }) => {
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Helper styles for centered metric columns
  const columnStyle: React.CSSProperties = {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  };

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
      <div style={{ height: 5,  }} />

      <div style={{ padding: "20px 24px" }}>
        <Row gutter={[24, 16]} align="middle" justify="space-between">
          {/* Left: title + description */}
          <Col flex="1 1 300px">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TeamOutlined style={{ fontSize: 22}} />
              </div>
              <Title level={3} style={{ margin: 0 }}>{project.name}</Title>
            </div>
            <Paragraph style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
              {project.description}
            </Paragraph>
          </Col>

          {/* Right: stats - aligned using Flexbox */}
          <Col>
            <Row gutter={[32, 0]} align="top">
              {/* Progress */}
              <Col style={columnStyle}>
                <Text strong style={{ fontSize: 22, lineHeight: "28px" }}>
                  {progress}%
                </Text>
                <Text style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>Complete</Text>
                <Progress
                  percent={progress}
                  showInfo={false}
                  trailColor="#f0f0f0"
                  strokeWidth={5}
                  style={{ width: 80, margin: 0 }}
                />
              </Col>

              {/* Total tasks */}
              <Col style={columnStyle}>
                <Text strong style={{ fontSize: 22, lineHeight: "28px" }}>{totalTasks}</Text>
                <Text style={{ fontSize: 12, color: "#9ca3af" }}>Total tasks</Text>
              </Col>

              {/* Team */}
              <Col style={columnStyle}>
                <Text style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>Team</Text>
                <Avatar.Group maxCount={4} size="small">
                  {project.members?.map((member) => (
                        <Tooltip key={member.id} title={member.username}>
                          <Avatar size="small" style={{ backgroundColor: "#87d068" }}>
                            {member.username.charAt(0).toUpperCase()}
                          </Avatar>
                        </Tooltip>
                      ))}
                </Avatar.Group>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default ProjectHeader;