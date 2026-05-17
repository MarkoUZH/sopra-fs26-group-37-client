"use client";
import { MoreOutlined, ArrowRightOutlined, FolderOutlined, PlusOutlined, AimOutlined } from "@ant-design/icons";
import { Button, Card, Col, Dropdown, Flex, Progress, Row, Typography } from "antd";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ApiService } from "@/api/apiService";
import CreateProjectModal from "./CreateProjectModal";
import EditProjectModal from "./EditProjectModal";
import { getSprintTranslation } from "@/utils/dictionary_sprints";
import { useRouter } from "next/navigation";
import { ProjectDTO } from "@/projects/projectTypes";
import { getApiDomain } from "@/utils/domain";

const { Title, Text } = Typography;

// --- Interfaces ---

interface TranslateResponse {
    text?: () => Promise<string>;
}

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
    originalLanguage: string; // Captured to determine translation source language
}

const ProjectListSection = (): React.JSX.Element => {
    const [userId, setUserId] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectDTO | null>(null);
    const [isManager, setIsManager] = useState<boolean>(false);
    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [status, setStatus] = useState<"loading" | "ready">("loading");
    
    const [rawSprints, setRawSprints] = useState<SprintGetDTO[]>([]); // Keeps the raw untranslated API responses
    const [sprints, setSprints] = useState<SprintGetDTO[]>([]);       // Holds completely translated sprints
    const [projectLanguages, setProjectLanguages] = useState<Record<number, string>>({});
    const [targetLanguage, setTargetLanguage] = useState("en");

    const router = useRouter();
    const api = useMemo(() => new ApiService(), []);

    const handleEditClick = (project: ProjectDTO) => {
        setSelectedProject(project);
        setIsEditModalOpen(true);
    };

    // Sync language from storage
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

    // 1. Instant UI Label Translation (Dictionary Mapping)
    const uiText = useMemo(() => {
        return {
            activeSprintsTitle: getSprintTranslation("Active Sprints", targetLanguage),
            projectLabel: getSprintTranslation("Project", targetLanguage),
            daysRemaining: getSprintTranslation("days remaining", targetLanguage),
            ended: getSprintTranslation("Ended", targetLanguage),
            noSprintsText: getSprintTranslation("No active sprints available.", targetLanguage),
        };
    }, [targetLanguage]);

    const getDaysRemaining = (endDateStr: string) => {
        const end = new Date(endDateStr).getTime();
        const now = new Date().getTime();
        const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? `${diffDays} ${uiText.daysRemaining}` : uiText.ended;
    };

    // 2. Dynamic Translation Helper (API Method Matching Modal Setup)
    const translateText = useCallback(async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
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
            console.error("Translation error in dashboard:", err);
            return text;
        }
    }, [api]);

    // 3. Main Data Fetching Engine
    const fetchSprints = async () => {
        try {
            const userData = localStorage.getItem("id");
            if (!userData) return;

            const [allSprints, userProjects] = await Promise.all([
                api.get<SprintGetDTO[]>("/sprints"),
                api.get<ProjectGetDTO[]>(`/projects/users/${userData}`),
            ]);

            const myProjectIds = userProjects.map((project) => project.id);
            
            // Map project ID to its original language configuration
            const languageMap: Record<number, string> = {};
            userProjects.forEach(p => {
                languageMap[p.id] = p.originalLanguage || "it";
            });
            setProjectLanguages(languageMap);

            const now = new Date();
            const activeAndMySprints = allSprints.filter((sprint) => {
                const startDate = new Date(sprint.startTime);
                const endDate = new Date(sprint.endTime);
                const isActive = startDate <= now && endDate >= now;
                const isMyProject = myProjectIds.includes(sprint.projectId);
                return isActive && isMyProject;
            });

            setRawSprints(activeAndMySprints);
        } catch (e) {
            console.error("Failed to fetch or filter sprints", e);
        }
    };

    // 4. Effect to Process Dynamic Translation of Sprint Objects (Matching Modal Logic)
// 4. Effect to Process Dynamic Translation of Sprint Objects (With Backlog Skip Logic)
useEffect(() => {
    const translateDynamicContent = async () => {
        const translated = await Promise.all(
            rawSprints.map(async (s) => {
                const source = projectLanguages[s.projectId] || "it"; 
                
                // Check if the sprint name is "backlog" (case-insensitive)
                const isBacklog = s.name.trim().toLowerCase() === "backlog";

                return {
                    ...s,
                    // Skip translation if it's a backlog sprint, otherwise translate it
                    name: isBacklog ? s.name : await translateText(s.name, source, targetLanguage),
                    projectName: await translateText(s.projectName || "", source, targetLanguage)
                };
            })
        );
        setSprints(translated);
    };

    if (rawSprints.length > 0 && Object.keys(projectLanguages).length > 0) {
        translateDynamicContent();
    } else if (rawSprints.length === 0) {
        setSprints([]);
    }
}, [targetLanguage, rawSprints, projectLanguages, translateText]);

    useEffect(() => {
        fetchSprints();

        const handleRefresh = () => fetchSprints();
        window.addEventListener("sprintCreated", handleRefresh);

        return () => {
            window.removeEventListener("sprintCreated", handleRefresh);
        };
    }, []);

    useEffect(() => {
        setUserId(localStorage.getItem("id"));
    }, []);

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
                                        strokeColor="#4f46e5" 
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
};

export default ProjectListSection;