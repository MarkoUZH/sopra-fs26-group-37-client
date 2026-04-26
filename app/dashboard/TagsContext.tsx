"use client";
import React, { createContext, useContext, useCallback } from "react";
import { useApi } from "@/hooks/useApi";

export interface TagItem {
    id: number;
    name: string;
    projectId: number;
    taskIds: number[];
}

interface TagsContextType {
    getTagsForProject: (projectId: string) => Promise<TagItem[]>;
    addTag: (projectId: string, name: string) => Promise<TagItem>;
    deleteTag: (projectId: string, tagId: number) => Promise<void>;
}

const TagsContext = createContext<TagsContextType | null>(null);

export const TagsProvider = ({ children }: { children: React.ReactNode }) => {
    const api = useApi();

    const getTagsForProject = useCallback(
        async (projectId: string): Promise<TagItem[]> => {
            return await api.get<TagItem[]>(`/projects/${projectId}/tags`);
        },
        [api]
    );

    const addTag = useCallback(
        async (projectId: string, name: string): Promise<TagItem> => {
            return await api.post<TagItem>("/tags", {
                name,
                projectId: Number(projectId),
                taskIds: [],
            });
        },
        [api]
    );

    const deleteTag = useCallback(
        async (_projectId: string, tagId: number): Promise<void> => {
            await api.delete(`/tags/${tagId}`);
        },
        [api]
    );

    return (
        <TagsContext.Provider value={{ getTagsForProject, addTag, deleteTag }}>
            {children}
        </TagsContext.Provider>
    );
};

export const useTags = () => {
    const ctx = useContext(TagsContext);
    if (!ctx) throw new Error("useTags must be used within a TagsProvider");
    return ctx;
};