"use client";
import { MoreOutlined, ArrowRightOutlined, FolderOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Dropdown, Flex, Progress, Row, Typography, message } from "antd";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ApiService } from "@/api/apiService"; 
import CreateProjectModal from "./CreateProjectModal";
import EditProjectModal from "./EditProjectModal";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

interface Member {
  id: number;
  username: string;
}

interface ProjectDTO {
  id: number;
  name: string;
  description: string;
  tasks: Task[];
  members: Member[];
}

interface Task {
  id: number;
  status: "TODO" | "IN_PROGRESS" | "DONE";
}

// 1. Extract base English text for translation
const baseText = {
  title: "Projects",
  createProject: "Create Project",
  editProject: "Edit Project",
  tasksLabel: "tasks",
  inProgressLabel: "in progress",
  membersLabel: "members",
  noProjects: "No projects found."
};

const TaskSummarySection = (): React.JSX.Element => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectDTO | null>(null);
  const [isManager, setIsManager] = useState<boolean>(false);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  // displayProjects holds the translated versions of the projects
  const [displayProjects, setDisplayProjects] = useState<ProjectDTO[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const router = useRouter();
  const api = useMemo(() => new ApiService(), []);

  // Translation State
  const [uiText, setUiText] = useState(baseText);
  const [targetLanguage, setTargetLanguage] = useState("en");

  // Read preferred language from localStorage on component mount
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

  // Helper function for translating a single string
  const translateText = useCallback(async (text: string, lang: string) => {
    if (!text || lang === "en") return text;
    try {
      const result = await api.post<any>("/translate", {
        text: text,
        sourceLanguage: "en",
        language: lang,
      });

      // Handle plain text response
      if (result && typeof result.text === 'function') {
        return await result.text();
      }
      return typeof result === 'string' ? result : text;
    } catch (err) {
      return text; // Fallback to original text
    }
  }, [api]);

  // 2. Logic for translating UI labels and dynamic project data
  useEffect(() => {
    const performTranslations = async () => {
      // Step A: Translate UI Labels
      if (targetLanguage === "en") {
        setUiText(baseText);
        setDisplayProjects(projects);
        return;
      }

      const keys = Object.keys(baseText) as Array<keyof typeof baseText>;
      const translations = await Promise.all(
        keys.map((key) => translateText(baseText[key], targetLanguage))
      );

      const newUiText = {} as typeof baseText;
      keys.forEach((key, index) => {
        newUiText[key] = translations[index] || baseText[key];
      });
      setUiText(newUiText);

      // Step B: Translate Project Titles and Descriptions
      if (projects.length > 0) {
        const translatedProjects = await Promise.all(
          projects.map(async (project) => {
            const translatedName = await translateText(project.name, targetLanguage);
            const translatedDesc = await translateText(project.description, targetLanguage);
            return {
              ...project,
              name: translatedName,
              description: translatedDesc
            };
          })
        );
        setDisplayProjects(translatedProjects);
      }
    };

    performTranslations();
  }, [targetLanguage, projects, translateText]);

  const handleEditClick = (project: ProjectDTO) => {
    // CRITICAL: Always use the original (untranslated) project for editing
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      const userId = localStorage.getItem("id");
      if (!userId) return;

      try {
        const userData = await api.get<{ manager: boolean }>(`/users/${userId}`);
        if (!isMounted) return;
        
        setIsManager(userData.manager);
        const data = await api.get<ProjectDTO[]>(`/projects/users/${userId}`);
        
        if (isMounted) {
          setProjects(data || []);
          // Initialize displayProjects with raw data immediately
          if (targetLanguage === "en") {
            setDisplayProjects(data || []);
          }
        }
      } catch (error) {
        console.error("Project Fetch Error:", error);
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [api, targetLanguage]);

  return (
    <Card style={{ borderRadius: 12, width: "100%", background: "#ffffff", boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)', marginTop: 16 }}>
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
        {displayProjects.map((project) => {
          // Find the original project data for logic (task counts, percentages)
          const originalProject = projects.find(p => p.id === project.id) || project;
          
          const totalTasks = originalProject.tasks?.length || 0;
          const completedTasks = originalProject.tasks?.filter(t => t.status === "DONE").length || 0;
          const inProgressTasks = originalProject.tasks?.filter(t => t.status === "IN_PROGRESS" || (t.status as any) === 1).length || 0;
          const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return (
            <Col xs={24} sm={12} lg={8} key={project.id} style={{ display: "flex" }}>
              <Card size="small" style={{ borderRadius: 12, width: "100%", display: "flex", flexDirection: "column" }}>
                <Flex justify="space-between" align="center">
                  {/* Using translated project name */}
                  <Title level={5} style={{ margin: 0 }}>{project.name}</Title>
                  <Flex gap={8} align="center">
                    {isManager && (
                      <Dropdown
                        menu={{
                          items: [{
                            key: 'edit',
                            label: uiText.editProject,
                            onClick: () => handleEditClick(originalProject),
                          }],
                        }}
                        trigger={['click']}
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

                {/* Using translated project description */}
                <Text style={{ display: "block", margin: "8px 0", color: "#4A5565", minHeight: "40px" }}>
                  {project.description}
                </Text>

                <Flex justify="space-between" align="center">
                  <Text style={{ color: "#4A5565" }}>{completedTasks}/{totalTasks} {uiText.tasksLabel}</Text>
                  <Text style={{ color: "#4A5565" }}>{percentage}%</Text>
                </Flex>

                <Progress percent={percentage} showInfo={false} size="small" strokeColor="#00c950" />

                <Flex gap={8} align="center" style={{ marginTop: 8 }}>
                  <Text style={{ color: "#4A5565" }}>{inProgressTasks} {uiText.inProgressLabel}</Text>
                  <Text style={{ color: "#4A5565" }}>•</Text>
                  <Text style={{ color: "#4A5565" }}>{originalProject.members?.length || 0} {uiText.membersLabel}</Text>
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
      
      <CreateProjectModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {selectedProject && (
        <EditProjectModal 
          open={isEditModalOpen} 
          project={selectedProject}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProject(null);
          }} 
        />
      )}
    </Card>
  );
};

export default TaskSummarySection;