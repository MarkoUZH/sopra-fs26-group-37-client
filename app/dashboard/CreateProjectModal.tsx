"use client";
import { ApiService } from "@/api/apiService";
import { DeleteOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Flex, Input, Select, Typography } from "antd";
import React, {useEffect, useState} from "react";

const { Title } = Typography;

// to test the look of the member section, needs to be removed later


interface Props {
  open: boolean;
  onClose: () => void;
}
interface User {
  id: number;
  username: string; 
  name: string
}

interface SelectedMember {
  key: string;
  initial: string;
  name: string;
}

const CreateProjectModal = ({ open, onClose }: Props): React.JSX.Element | null => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<SelectedMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const api = new ApiService();
  const [selectValue, setSelectValue] = useState<number | null>(null);
 
 
  const handleAddProject = async () => {
     const storedId = localStorage.getItem("id");
    try {
      // 1. Prepare the DTO for the backend
      // Your backend Project entity likely expects a list of IDs for members
      const projectData = {
        name: projectName,
        description: description,
        memberIds: members.map(m => parseInt(m.key)),
        ownerId: parseInt(storedId || "0"),

      };

      // 2. Call your backend POST /projects
      await api.post("/projects", projectData);
      
      // 3. Reset form and close
      setProjectName("");
      setDescription("");
      setMembers([]);
      onClose();
      
      // Optional: Refresh the page or trigger a refresh in the parent
      window.location.reload(); 
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Error creating project. Please try again.");
    }
  };

  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        try {
          const data = await api.get<User[]>("/users");
          setAvailableUsers(data);
        } catch (error) {
          console.error("Failed to fetch users:", error);
        }
      };
      fetchUsers();
    }
  }, [open]);
  if (!open) return null;

  const removeMember = (key: string) => {
    setMembers(members.filter((m) => m.key !== key));
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#00000099",
        display: "flex",

        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 12,
          width: 560,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Flex justify="space-between" align="center" style={{ padding: "20px 24px 16px 24px" }}>
          <Title level={3} style={{ margin: 0 }}>
            Create Project
          </Title>
          <Button type="text" onClick={onClose} style={{ color: "#888", fontSize: 16, marginRight: -8 }}>
            ✕
          </Button>
        </Flex>

        <div style={{ height: 1, background: "#e5e7eb", margin: "0 0 15px 0", marginTop: -5 }} />

        <Flex vertical gap={12} style={{ padding: "0 24px 24px 24px" }}>

          <Flex vertical gap={6}>
            <span style={{ fontSize: 13, color: "#555" }}>Project Name</span>
            <Input placeholder="Add a project name..." style={{ borderRadius: 8 }} value={projectName}
              onChange={(e) => setProjectName(e.target.value)}/>
          </Flex>

          <Flex vertical gap={6}>
            <span style={{ fontSize: 13, color: "#555" }}>Description</span>
            <Input.TextArea
              placeholder="Add a description..."
              rows={4}
              style={{ borderRadius: 8, resize: "none", maxHeight: 120 }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Flex>

          <Flex vertical gap={6}>
            <Flex align="center" gap={4}>
              <UserOutlined style={{ fontSize: 13, color: "#555" }} />
              <span style={{ fontSize: 13, color: "#555" }}>Members</span>
            </Flex>
            <Select
          showSearch // Allows typing to filter users
          placeholder="Select members to add"
          style={{ width: "100%" }}
          value={selectValue}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          // Map your API data to the Select options format
          options={availableUsers.map((user) => ({
            label: `${user.name} (${user.username})`,
            value: user.id,
            username: user.username, 
            name: user.name // Keep the username for later use when adding members
          }))}
          onChange={(value, option) => {
            // Logic to add the selected user to your 'members' list
            const selectedUser = option as { label: string; value: number };
            const newMember = {
              key: selectedUser.value.toString(),
              initial: selectedUser.label.charAt(0).toUpperCase(),
              name: selectedUser.label,
            };
            
            // Prevent duplicates
            if (!members.find(m => m.key === newMember.key)) {
              setMembers([...members, newMember]);
            }

            
        setSelectValue(null);
          }}
        />
          </Flex>

          <Flex vertical gap={8}>
            {members.map((member) => (
              <Flex
                key={member.key}
                align="center"
                justify="space-between"
                style={{
                  padding: "10px 12px",
                  background: "#fafafb",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                }}
              >
                <Flex align="center" gap={8}>
                  <Avatar style={{ background: "#4f46e5", flexShrink: 0 }}>
                    {member.initial}
                  </Avatar>
                  <Typography.Text>{member.name}</Typography.Text>
                </Flex>
                <Button
                  type="text"
                  icon={<DeleteOutlined style={{ color: "#aaa" }} />}
                  onClick={() => removeMember(member.key)}
                />
              </Flex>
            ))}
          </Flex>

          <Flex justify="flex-end" gap={8} style={{ marginTop: 8 }}>
            <Button size="middle" onClick={onClose} style={{ borderRadius: 8 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              size="middle"
              icon={<PlusOutlined />}
              onClick={handleAddProject}
              style={{ background: "#4f46e5", borderRadius: 8 }}
            >
              Add Project
            </Button>
          </Flex>
        </Flex>
      </div>
    </div>
  );
};

export default CreateProjectModal;