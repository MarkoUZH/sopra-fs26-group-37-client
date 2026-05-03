"use client";
import { CalendarOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Typography, DatePicker, Select, message } from "antd";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import { useApi } from "@/hooks/useApi";
import { getSprintTranslation } from "@/utils/dictionary_sprint_modal";

const { Title, Text } = Typography;

// --- Interfaces ---
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
  const [lang, setLang] = useState("en");
  const api = useApi();
  const containerRef = useRef<HTMLDivElement>(null);

  // Load language from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("language");
      if (savedLang) setLang(savedLang.replace(/"/g, ''));
    }
  }, [open]);

  // Dictionary for translations
  const t = useMemo(() => ({
    header: getSprintTranslation("manageSprints", lang),
    name: getSprintTranslation("sprintName", lang),
    project: getSprintTranslation("project", lang),
    status: getSprintTranslation("status", lang),
    start: getSprintTranslation("startDate", lang),
    end: getSprintTranslation("endDate", lang),
    add: getSprintTranslation("addSprint", lang),
    save: getSprintTranslation("saveChanges", lang),
    cancel: getSprintTranslation("cancel", lang),
    selectP: getSprintTranslation("selectProject", lang),
    planned: getSprintTranslation("planned", lang),
    active: getSprintTranslation("active", lang),
    completed: getSprintTranslation("completed", lang),
    fill: getSprintTranslation("fillFields", lang),
    sCreated: getSprintTranslation("successCreate", lang),
    sUpdated: getSprintTranslation("successUpdate", lang),
    fSave: getSprintTranslation("failSave", lang),
    deleted: getSprintTranslation("deleted", lang),
  }), [lang]);

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      try {
        const [sprintData, projectData] = await Promise.all([
          api.get<ApiSprint[]>("/sprints"),
          api.get<ApiProject[]>("/projects")
        ]);
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
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, [api, open]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.startDate || !form.endDate || !form.projectId) {
      message.warning(t.fill);
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
        message.success(t.sUpdated);
      } else {
        await api.post("/sprints", payload);
        message.success(t.sCreated);
        window.dispatchEvent(new Event("sprintCreated"));
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      // Refresh list
      const refreshed = await api.get<ApiSprint[]>("/sprints");
      setSprints(refreshed.map(s => ({
        id: s.id, name: s.name, status: s.sprintStatus,
        startDate: dayjs(s.startTime).format("DD.MM.YYYY"),
        endDate: dayjs(s.endTime).format("DD.MM.YYYY"),
        projectId: s.projectId, projectName: s.projectName
      })));
    } catch { message.error(t.fSave); }
  };

  if (!open) return null;

  return createPortal(
    <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "#00000099", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div ref={containerRef} onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, width: 560, maxHeight: "90vh", overflowY: "auto", padding: "20px 24px" }}>
        
        <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>{t.header}</Title>
          <Button type="text" onClick={onClose}>✕</Button>
        </Flex>

        {showForm && (
          <Flex vertical gap={12} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <Flex vertical gap={4}>
              <Text strong>{t.name}</Text>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Flex>

            <Flex gap={12}>
              <Flex vertical gap={4} style={{ flex: 1 }}>
                <Text strong>{t.project}</Text>
                <Select
                  placeholder={t.selectP}
                  disabled={!!editingId}
                  value={form.projectId || undefined}
                  onChange={(val) => setForm({ ...form, projectId: val })}
                  options={projects.map(p => ({ label: p.name, value: String(p.id) }))}
                />
              </Flex>
              <Flex vertical gap={4} style={{ flex: 1 }}>
                <Text strong>{t.status}</Text>
                <Select
                  value={form.status}
                  onChange={(val) => setForm({ ...form, status: val })}
                  options={[
                    { label: t.planned, value: "PLANNED" },
                    { label: t.active, value: "ACTIVE" },
                    { label: t.completed, value: "COMPLETED" },
                  ]}
                />
              </Flex>
            </Flex>

            <Flex gap={12}>
              <Flex vertical gap={4} style={{ flex: 1 }}>
                <Text strong>{t.start}</Text>
                <DatePicker 
                    style={{ width: "100%" }} 
                    format="DD.MM.YYYY" 
                    value={form.startDate ? dayjs(form.startDate, "DD.MM.YYYY") : null} 
                    onChange={(_, dateStr) => setForm({ ...form, startDate: String(dateStr) })}
                />
              </Flex>
              <Flex vertical gap={4} style={{ flex: 1 }}>
                <Text strong>{t.end}</Text>
                <DatePicker 
                    style={{ width: "100%" }} 
                    format="DD.MM.YYYY" 
                    value={form.endDate ? dayjs(form.endDate, "DD.MM.YYYY") : null} 
                    onChange={(_, dateStr) => setForm({ ...form, endDate: String(dateStr) })}
                />
              </Flex>
            </Flex>
          </Flex>
        )}

        <Flex vertical gap={8}>
          {sprints.map((sprint) => (
            <Flex key={sprint.id} align="center" justify="space-between" style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
              <Flex vertical>
                <Text strong>{sprint.name} <Text type="secondary" style={{ fontSize: 12 }}>({sprint.status})</Text></Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{sprint.startDate} - {sprint.endDate}</Text>
              </Flex>
              <Flex>
                <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingId(sprint.id); setForm({ ...sprint }); setShowForm(true); }} />
                <Button type="text" danger icon={<DeleteOutlined />} onClick={async () => {
                    await api.delete(`/sprints/${sprint.id}`);
                    setSprints(sprints.filter(s => s.id !== sprint.id));
                    message.success(t.deleted);
                }} />
              </Flex>
            </Flex>
          ))}
        </Flex>

        <Flex justify="flex-end" gap={8} style={{ marginTop: 16 }}>
          {showForm ? (
            <>
              <Button onClick={() => setShowForm(false)}>{t.cancel}</Button>
              <Button type="primary" onClick={handleSave} style={{ background: "#4f46e5" }}>{t.save}</Button>
            </>
          ) : (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }} style={{ background: "#4f46e5" }}>{t.add}</Button>
          )}
        </Flex>
      </div>
    </div>,
    document.body
  );
};

export default ManageSprintsModal;