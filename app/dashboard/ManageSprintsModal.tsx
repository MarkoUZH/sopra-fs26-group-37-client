"use client";
import { CalendarOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Typography, DatePicker, Select, message } from "antd";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import { useApi } from "@/hooks/useApi";
import { getSprintTranslation } from "@/utils/dictionary_sprint_modal"; 

const { Title, Text } = Typography;

// --- Interfaces ---

interface TranslateResponse {
  text?: () => Promise<string>;
}

interface ApiSprint {
  id: number;
  name: string;
  sprintStatus: string;
  startTime: string;
  endTime: string;
  projectId: string;
  projectName?: string;
}

// Updated interface to accurately map the nested JSON structure
interface ApiProject {
  id: number;
  name: string;
  originalLanguage: string;
  owner: {
    id: number;
    email: string;
    username: string;
    [key: string]: any; 
  };
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
  originalLanguage: string;
  ownerId: number; // Keep flattened inside UI state configuration
}

const EMPTY_FORM = { name: "", status: "PLANNED", startDate: "", endDate: "", projectId: "" };

const ManageSprintsModal = ({ open, onClose }: Props): React.JSX.Element | null => {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [rawSprints, setRawSprints] = useState<ApiSprint[]>([]); 
  const [sprints, setSprints] = useState<SprintItem[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const api = useApi();
  const containerRef = useRef<HTMLDivElement>(null);
  const [targetLanguage, setTargetLanguage] = useState("en");

  // Sync language and user id from storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("language");
      if (savedLang) {
        try { setTargetLanguage(JSON.parse(savedLang)); }
        catch { setTargetLanguage(savedLang); }
      }
      
      const storedUid = localStorage.getItem("id");
      if (storedUid) {
        setCurrentUserId(Number(storedUid));
      }
    }
  }, []);

  // 1. Instant UI Label Translation (Dictionary)
  const uiText = useMemo(() => ({
    manageSprints: getSprintTranslation("manageSprints", targetLanguage),
    sprintName: getSprintTranslation("sprintName", targetLanguage),
    project: getSprintTranslation("project", targetLanguage),
    status: getSprintTranslation("status", targetLanguage),
    startDate: getSprintTranslation("startDate", targetLanguage),
    endDate: getSprintTranslation("endDate", targetLanguage),
    planned: getSprintTranslation("planned", targetLanguage),
    active: getSprintTranslation("active", targetLanguage),
    completed: getSprintTranslation("completed", targetLanguage),
    addSprint: getSprintTranslation("addSprint", targetLanguage),
    saveChanges: getSprintTranslation("saveChanges", targetLanguage),
    cancel: getSprintTranslation("cancel", targetLanguage),
    selectProject: getSprintTranslation("selectProject", targetLanguage),
    successCreate: getSprintTranslation("successCreate", targetLanguage),
    successUpdate: getSprintTranslation("successUpdate", targetLanguage),
    failSave: getSprintTranslation("failSave", targetLanguage),
    fillFields: getSprintTranslation("fillFields", targetLanguage),
    deleted: getSprintTranslation("deleted", targetLanguage),
    dateError: getSprintTranslation("dateError", targetLanguage),
  }), [targetLanguage]);

  // Authorization check using our local state variable
  const isProjectOwner = useCallback((projectId: string) => {
    const targetProject = projects.find(p => String(p.id) === String(projectId));
    if (!targetProject || currentUserId === null) return false;
    return targetProject.ownerId === currentUserId;
  }, [projects, currentUserId]);

  // 2. Dynamic Translation Helper (API)
  const translateText = useCallback(async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
    try {
      const result = await api.post<TranslateResponse | string>("/translate", {
        text,
        sourceLanguage: sourceLang,
        language: targetLang,
      });
      if (result && typeof result === 'object' && typeof result.text === 'function') {
        return await result.text();
      }
      return typeof result === 'string' ? result : text;
    } catch (err) {
      console.error("Translation error:", err);
      return text;
    }
  }, [api]);

  // 3. Effect to Translate Dynamic Sprint Content
  useEffect(() => {
    const translateDynamicContent = async () => {
      const translated = await Promise.all(
        rawSprints.map(async (s) => {
          const projectInfo = projects.find(p => String(p.id) === String(s.projectId));
          const source = projectInfo?.originalLanguage || "it"; 
          
          // Case-insensitive validation to verify if the sprint is a backlog item
          const isBacklog = s.name.trim().toLowerCase() === "backlog";

          return {
            id: s.id,
            // Skip dynamic API translation layer if it's the baseline Backlog
            name: isBacklog ? s.name : await translateText(s.name, source, targetLanguage),
            status: s.sprintStatus,
            startDate: dayjs(s.startTime).format("DD.MM.YYYY"),
            endDate: dayjs(s.endTime).format("DD.MM.YYYY"),
            projectId: String(s.projectId),
            projectName: await translateText(s.projectName || "", source, targetLanguage)
          };
        })
      );
      setSprints(translated);
    };

    if (rawSprints.length > 0 && projects.length > 0) {
      translateDynamicContent();
    } else if (rawSprints.length === 0) {
      setSprints([]);
    }
  }, [targetLanguage, rawSprints, projects, translateText]);

  useEffect(() => {
    if (!open) return;
    let isMounted = true;

    const fetchData = async () => {
      try {
        const userData = localStorage.getItem("id");
        const [sprintData, userProjects] = await Promise.all([
          api.get<ApiSprint[]>("/sprints"),
          api.get<ApiProject[]>(`/projects/users/${userData}`)
        ]);

        if (!isMounted) return;

        const myProjectIds = userProjects.map(p => p.id);

        const translatedProjects = await Promise.all(
          userProjects.map(async (p) => ({
            id: p.id,
            name: await translateText(p.name, p.originalLanguage, targetLanguage),
            originalLanguage: p.originalLanguage,
            ownerId: p.owner?.id // Extracted from your nested owner object
          }))
        );
        setProjects(translatedProjects);

        const filteredSprints = sprintData.filter(s => 
          myProjectIds.includes(Number(s.projectId))
        );

        setRawSprints(filteredSprints);

      } catch (e) {
        console.error("Failed to fetch filtered management data", e);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [api, open, targetLanguage, translateText]);

  const calculateStatus = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return "PLANNED";
    const now = dayjs();
    const start = dayjs(startDate, "DD.MM.YYYY");
    const end = dayjs(endDate, "DD.MM.YYYY");
    if (now.isBefore(start, 'day')) return "PLANNED";
    if (now.isAfter(end, 'day')) return "COMPLETED";
    return "ACTIVE";
  };

  useEffect(() => {
    if (form.startDate && form.endDate) {
      const autoStatus = calculateStatus(form.startDate, form.endDate);
      if (autoStatus !== form.status) {
        setForm(prev => ({ ...prev, status: autoStatus }));
      }
    }
  }, [form.startDate, form.endDate, form.status]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.startDate || !form.endDate || !form.projectId) {
      message.warning(uiText.fillFields);
      return;
    }

    if (!isProjectOwner(form.projectId)) {
      message.error("Access Denied: Only the project owner can manage this sprint.");
      return;
    }

    const start = dayjs(form.startDate, "DD.MM.YYYY");
    const end = dayjs(form.endDate, "DD.MM.YYYY");

    if (end.isBefore(start)) {
      message.error(uiText.dateError); 
      return;
    }

    const payload = {
      name: form.name,
      sprintStatus: form.status,
      startTime: dayjs(form.startDate, "DD.MM.YYYY").format("YYYY-MM-DD"),
      endTime: dayjs(form.endDate, "DD.MM.YYYY").format("YYYY-MM-DD"),
      projectId: Number(form.projectId),
    };

    try {
      if (editingId !== null) {
        await api.put(`/sprints/${editingId}`, payload);
        message.success(uiText.successUpdate);
      } else {
        await api.post("/sprints", payload);
        message.success(uiText.successCreate);
        window.dispatchEvent(new Event("sprintCreated"));
      }
      
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);

      const refreshed = await api.get<ApiSprint[]>("/sprints");
      const myProjectIds = projects.map(p => p.id);
      const filtered = refreshed.filter(s => myProjectIds.includes(Number(s.projectId)));

      setRawSprints(filtered);
    } catch (e) {
      message.error(uiText.failSave);
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
          <Title level={3} style={{ margin: 0 }}>{uiText.manageSprints}</Title>
          <Button type="text" onClick={onClose} style={{ color: "#888", fontSize: 16 }}>✕</Button>
        </Flex>

        <Flex vertical gap={12} style={{ padding: "0 24px 24px 24px" }}>
          {showForm && (
            <Flex vertical gap={10} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
              <Flex vertical gap={4}>
                <Text style={{ fontSize: 13, color: "#555" }}>{uiText.sprintName}</Text>
                <Input
                  placeholder="e.g. Q1 Design Phase"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Flex>

              <Flex vertical gap={4}>
                <Text style={{ fontSize: 13, color: "#555" }}>{uiText.project}</Text>
                <Select
                  placeholder={uiText.selectProject}
                  disabled={!!editingId}
                  value={form.projectId || undefined}
                  onChange={(val) => setForm({ ...form, projectId: val })}
                  style={{ width: "100%" }}
                  getPopupContainer={() => containerRef.current || document.body}
                  options={projects.map(p => ({ label: p.name, value: String(p.id) }))}
                />
              </Flex>

              <Flex vertical gap={4}>
                <Text style={{ fontSize: 13, color: "#555" }}>{uiText.status}</Text>
                <Select
                  disabled
                  value={form.status}
                  style={{ width: "100%" }}
                  options={[
                    { label: uiText.planned, value: "PLANNED" },
                    { label: uiText.active, value: "ACTIVE" },
                    { label: uiText.completed, value: "COMPLETED" },
                  ]}
                />
              </Flex>

              <Flex gap={12}>
                <Flex vertical gap={4} style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: "#555" }}>{uiText.startDate}</Text>
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD.MM.YYYY"
                    getPopupContainer={() => containerRef.current || document.body}
                    value={form.startDate ? dayjs(form.startDate, "DD.MM.YYYY") : null}
                    onChange={(_, dateStr) => setForm({ ...form, startDate: Array.isArray(dateStr) ? dateStr[0] : dateStr })}
                  />
                </Flex>
                <Flex vertical gap={4} style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: "#555" }}>{uiText.endDate}</Text>
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD.MM.YYYY"
                    getPopupContainer={() => containerRef.current || document.body}
                    value={form.endDate ? dayjs(form.endDate, "DD.MM.YYYY") : null}
                    disabledDate={(current) => {
                      return form.startDate ? current && current < dayjs(form.startDate, "DD.MM.YYYY").startOf('day') : false;
                    }}
                    onChange={(_, dateStr) => setForm({ ...form, endDate: Array.isArray(dateStr) ? dateStr[0] : dateStr })}
                  />
                </Flex>
              </Flex>
            </Flex>
          )}

          <Flex vertical gap={0}>
            {sprints.map((sprint, index) => {
              const isOwner = isProjectOwner(sprint.projectId);
              const isBacklog = rawSprints.find(r => r.id === sprint.id)?.name.trim().toLowerCase() === "backlog";

              return (
                <Flex key={sprint.id} align="center" justify="space-between" style={{ padding: "14px 4px", borderBottom: index < sprints.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                  <Flex vertical gap={4}>
                    <Flex align="center" gap={8}>
                      <Text strong>{sprint.name}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        ({uiText[sprint.status.toLowerCase() as keyof typeof uiText]})
                      </Text>
                    </Flex>
                    <Flex align="center" gap={4}>
                      <CalendarOutlined style={{ fontSize: 11, color: "#888" }} />
                      <Text style={{ fontSize: 12, color: "#888" }}>
                        {sprint.startDate} - {sprint.endDate} {sprint.projectName && `• ${sprint.projectName}`}
                      </Text>
                    </Flex>
                  </Flex>
                  <Flex gap={4}>
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      disabled={!isOwner}
                      onClick={() => { 
                        setEditingId(sprint.id); 
                        setForm({ ...sprint, projectId: String(sprint.projectId) }); 
                        setShowForm(true); 
                      }} 
                    />
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined />} 
                      disabled={!isOwner || isBacklog} 
                      onClick={async () => {
                        try {
                          await api.delete(`/sprints/${sprint.id}`);
                          setSprints(sprints.filter(s => s.id !== sprint.id));
                          message.success(uiText.deleted);
                        } catch { message.error(uiText.failSave); }
                      }} 
                    />
                  </Flex>
                </Flex>
              );
            })}
          </Flex>

          <Flex justify="flex-end" gap={8} style={{ marginTop: 8 }}>
            {showForm ? (
              <>
                <Button onClick={() => setShowForm(false)}>{uiText.cancel}</Button>
                <Button type="primary" onClick={handleSave} style={{ background: "#4f46e5" }}>{uiText.saveChanges}</Button>
              </>
            ) : (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }} style={{ background: "#4f46e5" }}>{uiText.addSprint}</Button>
            )}
          </Flex>
        </Flex>
      </div>
    </div>,
    document.body
  );
};

export default ManageSprintsModal;