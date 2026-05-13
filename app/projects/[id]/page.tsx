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
import { TagsProvider, useTags, TagItem } from "@/dashboard/TagsContext";
import { ApiService } from "@/api/apiService";
import dayjs from "dayjs";
import { ProjectDTO, Sprint } from "@/projects/projectTypes";
import { getPageTranslation } from "@/utils/dictionary_projectPage";
import { useTaskWebSocket } from "@/hooks/useTaskWebSocket";
import FilterBar from "@/projects/FilterBar";

const { Content, Sider } = Layout;
const { Title } = Typography;

// ─── Inner component ────────────────────────────────────────────────────────
// Must live inside <TagsProvider> so useTags() works.

const ProjectPageInner: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const projectId = (params?.id as string) ?? "1";

    // 1. Data States
    const [project, setProject] = useState<ProjectDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [targetLanguage, setTargetLanguage] = useState("en");
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projectTags, setProjectTags] = useState<TagItem[]>([]);

    // 2. UI States
    const [modalOpen, setModalOpen] = useState(false);
    const [modalColumn, setModalColumn] = useState<TaskColumn>("TODO");
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [selectedSprints, setSelectedSprints] = useState<number[]>([]);

    const { getTagsForProject } = useTags(); // ✅ safe — inside TagsProvider
    const apiService = useMemo(() => new ApiService(), []);
    const dragTaskId = useRef<string | null>(null);

    // 3. Language Loading
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedLang = localStorage.getItem("language")?.replace(/"/g, "") || "en";
            setTargetLanguage(savedLang);
        }
    }, []);

    // 4. Memoized UI Translations
    const uiText = useMemo(
        () => ({
            back: getPageTranslation("Back to dashboard", targetLanguage),
            boardTitle: getPageTranslation("Task board", targetLanguage),
            addTask: getPageTranslation("Add Task", targetLanguage),
        }),
        [targetLanguage]
    );

    // 5. REST seed
    const fetchProject = useCallback(async () => {
        try {
            const data = await apiService.get<ProjectDTO>(`/projects/${projectId}`);
            setProject(data);
            setSprints(data.sprints || []);
            setTasks(data.tasks || []);
        } catch (error) {
            console.error("Failed to fetch project:", error);
        }
    }, [apiService, projectId]);

    useEffect(() => {
        setLoading(true);
        fetchProject().finally(() => setLoading(false));
    }, [fetchProject]);

    // 6. Fetch tags for filter bar
    useEffect(() => {
        getTagsForProject(projectId).then((tags) => setProjectTags(tags || []));
    }, [projectId, getTagsForProject]);

    // 7. WebSocket — live updates only
    useTaskWebSocket(projectId, setTasks);

    // 8. Stats & filtering
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === "DONE").length;

    const filteredTasks = tasks.filter((task) => {
        const memberMatch =
            selectedMembers.length === 0 ||
            task.assignedUsers?.some((u) => selectedMembers.includes(u.id));
        const tagMatch =
            selectedTags.length === 0 ||
            task.tags?.some((tag) => selectedTags.includes(tag.id));
        const sprintMatch =
            selectedSprints.length === 0 ||
            (task.sprintId != null && selectedSprints.includes(Number(task.sprintId)));
        return memberMatch && tagMatch && sprintMatch;
    });

    // 9. Drag & Drop
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
            setTasks((prev) =>
                prev.map((t) => (t.id === numericId ? { ...t, status: taskToUpdate.status } : t))
            );
        }
    };

    // 10. Modal helpers
    const handleAddTask = (column: TaskColumn) => {
        setModalColumn(column);
        setEditingTask(null);
        setModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setModalColumn(task.status);
        setModalOpen(true);
    };

    // 11. Save Task
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
                sprintId: taskData.sprintId,
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

    // 12. Delete Task
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
                    boxShadow: "2px 0 6px rgba(0,0,0,0.03)",
                    zIndex: 10,
                }}
            >
                <SideBarSection />
            </Sider>

            <Layout style={{ marginLeft: 220 }}>
                <Content style={{ padding: "12px 24px", background: "#f5f5f5" }}>
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

                    <FilterBar
                        members={project?.members || []}
                        selectedMembers={selectedMembers}
                        onMembersChange={setSelectedMembers}
                        tags={projectTags}
                        selectedTags={selectedTags}
                        onTagsChange={setSelectedTags}
                        sprints={sprints}
                        selectedSprints={selectedSprints}
                        onSprintsChange={setSelectedSprints}
                    />

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
                                tasks={filteredTasks.filter((t) => t.status === col.key)}
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
                    sprints={sprints}
                    team={project.members || []}
                    onClose={() => {
                        setModalOpen(false);
                        setEditingTask(null);
                    }}
                    onSave={handleSaveTask}
                    projectId={projectId}
                />
            )}
        </Layout>
    );
};

// ─── Outer wrapper ───────────────────────────────────────────────────────────
// Provides TagsContext to the entire page tree.

const ProjectPage: React.FC = () => (
    <TagsProvider>
        <ProjectPageInner />
    </TagsProvider>
);

export default ProjectPage;