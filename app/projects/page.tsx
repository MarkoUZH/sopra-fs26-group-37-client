"use client";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  ThunderboltOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Card, Col, Layout, Row, Typography, message } from "antd";
import React, { useState, useEffect } from "react";

// --- INLINE DEPENDENCIES FOR PREVIEW ENVIRONMENT ---
// These replace the Next.js and custom hooks so the code compiles in the browser,
// while STILL making real network requests to your local Spring Boot backend.
const useApi = () => {
  return {
    post: async <T = any>(endpoint: string, data: any): Promise<T> => {
      const baseUrl = "http://localhost:8080";
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': localStorage.getItem('token') || '' 
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        return response.json() as Promise<T>;
      }
      return response.text() as unknown as Promise<T>;
    }
  };
};

const ProjectListSection = () => (
  <div style={{ padding: 24, background: '#fff', borderRadius: 8, marginTop: 24, border: '1px dashed #d9d9d9' }}>
    [ProjectListSection Component Placeholder]
  </div>
);

const SideBarSection = () => (
  <div style={{ padding: '24px 16px', color: '#555' }}>
    [SideBarSection Component Placeholder]
  </div>
);
// --------------------------------------------------

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

// 1. Define the base English text outside to avoid recreating it on every render
const baseText = {
  title: "My Projects",
  totalTasks: "Total Tasks",
  todo: "To-Do",
  inProgress: "In Progress",
  completed: "Completed",
  activeSprints: "Active Sprints",
};

const Projects = (): React.JSX.Element => {
  const [modalOpen, setModalOpen] = useState(false);
  const apiService = useApi();

  // 2. State for the UI text and the selected language
  const [uiText, setUiText] = useState(baseText);
  const [targetLanguage, setTargetLanguage] = useState("en");

  // Read preferred language from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("language");
      if (savedLang) {
        try {
          // It might be stored as '"fr"' or 'fr', so we try parsing first
          setTargetLanguage(JSON.parse(savedLang));
        } catch {
          setTargetLanguage(savedLang);
        }
      }
    }
  }, []);

  // 3. Translation Effect
  useEffect(() => {
    let authErrorShown = false;

    const translatePage = async () => {
      // If English, just revert to base text
      if (targetLanguage === "en") {
        setUiText(baseText);
        return;
      }

      const translate = async (text: string) => {
        try {
          return await apiService.post<string>("/translate", {
            text: text,
            sourceLanguage: "en",
            language: targetLanguage,
          });
        } catch (err) {
          // Gracefully handle auth errors without spamming the console
          if (err instanceof Error && err.message.includes("401") && !authErrorShown) {
            authErrorShown = true;
            message.warning("Translation requires authorization. Make sure you are logged in.");
          } else if (!authErrorShown) {
            console.error("Translation failed for text:", text, err);
          }
          return text;
        }
      };

      // Translate all labels simultaneously to prevent a slow loading cascade
      const [title, totalTasks, todo, inProgress, completed, activeSprints] = await Promise.all([
        translate(baseText.title),
        translate(baseText.totalTasks),
        translate(baseText.todo),
        translate(baseText.inProgress),
        translate(baseText.completed),
        translate(baseText.activeSprints),
      ]);

      setUiText({
        title,
        totalTasks,
        todo,
        inProgress,
        completed,
        activeSprints,
      });
    };

    translatePage();
  }, [targetLanguage, apiService]);

  // 4. Move statsData INSIDE the component so it can use the dynamic uiText state
  const statsData = [
    {
      icon: <UnorderedListOutlined style={{ fontSize: 24, color: "#fff" }} />,
      iconBg: "#2b7fff",
      value: "18",
      label: uiText.totalTasks,
    },
    {
      icon: <FlagOutlined style={{ fontSize: 24, color: "#fff" }} />,
      iconBg: "#f04000",
      value: "9",
      label: uiText.todo,
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: 24, color: "#fff" }} />,
      iconBg: "#f0b100",
      value: "5",
      label: uiText.inProgress,
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: 24, color: "#fff" }} />,
      iconBg: "#00c950",
      value: "4",
      label: uiText.completed,
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: 24, color: "#fff" }} />,
      iconBg: "#ad46ff",
      value: "1",
      label: uiText.activeSprints,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Sider
        width={220}
        theme="light"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          height: "100vh",
          boxShadow: "2px 0 6px rgba(0, 0, 0, 0.03)",
          background: "#fff",
        }}
      >
        <SideBarSection />
      </Sider>

      <Layout style={{ marginLeft: 220 }}>
        <Content style={{ padding: "24px", background: "#f5f5f5" }}>
          
          {/* Header Row containing the translated Title */}
          <div style={{ marginBottom: 24 }}>
            <Title level={1} style={{ margin: 0 }}>{uiText.title}</Title>
          </div>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {statsData.map((stat, index) => (
              <Col key={index} flex="1 1 20%">
                <Card
                  style={{
                    boxShadow:
                      "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 52,
                      height: 52,
                      borderRadius: 10,
                      background: stat.iconBg,
                      marginBottom: 12,
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 24, display: "block" }}>
                      {stat.value}
                    </Text>
                    <Text style={{ color: "#4A5565" }}>{stat.label}</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <ProjectListSection />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Projects;