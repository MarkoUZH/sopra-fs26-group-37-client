"use client";
import { GlobalOutlined, SaveOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  Select,
  Switch,
  Typography,
} from "antd";
import React, { useState } from "react";

const { Title, Text } = Typography;

const Settings = (): React.JSX.Element => {
  const [password, setPassword] = useState("verysafepassword123");
  const [name, setName] = useState("Average Joe");
  const [autoTranslate, setAutoTranslate] = useState(true);

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      style={{ minHeight: "100vh", padding: "30px 16px" }}
    >
      <Flex vertical gap={24} style={{ width: "100%", maxWidth: 854 }}>
        <Card>
          <Flex align="center" gap={8} style={{ marginBottom: 0 }}>
            <UserOutlined style={{ fontSize: 20 }} />
            <Title level={4} style={{ margin: 0 }}>
              Profile
            </Title>
          </Flex>
          <Form layout="vertical" style={{ marginBottom: 0 }}>
            <Form.Item label="Name" style={{ marginBottom: 0 }}>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Form.Item>
            <Form.Item label="Email" style={{ marginBottom: 0 }}>
              <Input value="justyouraveragejoe@gmail.com" disabled />
            </Form.Item>
            <Form.Item label="Password" style={{ marginBottom: 0 }}>
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Role" style={{ marginBottom: 12 }}>
              <Input value="Manager / Member" disabled />
            </Form.Item>
          </Form>
        </Card>

        <Card>
          <Flex align="center" gap={8} style={{ marginBottom: 0 }}>
            <GlobalOutlined style={{ fontSize: 20 }} />
            <Title level={4} style={{ margin: 0 }}>
              Language &amp; Translation
            </Title>
          </Flex>
          <Form layout="vertical">
            <Form.Item label="Preferred Language">
              <Select defaultValue="English">
                <Select.Option value="English">English</Select.Option>
                {/* PLEASE REMOVE THIS IS SOLELY FOR TESTING THE UI */}
                <Select.Option value="German">German</Select.Option>
                <Select.Option value="French">French</Select.Option>
                <Select.Option value="Spanish">Spanish</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Flex justify="space-between" align="center">
                <Text>Automatic Translation</Text>
                <Switch checked={autoTranslate} onChange={setAutoTranslate} />
              </Flex>
            </Form.Item>
          </Form>
        </Card>

        <Flex justify="flex-end" gap={12}>
          <Button>Cancel</Button>
          <Button type="primary" icon={<SaveOutlined />}>
            Save Changes
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Settings;