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
import { useRouter } from "next/navigation"
interface UserData {
  name: string;
  email: string;
  role: boolean; // true for Manager, false for Member
  language: string;
}

const { Title, Text } = Typography;

const Settings = (): React.JSX.Element => {
  const router = useRouter();
  const api = useApi();
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const[username, setUsername] = useState("");
  const { value: id , clear: clearId } = useLocalStorage<string>("id", "");
  const [autoTranslate, setAutoTranslate] = useState(true);
const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
  const fetchUser = async () => {
      try {
        // Now requesting by ID: e.g., /users/1
        const currentUser = await api.get<User>(`/users/${id}`);
        setUser(currentUser);
        setName(currentUser.name || "");
        setUsername(currentUser.username || ""); // Set local username state to current username
      } catch (e) {
        console.error("Failed to fetch user", e);
      }
    };
    if (id) fetchUser();
  }, [id, api]);

  const handleSave = async () => {
  try {
    const updateData = {
      username: username,
      name: name, 
      password: password,
    };

    await api.put(`/users/${id}`, updateData);
    
    // Optional: Show success message using Ant Design message component
    alert("Profile updated successfully!");
    router.push("/dashboard"); // Redirect to dashboard after saving
  } catch (e) {
    console.error("Failed to update user", e);
    alert("Failed to save changes.");
  }
};

const handleCancel = () => {
  router.push("/dashboard"); // Redirect to dashboard without saving
}

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
          <Form layout="vertical">
            <Form.Item label={<span style={{ color: "black", fontWeight: "bold" }}>Username</span>} 
  style={{ marginBottom: 16 }}>
              <Input value={username || ""} onChange={(e) => setUsername(e.target.value)} />
            </Form.Item>
              <Form.Item label={<span style={{ color: "black", fontWeight: "bold" }}>Full name</span>} 
  style={{ marginBottom: 16 }}>
              <Input value={name || ""} onChange={(e) => setName(e.target.value)} />
            </Form.Item>
            <Form.Item label={<span style={{ color: "black", fontWeight: "bold" }}>Email</span>} style={{ marginBottom: 16 }}>
              <Input value={user?.email || ""} disabled />
            </Form.Item>
            <Form.Item label={<span style={{ color: "black", fontWeight: "bold" }}>New Password</span>} style={{ marginBottom: 16 }}>
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>
            <Form.Item label={<span style={{ color: "black", fontWeight: "bold" }}>Role</span>} style={{ marginBottom: 12 }}>
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
          <Button onClick={handleCancel}>
            Cancel</Button>

                      <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={handleSave} // Add this click handler
            >
              Save Changes
</Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Settings;