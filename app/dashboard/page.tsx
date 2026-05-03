"use client";
import { useState, useEffect, useMemo } from "react";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  ThunderboltOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Card, Col, Layout, Row, Typography } from "antd";
import React from "react";
import { TagsProvider } from "@/dashboard/TagsContext";
// --- DICTIONARY IMPORT ---
import { getTranslation } from "@/utils/dictionary_top_section";

// --- ACTUAL PROJECT IMPORTS ---
import ProjectListSection from "./ProjectListSection";
import SideBarSection from "./SideBarSection";
import TaskSummarySection from "./TaskSummarySection";
import CreateProjectModal from "./CreateProjectModal";
import { ApiService } from "@/api/apiService";
import { Task } from "@/projects/taskTypes";
// ------------------------------

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const Dashboard = (): React.JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const apiService = useMemo(() => new ApiService(), []);
  const [sprintUpdateTrigger, setSprintUpdateTrigger] = useState(0);

  // 1. Read preferred language from localStorage on mount
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

  // 2. Memoized UI Text - This replaces the old state and useEffect translation logic
  const uiText = useMemo(() => {
    return {
      dashboardTitle: getTranslation("My Dashboard", targetLanguage),
      totalTasks: getTranslation("Total Tasks", targetLanguage),
      todo: getTranslation("To-Do", targetLanguage),
      inProgress: getTranslation("In Progress", targetLanguage),
      completed: getTranslation("Completed", targetLanguage),
      activeSprints: getTranslation("Active Sprints", targetLanguage),
    };
  }, [targetLanguage]);

  // 3. Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await apiService.get<Task[]>("/tasks");
        setTasks(data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };
    fetchTasks();
  }, [apiService]);

  const statsData = [
    {
      icon: <UnorderedListOutlined style={{ fontSize: 24, color: "#fff" }} />,
      iconBg: "#2b7fff",
      value: tasks.length.toString(),
      label: uiText.totalTasks,
    },
    {
      icon: <FlagOutlined style={{ fontSize: 24, color: "#fff" }} />,
      iconBg: "#f04000",
      value: tasks.filter((t) => t.status === "TODO").length.toString(),
      label: uiText.todo,
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: 24, color: "#fff" }} />,
      iconBg: "#f0b100",
      value: tasks.filter((t) => t.status === "IN_PROGRESS").length.toString(),
      label: uiText.inProgress,
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: 24, color: "#fff" }} />,
      iconBg: "#00c950",
      value: tasks.filter((t) => t.status === "DONE").length.toString(),
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
    <TagsProvider>
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
            <Title level={1}>{uiText.dashboardTitle}</Title>
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
            <TaskSummarySection />
            <CreateProjectModal
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </Content>
        </Layout>
      </Layout>
    </TagsProvider>
  );
};

export default Dashboard;