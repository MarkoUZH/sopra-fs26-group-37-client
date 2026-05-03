"use client";
import { CalendarOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Typography, DatePicker, Select, App } from "antd";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import { useApi } from "@/hooks/useApi";

const { Title, Text } = Typography;

// --- Interfaces for API Responses ---
interface ApiSprint {
  id: number;
  name: string;
  sprintStatus: string;
  startTime: string;
  endTime: string;
  projectId: string;
  projectName?: string;
}

interface ApiProject {
  id: number;
  name: string;
}

// --- Component Props & State Interfaces ---
interface Props {
  open: boolean;
  onClose: () => void;
}

interface SprintItem {
  id: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  projectId: string;
  projectName?: string;
}

interface ProjectOption {
  id: number;
  name: string;
}

const EMPTY_FORM = { name: "", status: "PLANNED", startDate: "", endDate: "", projectId: "" };

const ManageSprintsModal = ({ open, onClose }: Props): React.JSX.Element | null => {
  const [sprints, setSprints] = useState<SprintItem[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const api = useApi();
  const { message } = App.useApp();
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Explicitly typing the API response in Promise.all
        const [sprintData, projectData] = await Promise.all([
          api.get<ApiSprint[]>("/sprints"),
          api.get<ApiProject[]>("/projects")
        ]);

        if (!isMounted) return;

        setProjects(projectData.map(p => ({ id: p.id, name: p.name })));
        setSprints(sprintData.map((s) => ({
          id: s.id,
          name: s.name,
          status: s.sprintStatus,
          startDate: dayjs(s.startTime).format("DD.MM.YYYY"),
          endDate: dayjs(s.endTime).format("DD.MM.YYYY"),
          projectId: s.projectId,
          projectName: s.projectName
        })));
      } catch (e) {
        console.error("Failed to fetch data", e);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [api, open]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.startDate || !form.endDate || !form.projectId) {
      message.warning("Please fill in all fields");
      return;
    }

    const payload = {
      name: form.name,
      sprintStatus: form.status,
      startTime: dayjs(form.startDate, "DD.MM.YYYY").toISOString(),
      endTime: dayjs(form.endDate, "DD.MM.YYYY").toISOString(),
      projectId: Number(form.projectId),
    };

    try {
      if (editingId !== null) {
        await api.put(`/sprints/${editingId}`, payload);
        message.success("Sprint updated");
      } else {
        await api.post("/sprints", payload);
        message.success("Sprint created");
        window.dispatchEvent(new Event("sprintCreated"));
      }
      
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);

      const refreshed = await api.get<ApiSprint[]>("/sprints");
      setSprints(refreshed.map(s => ({
        id: s.id,
        name: s.name,
        status: s.sprintStatus,
        startDate: dayjs(s.startTime).format("DD.MM.YYYY"),
        endDate: dayjs(s.endTime).format("DD.MM.YYYY"),
        projectId: s.projectId,
        projectName: s.projectName
      })));
    } catch (e) {
      message.error("Failed to save sprint");
    }
  };

  if (!open) return null;

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
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 12,
          width: 560, maxHeight: "90vh", overflowY: "auto",
          position: "relative", zIndex: 10000,
        }}
      >
        <Flex justify="space-between" align="center" style={{ padding: "20px 24px 16px 24px" }}>
          <Title level={3} style={{ margin: 0 }}>Sprint Management</Title>
          <Button type="text" onClick={onClose} style={{ color: "#888", fontSize: 16 }}>✕</Button>
        </Flex>

        <Flex vertical gap={12} style={{ padding: "0 24px 24px 24px" }}>
          {showForm && (
            <Flex vertical gap={10} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
              <Flex vertical gap={4}>
                <Text style={{ fontSize: 13, color: "#555" }}>Sprint Name</Text>
                <Input
                  placeholder="e.g. Q1 Design Phase"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Flex>

              <Flex vertical gap={4}>
                <Text style={{ fontSize: 13, color: "#555" }}>Project</Text>
                <Select
                  placeholder="Select a project"
                  disabled={!!editingId}
                  value={form.projectId || undefined}
                  onChange={(val) => setForm({ ...form, projectId: val })}
                  style={{ width: "100%" }}
                  getPopupContainer={() => containerRef.current || document.body}
                  options={projects.map(p => ({ label: p.name, value: String(p.id) }))}
                />
              </Flex>

              <Flex vertical gap={4}>
                <Text style={{ fontSize: 13, color: "#555" }}>Status</Text>
                <Select
                  value={form.status}
                  onChange={(val) => setForm({ ...form, status: val })}
                  style={{ width: "100%" }}
                  getPopupContainer={() => containerRef.current || document.body}
                  options={[
                    { label: "Planned", value: "PLANNED" },
                    { label: "Active", value: "ACTIVE" },
                    { label: "Completed", value: "COMPLETED" },
                  ]}
                />
              </Flex>

              <Flex gap={12}>
                <Flex vertical gap={4} style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: "#555" }}>Start Date</Text>
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD.MM.YYYY"
                    getPopupContainer={() => containerRef.current || document.body}
                    value={form.startDate ? dayjs(form.startDate, "DD.MM.YYYY") : null}
                    onChange={(_, dateStr) => setForm({ ...form, startDate: Array.isArray(dateStr) ? dateStr[0] : dateStr })}
                    disabledDate={(current) =>
                        form.endDate ? current > dayjs(form.endDate, "DD.MM.YYYY") : false
                    }
                  />
                </Flex>
                <Flex vertical gap={4} style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: "#555" }}>Due Date</Text>
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD.MM.YYYY"
                    getPopupContainer={() => containerRef.current || document.body}
                    value={form.endDate ? dayjs(form.endDate, "DD.MM.YYYY") : null}
                    onChange={(_, dateStr) => setForm({ ...form, endDate: Array.isArray(dateStr) ? dateStr[0] : dateStr })}
                    disabledDate={(current) =>
                        form.startDate ? current < dayjs(form.startDate, "DD.MM.YYYY") : false
                    }
                  />
                </Flex>
              </Flex>
            </Flex>
          )}

          <Flex vertical gap={0}>
            {sprints.map((sprint, index) => (
              <Flex key={sprint.id} align="center" justify="space-between" style={{ padding: "14px 4px", borderBottom: index < sprints.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                <Flex vertical gap={4}>
                  <Flex align="center" gap={8}>
                    <Text strong>{sprint.name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>({sprint.status})</Text>
                  </Flex>
                  <Flex align="center" gap={4}>
                    <CalendarOutlined style={{ fontSize: 11, color: "#888" }} />
                    <Text style={{ fontSize: 12, color: "#888" }}>
                      {sprint.startDate} - {sprint.endDate} {sprint.projectName && `• ${sprint.projectName}`}
                    </Text>
                  </Flex>
                </Flex>
                <Flex gap={4}>
                  <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingId(sprint.id); setForm({ ...sprint, projectId: String(sprint.projectId) }); setShowForm(true); }} />
                  <Button type="text" icon={<DeleteOutlined />} onClick={async () => {
                    try {
                      await api.delete(`/sprints/${sprint.id}`);
                      setSprints(sprints.filter(s => s.id !== sprint.id));
                      message.success("Deleted");
                    } catch { message.error("Failed"); }
                  }} />
                </Flex>
              </Flex>
            ))}
          </Flex>

          <Flex justify="flex-end" gap={8} style={{ marginTop: 8 }}>
            {showForm ? (
              <>
                <Button onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="primary" onClick={handleSave} style={{ background: "#4f46e5" }}>Save Changes</Button>
              </>
            ) : (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }} style={{ background: "#4f46e5" }}>Add Sprint</Button>
            )}
          </Flex>
        </Flex>
      </div>
    </div>,
    document.body
  );
};

export default ManageSprintsModal;