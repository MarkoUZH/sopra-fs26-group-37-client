import {
  ArrowRightOutlined,
  FolderOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Flex, Progress, Row, Typography } from "antd";

const { Title, Text } = Typography;

const projects = [
  {
    name: "Multilingual Scrum Board",
    description: "Web-based Agile/Scrum board with real-time translation",
    tasks: "3/15 tasks",
    percent: 20,
    percentLabel: "20%",
    inProgress: "4 in progress",
    members: "5 members",
  },
  {
    name: "Mobile App Development",
    description: "Native mobile application for IOS",
    tasks: "10/20 tasks",
    percent: 50,
    percentLabel: "50%",
    inProgress: "3 in progress",
    members: "7 members",
  },
  {
    name: "Budget Planner WebApp",
    description: "Web-based budget planning",
    tasks: "15/18",
    percent: 83,
    percentLabel: "83.3%",
    inProgress: "2 in progress",
    members: "4 members",
  },
];

const TaskSummarySection = (): JSX.Element => {
  return (
    <Card style={{ borderRadius: 12, width: "100%", background: "#ffffff", boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Flex align="center" gap={8}>
          <FolderOutlined style={{ fontSize: 20 }} />
          <Title level={4} style={{ margin: 0 }}>
            Projects
          </Title>
        </Flex>
        <Button type="primary" icon={<PlusOutlined />}>
          Create Project
        </Button>
      </Flex>

      <Row gutter={16}>
        {projects.map((project) => (
          <Col xs={24} sm={12} lg={8} key={project.name} style={{ display: "flex" }}>
            <Card size="small" className="project-card" style={{ borderRadius: 12, background: "#ffffff", width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <Flex justify="space-between" align="flex-start">
                <Title level={5} style={{ margin: 0 }}>
                  {project.name}
                </Title>
                <ArrowRightOutlined />
              </Flex>

              <Text
                style={{ display: "block", margin: "8px 0", color: "#4A5565" }}
              >
                {project.description}
              </Text>

              <Flex justify="space-between" align="center">
                <Text style={{ color: "#4A5565" }}>{project.tasks}</Text>
                <Text style={{ color: "#4A5565" }}>{project.percentLabel}</Text>
              </Flex>

              <Progress
                percent={project.percent}
                showInfo={false}
                size="small"
              />

              <Flex gap={8} align="center">
                <Text style={{ color: "#4A5565" }}>{project.inProgress}</Text>
                <Text style={{ color: "#4A5565" }}>•</Text>
                <Text style={{ color: "#4A5565" }}>{project.members}</Text>
              </Flex>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default TaskSummarySection;
