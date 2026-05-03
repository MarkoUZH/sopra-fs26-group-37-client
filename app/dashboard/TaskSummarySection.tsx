"use client";
import { MoreOutlined, ArrowRightOutlined, FolderOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Dropdown, Flex, Progress, Row, Typography } from "antd";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ApiService } from "@/api/apiService";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import CreateProjectModal from "./CreateProjectModal";
import EditProjectModal from "./EditProjectModal";
import { useRouter } from "next/navigation";
import { ProjectDTO } from "@/projects/projectTypes";
import { getTaskSummaryTranslation } from "@/utils/dictionary_task_summary";
import {getApiDomain} from "@/utils/domain";

const { Title, Text } = Typography;

// Define the interface to satisfy Vercel/TypeScript
interface TranslateResponse {
  text?: () => Promise<string>;
}

const TaskSummarySection = (): React.JSX.Element => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectDTO | null>(null);
  const [isManager, setIsManager] = useState<boolean>(false);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [displayProjects, setDisplayProjects] = useState<ProjectDTO[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();
  const api = useMemo(() => new ApiService(), []);
  const [targetLanguage, setTargetLanguage] = useState("en");

  // Sync language from storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("language");
      if (savedLang) {
        try { setTargetLanguage(JSON.parse(savedLang)); }
        catch { setTargetLanguage(savedLang); }
      }
    }
  }, []);

  // 1. Instant UI Label Translation (Dictionary)
  const uiText = useMemo(() => ({
    title: getTaskSummaryTranslation("Projects", targetLanguage),
    createProject: getTaskSummaryTranslation("Create Project", targetLanguage),
    editProject: getTaskSummaryTranslation("Edit Project", targetLanguage),
    tasksLabel: getTaskSummaryTranslation("tasks", targetLanguage),
    inProgressLabel: getTaskSummaryTranslation("in progress", targetLanguage),
    membersLabel: getTaskSummaryTranslation("members", targetLanguage),
    noProjects: getTaskSummaryTranslation("No projects found.", targetLanguage)
  }), [targetLanguage]);



  // 2. Dynamic Translation Helper (API) - 'any' replaced with 'TranslateResponse | string'
