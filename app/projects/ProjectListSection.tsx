"use client";
import { FolderOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Row, Typography } from "antd";
import React, { useState } from "react";
import ProjectCard from "@/projects/ProjectCard";
import { Project, ProjectStatus } from "@/projects/projectTypes";

const { Text, Title } = Typography;

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Full overhaul of the marketing website with new brand guidelines and improved UX.",
    status: "active",
    priority: "high",
    progress: 68,
    tasksTotal: 24,
    tasksDone: 16,
    tasksInProgress: 5,
    dueDate: "Apr 30, 2025",
    color: "#2b7fff",
    team: [
      { name: "Alice Meier", color: "#2b7fff", initials: "AM" },
      { name: "Bob Keller",  color: "#f04000", initials: "BK" },
      { name: "Clara Sun",   color: "#00c950", initials: "CS" },
    ],
  },
  {
    id: "2",
    name: "Mobile App v2",
    description: "Second major release adding offline mode, push notifications, and dark theme.",
    status: "active",
    priority: "high",
    progress: 41,
    tasksTotal: 38,
    tasksDone: 15,
    tasksInProgress: 9,
    dueDate: "May 15, 2025",
    color: "#ad46ff",
    team: [
      { name: "David Park", color: "#ad46ff", initials: "DP" },
      { name: "Eva Braun",  color: "#f0b100", initials: "EB" },
    ],
  },
  {
    id: "3",
    name: "API Integration",
    description: "Connect third-party payment and analytics services to the core platform.",
    status: "on-hold",
    priority: "medium",
    progress: 25,
    tasksTotal: 12,
    tasksDone: 3,
    tasksInProgress: 2,
    dueDate: "Jun 01, 2025",
    color: "#f0b100",
    team: [
      { name: "Frank Müller", color: "#f04000", initials: "FM" },
      { name: "Grace Lee",    color: "#2b7fff", initials: "GL" },
      { name: "Henry Wang",   color: "#00c950", initials: "HW" },
      { name: "Iris Tanner",  color: "#ad46ff", initials: "IT" },
    ],
  },
  {
    id: "4",
    name: "Design System",
    description: "Establish a unified component library and token-based design language.",
    status: "planning",
    priority: "medium",
    progress: 10,
    tasksTotal: 20,
    tasksDone: 2,
    tasksInProgress: 1,
    dueDate: "Jul 10, 2025",
    color: "#00c950",
    team: [
      { name: "Julia Bauer", color: "#2b7fff", initials: "JB" },
      { name: "Karl Hofer",  color: "#f04000", initials: "KH" },
    ],
  },
  {
    id: "5",
    name: "Data Migration",
    description: "Migrate legacy database records to the new cloud infrastructure with zero downtime.",
    status: "completed",
    priority: "low",
    progress: 100,
    tasksTotal: 16,
    tasksDone: 16,
    tasksInProgress: 0,
    dueDate: "Mar 22, 2025",
    color: "#f04000",
    team: [
      { name: "Laura Chen",   color: "#ad46ff", initials: "LC" },
      { name: "Mark Steiner", color: "#f0b100", initials: "MS" },
    ],
  },
  {
    id: "6",
    name: "Security Audit",
    description: "Comprehensive review of authentication flows, data handling and penetration tests.",
    status: "active",
    priority: "high",
    progress: 55,
    tasksTotal: 9,
    tasksDone: 5,
    tasksInProgress: 2,
    dueDate: "Apr 18, 2025",
    color: "#2b7fff",
    team: [
      { name: "Nina Vogel",  color: "#f04000", initials: "NV" },
      { name: "Oscar Roth",  color: "#2b7fff", initials: "OR" },
      { name: "Paula Kern",  color: "#00c950", initials: "PK" },
    ],
  },
];

type FilterKey = "all" | ProjectStatus;

const filters: { key: FilterKey; label: string }[] = [
  { key: "all",       label: "All"       },
  { key: "active",    label: "Active"    },
  { key: "planning",  label: "Planning"  },
  { key: "on-hold",   label: "On Hold"   },
  { key: "completed", label: "Completed" },
];

interface ProjectListSectionProps {
  onCreateProject?: () => void;
}

const ProjectListSection: React.FC<ProjectListSectionProps> = ({ onCreateProject }) => {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filtered =
    activeFilter === "all"
      ? mockProjects
      : mockProjects.filter((p) => p.status === activeFilter);

  const handleMenuAction = (key: string, project: Project) => {
    console.log(`Action "${key}" on project "${project.name}"`);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Title level={4} style={{ margin: 0 }}>Projects</Title>
          <Text
            style={{
              fontSize: 13,
              color: "#8c8c8c",
              background: "#f0f0f0",
              borderRadius: 20,
              padding: "1px 8px",
            }}
          >
            {filtered.length}
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="middle" onClick={onCreateProject}>
          New Project
        </Button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              style={{
                padding: "4px 14px",
                borderRadius: 20,
                border: isActive ? "1px solid #2b7fff" : "1px solid #e5e7eb",
                background: isActive ? "#eff6ff" : "#fff",
                color: isActive ? "#2b7fff" : "#4A5565",
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <Row gutter={[20, 20]}>
        {filtered.map((project) => (
          <Col key={project.id} xs={24} sm={12} lg={8}>
            <ProjectCard project={project} onMenuAction={handleMenuAction} />
          </Col>
        ))}
      </Row>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#8c8c8c" }}>
          <FolderOutlined style={{ fontSize: 40, marginBottom: 12, display: "block" }} />
          <Text>No projects match this filter.</Text>
        </div>
      )}
    </div>
  );
};

export default ProjectListSection;
