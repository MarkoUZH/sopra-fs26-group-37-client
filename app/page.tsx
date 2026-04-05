"use client";
import {
  AppstoreOutlined,
  ProjectOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { Button, Col, Flex, Row, Typography } from "antd";
import { useRouter } from "next/navigation";

const { Title, Paragraph } = Typography;

const features = [
  {
    icon: <AppstoreOutlined style={{ fontSize: 36, color: "#7c3aed" }} />,
    iconBg: "#f3f0ff",
    title: "Dashboard Analytics",
    description: "Track project progress and team performance",
  },
  {
    icon: <ProjectOutlined style={{ fontSize: 36, color: "#a855f7" }} />,
    iconBg: "#fdf4ff",
    title: "Project Management",
    description: "Organize sprints, epics, and user stories",
  },
  {
    icon: <TableOutlined style={{ fontSize: 36, color: "#ec4899" }} />,
    iconBg: "#fff0f6",
    title: "Kanban Board",
    description: "Drag & drop tasks across workflow stages",
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      style={{ minHeight: "100vh", padding: "40px 24px", background: "#fff" }}
    >
      <Title style={{ textAlign: "center", marginBottom: 8, fontSize: 52 }}>
        Agile Project Manager
      </Title>
      <Paragraph
        style={{
          textAlign: "center",
          fontSize: 16,
          maxWidth: 480,
          marginBottom: 32,
          color: "#555",
        }}
      >
        Streamline your workflow with powerful sprint planning, kanban boards,
        and team collaboration tools
      </Paragraph>

      <Flex gap={16} justify="center" style={{ marginBottom: 56 }}>
        <Button
          type="primary"
          style={{ minWidth: 130, height: 40, fontSize: 18 }}
          onClick={() => router.push("/login")}
        >
          Login
        </Button>
        <Button
          type="primary"
          style={{ minWidth: 130, height: 40, fontSize: 18, background: "#9665FFE5" }}
          onClick={() => router.push("/register")}
        >
          Register
        </Button>
      </Flex>

      <Row
        gutter={[48, 32]}
        justify="center"
        style={{ maxWidth: 900, width: "100%", }}
      >
        {features.map((feature) => (
          <Col key={feature.title} xs={24} sm={12} md={8}>
            <Flex vertical align="center" gap={12}>
              <Flex
                align="center"
                justify="center"
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 16,
                  background: feature.iconBg,
                }}
              >
                {feature.icon}
              </Flex>
              <Title level={4} style={{ textAlign: "center", marginBottom: 0 }}>
                {feature.title}
              </Title>
              <Paragraph
                style={{
                  textAlign: "center",
                  marginBottom: 0,
                  color: "#666",
                }}
              >
                {feature.description}
              </Paragraph>
            </Flex>
          </Col>
        ))}
      </Row>
    </Flex>
  );
}