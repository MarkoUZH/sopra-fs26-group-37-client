"use client";
import { MoreOutlined, ArrowRightOutlined, FolderOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Dropdown, Flex, Progress, Row, Typography, message } from "antd";
import React, { useEffect, useState, useMemo } from "react";
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

  // Translate page whenever targetLanguage changes
  useEffect(() => {
    let authErrorShown = false;

    const translatePage = async () => {
      // Revert to English instantly if English is selected
      if (targetLanguage === "en") {
        setUiText(baseText);
        return;
      }

      const translate = async (text: string) => {
          try {
            const result = await api.post<{ text?: () => Promise<string> } | string>("/translate", {
                text: text,
                sourceLanguage: "en",
                language: targetLanguage,
            });

            // Extract plain text if the API returns a raw Response object
            if (result && typeof result === 'object' && typeof result.text === 'function') {
                return await result.text();
            }

          return typeof result === 'string' ? result : text;
        } catch (err) {
          // Gracefully catch any 401s without spamming the console
          if (err instanceof Error && err.message.includes("401") && !authErrorShown) {
            authErrorShown = true;
            message.warning("Translation requires authorization. Please log in.");
          } else if (!authErrorShown) {
            console.error("Translation failed for text:", text, err);
          }
          return text; // Fallback to English on error
        }
      };

      // Resolve all translations concurrently
      const keys = Object.keys(baseText) as Array<keyof typeof baseText>;
      const translations = await Promise.all(
        keys.map((key) => translate(baseText[key]))
      );

      const newUiText = {} as typeof baseText;
      keys.forEach((key, index) => {
        newUiText[key] = translations[index];
      });

      setUiText(newUiText);
    };

    translatePage();
  }, [targetLanguage, api]);

  const handleEditClick = (project: ProjectDTO) => {
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
        
        if (isMounted) setProjects(data);
      } catch (error) {
        console.error("Project Fetch Error:", error);
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [api]);

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
        {projects.map((project) => {
          const totalTasks = project.tasks?.length || 0;
          const completedTasks = project.tasks?.filter(t => t.status === "DONE").length || 0;
          const inProgressTasks = project.tasks?.filter(t => t.status === "IN_PROGRESS" || (t.status) === 1).length || 0;
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
                          items: [{
                            key: 'edit',
                            label: uiText.editProject,
                            onClick: () => handleEditClick(project),
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
                  <Text style={{ color: "#4A5565" }}>{project.members?.length || 0} {uiText.membersLabel}</Text>
                </Flex>
              </Card>
            </Col>
          );
        })}
      </Row>

      {projects.length === 0 && (
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