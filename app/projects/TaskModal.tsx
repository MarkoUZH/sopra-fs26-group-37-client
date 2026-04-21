"use client";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  PlusOutlined,
  TagOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, DatePicker, Flex, Input, Select, Typography } from "antd";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { TeamMember } from "@/projects/projectTypes";
import { Task, TaskColumn } from "@/projects/taskTypes";
import dayjs from "dayjs";
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


const EMPTY_FORM = {
  title: "",
  description: "",
  priority: "medium" as Task["priority"],
  column: "todo" as TaskColumn,
  assigneeIndex: -1,
  dueDate: "",
  hours: "",
  tags: [] as string[],
};

const TaskModal: React.FC<TaskModalProps> = ({
  open,
  initialColumn,
  editingTask,
  team,
  onClose,
  onSave,
  projectId,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const { getTagsForProject } = useTags();
  const projectTags = getTagsForProject(projectId);

  React.useEffect(() => {
    if (open) {
      if (editingTask) {
        setForm({
          title: editingTask.title,
          description: editingTask.description ?? "",
          priority: editingTask.priority,
          column: editingTask.column,
          assigneeIndex: team.findIndex((m) => m.name === editingTask.assignee?.name),
          dueDate: editingTask.dueDate ?? "",
          hours: (editingTask as any).hours ?? "",
          tags: editingTask.tags ?? [],
        });
      } else {
        setForm({ ...EMPTY_FORM, column: initialColumn });
      }
    }
  }, [open, editingTask, initialColumn]);

  if (!open) return null;

  const handleSave = () => {
    if (!form.title.trim()) return;
    const assignee = form.assigneeIndex >= 0 ? team[form.assigneeIndex] : undefined;
    onSave({
      title: form.title,
      description: form.description,
      priority: form.priority,
      column: form.column,
      assignee,
      dueDate: form.dueDate,
      tags: form.tags,
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
        {/* Header */}
        <Flex justify="space-between" align="center" style={{ padding: "20px 24px 16px 24px" }}>
          <Title level={3} style={{ margin: 0 }}>
            {editingTask ? "Edit Task" : "Create Task"}
          </Title>
          <Button type="text" onClick={onClose} style={{ color: "#888", fontSize: 16, marginRight: -8 }}>
            ✕
          </Button>
        </Flex>

        <div style={{ height: 1, background: "#e5e7eb", margin: "0 0 15px 0", marginTop: -5 }} />

        <Flex vertical gap={14} style={{ padding: "0 24px 24px 24px" }}>

          {/* Title */}
          <Flex vertical gap={4}>
            <span style={{ fontSize: 13, color: "#555" }}>Title</span>
            <Input
              placeholder="Add a task title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
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

          {/* Tags + Members */}
          <Flex gap={12}>
            <Flex vertical gap={4} style={{ flex: 1 }}>
              <Flex align="center" gap={4}>
                <TagOutlined style={{ fontSize: 12, color: "#555" }} />
                <span style={{ fontSize: 13, color: "#555" }}>Tags</span>
              </Flex>
              <Select
                mode="multiple"
                placeholder="Select tags"
                value={form.tags}
                onChange={(val) => setForm({ ...form, tags: val })}
                style={{ width: "100%" }}
                options={projectTags.map((t) => ({ label: t.name, value: t.name }))}
                getPopupContainer={(trigger) => trigger.parentElement!}
              />
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
                  label: (
                    <Flex align="center" gap={8}>
                      <Avatar size={18} style={{ backgroundColor: member.color, fontSize: 9, fontWeight: 700 }}>
                        {member.initials}
                      </Avatar>
                      {member.name}
                    </Flex>
                  ),
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
                  { label: "High", value: "high" },
                  { label: "Medium", value: "medium" },
                  { label: "Low", value: "low" },
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
                value={form.dueDate ? dayjs(form.dueDate, "DD.MM.YYYY") : null}
                onChange={(_, dateStr) => setForm({ ...form, dueDate: dateStr as string })}
                getPopupContainer={(trigger) => trigger.parentElement!}
              />
            </Flex>
          </Flex>

          {/* Hours + Column */}
          <Flex gap={12}>
            <Flex vertical gap={4} style={{ flex: 1 }}>
              <Flex align="center" gap={4}>
                <ClockCircleOutlined style={{ fontSize: 12, color: "#555" }} />
                <span style={{ fontSize: 13, color: "#555" }}>Time Estimate</span>
              </Flex>
              <Input
                placeholder="e.g. 4h"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                style={{ borderRadius: 8 }}
              />
            </Flex>

            <Flex vertical gap={4} style={{ flex: 1 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Column</span>
              <Select
                value={form.column}
                onChange={(val) => setForm({ ...form, column: val })}
                style={{ width: "100%" }}
                getPopupContainer={(trigger) => trigger.parentElement!}
                options={[
                  { label: "To Do", value: "todo" },
                  { label: "In Progress", value: "inprogress" },
                  { label: "Done", value: "done" },
                ]}
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
              style={{ background: "#4f46e5", borderRadius: 8 }}
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