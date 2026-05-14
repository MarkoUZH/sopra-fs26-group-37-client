"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useApi } from "@/hooks/useApi";
import { Layout, Select, Typography, Spin, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import SideBarSection from "@/dashboard/SideBarSection";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import {TagsProvider} from "@/dashboard/TagsContext";

const { Sider, Content } = Layout;
const { Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiSprint {
    id: number;
    name: string;
    sprintStatus: string;
    startTime: string;
    endTime: string;
    projectId: number;
    projectName?: string;
}

interface ApiTask {
    id: number;
    name: string;
    status: "TODO" | "IN_PROGRESS" | "DONE";
    priority: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: string;
    timeEstimate?: number;
    assignedUsers?: { id: number; username: string }[];
}

interface ApiProject {
    id: number;
    name: string;
    description?: string;
    tasks?: ApiTask[];
    members?: { id: number; username: string; name?: string }[];
    sprints?: ApiSprint[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
    PLANNED:   "#6366f1",
    ACTIVE:    "#10b981",
    COMPLETED: "#94a3b8",
};

const PRIORITY_COLOR: Record<string, string> = {
    HIGH:   "#ef4444",
    MEDIUM: "#f59e0b",
    LOW:    "#22c55e",
};

const MEMBER_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function daysLeft(endTime: string): number {
    return Math.max(0, dayjs(endTime).diff(dayjs(), "day"));
}

function sprintProgress(start: string, end: string): number {
    const total = dayjs(end).diff(dayjs(start), "day");
    const elapsed = dayjs().diff(dayjs(start), "day");
    return total > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / total) * 100))) : 0;
}

function buildBurndown(tasks: ApiTask[], startTime: string, endTime: string) {
    const total = tasks.length;
    const start = dayjs(startTime);
    const end = dayjs(endTime);
    const totalDays = end.diff(start, "day");
    if (totalDays <= 0 || total === 0) return [];

    const today = dayjs();
    const doneTasks = tasks.filter(t => t.status === "DONE").length;

    return Array.from({ length: totalDays + 1 }, (_, i) => {
        const date = start.add(i, "day");
        const isPast = date.isBefore(today) || date.isSame(today, "day");
        return {
            day: date.format("MMM D"),
            ideal: Math.round(total - (total / totalDays) * i),
            actual: isPast ? Math.max(0, total - doneTasks) : null,
        };
    });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({
                      label, value, sub, accent,
                  }: { label: string; value: string | number; sub?: string; accent: string }) => (
    <div style={{
        background: "#fff", borderRadius: 14, padding: "20px 24px",
        border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        display: "flex", flexDirection: "column", gap: 4,
    }}>
    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
      {label}
    </span>
        <span style={{ fontSize: 32, fontWeight: 800, color: accent, lineHeight: 1.1 }}>
      {value}
    </span>
        {sub && <span style={{ fontSize: 12, color: "#94a3b8" }}>{sub}</span>}
    </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{
        fontSize: 11, fontWeight: 700, color: "#94a3b8",
        letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 16,
    }}>
        {children}
    </div>
);

