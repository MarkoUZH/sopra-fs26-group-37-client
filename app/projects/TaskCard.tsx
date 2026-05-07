"use client";
import {
    CalendarOutlined,
    DeleteOutlined,
    EditOutlined,
    MoreOutlined,
    UserOutlined,
    TranslationOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, MenuProps, Switch, Tooltip, Typography, Flex, Tag } from "antd";
import RocketOutlined from "@ant-design/icons/lib/icons/RocketOutlined";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PRIORITY_DOT_COLOR, Task } from "@/projects/taskTypes";
import { ApiService } from "@/api/apiService";

const { Text } = Typography;

export interface TaskCardProps {
    task: Task;
    onDragStart: (e: React.DragEvent, taskId: number) => void;
    onEdit: (task: Task) => void;
    onDelete: (taskId: number) => void;
    projectId: string;
    sprints: { id: number; name: string }[];
}

const TaskCard: React.FC<TaskCardProps> = ({ 
    task, 
    onDragStart, 
    onEdit, 
    onDelete, 
    sprints = [] 
}) => {
    const [dragging, setDragging] = useState(false);
    const [isTranslated, setIsTranslated] = useState(false);
    const [translatedContent, setTranslatedContent] = useState({ 
        name: task.name, 
        description: task.description || "" 
    });
    
    const api = useMemo(() => new ApiService(), []);

    // 1. Get Sprint Name from the list passed down
    const sprintName = useMemo(() => {
        if (!task.sprintId) return null;
        const found = sprints.find(s => String(s.id) === String(task.sprintId));
        return found ? found.name : `Sprint #${task.sprintId}`;
    }, [task.sprintId, sprints]);

    // 2. Global Auto-Translate Logic
    useEffect(() => {
        const masterSetting = localStorage.getItem("autoTranslate");
        const shouldAutoTranslate = masterSetting !== null ? JSON.parse(masterSetting) : true;
        setIsTranslated(shouldAutoTranslate);
    }, []);

    const targetLanguage = useMemo(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("language")?.replace(/"/g, '') || "en";
        }
        return "en";
    }, []);

    // 3. Translation logic
    const translateText = useCallback(async (text: string, sourceLang: string, targetLang: string) => {
        if (!text || sourceLang === targetLang) return text;
        try {
            const result = await api.post<any>("/translate", {
                text,
                sourceLanguage: sourceLang,
                language: targetLang,
            });
            return typeof result === 'string' ? result : text;
        } catch (err) {
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
            }}
        >
            <Flex justify="space-between" align="start" style={{ marginBottom: 8 }}>
                <Flex align="start" gap={8}>
                    <span style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: PRIORITY_DOT_COLOR[task.priority]?.color || "#ccc",
                        marginTop: 6
                    }} />
                    <Text strong style={{ fontSize: 14 }}>{displayName}</Text>
                </Flex>
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
                    <Button type="text" size="small" icon={<MoreOutlined />} />
                </Dropdown>
            </Flex>

            {displayDescription && (
                <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 12 }}>
                    {displayDescription}
                </Text>
            )}

            {/* Sprint Tag */}
            {sprintName && (
                <Flex align="center" gap={6} style={{ marginBottom: 12 }}>
                    <RocketOutlined style={{ fontSize: 12, color: "#1890ff" }} />
                    <Text style={{ fontSize: 12, color: "#1890ff", fontWeight: 500 }}>{sprintName}</Text>
                </Flex>
            )}

            <Flex justify="space-between" align="center" style={{ borderTop: "1px solid #f0f0f0", paddingTop: 8 }}>
                {task.dueDate ? (
                    <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {new Date(task.dueDate).toLocaleDateString()}
                    </Text>
                ) : <div />}

                <Tooltip title={isTranslated ? "Show Original" : "Translate"}>
                    <Flex align="center" gap={4}>
                        <TranslationOutlined style={{ fontSize: 12, color: isTranslated ? "#6066FF" : "#bfbfbf" }} />
                        <Switch
                            size="small"
                            checked={isTranslated}
                            onChange={setIsTranslated}
                            style={{ scale: '0.8' }}
                        />
                    </Flex>
                </Tooltip>
            </Flex>
        </div>
    );
};

export default TaskCard;