"use client";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Layout, Typography, Spin, message } from "antd";
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
import { ProjectDTO, Sprint } from "@/projects/projectTypes";
import { getPageTranslation } from "@/utils/dictionary_projectPage";
import FilterBar from "@/projects/FilterBar";

const { Content, Sider } = Layout;
const { Title } = Typography;

const ProjectPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetLanguage, setTargetLanguage] = useState("en");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalColumn, setModalColumn] = useState<TaskColumn>("TODO");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  
  const apiService = useMemo(() => new ApiService(), []);
  const dragTaskId = useRef<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) ?? "";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("language")?.replace(/"/g, '') || "en";
      setTargetLanguage(savedLang);
    }
  }, []);

  const uiText = useMemo(() => ({
    back: getPageTranslation("Back to dashboard", targetLanguage),
    boardTitle: getPageTranslation("Task board", targetLanguage),
    addTask: getPageTranslation("Add Task", targetLanguage),
  }), [targetLanguage]);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await apiService.get<ProjectDTO>(`/projects/${projectId}`);
      setProject(data);
      setTasks(data.tasks || []);
      setSprints(data.sprints || []);
    } catch (error) {
      console.error("Failed to refresh data:", error);
      message.error("Failed to load project tasks");
    }
  }, [apiService, projectId]);

  useEffect(() => {
    setLoading(true);
    fetchProject().finally(() => setLoading(false));
  }, [fetchProject]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) =>
      selectedMembers.length === 0 ||
      task.assignedUsers?.some((u) => selectedMembers.includes(u.id))
    );
  }, [tasks, selectedMembers]);

  // --- Handlers ---

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    dragTaskId.current = taskId.toString();
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskColumn) => {
    e.preventDefault();
    if (!dragTaskId.current) return;
    
    const numericId = Number(dragTaskId.current);
    dragTaskId.current = null;

    const taskToUpdate = tasks.find(t => t.id === numericId);
    if (!taskToUpdate || taskToUpdate.status === targetStatus) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === numericId ? { ...t, status: targetStatus } : t))
    );

    try {
      await apiService.put(`/tasks/${numericId}`, {
        ...taskToUpdate,
        status: targetStatus,
        projectId: Number(projectId)
      });
    } catch (error) {
      fetchProject(); 
    }
  };

  const handleAddTask = (column: TaskColumn) => {
    setEditingTask(null);
    setModalColumn(column);
    setModalOpen(true);
  };

  // This was the missing function!
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setModalColumn(task.status);
    setModalOpen(true);
  };

  const handleSaveTask = async (taskData: any) => {
    try {
      const payload = {
        ...taskData,
        projectId: Number(projectId),
        tagIds: taskData.tags?.map((t: any) => t.id) || [],
        assignedUserIds: taskData.assignedUsers?.map((u: any) => u.id) || [],
        sprintId: taskData.sprintId ? Number(taskData.sprintId) : null,
      };

      if (editingTask) {
        await apiService.put(`/tasks/${editingTask.id}`, payload);
      } else {
        await apiService.post(`/tasks`, payload);
      }
      
      message.success("Task saved");
      await fetchProject(); 
      setModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      message.error("Save failed");
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
  }

  return (
    <TagsProvider>
      <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
        <Sider width={220} theme="light" style={{ position: "fixed", left: 0, top: 0, bottom: 0, height: "100vh", zIndex: 10 }}>
          <SideBarSection />
        </Sider>

        <Layout style={{ marginLeft: 220 }}>
          <Content style={{ padding: "12px 24px" }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.push('/dashboard')} style={{ marginBottom: 16, color: "#6b7280" }}>
              {uiText.back}
            </Button>

            {project && (
              <ProjectHeader
                project={{
                  name: project.name,
                  description: project.description,
                  members: project.members || [],
                  originalLanguage: project.originalLanguage || "en"
                }}
                totalTasks={tasks.length}
                doneTasks={tasks.filter((t) => t.status?.toUpperCase() === "DONE").length}
              />
            )}

            <FilterBar members={project?.members || []} selectedMembers={selectedMembers} onMembersChange={setSelectedMembers} tags={[]} selectedTags={[]} onTagsChange={function (val: number[]): void {
              throw new Error("Function not implemented.");
            } } />
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>{uiText.boardTitle}</Title>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAddTask("TODO")} style={{ background: "#6066FF" }}>
                {uiText.addTask}
              </Button>
            </div>

            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", overflowX: "auto", paddingBottom: 24 }}>
              {KANBAN_COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.key}
                  column={col}
                  tasks={filteredTasks.filter((t) => t.status?.toUpperCase() === col.key.toUpperCase())}
                  //sprints={sprints} // Ensure KanbanColumn.tsx interface includes sprints!
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                  onEdit={handleEditTask}
                  onDelete={(id) => { apiService.delete(`/tasks/${id}`).then(() => fetchProject()); }}
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