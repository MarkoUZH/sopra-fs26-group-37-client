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
import React, { useEffect, useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
interface UserData {
  name: string;
  email: string;
  role: boolean; // true for Manager, false for Member
  language: string;
}

const { Title, Text } = Typography;

const Settings = (): React.JSX.Element => {
  const api = useApi();
  const [password, setPassword] = useState("verysafepassword123");
  const [name, setName] = useState("Average Joe");
  const { value: id , clear: clearId } = useLocalStorage<string>("id", "");
  const [autoTranslate, setAutoTranslate] = useState(true);
const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
  const fetchUser = async () => {
      try {
        // Now requesting by ID: e.g., /users/1
        const currentUser = await api.get<User>(`/users/${id}`);
        setUser(currentUser);
      } catch (e) {
        console.error("Failed to fetch user", e);
      }
    };
    if (id) fetchUser();
  }, [id, api]);

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
              <Input value={user?.username || ""} onChange={(e) => setName(e.target.value)} />
            </Form.Item>
            <Form.Item label="Email" style={{ marginBottom: 0 }}>
              <Input value={user?.email || ""} disabled />
            </Form.Item>
            <Form.Item label="Password" style={{ marginBottom: 0 }}>
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Role" style={{ marginBottom: 12 }}>
              <Input value={user?.manager ? "Manager" : "Member"} disabled />
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