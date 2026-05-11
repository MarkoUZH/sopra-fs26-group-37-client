"use client";
import { ApiService } from "@/api/apiService";
import { DeleteOutlined, SaveOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Flex, Input, Select, Typography } from "antd";
import React, { useEffect, useState } from "react";
import {Project} from "@/projects/projectTypes";

const { Title } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  project: Project; // Use your ProjectDTO type here
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


const EditProjectModal = ({ open, onClose, project }: Props): React.JSX.Element | null => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<{key: string, initial: string, name: string}[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const api = new ApiService();
const [selectValue, setSelectValue] = useState<number | null>(null);

  // Pre-fill data when modal opens or project changes
  useEffect(() => {
    if (open && project) {
      setProjectName(project.name);
      setDescription(project.description);
      const formattedMembers = project.members?.map((m: User) => ({
        key: m.id.toString(),
        initial: m.username.charAt(0).toUpperCase(),
        name: m.username,
      })) || [];
      setMembers(formattedMembers);
    }
  }, [open, project]);

  const handleUpdateProject = async () => {
    try {
      const projectData = {
        name: projectName,
        description: description,
        memberIds: members.map(m => parseInt(m.key)),
      };

      await api.put(`/projects/${project.id}`, projectData);
      onClose();
    } catch (error) {
      console.error("Failed to update project:", error);
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
  // Reuse your existing UI logic for availableUsers, removeMember, and the JSX...
  // (Include the same Select and mapping logic from CreateProjectModal here)

  if (!open) return null;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "#00000099", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, width: 560, maxHeight: "90vh", overflowY: "auto" }}>
        <Flex justify="space-between" align="center" style={{ padding: "20px 24px 16px 24px" }}>
          <Title level={3} style={{ margin: 0 }}>Edit Project</Title>
          <Button type="text" onClick={onClose}>✕</Button>
        </Flex>

        <div style={{ height: 1, background: "#e5e7eb", marginBottom: 15 }} />

        <Flex vertical gap={12} style={{ padding: "0 24px 24px 24px" }}>
          {/* Name Input */}
          <Flex vertical gap={6}>
            <span style={{ fontSize: 13, color: "#555" }}>Project Name</span>
            <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          </Flex>

          {/* Description Input */}
          <Flex vertical gap={6}>
            <span style={{ fontSize: 13, color: "#555" }}>Description</span>
            <Input.TextArea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
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
          
          
          <Flex justify="flex-end" gap={8}>
            <Button onClick={onClose}>Cancel</Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={handleUpdateProject}
              style={{ background: "#4f46e5" }}
            >
              Save Changes
            </Button>
          </Flex>
        </Flex>
      </div>
    </div>
  );
};

export default EditProjectModal;