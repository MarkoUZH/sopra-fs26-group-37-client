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
// --- DICTIONARY IMPORT ---
import { getTranslation } from "@/utils/dictionary_top_section";

// --- ACTUAL PROJECT IMPORTS ---
import ProjectListSection from "./ProjectListSection";
import SideBarSection from "./SideBarSection";
import TaskSummarySection from "./TaskSummarySection";
import CreateProjectModal from "./CreateProjectModal";
import { ApiService } from "@/api/apiService";
import { Task } from "@/projects/taskTypes";
import { ProjectDTO, TeamMember, Sprint } from "@/projects/projectTypes";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const Dashboard = (): React.JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const apiService = useMemo(() => new ApiService(), []);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);

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

  // 2. Memoized UI Text
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

  // 3. Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
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
    fetchDashboardData();
  }, [apiService]);

  // 4. Retrieve and sanitize Current User ID
  const userIdRaw = typeof window !== "undefined" ? localStorage.getItem("id") : null;
  const currentUserId = userIdRaw ? Number(userIdRaw.replace(/['"]+/g, '')) : null;

  // 5. Explicitly Typed Derived Computations (Safely reading missing interface properties)
  const { userTasks, activeSprintCount } = useMemo(() => {
    // Filter tasks assigned to this user
    const uTasks = tasks.filter((t) => 
      t.assignedUsers?.some(u => u.id === currentUserId)
    );

    // Filter projects where the user is listed in the members list
    const uProjects = projects.filter((p) => 
      p.members?.some((m: TeamMember) => m.id === currentUserId)
    );

    // FlatMap and filter to compute running sprint numbers
    const aSprintCount = uProjects
      .flatMap((p) => p.sprints || [])
      .filter((s: Sprint) => {
        // Accessing 'sprintStatus' safely through an index signature to accommodate interface definitions
        const rawStatus = (s as unknown as Record<string, unknown>)["sprintStatus"];
        return typeof rawStatus === "string" && rawStatus.toUpperCase() === "ACTIVE";
      })
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
            left: 0,
            top: 0,
            bottom: 0,
            height: "100vh",
            boxShadow: "2px 0 6px rgba(0, 0, 0, 0.03)",
            background: "#fff",
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
                  <Card
                    style={{
                      borderRadius: 12,
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