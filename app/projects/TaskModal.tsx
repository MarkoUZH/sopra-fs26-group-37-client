"use client";
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  PlusOutlined,
  TagOutlined,
  UserOutlined,
  RocketOutlined,
} from "@ant-design/icons";

import { Avatar, Button, DatePicker, Flex, Input, InputNumber, Select, Typography, Tag } from "antd";
import dayjs from "dayjs";
import { TeamMember } from "@/projects/projectTypes";
import { Task, TaskColumn } from "@/projects/taskTypes";
import {TagItem, useTags} from "@/dashboard/TagsContext";
import { getModalTranslation } from "@/utils/dictionary_task_modal";

const { Title, Text } = Typography;

export interface TaskModalProps {
  open: boolean;
  initialColumn: TaskColumn;
  editingTask?: Task | null;
  team: TeamMember[];
  sprints: { id: number; name: string }[];
  projectId: string;
  onClose: () => void;
  onSave: (task: Omit<Task, "id">) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  open,
  initialColumn,
  editingTask,
  team,
  sprints = [],
  onClose,
  onSave,
  projectId,
}) => {
  const { getTagsForProject } = useTags();
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [availableTags, setAvailableTags] = useState<TagItem[]>([]);
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    priority: "MEDIUM" as Task["priority"],
    status: "TODO" as TaskColumn,
    assigneeIndex: -1,
    dueDate: null as dayjs.Dayjs | null,
    timeEstimate: "",
    tags: [] as string[],
    sprintId: undefined as number | undefined,
  });

  useEffect(() => {
    if (open) {
      if (typeof window !== "undefined") {
        const savedLang = localStorage.getItem("language");
        if (savedLang) {
          try { setTargetLanguage(JSON.parse(savedLang)); } 
          catch { setTargetLanguage(savedLang.replace(/"/g, '')); }
        }
      }
      const loadTags = async () => {
        const tags = await getTagsForProject(projectId);
        setAvailableTags(tags || []);
      };
      loadTags();
    }
  }, [open, projectId, getTagsForProject]);

  const ui = useMemo(() => ({
    header: getModalTranslation(editingTask ? "Edit Task" : "Create Task", targetLanguage),
    title: getModalTranslation("Title", targetLanguage),
    desc: getModalTranslation("Description", targetLanguage),
    tags: getModalTranslation("Tags", targetLanguage),
    members: getModalTranslation("Members", targetLanguage),
    priority: getModalTranslation("Priority", targetLanguage),
    date: getModalTranslation("Due Date", targetLanguage),
    time: getModalTranslation("Time Estimate", targetLanguage),
    unassigned: getModalTranslation("Unassigned", targetLanguage),
    cancel: getModalTranslation("Cancel", targetLanguage),
    action: getModalTranslation(editingTask ? "Save Changes Button" : "Add Task Button", targetLanguage),
    high: getModalTranslation("High", targetLanguage),
    medium: getModalTranslation("Medium", targetLanguage),
    low: getModalTranslation("Low", targetLanguage),
    sprint: getModalTranslation("Sprint", targetLanguage),
  }), [targetLanguage, editingTask]);

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
          // Normalize to strings for the Select matcher
          tags: editingTask.tags?.map((t: TagItem) => String(t.name)) ?? [],
          sprintId: editingTask.sprintId ? Number(editingTask.sprintId) : undefined,
        });
      } else {
        setForm({
          name: "", description: "", priority: "MEDIUM", status: initialColumn,
          assigneeIndex: -1, dueDate: null, timeEstimate: "", tags: [], sprintId: undefined,
        });
      }
    }
  }, [open, editingTask, initialColumn, team]);

  if (!open) return null;

  const handleSave = async () => {
    if (!form.name.trim()) return;
    
    const projectTags = await getTagsForProject(projectId);
    const selectedTags = projectTags.filter((t: TagItem) => form.tags.includes(t.name));

    onSave({
      name: form.name,
      description: form.description,
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate ? form.dueDate.toISOString() : undefined,
      timeEstimate: parseFloat(form.timeEstimate) || 0,
      assignedUsers: form.assigneeIndex >= 0 ? [team[form.assigneeIndex]] : [],
      tags: selectedTags,
      sprintId: form.sprintId ? form.sprintId.toString() : undefined,
      originalLanguage: editingTask?.originalLanguage || targetLanguage,
    });
    onClose();
  };

  return createPortal(
    <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "#00000099", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, width: 560, maxHeight: "90vh", overflowY: "auto", position: "relative", zIndex: 10000 }}>
        
        <Flex justify="space-between" align="center" style={{ padding: "20px 24px 16px 24px" }}>
          <Title level={3} style={{ margin: 0 }}>{ui.header}</Title>
          <Button type="text" onClick={onClose} style={{ color: "#888", fontSize: 16 }}>✕</Button>
        </Flex>

        <div style={{ height: 1, background: "#e5e7eb", marginBottom: 15 }} />

        <Flex vertical gap={14} style={{ padding: "0 24px 24px 24px" }}>
          <Flex vertical gap={4}>
             <span style={{ fontSize: 13, color: "#555" }}>{ui.title}</span>
             <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ borderRadius: 8 }} />
          </Flex>

          <Flex vertical gap={4}>
            <span style={{ fontSize: 13, color: "#555" }}>{ui.desc}</span>
            <Input.TextArea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ borderRadius: 8, resize: "none" }} />
          </Flex>

          <Flex gap={12}>
            <Flex vertical gap={4} style={{ flex: 1 }}>
              <Flex align="center" gap={4}>
                <TagOutlined style={{ fontSize: 12, color: "#555" }} />
                <span style={{ fontSize: 13, color: "#555" }}>{ui.tags}</span>
              </Flex>
              <Select 
                mode="multiple" 
                value={form.tags} 
                onChange={(vals) => setForm({ ...form, tags: vals })} 
                style={{ width: "100%" }} 
                getPopupContainer={(trigger) => trigger.parentElement!}
                options={availableTags.map(tag => ({ label: tag.name, value: tag.name }))}
                // This forces the "Pills" to render even if types are weird
                tagRender={(props) => {
                    const { label, closable, onClose } = props;
                    return (
                      <Tag
                        color="blue"
                        closable={closable}
                        onClose={onClose}
                        style={{ marginRight: 3, display: 'flex', alignItems: 'center' }}
                      >
                        {label}
                      </Tag>
                    );
                }}
              />
              {/* VISUAL ROW: Shows tags below the selector if they are hidden in the line */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {form.tags.length > 0 && form.tags.map(tagName => (
                  <Tag key={tagName} color="geekblue" closable onClose={() => {
                    setForm({ ...form, tags: form.tags.filter(t => t !== tagName) });
                  }}>
                    {tagName}
                  </Tag>
                ))}
              </div>
            </Flex>

            <Flex vertical gap={4} style={{ flex: 1 }}>
              <Flex align="center" gap={4}>
                <UserOutlined style={{ fontSize: 12, color: "#555" }} />
                <span style={{ fontSize: 13, color: "#555" }}>{ui.members}</span>
              </Flex>
              <Select 
                allowClear 
                value={form.assigneeIndex >= 0 ? form.assigneeIndex : undefined} 
                onChange={(val) => setForm({ ...form, assigneeIndex: val ?? -1 })} 
                style={{ width: "100%" }} 
                getPopupContainer={(trigger) => trigger.parentElement!}
                options={team.map((member, i) => ({ label: member.username, value: i }))} 
              />
            </Flex>
          </Flex>

          {/* ... [Rest of the code remains exactly as you had it] ... */}
          <Flex gap={12}>
            <Flex vertical gap={4} style={{ flex: 1 }}>
              <Flex align="center" gap={4}>
                <FlagOutlined style={{ fontSize: 12, color: "#555" }} />
                <span style={{ fontSize: 13, color: "#555" }}>{ui.priority}</span>
              </Flex>
              <Select 
                value={form.priority} 
                onChange={(val) => setForm({ ...form, priority: val })} 
                style={{ width: "100%" }}
                getPopupContainer={(trigger) => trigger.parentElement!}
                options={[{ label: ui.high, value: "HIGH" }, { label: ui.medium, value: "MEDIUM" }, { label: ui.low, value: "LOW" }]} 
              />
            </Flex>
            <Flex vertical gap={4} style={{ flex: 1 }}>
              <Flex align="center" gap={4}>
                <CalendarOutlined style={{ fontSize: 12, color: "#555" }} />
                <span style={{ fontSize: 13, color: "#555" }}>{ui.date}</span>
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
          <Flex gap={12}>
            <Flex vertical gap={4} style={{ flex: 1 }}>
              <Flex align="center" gap={4}>
                <ClockCircleOutlined style={{ fontSize: 12, color: "#555" }} />
                <span style={{ fontSize: 13, color: "#555" }}>{ui.time}</span>
              </Flex>
              <InputNumber
                max={999}
                placeholder="e.g. 8"
                value={form.timeEstimate ? parseFloat(form.timeEstimate) : undefined}
                onChange={(val) => setForm({ ...form, timeEstimate: val !== null && val !== undefined ? String(Math.abs(val)) : "" })}
                style={{ width: "100%", borderRadius: 8 }}
              />
            </Flex>

            <Flex vertical gap={4} style={{ flex: 1 }}>
              <Flex align="center" gap={4}>
                <RocketOutlined style={{ fontSize: 12, color: "#555" }} />
                <span style={{ fontSize: 13, color: "#555" }}>{ui.sprint || "Sprint"}</span>
              </Flex>
              <Select 
                placeholder="Select Sprint"
                allowClear
                value={form.sprintId} 
                onChange={(val) => setForm({ ...form, sprintId: val })} 
                style={{ width: "100%" }}
                getPopupContainer={(trigger) => trigger.parentElement!}
                options={sprints.map(s => ({ label: s.name, value: s.id }))} 
              />
            </Flex>
          </Flex>

          <Flex justify="flex-end" gap={8} style={{ marginTop: 10 }}>
            <Button onClick={onClose} style={{ borderRadius: 8 }}>{ui.cancel}</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleSave} style={{ background: "#4f46e5", borderRadius: 8, border: "none" }}>{ui.action}</Button>
          </Flex>
        </Flex>
      </div>
    </div>,
    document.body
  );
};

export default TaskModal;