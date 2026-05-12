"use client";
import { useState, useEffect, useMemo } from "react";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  ThunderboltOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Card, Col, Layout, Row, Typography, Spin } from "antd";
import React from "react";
import { TagsProvider } from "@/dashboard/TagsContext";
import { getTranslation } from "@/utils/dictionary_top_section";

// --- ACTUAL PROJECT IMPORTS ---
import ProjectListSection from "./ProjectListSection";
import SideBarSection from "./SideBarSection";
import CreateProjectModal from "./CreateProjectModal";
import { ApiService } from "@/api/apiService";
import { Task } from "@/projects/taskTypes";
import { ProjectDTO } from "@/projects/projectTypes";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const Dashboard = (): React.JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const apiService = useMemo(() => new ApiService(), []);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Load Language
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("language");
      if (savedLang) {
        try {
          setTargetLanguage(JSON.parse(savedLang));
        } catch {
          setTargetLanguage(savedLang.replace(/"/g, ''));
        }
      }
    }
  }, []);

  const uiText = useMemo(() => ({
    dashboardTitle: getTranslation("My Dashboard", targetLanguage),
    totalTasks: getTranslation("Total Tasks", targetLanguage),
    todo: getTranslation("To-Do", targetLanguage),
    inProgress: getTranslation("In Progress", targetLanguage),
    completed: getTranslation("Completed", targetLanguage),
    activeSprints: getTranslation("Active Sprints", targetLanguage),
  }), [targetLanguage]);

  // 2. Fetch Data (Tasks and Projects)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksData, projectsData] = await Promise.all([
          apiService.get<Task[]>("/tasks"),
          apiService.get<ProjectDTO[]>("/projects")
        ]);
        setTasks(tasksData || []);
        setProjects(projectsData || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiService]);

  // 3. User Identity
  const userIdRaw = typeof window !== "undefined" ? localStorage.getItem("id") : null;
  const currentUserId = userIdRaw ? Number(userIdRaw.replace(/['"]+/g, '')) : null;

  // 4. Logic: Filter Projects and Sprints the user is part of
  const { userTasks, activeSprintCount } = useMemo(() => {
    // Only count tasks assigned to the current user
    const uTasks = tasks.filter((t) => 
      t.assignedUsers?.some(u => u.id === currentUserId)
    );

    // Only count sprints from projects where the user is a member
    const uProjects = projects.filter((p) => 
      p.members?.some((m: any) => m.id === currentUserId)
    );

    const aSprintCount = uProjects
      .flatMap((p) => p.sprints || [])
      .filter((s: any) => s.sprintStatus?.toUpperCase() === "ACTIVE")
      .length;

    return { userTasks: uTasks, activeSprintCount: aSprintCount };
  }, [tasks, projects, currentUserId]);

  const statsData = [
    {
      icon: <UnorderedListOutlined style={{ fontSize: 24, color: "#fff" }} />,
      iconBg: "#2b7fff",
      value: userTasks.length.toString(),
      label: uiText.totalTasks,
    },
    {
      icon: <FlagOutlined style={{ fontSize: 24, color: "#fff" }} />,
      iconBg: "#f04000",
      value: userTasks.filter((t) => t.status === "TODO").length.toString(),
      label: uiText.todo,
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: 24, color: "#fff" }} />,
      iconBg: "#f0b100",
      value: userTasks.filter((t) => t.status === "IN_PROGRESS").length.toString(),
      label: uiText.inProgress,
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: 24, color: "#fff" }} />,
      iconBg: "#00c950",
      value: userTasks.filter((t) => t.status === "DONE").length.toString(),
      label: uiText.completed,
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: 24, color: "#fff" }} />,
      iconBg: "#ad46ff",
      value: activeSprintCount.toString(),
      label: uiText.activeSprints,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <TagsProvider>
      <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
        <Sider
          width={220}
          theme="light"
          style={{
            position: "fixed",
            left: 0, top: 0, bottom: 0,
            height: "100vh",
            boxShadow: "2px 0 6px rgba(0, 0, 0, 0.03)",
            zIndex: 10,
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
                  <Card style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 52, height: 52,
                      borderRadius: 10,
                      background: stat.iconBg,
                      marginBottom: 12,
                    }}>
                      {stat.icon}
                    </div>
                    <div>
                      <Text strong style={{ fontSize: 24, display: "block" }}>{stat.value}</Text>
                      <Text style={{ color: "#4A5565" }}>{stat.label}</Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            <ProjectListSection />
            
            <CreateProjectModal
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
            <TaskSummarySection />
          </Content>
        </Layout>
      </Layout>
    </TagsProvider>
  );
};

export default Dashboard;