"use client";
import { AimOutlined } from "@ant-design/icons";
import { Card, Col, Flex, Progress, Row, Typography } from "antd";
import React, { useEffect, useState, useMemo } from "react";

// --- ACTUAL LOCAL IMPORTS ---
import { useApi } from "@/hooks/useApi"; 
import { getSprintTranslation } from "@/utils/dictionary_sprints";
// ---------------------------

const { Title, Text } = Typography;

interface SprintGetDTO {
  id: number;
  name: string;
  sprintStatus: string;
  startTime: string; 
  endTime: string;   
  projectId: number;
  projectName: string;
}

export default function ProjectListSection(): React.JSX.Element {
  const api = useApi();
  const [sprints, setSprints] = useState<SprintGetDTO[]>([]);
  const [targetLanguage, setTargetLanguage] = useState("en");

  // 1. Sync language from LocalStorage
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

  // 2. Instant Dictionary Lookup (Replaces old translatePage useEffect)
  const uiText = useMemo(() => {
    return {
      activeSprintsTitle: getSprintTranslation("Active Sprints", targetLanguage),
      projectLabel: getSprintTranslation("Project", targetLanguage),
      daysRemaining: getSprintTranslation("days remaining", targetLanguage),
      ended: getSprintTranslation("Ended", targetLanguage),
      noSprintsText: getSprintTranslation("No active sprints available.", targetLanguage)
    };
  }, [targetLanguage]);

  // 3. Fetch data on mount
  useEffect(() => {
    let isMounted = true;

    const fetchSprints = async () => {
      try {
        const fetchedSprints = await api.get<SprintGetDTO[]>("/sprints");
        if (!isMounted) return;

        const now = new Date();
        const activeSprints = fetchedSprints.filter((sprint) => {
          const endDate = new Date(sprint.endTime);
          return endDate >= now;
        });
        setSprints(activeSprints);
      } catch (e) {
        console.error("Failed to fetch sprints", e);
      }
    };
    
    fetchSprints();
    return () => { isMounted = false; };
  }, [api]);

  // Helper for date formatting
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    // You can also make the locale dynamic based on targetLanguage if desired!
    return date.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Helper for "days remaining" logic
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
          sprints.map((sprint) => (
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
                  percent={0} 
                  style={{ flex: 1, margin: 0 }}
                  showInfo={false}
                />
                <Text style={{ color: "#4A5565" }}>0%</Text>
              </Flex>
            </Flex>
          ))
        ) : (
          <Text type="secondary">{uiText.noSprintsText}</Text>
        )}
      </Flex>
    </Card>
  );
}