"use client";
import React, { createContext, useContext, useState } from "react";

export interface TagItem {
  id: number;
  name: string;
}

// Easy to replace later: swap with api.get(`/projects/${projectId}/tags`)
const INITIAL_TAGS_BY_PROJECT: Record<string, TagItem[]> = {
  "1": [
    { id: 1, name: "dev" },
    { id: 2, name: "design" },
    { id: 3, name: "content" },
    { id: 4, name: "seo" },
    { id: 5, name: "qa" },
    { id: 6, name: "research" },
  ],
};

interface TagsContextType {
  getTagsForProject: (projectId: string) => TagItem[];
  addTag: (projectId: string, name: string) => void;
  deleteTag: (projectId: string, id: number) => void;
}

const TagsContext = createContext<TagsContextType | null>(null);

export const TagsProvider = ({ children }: { children: React.ReactNode }) => {
  const [tagsByProject, setTagsByProject] = useState<Record<string, TagItem[]>>(
    INITIAL_TAGS_BY_PROJECT
  );

  const getTagsForProject = (projectId: string): TagItem[] =>
    tagsByProject[projectId] ?? [];

  const addTag = (projectId: string, name: string) => {
    setTagsByProject((prev) => ({
      ...prev,
      [projectId]: [...(prev[projectId] ?? []), { id: Date.now(), name }],
    }));
  };

  const deleteTag = (projectId: string, id: number) => {
    setTagsByProject((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] ?? []).filter((t) => t.id !== id),
    }));
  };

  return (
    <TagsContext.Provider value={{ getTagsForProject, addTag, deleteTag }}>
      {children}
    </TagsContext.Provider>
  );
};

export const useTags = () => {
  const ctx = useContext(TagsContext);
  if (!ctx) throw new Error("useTags must be used inside TagsProvider");
  return ctx;
};