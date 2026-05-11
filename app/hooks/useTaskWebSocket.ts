import { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Task } from "@/projects/taskTypes";
import { ApiService } from "@/api/apiService";
import { getApiDomain } from "@/utils/domain";

export function useTaskWebSocket(projectId: string | number) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [status, setStatus] = useState<"loading" | "ready">("loading");

    useEffect(() => {
        if (!projectId) return;
        const api = new ApiService();

        // 1. REST — initial load on mount/refresh
        const seed = async () => {
            try {
                const data = await api.get<{ tasks: Task[] }>(`/projects/${projectId}`);
                setTasks(data.tasks ?? []);
            } catch (e) {
                console.error("Initial task fetch failed:", e);
            } finally {
                setStatus("ready");
            }
        };

        seed();

        // 2. WebSocket — real-time updates after initial load
        const client = new Client({
            webSocketFactory: () =>
                new SockJS(`${getApiDomain()}/ws/tasks`),
            onConnect: () => {
                client.subscribe("/topic/tasks", (msg) => {
                    const { type, payload } = JSON.parse(msg.body);
                    switch (type) {
                        // Ignore snapshot — REST already seeded state
                        case "task_created":
                            if (String((payload as any).projectId) === String(projectId)) {
                                setTasks((prev) => [...prev, payload]);
                            }
                            break;
                        case "task_updated":
                            setTasks((prev) =>
                                prev.map((t) => (t.id === payload.id ? payload : t))
                            );
                            break;
                        case "task_deleted":
                            setTasks((prev) => prev.filter((t) => t.id !== payload.id));
                            break;
                    }
                });
                client.publish({
                    destination: "/app/subscribe_tasks",
                    body: JSON.stringify({ projectId }),
                });
            },
            onDisconnect: () => {},
            reconnectDelay: 3000,
        });

        client.activate();
        return () => { client.deactivate(); };
    }, [projectId]);

    return { tasks, setTasks, status };
}