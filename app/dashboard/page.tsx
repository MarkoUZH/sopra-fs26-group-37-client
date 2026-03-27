"use client";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  ThunderboltOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Card, Col, Layout, Row, Typography } from "antd";
import React from "react";

import ProjectListSection from "./ProjectListSection";
import SideBarSection from "./SideBarSection";
import TaskSummarySection from "./TaskSummarySection";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const statsData = [
  {
    icon: <UnorderedListOutlined style={{ fontSize: 24, color: "#fff" }} />,
    iconBg: "#2b7fff",
    value: "18",
    label: "Total Tasks",
  },
  {
    icon: <FlagOutlined style={{ fontSize: 24, color: "#fff" }} />,
    iconBg: "#f04000",
    value: "9",
    label: "To-Do",
  },
  {
    icon: <ClockCircleOutlined style={{ fontSize: 24, color: "#fff" }} />,
    iconBg: "#f0b100",
    value: "5",
    label: "In Progress",
  },
  {
    icon: <CheckCircleOutlined style={{ fontSize: 24, color: "#fff" }} />,
    iconBg: "#00c950",
    value: "4",
    label: "Completed",
  },
  {
    icon: <ThunderboltOutlined style={{ fontSize: 24, color: "#fff" }} />,
    iconBg: "#ad46ff",
    value: "1",
    label: "Active Sprints",
  },
];

const Dashboard = (): JSX.Element => {
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
              boxShadow: "2px 0 6px rgba(0, 0, 0, 0.03)",
            }}
          >
            <SideBarSection />
          </Sider>

          <Layout style={{ marginLeft: 220 }}>
            <Content style={{ padding: "24px", background: "#f5f5f5" }}>
              <Title level={1}>My Dashboard</Title>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {statsData.map((stat, index) => (
              <Col key={index} flex="1 1 20%">
                <Card
                  style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 52,
                      height: 52,
                      borderRadius: 10,
                      background: stat.iconBg,
                      marginBottom: 12,
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 24, display: "block" }}>
                      {stat.value}
                    </Text>
                    <Text style={{ color: "#4A5565" }}>{stat.label}</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          <div style={{ position: "relative" }}>
            <TaskSummarySection />
          </div>
          <ProjectListSection />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;