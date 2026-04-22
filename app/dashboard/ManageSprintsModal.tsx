"use client";
import { CalendarOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Typography, DatePicker, Select } from "antd";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";


const { Title, Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

interface SprintItem {
  id: number;
  name: string;
  status: "Completed" | "Active" | "Planned";
  startDate: string;
  endDate: string;
  project: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Completed: { bg: "#d1fae5", text: "#065f46" },
  Active: { bg: "#fee2e2", text: "#b91c1c" },
  Planned: { bg: "#f3f4f6", text: "#374151" },
};

const INITIAL_SPRINTS: SprintItem[] = [
  { id: 1, name: "Sprint 1 - Foundation", status: "Completed", startDate: "16.02.2026", endDate: "05.03.2026", project: "Project Y" },
  { id: 2, name: "Sprint 2 - Dashboard", status: "Active", startDate: "05.03.2026", endDate: "20.03.2026", project: "Project Y" },
  { id: 3, name: "Sprint 3 - Project Page", status: "Planned", startDate: "21.03.2026", endDate: "29.04.2026", project: "Project X" },
];

const AVAILABLE_PROJECTS = [
  { id: "1", name: "Project X" },
  { id: "2", name: "Project Y" },
  { id: "3", name: "Website Redesign" },
];

const EMPTY_FORM = { name: "", status: "", startDate: "", endDate: "", project: "" };

const ManageSprintsModal = ({ open, onClose }: Props): React.JSX.Element | null => {
  const [sprints, setSprints] = useState<SprintItem[]>(INITIAL_SPRINTS);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  if (!open) return null;

  const handleAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const handleEdit = (sprint: SprintItem) => {
    setEditingId(sprint.id);
    setForm({
      name: sprint.name,
      status: sprint.status,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      project: sprint.project,
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setSprints(sprints.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId !== null) {
      setSprints(sprints.map((s) =>
        s.id === editingId ? { ...s, ...form, status: form.status as SprintItem["status"] } : s
      ));
    } else {
      setSprints([...sprints, {
        id: Date.now(),
        name: form.name,
        status: (form.status || "Planned") as SprintItem["status"],
        startDate: form.startDate,
        endDate: form.endDate,
        project: form.project,
      }]);
    }
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const SprintList = () => (
    <Flex vertical gap={0}>
      {sprints.map((sprint, index) => (
        <Flex
          key={sprint.id}
          align="center"
          justify="space-between"
          style={{
            padding: "14px 4px",
            borderBottom: index < sprints.length - 1 ? "1px solid #e5e7eb" : "none",
          }}
        >
          <Flex vertical gap={4}>
            <Flex align="center" gap={8}>
              <Text strong style={{ fontSize: 14 }}>{sprint.name}</Text>
              <span style={{
                background: STATUS_COLORS[sprint.status].bg,
                color: STATUS_COLORS[sprint.status].text,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                padding: "1px 8px",
              }}>
                {sprint.status}
              </span>
            </Flex>
            <Flex align="center" gap={4}>
              <CalendarOutlined style={{ fontSize: 11, color: "#888" }} />
              <Text style={{ fontSize: 12, color: "#888" }}>
                {sprint.startDate} - {sprint.endDate}{sprint.project ? ` • ${sprint.project}` : ""}
              </Text>
            </Flex>
          </Flex>
          <Flex gap={4}>
            <Button type="text" icon={<EditOutlined style={{ color: "#aaa" }} />} onClick={() => handleEdit(sprint)} />
            <Button type="text" icon={<DeleteOutlined style={{ color: "#aaa" }} />} onClick={() => handleDelete(sprint.id)} />
          </Flex>
        </Flex>
      ))}
    </Flex>
  );

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        backgroundColor: "#00000099",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 12,
          width: 560, maxHeight: "90vh", overflowY: "auto",
          position: "relative", zIndex: 10000,
        }}
      >
        {/* Header */}
        <Flex justify="space-between" align="center" style={{ padding: "20px 24px 16px 24px" }}>
          <Title level={3} style={{ margin: 0 }}>Sprint Management</Title>
          <Button type="text" onClick={onClose} style={{ color: "#888", fontSize: 16, marginRight: -8 }}>✕</Button>
        </Flex>
        <div style={{ height: 1, background: "#e5e7eb", margin: "0 0 15px 0", marginTop: -5 }} />

        <Flex vertical gap={12} style={{ padding: "0 24px 24px 24px" }}>

          {/* Add form - shown when showForm is true */}
          {showForm && (
            <Flex vertical gap={10} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
              <Flex vertical gap={4}>
                <span style={{ fontSize: 13, color: "#555" }}>Name</span>
                <Input
                  placeholder="Add a name..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ borderRadius: 8 }}
                />
              </Flex>

              <Flex vertical gap={4}>
                <Flex align="center" gap={4}>
                  <span style={{ fontSize: 13, color: "#555" }}>Status</span>
                </Flex>
                <Select
                  placeholder="Select status"
                  value={form.status || undefined}
                  onChange={(val) => setForm({ ...form, status: val })}
                  style={{ width: "100%" }}
                  getPopupContainer={(trigger) => trigger.parentElement!}
                  options={[
                    { label: "Planned", value: "Planned" },
                    { label: "Active", value: "Active" },
                    { label: "Completed", value: "Completed" },
                  ]}
                />
              </Flex>
              <Flex vertical gap={4}>
                <span style={{ fontSize: 13, color: "#555" }}>Project</span>
                <Select
                  placeholder="Assign to project"
                  value={form.project || undefined}
                  onChange={(val) => setForm({ ...form, project: val })}
                  style={{ width: "100%" }}
                  getPopupContainer={(trigger) => trigger.parentElement!}
                  options={AVAILABLE_PROJECTS.map((p) => ({ label: p.name, value: p.name }))}
                />
              </Flex>
              <Flex gap={12}>
                <Flex vertical gap={4} style={{ flex: 1 }}>
                  <Flex align="center" gap={4}>
                    <CalendarOutlined style={{ fontSize: 12, color: "#555" }} />
                    <span style={{ fontSize: 13, color: "#555" }}>Start Date</span>
                  </Flex>
                  <DatePicker
                    style={{ width: "100%", borderRadius: 8 }}
                    format="DD.MM.YYYY"
                    value={form.startDate ? dayjs(form.startDate, "DD.MM.YYYY") : null}
                    onChange={(_, dateStr) => setForm({ ...form, startDate: dateStr as string })}
                    getPopupContainer={(trigger) => trigger.parentElement!}
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
                    value={form.endDate ? dayjs(form.endDate, "DD.MM.YYYY") : null}
                    onChange={(_, dateStr) => setForm({ ...form, endDate: dateStr as string })}
                    getPopupContainer={(trigger) => trigger.parentElement!}
                  />
                </Flex>
              </Flex>
            </Flex>
          )}

          {/* Sprint list - always shown */}
          <SprintList />

          {/* Footer buttons */}
          <Flex justify="flex-end" gap={8} style={{ marginTop: 8 }}>
            {showForm ? (
              <>
                <Button onClick={handleCancel} style={{ borderRadius: 8 }}>Cancel</Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleSave}
                  style={{ background: "#4f46e5", borderRadius: 8 }}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                style={{ background: "#4f46e5", borderRadius: 8 }}
              >
                Add Sprint
              </Button>
            )}
          </Flex>

        </Flex>
      </div>
    </div>,
    document.body
  );
};

export default ManageSprintsModal;