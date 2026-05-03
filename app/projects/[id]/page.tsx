"use client";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Layout, Typography, Spin } from "antd";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import SideBarSection from "@/dashboard/SideBarSection";
import ProjectHeader from "@/projects/ProjectHeader";
import KanbanColumn from "@/projects/KanbanColumn";
import TaskModal from "@/projects/TaskModal";
import { KANBAN_COLUMNS, Task, TaskColumn } from "@/projects/taskTypes";
import { TagsProvider } from "@/dashboard/TagsContext";
import { ApiService } from "@/api/apiService";
import dayjs from "dayjs";
import { ProjectDTO } from "@/projects/projectTypes";
import { getPageTranslation } from "@/utils/dictionary_projectPage";
import { useTaskWebSocket } from "@/hooks/useTaskWebSocket";

const { Content, Sider } = Layout;
const { Title } = Typography;

const ProjectPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const projectId = (params?.id as string) ?? "1";

    // 1. Data States
    const [project, setProject] = useState<ProjectDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [targetLanguage, setTargetLanguage] = useState("en");
    const { tasks, setTasks, status } = useTaskWebSocket(projectId);

    // 2. UI States
    const [modalOpen, setModalOpen] = useState(false);
    const [modalColumn, setModalColumn] = useState<TaskColumn>("TODO");
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const apiService = useMemo(() => new ApiService(), []);
    const dragTaskId = useRef<string | null>(null);

    // 3. Language Loading
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedLang = localStorage.getItem("language")?.replace(/"/g, '') || "en";
            setTargetLanguage(savedLang);
        }
    }, []);

    // 4. Memoized UI Translations
    const uiText = useMemo(() => ({
        back: getPageTranslation("Back to dashboard", targetLanguage),
        boardTitle: getPageTranslation("Task board", targetLanguage),
        addTask: getPageTranslation("Add Task", targetLanguage),
    }), [targetLanguage]);

    // 5. Fetch project metadata only (members, name, description)
    const fetchProject = useCallback(async () => {
        try {
            const data = await apiService.get<ProjectDTO>(`/projects/${projectId}`);
            setProject(data);

            if (data.tasks && data.tasks.length > 0) {
                setTasks(data.tasks);
            }
        } catch (error) {
            console.error("Failed to fetch project:", error);
        }
    }, [apiService, projectId, setTasks]);

    useEffect(() => {
        setLoading(true);
        fetchProject().finally(() => setLoading(false));
    }, [fetchProject]);

    // 6. Stats
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === "DONE").length;

    // 7. Drag & Drop
    const handleDragStart = (e: React.DragEvent, taskId: number) => {
        dragTaskId.current = taskId.toString();
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDrop = async (e: React.DragEvent, targetStatus: TaskColumn) => {
        e.preventDefault();
        if (!dragTaskId.current) return;

        const numericId = Number(dragTaskId.current);
        dragTaskId.current = null;

        const taskToUpdate = tasks.find((t) => t.id === numericId);
        if (!taskToUpdate || taskToUpdate.status === targetStatus) return;

        // Optimistic update — WebSocket will confirm with task_updated broadcast
        setTasks((prev) =>
            prev.map((t) => (t.id === numericId ? { ...t, status: targetStatus } : t))
        );

        try {
            await apiService.put(`/tasks/${numericId}`, {
                name: taskToUpdate.name,
                description: taskToUpdate.description,
                priority: taskToUpdate.priority,
                status: targetStatus,
                dueDate: taskToUpdate.dueDate
                    ? dayjs(taskToUpdate.dueDate).format("YYYY-MM-DDTHH:mm:ss")
                    : null,
                timeEstimate: taskToUpdate.timeEstimate,
                tagIds: taskToUpdate.tags?.map((t) => t.id) || [],
                assignedUserIds: taskToUpdate.assignedUsers?.map((u) => u.id) || [],
                projectId: Number(projectId),
            });
        } catch (error) {
            console.error("Failed to update task status:", error);
            // Revert optimistic update on failure
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === numericId ? { ...t, status: taskToUpdate.status } : t
                )
            );
        }
    };

    // 8. Modal helpers
    const handleAddTask = (column: TaskColumn) => {
        setModalColumn(column);
        setEditingTask(null);
        setModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setModalOpen(true);
    };

    // 9. Save Task (create or update) — REST only, WebSocket broadcasts back
    const handleSaveTask = async (taskData: Omit<Task, "id">) => {
        try {
            const postBody = {
                name: taskData.name,
                description: taskData.description,
                priority: taskData.priority,
                status: taskData.status,
                dueDate: taskData.dueDate
                    ? dayjs(taskData.dueDate).format("YYYY-MM-DDTHH:mm:ss")
                    : null,
                timeEstimate: taskData.timeEstimate,
                tagIds: taskData.tags?.map((t) => t.id) || [],
                assignedUserIds: taskData.assignedUsers?.map((u) => u.id) || [],
                projectId: Number(projectId),
            };

            if (editingTask) {
                await apiService.put(`/tasks/${editingTask.id}`, postBody);
            } else {
                await apiService.post(`/tasks`, postBody);
            }

            setModalOpen(false);
            setEditingTask(null);
        } catch (error) {
            console.error("Save failed:", error);
        }
    };

    // 10. Delete Task — REST only, WebSocket broadcasts back
    const handleDeleteTask = async (taskId: number) => {
        try {
            await apiService.delete(`/tasks/${taskId}`);
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

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
                        position: "fixed", left: 0, top: 0, bottom: 0,
                        height: "100vh", boxShadow: "2px 0 6px rgba(0,0,0,0.03)",
                        zIndex: 10,
                    }}
                >
                    <SideBarSection />
                </Sider>

                <Layout style={{ marginLeft: 220 }}>
                    <Content style={{ padding: "24px", background: "#f5f5f5" }}>
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => router.push("/dashboard")}
                            style={{ marginBottom: 16, color: "#6b7280", paddingLeft: 0 }}
                        >
                            {uiText.back}
                        </Button>

                        {project && (
                            <ProjectHeader
                                project={{
                                    name: project.name,
                                    description: project.description,
                                    members: project.members || [],
                                    originalLanguage: project.originalLanguage || "en",
                                }}
                                totalTasks={totalTasks}
                                doneTasks={doneTasks}
                            />
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <Title level={4} style={{ margin: 0 }}>{uiText.boardTitle}</Title>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => handleAddTask("TODO")}
                                style={{ background: "#6066FF", borderRadius: 8 }}
                            >
                                {uiText.addTask}
                            </Button>
                        </div>

                        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", overflowX: "auto", paddingBottom: 24 }}>
                            {KANBAN_COLUMNS.map((col) => (
                                <KanbanColumn
                                    key={col.key}
                                    column={col}
                                    tasks={tasks.filter((t) => t.status === col.key)}
                                    onDragStart={handleDragStart}
                                    onDrop={handleDrop}
                                    onEdit={handleEditTask}
                                    onDelete={handleDeleteTask}
                                    onAddTask={handleAddTask}
                                    projectId={Number(projectId)}
                                />
                            ))}
                        </div>
                    </Content>
                </Layout>

                {project && (
                    <TaskModal
                        open={modalOpen}
                        initialColumn={modalColumn}
                        editingTask={editingTask}
                        team={project.members || []}
                        onClose={() => { setModalOpen(false); setEditingTask(null); }}
                        onSave={handleSaveTask}
                        projectId={projectId}
                    />
                )}
            </Layout>
        </TagsProvider>
    );
};

export default ProjectPage;