import { AimOutlined } from "@ant-design/icons";
import { Card, Col, Flex, Progress, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi"; 


const { Title, Text } = Typography;
interface SprintGetDTO {
  id: number;
  name: string;
  sprintStatus: string;
  startTime: string; 
  endTime: string;   
  projectId: number;
  projectName: string;
}



export default function ProjectListSection(): React.JSX.Element {
  // 2. Use the hook pattern
  const api = useApi();
  const [sprints, setSprints] = useState<SprintGetDTO[]>([]);

  // 3. Fetch data on mount
  useEffect(() => {
    const fetchSprints = async () => {
      try {
        const fetchedSprints = await api.get<SprintGetDTO[]>("/sprints");
        const now = new Date();
        const activeSprints = fetchedSprints.filter((sprint) => {
          const endDate = new Date(sprint.endTime);
          return endDate >= now;
        });
        setSprints(activeSprints);
      } catch (e) {
        console.error("Failed to fetch sprints", e);
      }
    };
    fetchSprints();
  }, [api]);

  // Helper for date formatting
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Helper for "days remaining" logic
  const getDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days remaining` : "Ended";
  };  
  
  return (
    <Card style={{ borderRadius: 12, width: "100%", marginTop: 16, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
      <Flex vertical gap={16}>
        <Flex align="center" gap={8}>
          <AimOutlined style={{ fontSize: 22 }} />
          <Title level={4} style={{ margin: 0 }}>
            Active Sprints
          </Title>
        </Flex>

        {/* 4. Map the dynamic sprints */}
        {sprints.length > 0 ? (
          sprints.map((sprint) => (
            <Flex vertical gap={4} key={sprint.id}>
              <Title level={5} style={{ margin: 0 }}>
                { sprint.name}
              </Title>

              <Row justify="space-between" align="middle">
                <Col>
                  <Text style={{ color: "#4A5565" }}>
                    {formatDate(sprint.startTime)} - {formatDate(sprint.endTime)} 
                    &nbsp;•&nbsp; Project: {sprint.projectName}
                  </Text>
                </Col>
                <Col>
                  <Text style={{ color: "#4A5565" }}>{getDaysRemaining(sprint.endTime)}</Text>
                </Col>
              </Row>

              <Flex align="center" gap={8}>
                <Progress
                  percent={0} // Replace with dynamic calculation if you add task status to backend
                  style={{ flex: 1, margin: 0 }}
                  showInfo={false}
                />
                <Text style={{ color: "#4A5565" }}>0%</Text>
              </Flex>
            </Flex>
          ))
        ) : (
          <Text type="secondary">No active sprints available.</Text>
        )}
      </Flex>
    </Card>
  );
}
