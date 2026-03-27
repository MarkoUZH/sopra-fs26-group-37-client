import { AimOutlined } from "@ant-design/icons";
import { Card, Col, Flex, Progress, Row, Typography } from "antd";
import React from "react";

const { Title, Text } = Typography;

export default function ProjectListSection(): JSX.Element {
  return (
    <Card style={{ borderRadius: 12, width: "100%", marginTop: 16, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
      <Flex vertical gap={16}>
        <Flex align="center" gap={8}>
          <AimOutlined style={{ fontSize: 22 }} />
          <Title level={4} style={{ margin: 0 }}>
            Active Sprints
          </Title>
        </Flex>

        <Flex vertical gap={4}>
          <Title level={5} style={{ margin: 0 }}>
            Sprint 2 - Dashboard
          </Title>

          <Row justify="space-between" align="middle">
            <Col>
              <Text style={{ color: "#4A5565" }}>
                05.03.2026 - 20.03.2026 &nbsp;•&nbsp; 0/8 tasks completed
                &nbsp;•&nbsp; Project X
              </Text>
            </Col>
            <Col>
              <Text style={{ color: "#4A5565" }}>9 days remaining</Text>
            </Col>
          </Row>

          <Flex align="center" gap={8}>
            <Progress
              percent={0}
              style={{ flex: 1, margin: 0 }}
              showInfo={false}
            />
            <Text style={{ color: "#4A5565" }}>0%</Text>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
