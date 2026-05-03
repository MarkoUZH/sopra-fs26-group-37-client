import { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Task } from "@/projects/taskTypes";
import { getApiDomain } from "@/utils/domain";

export function useTaskWebSocket(projectId?: string | number) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting");

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () =>
                new SockJS(`${getApiDomain()}/ws/tasks`),

            onConnect: () => {
                setStatus("open");

                client.subscribe("/topic/tasks", (msg) => {
                    const { type, payload } = JSON.parse(msg.body);

                    switch (type) {
                        case "tasks_snapshot":
                            setTasks((prev) => prev.length === 0 ? payload : prev);
                            break;
                        case "task_created":
                            if (!projectId || String((payload as any).projectId) === String(projectId)) {
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

            onDisconnect: () => setStatus("closed"),
            onStompError: () => setStatus("closed"),
            reconnectDelay: 3000,
        });

        client.activate();
        return () => { client.deactivate(); };
    }, [projectId]);

    return { tasks, setTasks, status };
}