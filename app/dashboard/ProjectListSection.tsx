"use client";
import { AimOutlined } from "@ant-design/icons";
import { Card, Col, Flex, Progress, Row, Typography } from "antd";
import React, { useEffect, useState, useMemo } from "react";
import { useApi } from "@/hooks/useApi"; 
import { getSprintTranslation } from "@/utils/dictionary_sprints";

const { Title, Text } = Typography;

interface SprintGetDTO {
  id: number;
  name: string;
  sprintStatus: string;
  startTime: string; 
  endTime: string;   
  projectId: number;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
}

export default function ProjectListSection(): React.JSX.Element {
  const api = useApi();
  const [sprints, setSprints] = useState<SprintGetDTO[]>([]);
  const [targetLanguage, setTargetLanguage] = useState("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("language");
      if (savedLang) {
        try {
          setTargetLanguage(JSON.parse(savedLang));
        } catch {
          setTargetLanguage(savedLang);
        }
      }
    }
  }, []);

  const uiText = useMemo(() => {
    return {
      activeSprintsTitle: getSprintTranslation("Active Sprints", targetLanguage),
      projectLabel: getSprintTranslation("Project", targetLanguage),
      daysRemaining: getSprintTranslation("days remaining", targetLanguage),
      ended: getSprintTranslation("Ended", targetLanguage),
      noSprintsText: getSprintTranslation("No active sprints available.", targetLanguage)
    };
  }, [targetLanguage]);

  // Fetch logic
  const fetchSprints = async () => {
    try {
      const fetchedSprints = await api.get<SprintGetDTO[]>("/sprints");
      const now = new Date();
      // Logic: Only show sprints that have started and haven't ended yet
      const activeSprints = fetchedSprints.filter((sprint) => {
        const startDate = new Date(sprint.startTime);
        const endDate = new Date(sprint.endTime);
        return startDate <= now && endDate >= now;
      });
      setSprints(activeSprints);
    } catch (e) {
      console.error("Failed to fetch sprints", e);
    }
  };

  useEffect(() => {
    fetchSprints();

    const handleRefresh = () => fetchSprints();
    window.addEventListener("sprintCreated", handleRefresh);
    
    return () => {
      window.removeEventListener("sprintCreated", handleRefresh);
    };
  }, [api]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} ${uiText.daysRemaining}` : uiText.ended;
  };

  return (
    <Card style={{ 
      borderRadius: 12, 
      width: "100%", 
      marginTop: 16, 
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' 
    }}>
      <Flex vertical gap={16}>
        <Flex align="center" gap={8}>
          <AimOutlined style={{ fontSize: 22 }} />
          <Title level={4} style={{ margin: 0 }}>
            {uiText.activeSprintsTitle}
          </Title>
        </Flex>

        {sprints.length > 0 ? (
          sprints.map((sprint) => {
            // --- CALCULATION LOGIC ---
            const progressPercent = sprint.totalTasks > 0 
              ? Math.round((sprint.completedTasks / sprint.totalTasks) * 100) 
              : 0;

            return (
              <Flex vertical gap={4} key={sprint.id}>
                <Title level={5} style={{ margin: 0 }}>
                  {sprint.name}
                </Title>

                <Row justify="space-between" align="middle">
                  <Col>
                    <Text style={{ color: "#4A5565" }}>
                      {formatDate(sprint.startTime)} - {formatDate(sprint.endTime)} 
                      &nbsp;•&nbsp; {uiText.projectLabel}: {sprint.projectName}
                    </Text>
                  </Col>
                  <Col>
                    <Text style={{ color: "#4A5565" }}>{getDaysRemaining(sprint.endTime)}</Text>
                  </Col>
                </Row>

                <Flex align="center" gap={8}>
                  <Progress
                    percent={progressPercent} 
                    strokeColor="#4f46e5" // Matching your "Add Sprint" button color
                    style={{ flex: 1, margin: 0 }}
                    showInfo={false}
                  />
                  <Text style={{ color: "#4A5565", minWidth: 35 }}>{progressPercent}%</Text>
                </Flex>
              </Flex>
            );
          })
        ) : (
          <Text type="secondary">{uiText.noSprintsText}</Text>
        )}
      </Flex>
    </Card>
  );
}