"use client";
import { MoreOutlined, ArrowRightOutlined, FolderOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Dropdown, Flex, Progress, Row, Typography } from "antd";
import React, { useEffect, useState, useMemo } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { AimOutlined } from "@ant-design/icons";
import { ApiService } from "@/api/apiService";
import CreateProjectModal from "./CreateProjectModal";
import EditProjectModal from "./EditProjectModal";
import { getSprintTranslation } from "@/utils/dictionary_sprints";
import { useRouter } from "next/navigation";
import { ProjectDTO } from "@/projects/projectTypes";
import { getApiDomain } from "@/utils/domain";

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
    memberIds: number[];
}

interface ProjectGetDTO {
    id: number;
    projectName: string;
}



const ProjectListSection = (): React.JSX.Element => {
    const [userId, setUserId] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectDTO | null>(null);
    const [isManager, setIsManager] = useState<boolean>(false);
    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [status, setStatus] = useState<"loading" | "ready">("loading");
    const [sprints, setSprints] = useState<SprintGetDTO[]>([]);
    const [targetLanguage, setTargetLanguage] = useState("en");

    const router = useRouter();
    const api = useMemo(() => new ApiService(), []);

    // FIX 1: handleEditClick is now a proper standalone function
    const handleEditClick = (project: ProjectDTO) => {
        setSelectedProject(project);
        setIsEditModalOpen(true);
    };

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

const uiText = useMemo(() => {
  return {
    activeSprintsTitle: getSprintTranslation("Active Sprints", targetLanguage),
    projectLabel: getSprintTranslation("Project", targetLanguage),
    daysRemaining: getSprintTranslation("days remaining", targetLanguage),
    ended: getSprintTranslation("Ended", targetLanguage),
    noSprintsText: getSprintTranslation("No active sprints available.", targetLanguage),
  };
}, [targetLanguage]);
    const fetchSprints = async () => {
        try {
            const userData = localStorage.getItem("id");

            const [allSprints, userProjects] = await Promise.all([
                api.get<SprintGetDTO[]>("/sprints"),
                api.get<ProjectGetDTO[]>(`/projects/users/${userData}`),
            ]);

            const myProjectIds = userProjects.map((project) => project.id);
            const now = new Date();

            const activeAndMySprints = allSprints.filter((sprint) => {
                const startDate = new Date(sprint.startTime);
                const endDate = new Date(sprint.endTime);
                const isActive = startDate <= now && endDate >= now;
                const isMyProject = myProjectIds.includes(sprint.projectId);
                return isActive && isMyProject;
            });

            setSprints(activeAndMySprints);
        } catch (e) {
            console.error("Failed to fetch or filter sprints", e);
        }
    };

    // FIX 2: fetchSprints effect is now its own top-level useEffect
    useEffect(() => {
        fetchSprints();

        const handleRefresh = () => fetchSprints();
        window.addEventListener("sprintCreated", handleRefresh);

        return () => {
            window.removeEventListener("sprintCreated", handleRefresh);
        };
    }, []);

    // FIX 3: userId effect is now a proper top-level useEffect
    useEffect(() => {
        setUserId(localStorage.getItem("id"));
    }, []);

    // FIX 4: seed/REST effect is now a proper top-level useEffect
    useEffect(() => {
        if (!userId) return;

        const seed = async () => {
            try {
                const [userData, projectData] = await Promise.all([
                    api.get<{ manager: boolean }>(`/users/${userId}`),
                    api.get<ProjectDTO[]>(`/projects/users/${userId}`),
                ]);
                setIsManager(userData.manager);
                setProjects(projectData ?? []);
            } catch (e) {
                console.error("Initial project fetch failed:", e);
            } finally {
                setStatus("ready");
            }
        };

        seed();
    }, [userId, api]);

    // FIX 5: WebSocket effect is now a proper top-level useEffect
    /*useEffect(() => {
        if (!userId) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${getApiDomain()}/ws/projects`),
            onConnect: () => {
                client.subscribe("/topic/projects", (msg) => {
                    const { type, payload } = JSON.parse(msg.body);
                    switch (type) {
                        case "project_created":
                            if ((payload as ProjectDTO).members?.some((m) => String(m.id) === userId)) {
                                setProjects((prev) => [...prev, payload]);
                            }
                            break;
                        case "project_updated":
                            setProjects((prev) => prev.map((p) => (p.id === payload.id ? payload : p)));
                            break;
                        case "project_deleted":
                            setProjects((prev) => prev.filter((p) => p.id !== payload.id));
                            break;
                    }
                });
                client.publish({
                    destination: "/app/subscribe_projects",
                    body: JSON.stringify({ userId }),
                });
            },
            reconnectDelay: 3000,
        });

        client.activate();
        return () => {
            client.deactivate();
        };
    }, [userId]);*/

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

export default ProjectListSection;