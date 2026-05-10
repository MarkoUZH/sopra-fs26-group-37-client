"use client";
import {
    CalendarOutlined,
    DeleteOutlined,
    EditOutlined,
    MoreOutlined,
    UserOutlined,
    TranslationOutlined,
} from "@ant-design/icons";
import RocketOutlined from "@ant-design/icons/lib/icons/RocketOutlined";
import { Button, Dropdown, MenuProps, Switch, Tooltip, Typography, Flex } from "antd";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PRIORITY_DOT_COLOR, Task } from "@/projects/taskTypes";
import { ApiService } from "@/api/apiService";
import { SprintDTO } from "./projectTypes";

const { Text } = Typography;

interface TranslateResponse {
    text?: () => Promise<string>;
}

export interface TaskCardProps {
    task: Task;
    onDragStart: (e: React.DragEvent, taskId: number) => void;
    onEdit: (task: Task) => void;
    onDelete: (taskId: number) => void;
    projectId: number;
}

const COLOR_PALETTE = [
    { bg: "#ede9fe", text: "#6d28d9" },
    { bg: "#dbeafe", text: "#1d4ed8" },
    { bg: "#d1fae5", text: "#065f46" },
    { bg: "#fee2e2", text: "#b91c1c" },
    { bg: "#fce7f3", text: "#9d174d" },
    { bg: "#fef9c3", text: "#92400e" },
    { bg: "#e0f2fe", text: "#0369a1" },
    { bg: "#ffedd5", text: "#c2410c" },
];

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, onEdit, onDelete }) => {
    const [dragging, setDragging] = useState(false);
    const [isTranslated, setIsTranslated] = useState(true);
    const [sprintName, setSprintName] = useState("");
    const [translatedContent, setTranslatedContent] = useState({
        name: task.name,
        description: task.description || "",
    });

    const api = useMemo(() => new ApiService(), []);

    const targetLanguage = useMemo(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("language")?.replace(/"/g, "") || "en";
        }
        return "en";
    }, []);

    const translateText = useCallback(
        async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
            if (!text || sourceLang === targetLang) return text;
            try {
                const result = await api.post<TranslateResponse | string>("/translate", {
                    text,
                    sourceLanguage: sourceLang,
                    language: targetLang,
                });
                if (result && typeof result === "object" && typeof result.text === "function") {
                    return await result.text();
                }
                return typeof result === "string" ? result : text;
            } catch (err) {
                console.error("Translation error:", err);
                return text;
            }
        },
        [api]
    );

    useEffect(() => {
        const fetchTranslation = async () => {
            const source = task.originalLanguage || "en";
            if (source !== targetLanguage) {
                const [tName, tDesc] = await Promise.all([
                    translateText(task.name, source, targetLanguage),
                    translateText(task.description || "", source, targetLanguage),
                ]);
                setTranslatedContent({ name: tName, description: tDesc });
            }
        };
        fetchTranslation();
    }, [task, targetLanguage, translateText]);

    useEffect(() => {
        const fetchSprintName = async () => {
            if (!task?.sprintId) return;
            try {
                const response = (await api.get(`/sprints/${task.sprintId}`)) as SprintDTO;
                if (response && response.name) {
                    setSprintName(response.name);
                } else {
                    setSprintName(`Sprint #${task.sprintId}`);
                }
            } catch (err) {
                console.error("Sprint fetch error:", err);
                setSprintName(`Sprint #${task.sprintId}`);
            }
        };
        fetchSprintName();
    }, [task?.sprintId, api]);

    const menuItems: MenuProps["items"] = [
        { key: "edit", label: "Edit task", icon: <EditOutlined /> },
        { key: "delete", label: "Delete task", icon: <DeleteOutlined />, danger: true },
    ];

    const displayName = isTranslated ? translatedContent.name : task.name;
    const displayDescription = isTranslated ? translatedContent.description : task.description;

    return (
        <div
            draggable
            onDragStart={(e) => {
                setDragging(true);
                onDragStart(e, task.id);
            }}
            onDragEnd={() => setDragging(false)}
            style={{
                background: "#fff",
                borderRadius: 10,
                border: "1px solid #f0f0f0",
                padding: "14px 16px",
                marginBottom: 12,
                cursor: "grab",
                opacity: dragging ? 0.4 : 1,
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                transition: "all 0.2s ease",
            }}
        >
            {/* Top section: tags + menu button absolutely positioned */}
            <div style={{ position: "relative" }}>
                <Dropdown
                    menu={{
                        items: menuItems,
                        onClick: ({ key }) => {
                            if (key === "edit") onEdit(task);
                            if (key === "delete") onDelete(task.id);
                        },
                    }}
                    trigger={["click"]}
                >
                    <Button
                        type="text"
                        size="small"
                        icon={<MoreOutlined />}
                        style={{ color: "#9ca3af", padding: 0, position: "absolute", top: 0, right: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </Dropdown>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8, paddingRight: 24 }}>
                        {task.tags.map((tag, index) => {
                            const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
                            return (
                                <span
                                    key={tag.id}
                                    style={{
                                        fontSize: 11,
                                        padding: "2px 8px",
                                        borderRadius: 20,
                                        background: color.bg,
                                        color: color.text,
                                        fontWeight: 600,
                                    }}
                                >
                                    {tag.name}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Title */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6, paddingRight: 24 }}>
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: PRIORITY_DOT_COLOR[task.priority]?.color || "#ccc",
                            marginTop: 6,
                            flexShrink: 0,
                        }}
                    />
                    <Text strong style={{ color: "#1f2937", fontSize: 14, lineHeight: 1.4 }}>
                        {displayName}
                    </Text>
                </div>
            </div>

            {/* Description */}
            {displayDescription && (
                <Text style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 10 }}>
                    {displayDescription}
                </Text>
            )}

            {/* Assignee */}
            {task.assignedUsers?.[0] && (
                <Flex align="center" gap={6} style={{ marginBottom: 8 }}>
                    <UserOutlined style={{ fontSize: 12, color: "#8c8c8c" }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {task.assignedUsers[0].username}
                    </Text>
                </Flex>
            )}

            {/* Sprint + Time Estimate on same row */}
            <Flex justify="space-between" align="center" style={{ marginBottom: 10 }}>
                {task.sprintId ? (
                    <Flex align="center" gap={6}>
                        <RocketOutlined style={{ fontSize: 12, color: "#1890ff" }} />
                        <Text style={{ fontSize: 12, color: "#1890ff", fontWeight: 500 }}>
                            {sprintName}
                        </Text>
                    </Flex>
                ) : <div />}
                {task.timeEstimate !== undefined && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Est: {task.timeEstimate}h
                    </Text>
                )}
            </Flex>

            {/* Footer: due date + translation toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f5f5f5", paddingTop: 10 }}>
                {task.dueDate ? (() => {
                    const isOverdue = task.status !== "DONE" && new Date(task.dueDate) < new Date();
                    return (
                        <Text style={{ fontSize: 11, color: isOverdue ? "#ef4444" : "#9ca3af" }}>
                            <CalendarOutlined style={{ marginRight: 4, color: isOverdue ? "#ef4444" : "#9ca3af" }} />
                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </Text>
                    );
                })() : <div />}

                <Tooltip title={isTranslated ? "Show Original" : "Translate"} placement="top">
                    <Flex align="center" gap={4}>
                        <TranslationOutlined style={{ fontSize: 12, color: isTranslated ? "#6066FF" : "#bfbfbf" }} />
                        <Switch
                            size="small"
                            checked={isTranslated}
                            onChange={(checked) => setIsTranslated(checked)}
                            style={{ scale: "0.8", backgroundColor: isTranslated ? "#6066FF" : "#bfbfbf" }}
                        />
                    </Flex>
                </Tooltip>
            </div>
        </div>
    );
};

export default TaskCard;