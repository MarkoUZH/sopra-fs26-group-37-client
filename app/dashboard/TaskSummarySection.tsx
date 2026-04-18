import { ArrowRightOutlined, FolderOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Flex, Progress, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { ApiService } from "@/api/apiService"; // 1. Adjust this path to your file location
import CreateProjectModal from "./CreateProjectModal";


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
  status: "TODO" | "IN_PROGRESS" | "DONE"; // Match your TaskStatus enum
}

const TaskSummarySection = (): React.JSX.Element => {
const [isManager, setIsManager] = useState<boolean>(false);
  
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const api = new ApiService();

  useEffect(() => {

    
    const fetchProjects = async () => {
      const userId = localStorage.getItem("id");
      if (!userId) return;

      try {
        const userData = await api.get<{ manager: boolean }>(`/users/${userId}`);
        setIsManager(userData.manager);
        const data = await api.get<ProjectDTO[]>(`/projects/users/${userId}`);
        setProjects(data);
      } catch (error) {
        // processResponse in your ApiService throws detailed errors
        console.error("Project Fetch Error:", error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <Card style={{ borderRadius: 12, width: "100%", background: "#ffffff", boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Flex align="center" gap={8}>
          <FolderOutlined style={{ fontSize: 20 }} />
          <Title level={4} style={{ margin: 0 }}>Projects</Title>
        </Flex>
        {isManager && (
          <Button type="primary" icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}>
            Create Project
            
          </Button>
        )}
      </Flex>

<Row gutter={[16, 16]}>
        {projects.map((project) => {
          console.log(`Project ${project.name} tasks:`, project )
          // 2. Logic to calculate stats for THIS specific project
          const totalTasks = project.tasks?.length || 0;
          const completedTasks = project.tasks?.filter(t => t.status === "DONE").length || 0;
          const inProgressTasks = project.tasks?.filter(t => t.status === "IN_PROGRESS" || (t.status as any) === 1).length || 0;
          
          // Calculate percentage (avoid division by zero)
          const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return (
            <Col xs={24} sm={12} lg={8} key={project.id} style={{ display: "flex" }}>
              <Card size="small" style={{ borderRadius: 12, width: "100%", display: "flex", flexDirection: "column" }}>
                <Flex justify="space-between" align="center">
                  <Title level={5} style={{ margin: 0 }}>{project.name}</Title>
                  <ArrowRightOutlined />
                </Flex>

                <Text style={{ display: "block", margin: "8px 0", color: "#4A5565", minHeight: "40px" }}>
                  {project.description}
                </Text>

                <Flex justify="space-between" align="center">
                  <Text style={{ color: "#4A5565" }}>{completedTasks}/{totalTasks} tasks</Text>
                  <Text style={{ color: "#4A5565" }}>{percentage}%</Text>
                </Flex>

                {/* 3. Update Progress Bar */}
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
        <Flex justify="center" style={{ padding: '20px' }}>
          <Text type="secondary">No projects found.</Text>
        </Flex>
      )}
      
      <CreateProjectModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </Card>
  );
};

export default TaskSummarySection;