// Add sourceLang to the parameters
const translateText = useCallback(async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
  // If the project language is already the same as the target language, don't translate
  if (!text || sourceLang === targetLang) return text;

  try {
    const result = await api.post<TranslateResponse | string>("/translate", {
      text,
      sourceLanguage: sourceLang, // Use the passed sourceLang
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

  // 3. Translate Dynamic Project Content
useEffect(() => {
  const translateDynamicContent = async () => {
    // Note: We no longer skip if targetLanguage === "en" globally,
    // because some projects might be in "de" or "es" and need translation TO "en".

    const translated = await Promise.all(
      projects.map(async (p) => {
        // Use the project's specific originalLanguage
        const source = p.originalLanguage || "fr"; // Fallback to en if undefined

        return {
          ...p,
          name: await translateText(p.name, source, targetLanguage),
          description: await translateText(p.description, source, targetLanguage),
        };
      })
    );
    setDisplayProjects(translated);
  };

  if (projects.length > 0) translateDynamicContent();
}, [targetLanguage, projects, translateText]);

  // 4. Fetch Projects
    useEffect(() => {
        const fetchUserRole = async () => {
            const userId = localStorage.getItem("id");
            if (!userId) return;
            try {
                const userData = await api.get<{ manager: boolean }>(`/users/${userId}`);
                setIsManager(userData.manager);
            } catch (error) { console.error("User fetch error:", error); }
        };
        fetchUserRole();
    }, [api]);

    // WebSocket for projects
    useEffect(() => {
        const userId = localStorage.getItem("id");
        if (!userId) return;

        const client = new Client({
            webSocketFactory: () =>
                new SockJS(`${getApiDomain()}/ws/projects`),
            onConnect: () => {
                client.subscribe("/topic/projects", (msg) => {
                    const { type, payload } = JSON.parse(msg.body);
                    switch (type) {
                        case "projects_snapshot":
                            setProjects(
                                (payload as ProjectDTO[]).filter((p) =>
                                    p.members?.some((m) => String(m.id) === userId)
                                )
                            );
                            break;
                        case "project_created":
                            if ((payload as ProjectDTO).members?.some((m) => String(m.id) === userId)) {
                                setProjects((prev) => [...prev, payload]);
                            }
                            break;
                        case "project_updated":
                            setProjects((prev) =>
                                prev.map((p) => (p.id === payload.id ? payload : p))
                            );
                            break;
                        case "project_deleted":
                            setProjects((prev) => prev.filter((p) => p.id !== payload.id));
                            break;
                    }
                });
                client.publish({ destination: "/app/subscribe_projects", body: JSON.stringify({ userId }) });
            },
            reconnectDelay: 3000,
        });
        client.activate();
        return () => { client.deactivate(); };
    }, []);

  return (
    <Card style={{ borderRadius: 12, marginTop: 16, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Flex align="center" gap={8}>
          <FolderOutlined style={{ fontSize: 20 }} />
          <Title level={4} style={{ margin: 0 }}>{uiText.title}</Title>
        </Flex>
        {isManager && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            {uiText.createProject}
          </Button>
        )}
      </Flex>

      <Row gutter={[16, 16]}>
        {displayProjects.map((project, index) => {
          const originalProject = projects[index];
          const totalTasks = project.tasks?.length || 0;
          const completedTasks = project.tasks?.filter(t => t.status === "DONE").length || 0;
          const inProgressTasks = project.tasks?.filter(t => t.status === "IN_PROGRESS").length || 0;
          const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return (
            <Col xs={24} sm={12} lg={8} key={project.id}>
              <Card size="small" style={{ borderRadius: 12, height: '100%' }}>
                <Flex justify="space-between" align="center">
                  <Title level={5} style={{ margin: 0 }}>{project.name}</Title>
                  <Flex gap={8}>
                    {isManager && originalProject && (
                      <Dropdown menu={{ items: [{
                        key: 'edit',
                        label: uiText.editProject,
                        onClick: () => { setSelectedProject(originalProject); setIsEditModalOpen(true); }
                      }] }}>
                        <MoreOutlined style={{ cursor: "pointer", color: "#8c8c8c" }} />
                      </Dropdown>
                    )}
                    <ArrowRightOutlined
                      style={{ cursor: 'pointer' }}
                      onClick={() => router.push(`/projects/${project.id}`)}
                    />
                  </Flex>
                </Flex>

                <Text style={{ display: "block", margin: "8px 0", color: "#4A5565", minHeight: "40px" }}>
                  {project.description}
                </Text>

                <Flex justify="space-between">
                  <Text>{completedTasks}/{totalTasks} {uiText.tasksLabel}</Text>
                  <Text>{percentage}%</Text>
                </Flex>
                <Progress percent={percentage} showInfo={false} strokeColor="#00c950" />

                <Flex gap={8} style={{ marginTop: 8 }}>
                  <Text type="secondary">{inProgressTasks} {uiText.inProgressLabel}</Text>
                  <Text type="secondary">•</Text>
                  <Text type="secondary">
                    {originalProject?.members?.length || 0} {uiText.membersLabel}
                  </Text>
                </Flex>
              </Card>
            </Col>
          );
        })}
      </Row>

      {displayProjects.length === 0 && (
        <Flex justify="center" style={{ padding: '20px' }}>
          <Text type="secondary">{uiText.noProjects}</Text>
        </Flex>
      )}

      <CreateProjectModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {selectedProject && (
        <EditProjectModal
          open={isEditModalOpen}
          project={selectedProject}
          onClose={() => { setIsEditModalOpen(false); setSelectedProject(null); }}
        />
      )}
    </Card>
  );
};

export default TaskSummarySection;