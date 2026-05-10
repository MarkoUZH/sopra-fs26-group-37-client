"use client";
import { FilterOutlined, UserOutlined, TagsOutlined, RocketOutlined } from "@ant-design/icons";
import { Flex, Select, Typography } from "antd";
import React from "react";
import { TagItem } from "@/dashboard/TagsContext";
import { TeamMember, Sprint } from "@/projects/projectTypes";

const { Text } = Typography;

interface FilterBarProps {
  members: TeamMember[];
  tags: TagItem[];
  sprints: Sprint[];
  selectedMembers: number[];
  selectedTags: number[];
  selectedSprint: number | null;
  onMembersChange: (val: number[]) => void;
  onTagsChange: (val: number[]) => void;
  onSprintChange: (val: number | null) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  members,
  tags,
  sprints,
  selectedMembers,
  selectedTags,
  selectedSprint,
  onMembersChange,
  onTagsChange,
  onSprintChange,
}) => {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #f0f0f0",
      borderRadius: 12,
      padding: "12px 16px",
      marginBottom: 16,
      marginTop: -8,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <Flex align="center" gap={6} style={{ marginBottom: 10 }}>
        <FilterOutlined style={{ color: "#9ca3af", fontSize: 13 }} />
        <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Filters</Text>
      </Flex>

      <Flex gap={16}>
        {/* Member Filter */}
        <Flex vertical gap={4} style={{ flex: 1 }}>
          <Flex align="center" gap={4}>
            <UserOutlined style={{ fontSize: 12, color: "#6b7280" }} />
            <span style={{ fontSize: 12, color: "#6b7280" }}>Member</span>
          </Flex>
          <Select
            mode="multiple"
            allowClear
            placeholder=" "
            value={selectedMembers}
            onChange={onMembersChange}
            style={{ width: "100%" }}
            maxTagCount="responsive"
            getPopupContainer={(trigger) => trigger.parentElement!}
            options={members.map((m) => ({
              label: m.username,
              value: m.id,
            }))}
          />
        </Flex>

        {/* Tags Filter */}
        <Flex vertical gap={4} style={{ flex: 1 }}>
          <Flex align="center" gap={4}>
            <TagsOutlined style={{ fontSize: 12, color: "#6b7280" }} />
            <span style={{ fontSize: 12, color: "#6b7280" }}>Tags</span>
          </Flex>
          <Select
            mode="multiple"
            allowClear
            placeholder=" "
            value={selectedTags}
            onChange={onTagsChange}
            style={{ width: "100%" }}
            maxTagCount="responsive"
            getPopupContainer={(trigger) => trigger.parentElement!}
            options={tags.map((t) => ({
              label: t.name,
              value: t.id,
            }))}
          />
        </Flex>

        {/* Sprint Filter */}
        <Flex vertical gap={4} style={{ flex: 1 }}>
          <Flex align="center" gap={4}>
            <RocketOutlined style={{ fontSize: 12, color: "#6b7280" }} />
            <span style={{ fontSize: 12, color: "#6b7280" }}>Sprint</span>
          </Flex>
          <Select
            allowClear
            placeholder=" "
            value={selectedSprint ?? undefined}
            onChange={(val) => onSprintChange(val ?? null)}
            style={{ width: "100%" }}
            getPopupContainer={(trigger) => trigger.parentElement!}
            options={sprints.map((s) => ({
              label: s.name,
              value: s.id,
            }))}
          />
        </Flex>
      </Flex>
    </div>
  );
};

export default FilterBar;