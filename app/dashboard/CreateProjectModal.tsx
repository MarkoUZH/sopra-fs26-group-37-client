"use client";
import { DeleteOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Flex, Input, Select, Typography } from "antd";
import React, {useState} from "react";

const { Title } = Typography;

// to test the look of the member section, needs to be removed later
const initialMembers = [
  { key: "plain-harry", initial: "H", name: "Plain Harry" },
  { key: "ordinary-jane", initial: "J", name: "Ordinary Jane" },
  { key: "average-joe", initial: "J", name: "Average Joe" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

const CreateProjectModal = ({ open, onClose }: Props): React.JSX.Element | null => {
  const [members, setMembers] = useState(initialMembers);

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
            <Input placeholder="Add a project name..." style={{ borderRadius: 8 }} />
          </Flex>

          <Flex vertical gap={6}>
            <span style={{ fontSize: 13, color: "#555" }}>Description</span>
            <Input.TextArea
              placeholder="Add a description..."
              rows={4}
              style={{ borderRadius: 8, resize: "none", maxHeight: 120 }}
            />
          </Flex>

          <Flex vertical gap={6}>
            <Flex align="center" gap={4}>
              <UserOutlined style={{ fontSize: 13, color: "#555" }} />
              <span style={{ fontSize: 13, color: "#555" }}>Members</span>
            </Flex>
            <Select
              placeholder=""
              style={{ width: "100%" }}
              suffixIcon={
                <span style={{ color: "#888", display: "inline-block", transform: "rotate(90deg)", fontSize: 16 }}>
                  ›
                </span>
              }
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
            <Button size="medium" onClick={onClose} style={{ borderRadius: 8 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              size="medium"
              icon={<PlusOutlined />}
              onClick={onClose}
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