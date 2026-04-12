"use client";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Layout, Typography } from "antd";
import React, { useRef, useState } from "react";
import SideBarSection from "@/dashboard/SideBarSection";
import ProjectHeader from "@/projects/ProjectHeader";
import KanbanColumn from "@/projects/KanbanColumn";
import TaskModal from "@/projects/TaskModal";
import { initialTasks, mockProject } from "@/projects/projectDetailData";
import { KANBAN_COLUMNS, Task, TaskColumn } from "@/projects/taskTypes";

const { Content, Sider } = Layout;
const { Title } = Typography;

const ProjectDetailPage: React.FC = () => {
  const [tasks, setTasks]             = useState<Task[]>(initialTasks);
  const [modalOpen, setModalOpen]     = useState(false);
  const [modalColumn, setModalColumn] = useState<TaskColumn>("todo");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const dragTaskId                    = useRef<string | null>(null);

  const project    = mockProject;
  const totalTasks = tasks.length;
  const doneTasks  = tasks.filter((t) => t.column === "done").length;

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    dragTaskId.current = taskId;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, targetColumn: TaskColumn) => {
    e.preventDefault();
    if (!dragTaskId.current) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === dragTaskId.current ? { ...t, column: targetColumn } : t))
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
    setModalColumn(task.column);
    setModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleSaveTask = (data: Omit<Task, "id">) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...t, ...data } : t))
      );
    } else {
      setTasks((prev) => [...prev, { ...data, id: `t${Date.now()}` }]);
    }
  };

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
        }}
      >
        <SideBarSection />
      </Sider>

      <Layout style={{ marginLeft: 220 }}>
        <Content style={{ padding: "24px", background: "#f5f5f5" }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            style={{ marginBottom: 16, color: "#6b7280", paddingLeft: 0 }}
          >
            Back to projects
          </Button>

          <ProjectHeader
            project={project}
            totalTasks={totalTasks}
            doneTasks={doneTasks}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>Task Board</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={() => handleAddTask("todo")}
            >
              Add Task
            </Button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
              overflowX: "auto",
              paddingBottom: 24,
            }}
          >
            {KANBAN_COLUMNS.map((col) => (
              <KanbanColumn
                key={col.key}
                column={col}
                tasks={tasks.filter((t) => t.column === col.key)}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onAddTask={handleAddTask}
              />
            ))}
          </div>
        </Content>
      </Layout>

      <TaskModal
        open={modalOpen}
        initialColumn={modalColumn}
        editingTask={editingTask}
        team={project.team}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
      />
    </Layout>
  );
};

export default ProjectDetailPage;
