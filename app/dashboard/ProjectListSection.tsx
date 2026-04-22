"use client";
import { AimOutlined } from "@ant-design/icons";
import { Card, Col, Flex, Progress, Row, Typography, message } from "antd";
import React, { useEffect, useState } from "react";

// --- ACTUAL LOCAL IMPORT ---
import { useApi } from "@/hooks/useApi"; 
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

// 1. Extract base English text for translation
const baseText = {
  activeSprintsTitle: "Active Sprints",
  projectLabel: "Project",
  daysRemaining: "days remaining",
  ended: "Ended",
  noSprintsText: "No active sprints available."
};

export default function ProjectListSection(): React.JSX.Element {
  const api = useApi();
  const [sprints, setSprints] = useState<SprintGetDTO[]>([]);

  // Translation State
  const [uiText, setUiText] = useState(baseText);
  const [targetLanguage, setTargetLanguage] = useState("en");

  // Read preferred language from localStorage on component mount
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

  // Translate page whenever targetLanguage changes
  useEffect(() => {
    let authErrorShown = false;

    const translatePage = async () => {
      // Revert to English instantly if English is selected
      if (targetLanguage === "en") {
        setUiText(baseText);
        return;
      }

      const translate = async (text: string) => {
        try {
            const result = await api.post<{ text?: () => Promise<string> } | string>("/translate", {
            text: text,
            sourceLanguage: "en",
            language: targetLanguage,
          });

          // Extract plain text if the API returns a raw Response object
          if (result && typeof result === 'object' && typeof result.text === 'function') {
              return await result.text();
          }

          return typeof result === 'string' ? result : text;
        } catch (err) {
          // Gracefully catch any 401s without spamming the console
          if (err instanceof Error && err.message.includes("401") && !authErrorShown) {
            authErrorShown = true;
            message.warning("Translation requires authorization. Please log in.");
          } else if (!authErrorShown) {
            console.error("Translation failed for text:", text, err);
          }
          return text; // Fallback to English on error
        }
      };

      // Resolve all translations concurrently
      const keys = Object.keys(baseText) as Array<keyof typeof baseText>;
      const translations = await Promise.all(
        keys.map((key) => translate(baseText[key]))
      );

      const newUiText = {} as typeof baseText;
      keys.forEach((key, index) => {
        newUiText[key] = translations[index];
      });

      setUiText(newUiText);
    };

    translatePage();
  }, [targetLanguage]); // Omitted `api` to prevent dependency loops

  // Fetch data on mount
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

    return () => {
      isMounted = false;
    };
  }, []); // Omitted `api` to prevent dependency loops

  // Helper for date formatting
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Helper for "days remaining" logic, utilizing the translated strings
  const getDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} ${uiText.daysRemaining}` : uiText.ended;
  };  
  
  return (
    <Card style={{ borderRadius: 12, width: "100%", marginTop: 16, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
      <Flex vertical gap={16}>
        <Flex align="center" gap={8}>
          <AimOutlined style={{ fontSize: 22 }} />
          <Title level={4} style={{ margin: 0 }}>
            {uiText.activeSprintsTitle}
          </Title>
        </Flex>

        {/* Map the dynamic sprints */}
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
                  percent={0} // Replace with dynamic calculation if you add task status to backend
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