"use client";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Layout, Typography, Spin } from "antd";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SideBarSection from "@/dashboard/SideBarSection";
import ProjectHeader from "@/projects/ProjectHeader";
import KanbanColumn from "@/projects/KanbanColumn";
import TaskModal from "@/projects/TaskModal";
import { KANBAN_COLUMNS, Task, TaskColumn } from "@/projects/taskTypes";
import { TagsProvider } from "@/dashboard/TagsContext";
import { ApiService } from "@/api/apiService";
import dayjs from "dayjs";

const { Content, Sider } = Layout;
const { Title } = Typography;

const ProjectPage: React.FC = () => {
  // 1. States initialized for dynamic data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalColumn, setModalColumn] = useState<TaskColumn>("TODO");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const apiService = useMemo(() => new ApiService(), []);
  const dragTaskId = useRef<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) ?? "1";

  // 2. Fetch and Map Data
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        // Note: Using template literals `` for the URL
        const data = await apiService.get<any>(`/projects/${projectId}`);
        
        setProject(data);
        
        // Map TaskDTO to your frontend Task interface
        if (data.tasks) {
          const mappedTasks: Task[] = data.tasks.map((t: any) => ({
  ...t, 
  status: t.status, 
}));
setTasks(mappedTasks);
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [apiService, projectId]);

  // 3. Derived values for Header
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;

  // 4. Handlers
 const handleDragStart = (e: React.DragEvent, taskId: number) => {
  dragTaskId.current = taskId.toString(); // Keep ref as string for easy storage if preferred
  e.dataTransfer.effectAllowed = "move";
};

const handleDrop = (e: React.DragEvent, targetStatus: TaskColumn) => {
  e.preventDefault();
  if (!dragTaskId.current) return;
  
  const numericId = Number(dragTaskId.current);
  
  setTasks((prev) =>
    prev.map((t) => (t.id === numericId ? { ...t, status: targetStatus } : t))
  );
  dragTaskId.current = null;
};

  const handleAddTask = (column: TaskColumn) => {
    setEditingTask(null);
    setModalColumn(column);
    setModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setModalColumn(task.status);
    setModalOpen(true);
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    // Optional: apiService.delete(`/tasks/${taskId}`)
  };

const handleSaveTask = async (taskData: Omit<Task, "id">) => {
  try {
    // 1. Clean the payload to match TaskPostDTO exactly
    const postBody = {
      name: taskData.name,
      description: taskData.description,
      priority: taskData.priority,
      status: taskData.status,
      dueDate: taskData.dueDate ? dayjs(taskData.dueDate).format("YYYY-MM-DDTHH:mm:ss") : null,
      timeEstimate: taskData.timeEstimate,
      tagIds: taskData.tags?.map(t => t.id) || [],
      assignedUserIds: taskData.assignedUsers?.map(u => u.id) || [],
      projectId: Number(projectId),
    };

    if (editingTask) {
      const updatedTask = await apiService.put<Task>(`/tasks/${editingTask.id}`, postBody);
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updatedTask : t)));
    } else {
      const savedTask = await apiService.post<Task>(`/tasks`, postBody);
      setTasks((prev) => [...prev, savedTask]);
    }
    
    setModalOpen(false);
    setEditingTask(null);
  } catch (error) {
    console.error("Save failed:", error);
  }
};

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading project..." />
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
          }}
        >
          <SideBarSection />
        </Sider>

        <Layout style={{ marginLeft: 220 }}>
          <Content style={{ padding: "24px", background: "#f5f5f5" }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/projects')}
              style={{ marginBottom: 16, color: "#6b7280", paddingLeft: 0 }}
            >
              Back to projects
            </Button>

            {project && (
              <ProjectHeader
                project={{
                  name: project.name,
                  description: project.description,
                  members: project.members || []
                }}
                totalTasks={totalTasks}
                doneTasks={doneTasks}
              />
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>Task Board</Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleAddTask("TODO")}
                style={{ background: "#6066FF", borderRadius: 8 }}
              >
                Add Task
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
            team={project.members} // Updated from project.team to project.members
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