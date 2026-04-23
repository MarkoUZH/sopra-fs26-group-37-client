"use client";
import { ApiService } from "@/api/apiService";
import { DeleteOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Flex, Input, Select, Typography } from "antd";
import React, { useEffect, useState, useMemo } from "react";
import { getProjectTranslation } from "@/utils/dictionary_projects";
const { Title } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

interface User {
  id: number;
  username: string;
  name: string;
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
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [selectValue, setSelectValue] = useState<number | null>(null);
  
  const api = useMemo(() => new ApiService(), []);

  // 1. Sync language from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("language");
      if (savedLang) {
        try {
          setTargetLanguage(JSON.parse(savedLang));
        } catch {
          setTargetLanguage(savedLang);
        }
      }
    }
  }, [open]);

  // 2. Dictionary Lookup
  const uiText = useMemo(() => {
    return {
      title: getProjectTranslation("Create Project", targetLanguage),
      projectName: getProjectTranslation("Project Name", targetLanguage),
      projectNamePlaceholder: getProjectTranslation("Add a project name...", targetLanguage),
      description: getProjectTranslation("Description", targetLanguage),
      descriptionPlaceholder: getProjectTranslation("Add a description...", targetLanguage),
      members: getProjectTranslation("Members", targetLanguage),
      membersPlaceholder: getProjectTranslation("Select members to add", targetLanguage),
      cancel: getProjectTranslation("Cancel", targetLanguage),
      addProject: getProjectTranslation("Add Project", targetLanguage),
      errorMsg: getProjectTranslation("Error creating project", targetLanguage),
    };
  }, [targetLanguage]);

  const handleAddProject = async () => {
    const storedId = localStorage.getItem("id");
    try {
      const projectData = {
        name: projectName,
        description: description,
        memberIds: members.map(m => parseInt(m.key)),
        ownerId: parseInt(storedId || "0"),
      };

      await api.post("/projects", projectData);
      
      setProjectName("");
      setDescription("");
      setMembers([]);
      onClose();
      window.location.reload(); 
    } catch (error) {
      console.error("Failed to create project:", error);
      alert(uiText.errorMsg);
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
  }, [open, api]);

  const removeMember = (key: string) => {
    setMembers(members.filter((m) => m.key !== key));
  };

  if (!open) return null;

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
        zIndex: 1000,
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
            {uiText.title}
          </Title>
          <Button type="text" onClick={onClose} style={{ color: "#888", fontSize: 16, marginRight: -8 }}>
            ✕
          </Button>
        </Flex>

        <div style={{ height: 1, background: "#e5e7eb", margin: "0 0 15px 0", marginTop: -5 }} />

        <Flex vertical gap={12} style={{ padding: "0 24px 24px 24px" }}>

          <Flex vertical gap={6}>
            <span style={{ fontSize: 13, color: "#555" }}>{uiText.projectName}</span>
            <Input 
              placeholder={uiText.projectNamePlaceholder} 
              style={{ borderRadius: 8 }} 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </Flex>

          <Flex vertical gap={6}>
            <span style={{ fontSize: 13, color: "#555" }}>{uiText.description}</span>
            <Input.TextArea
              placeholder={uiText.descriptionPlaceholder}
              rows={4}
              style={{ borderRadius: 8, resize: "none", maxHeight: 120 }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Flex>

          <Flex vertical gap={6}>
            <Flex align="center" gap={4}>
              <UserOutlined style={{ fontSize: 13, color: "#555" }} />
              <span style={{ fontSize: 13, color: "#555" }}>{uiText.members}</span>
            </Flex>
            <Select
              showSearch
              placeholder={uiText.membersPlaceholder}
              style={{ width: "100%" }}
              value={selectValue}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={availableUsers.map((user) => ({
                label: `${user.name} (${user.username})`,
                value: user.id,
              }))}
              onChange={(value, option) => {
                const selected = option as { label: string; value: number };
                const newMember = {
                  key: selected.value.toString(),
                  initial: selected.label.charAt(0).toUpperCase(),
                  name: selected.label,
                };
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
              {uiText.cancel}
            </Button>
            <Button
              type="primary"
              size="middle"
              icon={<PlusOutlined />}
              onClick={handleAddProject}
              style={{ background: "#4f46e5", borderRadius: 8 }}
            >
              {uiText.addProject}
            </Button>
          </Flex>
        </Flex>
      </div>
    </div>
  );
};

export default CreateProjectModal;