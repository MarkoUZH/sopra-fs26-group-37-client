"use client";
import { MoreOutlined, ArrowRightOutlined, FolderOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Dropdown, Flex, Progress, Row, Typography } from "antd";
import React, { useEffect, useState, useMemo } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ApiService } from "@/api/apiService";
import CreateProjectModal from "./CreateProjectModal";
import EditProjectModal from "./EditProjectModal";
import { useRouter } from "next/navigation";
import { ProjectDTO } from "@/projects/projectTypes";
import { getApiDomain } from "@/utils/domain";

const { Title, Text } = Typography;

const ProjectListSection = (): React.JSX.Element => {
    const [userId, setUserId] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectDTO | null>(null);
    const [isManager, setIsManager] = useState<boolean>(false);
    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [status, setStatus] = useState<"loading" | "ready">("loading");

    const router = useRouter();
    const api = useMemo(() => new ApiService(), []);

    const handleEditClick = (project: ProjectDTO) => {
        setSelectedProject(project);
        setIsEditModalOpen(true);
    };

    // 1. Read userId from localStorage after mount
    useEffect(() => {
        setUserId(localStorage.getItem("id"));
    }, []);

    // 2. REST seed — runs when userId becomes available
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

    // 3. WebSocket — real-time updates only, no snapshot handling
    useEffect(() => {
        if (!userId) return;

        const client = new Client({
            webSocketFactory: () =>
                new SockJS(`${getApiDomain()}/ws/projects`),
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
                            setProjects((prev) =>
                                prev.map((p) => (p.id === payload.id ? payload : p))
                            );
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
        return () => { client.deactivate(); };
    }, [userId]);

    return (
        <Card style={{ borderRadius: 12, width: "100%", background: "#ffffff", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)" }}>
            <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                <Flex align="center" gap={8}>
                    <FolderOutlined style={{ fontSize: 20 }} />
                    <Title level={4} style={{ margin: 0 }}>Projects</Title>
                </Flex>
                {isManager && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                        Create Project
                    </Button>
                )}
            </Flex>

            <Row gutter={[16, 16]}>
                {projects.map((project) => {
                    const totalTasks = project.tasks?.length || 0;
                    const completedTasks = project.tasks?.filter(t => t.status === "DONE").length || 0;
                    const inProgressTasks = project.tasks?.filter(t => t.status === "IN_PROGRESS").length || 0;
                    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                    return (
                        <Col xs={24} sm={12} lg={8} key={project.id} style={{ display: "flex" }}>
                            <Card size="small" style={{ borderRadius: 12, width: "100%", display: "flex", flexDirection: "column" }}>
                                <Flex justify="space-between" align="center">
                                    <Title level={5} style={{ margin: 0 }}>{project.name}</Title>
                                    <Flex gap={8} align="center">
                                        {isManager && (
                                            <Dropdown
                                                menu={{
                                                    items: [{ key: "edit", label: "Edit Project", onClick: () => handleEditClick(project) }],
                                                }}
                                                trigger={["click"]}
                                            >
                                                <MoreOutlined style={{ cursor: "pointer", fontSize: 18, color: "#8c8c8c" }} />
                                            </Dropdown>
                                        )}
                                        <ArrowRightOutlined
                                            style={{ cursor: "pointer", fontSize: 18 }}
                                            onClick={() => router.push(`/projects/${project.id}`)}
                                        />
                                    </Flex>
                                </Flex>

                                <Text style={{ display: "block", margin: "8px 0", color: "#4A5565", minHeight: "40px" }}>
                                    {project.description}
                                </Text>

                                <Flex justify="space-between" align="center">
                                    <Text style={{ color: "#4A5565" }}>{completedTasks}/{totalTasks} tasks</Text>
                                    <Text style={{ color: "#4A5565" }}>{percentage}%</Text>
                                </Flex>

                                <Progress percent={percentage} showInfo={false} size="small" strokeColor="#00c950" />

                                <Flex gap={8} align="center" style={{ marginTop: 8 }}>
                                    <Text style={{ color: "#4A5565" }}>{inProgressTasks} in progress</Text>
                                    <Text style={{ color: "#4A5565" }}>•</Text>
                                    <Text style={{ color: "#4A5565" }}>{project.members?.length || 0} members</Text>
                                </Flex>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {projects.length === 0 && (
                <Flex justify="center" style={{ padding: "20px" }}>
                    <Text type="secondary">
                        {status === "loading" ? "Loading…" : "No projects found."}
                    </Text>
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

export default ProjectListSection;