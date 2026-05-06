"use client";
import { TeamOutlined } from "@ant-design/icons";
import { Avatar, Card, Col, Progress, Row, Tooltip, Typography } from "antd";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ApiService } from "@/api/apiService";
// 1. Import your new dictionary helper
import { getHeaderTranslation } from "@/utils/dictionary_projectHeaders";

const { Title, Text, Paragraph } = Typography;

interface TranslateResponse {
  text?: () => Promise<string>;
}

export interface ProjectHeaderProps {
  project: {
    name: string;
    description: string;
    originalLanguage?: string;
    members: { id: number; username: string; name?: string }[];
    owner?: { id: number; username: string };
  };
  totalTasks: number;
  doneTasks: number;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, totalTasks, doneTasks }) => {
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  
  const [displayContent, setDisplayContent] = useState({
    name: project.name,
    description: project.description
  });

  const api = useMemo(() => new ApiService(), []);
  
  const targetLanguage = useMemo(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("language")?.replace(/"/g, '') || "en";
    }
    return "en";
  }, []);

  // 2. Compute UI labels using the dictionary
  const uiLabels = useMemo(() => ({
    complete: getHeaderTranslation("Complete", targetLanguage),
    totalTasks: getHeaderTranslation("Total tasks", targetLanguage),
    team: getHeaderTranslation("Team", targetLanguage),
  }), [targetLanguage]);

  const translateText = useCallback(async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
    if (!text || sourceLang === targetLang) return text;
    try {
      const result = await api.post<TranslateResponse | string>("/translate", {
        text,
        sourceLanguage: sourceLang,
        language: targetLang,
      });

      if (result && typeof result === 'object' && typeof result.text === 'function') {
        return await result.text();
      }
      
      return typeof result === 'string' ? result : text;
    } catch (err) {
      console.error("Translation error:", err);
      return text;
    }
  }, [api]);

  useEffect(() => {
    const autoTranslate = async () => {
      const source = project.originalLanguage || "en";
      
      if (source !== targetLanguage) {
        const [tName, tDesc] = await Promise.all([
          translateText(project.name, source, targetLanguage),
          translateText(project.description || "", source, targetLanguage)
        ]);
        setDisplayContent({ name: tName, description: tDesc });
      } else {
        setDisplayContent({ name: project.name, description: project.description });
      }
    };

    autoTranslate();
  }, [project, targetLanguage, translateText]);

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
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ height: 5 }} />

      <div style={{ padding: "20px 24px" }}>
        <Row gutter={[24, 16]} align="middle" justify="space-between">
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
                <TeamOutlined style={{ fontSize: 22 }} />
              </div>
              <Title level={3} style={{ margin: 0 }}>{displayContent.name}</Title>
            </div>
            <Paragraph style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
              {displayContent.description}
            </Paragraph>
          </Col>

          <Col>
            <Row gutter={[32, 0]} align="top">
              <Col style={columnStyle}>
                <Text strong style={{ fontSize: 22, lineHeight: "28px" }}>
                  {progress}%
                </Text>
                {/* 3. Swap "Complete" for the dictionary label */}
                <Text style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>
                  {uiLabels.complete}
                </Text>
                <Progress
                  percent={progress}
                  showInfo={false}
                  railColor="#f0f0f0"
                  strokeColor="#1677ff"
                  size={["small", 5]}
                  style={{ width: 100, margin: 0 }}
                />
              </Col>

              <Col style={columnStyle}>
                <Text strong style={{ fontSize: 22, lineHeight: "28px" }}>{totalTasks}</Text>
                {/* 4. Swap "Total tasks" for the dictionary label */}
                <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                  {uiLabels.totalTasks}
                </Text>
              </Col>

              <Col style={columnStyle}>
                {/* 5. Swap "Team" for the dictionary label */}
                <Text style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>
                  {uiLabels.team}
                </Text>
                <Avatar.Group max={{ count: 4 }} size="small">
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