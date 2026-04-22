"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  PlusOutlined,
  TagOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, DatePicker, Flex, Input, Select, Typography } from "antd";
import dayjs from "dayjs";
import { TeamMember } from "@/projects/projectTypes";
import { Task, TaskColumn } from "@/projects/taskTypes";
import { useTags } from "@/dashboard/TagsContext";

const { Title } = Typography;

export interface TaskModalProps {
  open: boolean;
  initialColumn: TaskColumn;
  editingTask?: Task | null;
  team: TeamMember[];
  projectId: string;
  onClose: () => void;
  onSave: (task: Omit<Task, "id">) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  open,
  initialColumn,
  editingTask,
  team,
  onClose,
  onSave,
  projectId,
}) => {
  const { getTagsForProject } = useTags();
  const projectTags = getTagsForProject(projectId);

  const [form, setForm] = useState({
    name: "",
    description: "",
    priority: "MEDIUM" as Task["priority"],
    status: "TODO" as TaskColumn,
    assigneeIndex: -1, // UI uses index for selection
    dueDate: null as dayjs.Dayjs | null,
    timeEstimate: "" as string, // Labelled as "Hours"
    tags: [] as string[], // UI uses tag names
  });

  useEffect(() => {
    if (open) {
      if (editingTask) {
        setForm({
          name: editingTask.name,
          description: editingTask.description ?? "",
          priority: editingTask.priority,
          status: editingTask.status,
          assigneeIndex: team.findIndex((m) => m.id === editingTask.assignedUsers?.[0]?.id),
          dueDate: editingTask.dueDate ? dayjs(editingTask.dueDate) : null,
          timeEstimate: editingTask.timeEstimate?.toString() ?? "",
          tags: editingTask.tags?.map((t) => t.name) ?? [],
        });
      } else {
        setForm({
          name: "",
          description: "",
          priority: "MEDIUM",
          status: initialColumn,
          assigneeIndex: -1,
          dueDate: null,
          timeEstimate: "",
          tags: [],
        });
      }
    }
  }, [open, editingTask, initialColumn, team]);

  if (!open) return null;

  const handleSave = () => {
    if (!form.name.trim()) return;

    // Convert UI names/indices back to objects with IDs for the backend
    const selectedAssignees = form.assigneeIndex >= 0 ? [team[form.assigneeIndex]] : [];
    const selectedTags = projectTags.filter((t) => form.tags.includes(t.name));

    onSave({
      name: form.name,
      description: form.description,
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate ? form.dueDate.toISOString() : undefined,
      timeEstimate: parseFloat(form.timeEstimate) || 0,
      assignedUsers: selectedAssignees,
      tags: selectedTags,
    });
    onClose();
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#00000099",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
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
          position: "relative",
          zIndex: 10000,
        }}
      >
        <Flex justify="space-between" align="center" style={{ padding: "20px 24px 16px 24px" }}>
          <Title level={3} style={{ margin: 0 }}>
            {editingTask ? "Edit Task" : "Create Task"}
          </Title>
          <Button type="text" onClick={onClose} style={{ color: "#888", fontSize: 16 }}>✕</Button>
        </Flex>

        <div style={{ height: 1, background: "#e5e7eb", marginBottom: 15 }} />

        <Flex vertical gap={14} style={{ padding: "0 24px 24px 24px" }}>
          {/* Title */}
          <Flex vertical gap={4}>
            <span style={{ fontSize: 13, color: "#555" }}>Title</span>
            <Input
              placeholder="Add a task title..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ borderRadius: 8 }}
            />
          </Flex>

          {/* Description */}
          <Flex vertical gap={4}>
            <span style={{ fontSize: 13, color: "#555" }}>Description</span>
            <Input.TextArea
              placeholder="Add a description..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ borderRadius: 8, resize: "none" }}
            />
          </Flex>

          {/* Tags + Members Section */}
          <Flex gap={12}>
            <Flex vertical gap={4} style={{ flex: 1 }}>
            </Flex>

            <Flex vertical gap={4} style={{ flex: 1 }}>
              <Flex align="center" gap={4}>
                <UserOutlined style={{ fontSize: 12, color: "#555" }} />
                <span style={{ fontSize: 13, color: "#555" }}>Members</span>
              </Flex>
              <Select
                placeholder="Unassigned"
                allowClear
                value={form.assigneeIndex >= 0 ? form.assigneeIndex : undefined}
                onChange={(val) => setForm({ ...form, assigneeIndex: val ?? -1 })}
                style={{ width: "100%" }}
                getPopupContainer={(trigger) => trigger.parentElement!}
                options={team.map((member, i) => ({
                  label: <Flex align="center" gap={8}>{member.username}</Flex>,
                  value: i,
                }))}
              />
            </Flex>
          </Flex>

          {/* Priority + Due Date */}
          <Flex gap={12}>
            <Flex vertical gap={4} style={{ flex: 1 }}>
              <Flex align="center" gap={4}>
                <FlagOutlined style={{ fontSize: 12, color: "#555" }} />
                <span style={{ fontSize: 13, color: "#555" }}>Priority</span>
              </Flex>
              <Select
                value={form.priority}
                onChange={(val) => setForm({ ...form, priority: val })}
                style={{ width: "100%" }}
                getPopupContainer={(trigger) => trigger.parentElement!}
                options={[
                  { label: "High", value: "HIGH" },
                  { label: "Medium", value: "MEDIUM" },
                  { label: "Low", value: "LOW" },
                ]}
              />
            </Flex>

            <Flex vertical gap={4} style={{ flex: 1 }}>
              <Flex align="center" gap={4}>
                <CalendarOutlined style={{ fontSize: 12, color: "#555" }} />
                <span style={{ fontSize: 13, color: "#555" }}>Due Date</span>
              </Flex>
              <DatePicker
                style={{ width: "100%", borderRadius: 8 }}
                format="DD.MM.YYYY"
                value={form.dueDate}
                onChange={(date) => setForm({ ...form, dueDate: date })}
                getPopupContainer={(trigger) => trigger.parentElement!}
              />
            </Flex>
          </Flex>

          {/* Time Estimate (Hours) + Status */}
          <Flex gap={12}>
            <Flex vertical gap={4} style={{ flex: 1 }}>
              <Flex align="center" gap={4}>
                <ClockCircleOutlined style={{ fontSize: 12, color: "#555" }} />
                <span style={{ fontSize: 13, color: "#555" }}>Time Estimate (Hours)</span>
              </Flex>
              <Input
                type="number"
                min="1"
                max="999"
                placeholder="e.g. 8"
                value={form.timeEstimate}
                onChange={(e) => setForm({ ...form, timeEstimate: e.target.value })}
                style={{ borderRadius: 8 }}
              />
            </Flex>

          </Flex>

          {/* Footer buttons */}
          <Flex justify="flex-end" gap={8} style={{ marginTop: 4 }}>
            <Button onClick={onClose} style={{ borderRadius: 8 }}>Cancel</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleSave}
              style={{ background: "#4f46e5", borderRadius: 8, border: "none" }}
            >
              {editingTask ? "Save Changes" : "Add Task"}
            </Button>
          </Flex>
        </Flex>
      </div>
    </div>,
    document.body
  );
};

export default TaskModal;