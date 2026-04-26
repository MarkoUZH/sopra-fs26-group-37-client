"use client";
import { DeleteOutlined, PlusOutlined, TagOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Tag, Typography, Spin, message } from "antd";
import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTags, TagItem } from "@/dashboard/TagsContext";

const { Title } = Typography;

interface Props {
    open: boolean;
    onClose: () => void;
    projectId: string | undefined;
}

const TAG_COLORS = [
    { bg: "#ede9fe", text: "#6d28d9" },
    { bg: "#dbeafe", text: "#1d4ed8" },
    { bg: "#d1fae5", text: "#065f46" },
    { bg: "#fee2e2", text: "#b91c1c" },
    { bg: "#fce7f3", text: "#9d174d" },
    { bg: "#fef9c3", text: "#92400e" },
];

const ManageTagsModal = ({ open, onClose, projectId }: Props) => {
    const { getTagsForProject, addTag, deleteTag } = useTags();
    const [tags, setTags] = useState<TagItem[]>([]);
    const [newTagName, setNewTagName] = useState("");
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    const fetchTags = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const data = await getTagsForProject(projectId);
            setTags(data);
        } catch {
            message.error("Failed to load tags");
        } finally {
            setLoading(false);
        }
    }, [projectId, getTagsForProject]);

    useEffect(() => {
        if (open && projectId) fetchTags();
    }, [open, projectId, fetchTags]);

    if (!open) return null;

    const handleAddTag = async () => {
        if (!newTagName.trim() || !projectId) return;
        setAdding(true);
        try {
            const created = await addTag(projectId, newTagName.trim());
            setTags((prev) => [...prev, created]);
            setNewTagName("");
        } catch {
            message.error("Failed to create tag");
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteTag = async (tagId: number) => {
        if (!projectId) return;
        try {
            await deleteTag(projectId, tagId);
            setTags((prev) => prev.filter((t) => t.id !== tagId));
        } catch {
            message.error("Failed to delete tag");
        }
    };

    return createPortal(
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, backgroundColor: "#00000099",
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#fff", borderRadius: 12, width: 560,
                    maxHeight: "90vh", overflowY: "auto", position: "relative", zIndex: 10000,
                }}
            >
                <Flex justify="space-between" align="center" style={{ padding: "20px 24px 16px 24px" }}>
                    <Title level={3} style={{ margin: 0 }}>Tag Management</Title>
                    <Button type="text" onClick={onClose} style={{ color: "#888", fontSize: 16, marginRight: -8 }}>✕</Button>
                </Flex>

                <div style={{ height: 1, background: "#e5e7eb", margin: "0 0 15px 0", marginTop: -5 }} />

                <Flex vertical gap={12} style={{ padding: "0 24px 24px 24px" }}>
                    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px" }}>
                        <Flex align="center" gap={6} style={{ marginBottom: 12 }}>
                            <TagOutlined style={{ color: "#555" }} />
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>Create New Tag</span>
                        </Flex>
                        <Flex gap={8}>
                            <Input
                                placeholder="Enter tag name..."
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                onPressEnter={handleAddTag}
                                style={{ borderRadius: 8 }}
                            />
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddTag}
                                loading={adding}
                                style={{ background: "#4f46e5", borderRadius: 8, whiteSpace: "nowrap" }}
                            >
                                Add Tag
                            </Button>
                        </Flex>
                    </div>

                    {loading ? (
                        <Flex justify="center" style={{ padding: 24 }}><Spin /></Flex>
                    ) : (
                        <Flex vertical gap={0}>
                            {tags.map((tag, index) => {
                                const color = TAG_COLORS[index % TAG_COLORS.length];
                                return (
                                    <Flex
                                        key={tag.id}
                                        align="center"
                                        justify="space-between"
                                        style={{
                                            padding: "12px 4px",
                                            borderBottom: index < tags.length - 1 ? "1px solid #e5e7eb" : "none",
                                        }}
                                    >
                                        <Tag style={{
                                            background: color.bg, color: color.text, border: "none",
                                            borderRadius: 6, fontWeight: 500, fontSize: 13, padding: "2px 10px",
                                        }}>
                                            {tag.name}
                                        </Tag>
                                        <Button
                                            type="text"
                                            icon={<DeleteOutlined style={{ color: "#aaa" }} />}
                                            onClick={() => handleDeleteTag(tag.id)}
                                        />
                                    </Flex>
                                );
                            })}
                        </Flex>
                    )}
                </Flex>
            </div>
        </div>,
        document.body
    );
};

export default ManageTagsModal;