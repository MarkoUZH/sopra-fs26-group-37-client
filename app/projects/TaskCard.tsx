"use client";
import {
    CalendarOutlined,
    DeleteOutlined,
    EditOutlined,
    MoreOutlined,
    UserOutlined,
    TranslationOutlined
} from "@ant-design/icons";
import { Button, Dropdown, MenuProps, Switch, Tooltip, Typography, Flex } from "antd";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PRIORITY_DOT_COLOR, Task } from "@/projects/taskTypes";
import { ApiService } from "@/api/apiService";

const { Text } = Typography;

// Define the interface to satisfy TypeScript/Vercel
interface TranslateResponse {
  text?: () => Promise<string>;
}

export interface TaskCardProps {
    task: Task,
    onDragStart: (e: React.DragEvent, taskId: number) => void,
    onEdit: (task: Task) => void,
    onDelete: (taskId: number) => void,
    projectId: number,
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, onEdit, onDelete }) => {
    const [dragging, setDragging] = useState(false);
    const [isTranslated, setIsTranslated] = useState(true);
    const [translatedContent, setTranslatedContent] = useState({ 
        name: task.name, 
        description: task.description || "" 
    });
    
    const api = useMemo(() => new ApiService(), []);
    
    const targetLanguage = useMemo(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("language")?.replace(/"/g, '') || "en";
        }
        return "en";
    }, []);

    const translateText = useCallback(async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
        if (!text || sourceLang === targetLang) return text;
        try {
            // Replace 'any' with the specific expected types
            const result = await api.post<TranslateResponse | string>("/translate", {
                text,
                sourceLanguage: sourceLang,
                language: targetLang,
            });

            // Handle object response with text() method (common in fetch-based wrappers)
            if (result && typeof result === 'object' && typeof result.text === 'function') {
                return await result.text();
            }
            
            // Handle direct string response
            return typeof result === 'string' ? result : text;
        } catch (err) {
            console.error("Translation error:", err);
            return text;
        }
    }, [api]);

    useEffect(() => {
        const fetchTranslation = async () => {
            const source = task.originalLanguage || "en";
            if (source !== targetLanguage) {
                const [tName, tDesc] = await Promise.all([
                    translateText(task.name, source, targetLanguage),
                    translateText(task.description || "", source, targetLanguage)
                ]);
                setTranslatedContent({ name: tName, description: tDesc });
            }
        };
        fetchTranslation();
    }, [task, targetLanguage, translateText]);

    const menuItems: MenuProps["items"] = [
        { key: "edit", label: "Edit task", icon: <EditOutlined /> },
        { key: "delete", label: "Delete task", icon: <DeleteOutlined />, danger: true },
    ];

    const displayName = isTranslated ? translatedContent.name : task.name;
    const displayDescription = isTranslated ? translatedContent.description : task.description;

    return (
        <div
            draggable
            onDragStart={(e) => { setDragging(true); onDragStart(e, task.id); }}
            onDragEnd={() => setDragging(false)}
            style={{
                background: "#fff",
                borderRadius: 10,
                border: "1px solid #f0f0f0",
                padding: "16px",
                marginBottom: 12,
                cursor: "grab",
                opacity: dragging ? 0.4 : 1,
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                transition: "all 0.2s ease",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: PRIORITY_DOT_COLOR[task.priority]?.color || "#ccc",
                        marginTop: 6, flexShrink: 0
                    }} />
                    <Text strong style={{ color: "#1f2937", fontSize: 14, lineHeight: 1.4 }}>
                        {displayName}
                    </Text>
                </div>
                <Dropdown
                    menu={{
                        items: menuItems,
                        onClick: ({ key }) => {
                            if (key === "edit") onEdit(task);
                            if (key === "delete") onDelete(task.id);
                        }
                    }}
                    trigger={["click"]}
                >
                    <Button type="text" size="small" icon={<MoreOutlined />} style={{ color: "#9ca3af", padding: 0 }} />
                </Dropdown>
            </div>

            {displayDescription && (
                <Text style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 12 }}>
                    {displayDescription}
                </Text>
            )}

            <Flex vertical gap={4} style={{ marginBottom: 12 }}>
                {task.assignedUsers?.[0] && (
                    <Flex align="center" gap={6}>
                        <UserOutlined style={{ fontSize: 12, color: "#555" }} />
                        <Text style={{ fontSize: 12, color: "#555" }}>{task.assignedUsers[0].username}</Text>
                    </Flex>
                )}
                {task.timeEstimate !== undefined && (
                    <Text type="secondary" style={{ fontSize: 12 }}>Est: {task.timeEstimate}h</Text>
                )}
            </Flex>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f9f9f9", paddingTop: 12 }}>
                {task.dueDate ? (
                    <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                ) : <div />}

                <Tooltip title={isTranslated ? "Show Original" : "Translate"} placement="top">
                    <Flex align="center" gap={4}>
                        <TranslationOutlined style={{ fontSize: 12, color: isTranslated ? "#1677ff" : "#bfbfbf" }} />
                        <Switch
                            size="small"
                            checked={isTranslated}
                            onChange={(checked) => setIsTranslated(checked)}
                            style={{ scale: '0.8' }}
                        />
                    </Flex>
                </Tooltip>
            </div>
        </div>
    );
};

export default TaskCard;