const EmptyChart = ({ height = 180 }: { height?: number }) => (
    <div style={{
        height, display: "flex", alignItems: "center",
        justifyContent: "center", color: "#cbd5e1", fontSize: 13,
    }}>
        No data yet
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const ProjectSprintOverview: React.FC = () => {
    const api = useApi();
    const router = useRouter();
    const params = useParams();
    const projectId = params?.id as string;

    const [project, setProject] = useState<ApiProject | null>(null);
    const [sprints, setSprints] = useState<ApiSprint[]>([]);
    const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // ── Fetch project + its sprints ──
    useEffect(() => {
        if (!projectId) return;
        let mounted = true;

        const load = async () => {
            try {
                const [projectData, allSprints] = await Promise.all([
                    api.get<ApiProject>(`/projects/${projectId}`),
                    api.get<ApiSprint[]>(`/projects/${projectId}/sprints`),
                ]);
                if (!mounted) return;

                setProject(projectData);
                setSprints(allSprints);

                // Default: active sprint → else most recent → else first
                const active = allSprints.find(s => s.sprintStatus === "ACTIVE");
                const sorted = [...allSprints].sort(
                    (a, b) => dayjs(b.startTime).valueOf() - dayjs(a.startTime).valueOf()
                );
                setSelectedSprintId(active?.id ?? sorted[0]?.id ?? null);
            } catch (e) {
                console.error("Failed to load project overview:", e);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => { mounted = false; };
    }, [api, projectId]);

    // ── Selected sprint ──
    const sprint = useMemo(
        () => sprints.find(s => s.id === selectedSprintId) ?? null,
        [sprints, selectedSprintId]
    );

    // ── Tasks scoped to this project ──
    const allTasks: ApiTask[] = project?.tasks ?? [];

    // ── Derived metrics ──
    const todo        = allTasks.filter(t => t.status === "TODO").length;
    const inProgress  = allTasks.filter(t => t.status === "IN_PROGRESS").length;
    const done        = allTasks.filter(t => t.status === "DONE").length;
    const total       = allTasks.length;
    const completion  = total > 0 ? Math.round((done / total) * 100) : 0;
    const timeLeft    = sprint ? daysLeft(sprint.endTime) : 0;
    const timeProgress = sprint ? sprintProgress(sprint.startTime, sprint.endTime) : 0;

    const burndownData = useMemo(
        () => sprint ? buildBurndown(allTasks, sprint.startTime, sprint.endTime) : [],
        [sprint, allTasks]
    );

    const priorityData = useMemo(() => [
        { name: "High",   value: allTasks.filter(t => t.priority === "HIGH").length,   fill: PRIORITY_COLOR.HIGH },
        { name: "Medium", value: allTasks.filter(t => t.priority === "MEDIUM").length, fill: PRIORITY_COLOR.MEDIUM },
        { name: "Low",    value: allTasks.filter(t => t.priority === "LOW").length,    fill: PRIORITY_COLOR.LOW },
    ].filter(d => d.value > 0), [allTasks]);

    const statusBarData = useMemo(() => [
        { name: "To Do",       count: todo,       fill: "#f04000" },
        { name: "In Progress", count: inProgress, fill: "#f0b100" },
        { name: "Done",        count: done,       fill: "#00c950" },
    ], [todo, inProgress, done]);

    const memberWorkload = useMemo(() => {
        const map: Record<string, number> = {};
        allTasks.forEach(t => {
            t.assignedUsers?.forEach(u => {
                map[u.username] = (map[u.username] ?? 0) + 1;
            });
        });
        return Object.entries(map)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [allTasks]);

    // Sprint velocity — tasks completed per sprint
    const velocityData = useMemo(() =>
            [...sprints]
                .sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf())
                .map(s => ({
                    name: s.name,
                    completed: s.id === selectedSprintId ? done : 0, // only accurate for selected sprint without per-sprint task history
                    status: s.sprintStatus,
                })),
        [sprints, selectedSprintId, done]
    );

    // ── Loading ──
    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <TagsProvider>
        <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
            <Sider
                width={220}
                theme="light"
                style={{
                    position: "fixed", left: 0, top: 0, bottom: 0,
                    height: "100vh", boxShadow: "2px 0 6px rgba(0,0,0,0.03)",
                    zIndex: 10, background: "#fff",
                }}
            >
                <SideBarSection />
            </Sider>

            <Layout style={{ marginLeft: 220 }}>
                <Content style={{ padding: "28px 32px", background: "#f8fafc", minHeight: "100vh" }}>

                    {/* ── Header ── */}
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => router.push(`/projects/${projectId}`)}
                        style={{ marginBottom: 20, color: "#64748b", paddingLeft: 0 }}
                    >
                        Back to board
                    </Button>

                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
                                {project?.name ?? "Project"} — Sprint Overview
                            </div>
                            {project?.description && (
                                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4, maxWidth: 520 }}>
                                    {project.description}
                                </div>
                            )}
                            <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  <b style={{ color: "#334155" }}>{project?.members?.length ?? 0}</b> members
                </span>
                                <span style={{ fontSize: 12, color: "#64748b" }}>
                  <b style={{ color: "#334155" }}>{sprints.length}</b> sprint{sprints.length !== 1 ? "s" : ""}
                </span>
                                <span style={{ fontSize: 12, color: "#64748b" }}>
                  <b style={{ color: "#334155" }}>{total}</b> tasks total
                </span>
                            </div>
                        </div>

                        {sprints.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Viewing Sprint
                </span>
                                <Select
                                    style={{ width: 260 }}
                                    value={selectedSprintId ?? undefined}
                                    onChange={setSelectedSprintId}
                                    placeholder="Select sprint"
                                    options={sprints
                                        .sort((a, b) => dayjs(b.startTime).valueOf() - dayjs(a.startTime).valueOf())
                                        .map(s => ({
                                            label: (
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{
                              width: 7, height: 7, borderRadius: "50%",
                              background: STATUS_COLOR[s.sprintStatus] ?? "#94a3b8",
                              flexShrink: 0, display: "inline-block",
                          }} />
                                                    <span style={{ fontWeight: s.id === selectedSprintId ? 600 : 400 }}>{s.name}</span>
                                                    <span style={{ color: "#94a3b8", fontSize: 11, marginLeft: "auto" }}>
                            {dayjs(s.startTime).format("MMM D")} – {dayjs(s.endTime).format("MMM D")}
                          </span>
                                                </div>
                                            ),
                                            value: s.id,
                                        }))}
                                />
                            </div>
                        )}
                    </div>

                    {sprints.length === 0 ? (
                        <div style={{
                            textAlign: "center", color: "#94a3b8", marginTop: 80,
                            fontSize: 15, lineHeight: 2,
                        }}>
                            No sprints found for this project.<br />
                            <span style={{ fontSize: 13 }}>Create one from the sidebar Sprint Management.</span>
                        </div>
                    ) : (
                        <>
                            {/* ── Sprint info bar ── */}
                            {sprint && (
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 16, marginBottom: 24,
                                    padding: "12px 16px", background: "#fff", borderRadius: 10,
                                    border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                                }}>
                  <span style={{
                      background: STATUS_COLOR[sprint.sprintStatus] + "18",
                      color: STATUS_COLOR[sprint.sprintStatus],
                      border: `1px solid ${STATUS_COLOR[sprint.sprintStatus]}40`,
                      borderRadius: 20, padding: "3px 14px",
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
                  }}>
                    {sprint.sprintStatus}
                  </span>
                                    <span style={{ fontSize: 13, color: "#64748b" }}>
                    {dayjs(sprint.startTime).format("MMM D, YYYY")} → {dayjs(sprint.endTime).format("MMM D, YYYY")}
                  </span>
                                    <span style={{
                                        fontSize: 13, fontWeight: timeLeft <= 3 ? 700 : 400,
                                        color: timeLeft <= 3 ? "#ef4444" : "#64748b",
                                        marginLeft: "auto",
                                    }}>
                    {timeLeft === 0 ? "Sprint ended" : `${timeLeft} day${timeLeft !== 1 ? "s" : ""} remaining`}
                  </span>
                                </div>
                            )}

                            {/* ── Stat cards ── */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                                <StatCard label="Completion"  value={`${completion}%`} sub={`${done} of ${total} tasks done`}        accent="#6366f1" />
                                <StatCard label="To Do"       value={todo}             sub="tasks not started"                        accent="#f04000" />
                                <StatCard label="In Progress" value={inProgress}       sub="tasks in flight"                          accent="#f0b100" />
                                <StatCard label="Days Left"   value={sprint ? timeLeft : "–"} sub={sprint ? `${timeProgress}% of sprint elapsed` : "No sprint selected"} accent={timeLeft <= 3 ? "#ef4444" : "#10b981"} />
                            </div>

                            {/* ── Timeline progress ── */}
                            {sprint && (
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                        <Text style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                                            Sprint timeline — {sprint.name}
                                        </Text>
                                        <Text style={{ fontSize: 12, color: "#94a3b8" }}>
                                            {dayjs(sprint.startTime).format("MMM D")} → {dayjs(sprint.endTime).format("MMM D")} · {timeProgress}% elapsed
                                        </Text>
                                    </div>
                                    <div style={{ background: "#e2e8f0", borderRadius: 99, height: 8, overflow: "hidden" }}>
                                        <div style={{
                                            width: `${timeProgress}%`, height: "100%", borderRadius: 99,
                                            background: `linear-gradient(90deg, ${STATUS_COLOR[sprint.sprintStatus]}, ${STATUS_COLOR[sprint.sprintStatus]}99)`,
                                            transition: "width 0.4s ease",
                                        }} />
                                    </div>
                                </div>
                            )}

                            {/* ── Charts row 1: Burndown + Priority ── */}
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>

                                <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                                    <SectionTitle>Burndown Chart</SectionTitle>
                                    {burndownData.length > 0 ? (
                                        <>
                                            <ResponsiveContainer width="100%" height={220}>
                                                <AreaChart data={burndownData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="idealGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                        </linearGradient>
                                                        <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} />
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                                                        formatter={(val: any, name: string) => [val ?? "–", name === "ideal" ? "Ideal remaining" : "Actual remaining"]}
                                                    />
                                                    <Area type="monotone" dataKey="ideal" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 3" fill="url(#idealGrad)" dot={false} name="ideal" />
                                                    <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2.5} fill="url(#actualGrad)" dot={false} connectNulls name="actual" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                            <div style={{ display: "flex", gap: 20, marginTop: 8, justifyContent: "center" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
                                                    <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#6366f1" strokeWidth="2" strokeDasharray="5 3" /></svg>
                                                    Ideal
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
                                                    <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#10b981" strokeWidth="2.5" /></svg>
                                                    Actual
                                                </div>
                                            </div>
                                        </>
                                    ) : <EmptyChart height={220} />}
                                </div>

                                <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                                    <SectionTitle>Priority Breakdown</SectionTitle>
                                    {priorityData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={220}>
                                            <PieChart>
                                                <Pie data={priorityData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                                                    {priorityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                                </Pie>
                                                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : <EmptyChart height={220} />}
                                </div>
                            </div>

                            {/* ── Charts row 2: Status + Workload ── */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

                                <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                                    <SectionTitle>Task Status Distribution</SectionTitle>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart data={statusBarData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} axisLine={false} />
                                            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                                            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56}>
                                                {statusBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                                    <SectionTitle>Member Workload</SectionTitle>
                                    {memberWorkload.length > 0 ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
                                            {memberWorkload.map((m, i) => {
                                                const pct = total > 0 ? Math.round((m.count / total) * 100) : 0;
                                                const color = MEMBER_COLORS[i % MEMBER_COLORS.length];
                                                return (
                                                    <div key={m.name}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                                            <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{m.name}</span>
                                                            <span style={{ fontSize: 12, color: "#94a3b8" }}>{m.count} task{m.count !== 1 ? "s" : ""} · {pct}%</span>
                                                        </div>
                                                        <div style={{ background: "#f1f5f9", borderRadius: 99, height: 6, overflow: "hidden" }}>
                                                            <div style={{
                                                                width: `${pct}%`, height: "100%", background: color,
                                                                borderRadius: 99, transition: "width 0.4s ease",
                                                            }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : <EmptyChart height={140} />}
                                </div>
                            </div>

                            {/* ── Sprint list for this project ── */}
                            <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 20 }}>
                                <SectionTitle>All Sprints in This Project</SectionTitle>
                                {sprints.length === 0 ? (
                                    <div style={{ color: "#94a3b8", fontSize: 13 }}>No sprints yet.</div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                                        {[...sprints]
                                            .sort((a, b) => dayjs(b.startTime).valueOf() - dayjs(a.startTime).valueOf())
                                            .map((s, i, arr) => {
                                                const isSelected = s.id === selectedSprintId;
                                                const left = daysLeft(s.endTime);
                                                const prog = sprintProgress(s.startTime, s.endTime);
                                                return (
                                                    <div
                                                        key={s.id}
                                                        onClick={() => setSelectedSprintId(s.id)}
                                                        style={{
                                                            display: "flex", alignItems: "center", gap: 16,
                                                            padding: "14px 12px",
                                                            borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none",
                                                            borderRadius: isSelected ? 10 : 0,
                                                            background: isSelected ? "#f8f7ff" : "transparent",
                                                            cursor: "pointer",
                                                            transition: "background 0.15s",
                                                        }}
                                                    >
                            <span style={{
                                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                                background: STATUS_COLOR[s.sprintStatus] ?? "#94a3b8",
                            }} />
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: "#1e293b" }}>
                                                                {s.name}
                                                            </div>
                                                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                                                                {dayjs(s.startTime).format("MMM D")} – {dayjs(s.endTime).format("MMM D, YYYY")}
                                                            </div>
                                                        </div>
                                                        <div style={{ width: 100 }}>
                                                            <div style={{ background: "#f1f5f9", borderRadius: 99, height: 5, overflow: "hidden" }}>
                                                                <div style={{
                                                                    width: `${prog}%`, height: "100%",
                                                                    background: STATUS_COLOR[s.sprintStatus],
                                                                    borderRadius: 99,
                                                                }} />
                                                            </div>
                                                        </div>
                                                        <span style={{
                                                            fontSize: 11, fontWeight: 700,
                                                            color: STATUS_COLOR[s.sprintStatus],
                                                            background: STATUS_COLOR[s.sprintStatus] + "18",
                                                            border: `1px solid ${STATUS_COLOR[s.sprintStatus]}30`,
                                                            borderRadius: 20, padding: "2px 10px",
                                                            letterSpacing: "0.04em", minWidth: 80, textAlign: "center",
                                                        }}>
                              {s.sprintStatus}
                            </span>
                                                        {s.sprintStatus === "ACTIVE" && (
                                                            <span style={{ fontSize: 11, color: left <= 3 ? "#ef4444" : "#64748b", minWidth: 60, textAlign: "right" }}>
                                {left}d left
                              </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>

                            {/* ── Task list ── */}
                            <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                                <SectionTitle>All Tasks in Project</SectionTitle>
                                {allTasks.length === 0 ? (
                                    <div style={{ color: "#94a3b8", fontSize: 13 }}>No tasks yet.</div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        {allTasks.map((task, i) => (
                                            <div key={task.id} style={{
                                                display: "flex", alignItems: "center", gap: 12,
                                                padding: "12px 4px",
                                                borderBottom: i < allTasks.length - 1 ? "1px solid #f8fafc" : "none",
                                            }}>
                        <span style={{
                            width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                            background: PRIORITY_COLOR[task.priority] ?? "#94a3b8",
                        }} />
                                                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#1e293b" }}>
                          {task.name}
                        </span>
                                                <span style={{ fontSize: 12, color: "#94a3b8", minWidth: 90, textAlign: "right" }}>
                          {task.assignedUsers?.[0]?.username ?? "Unassigned"}
                        </span>
                                                {task.dueDate && (
                                                    <span style={{ fontSize: 12, color: "#94a3b8", minWidth: 56, textAlign: "right" }}>
                            {dayjs(task.dueDate).format("MMM D")}
                          </span>
                                                )}
                                                {task.timeEstimate != null && task.timeEstimate > 0 && (
                                                    <span style={{ fontSize: 12, color: "#94a3b8", minWidth: 44, textAlign: "right" }}>
                            {task.timeEstimate}h
                          </span>
                                                )}
                                                <span style={{
                                                    fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "2px 10px",
                                                    letterSpacing: "0.03em", minWidth: 80, textAlign: "center",
                                                    background: task.status === "DONE" ? "#dcfce7" : task.status === "IN_PROGRESS" ? "#fef9c3" : "#fee2e2",
                                                    color: task.status === "DONE" ? "#16a34a" : task.status === "IN_PROGRESS" ? "#a16207" : "#b91c1c",
                                                }}>
                          {task.status === "IN_PROGRESS" ? "In Progress" : task.status === "DONE" ? "Done" : "To Do"}
                        </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Content>
            </Layout>
        </Layout>
        </TagsProvider>
    );
};

export default ProjectSprintOverview;