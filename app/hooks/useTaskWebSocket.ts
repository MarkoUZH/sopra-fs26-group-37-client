import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Task } from "@/projects/taskTypes";
import { getApiDomain } from "@/utils/domain";


export function useTaskWebSocket(
    projectId: string | number,
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) {
    useEffect(() => {
        if (!projectId) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${getApiDomain()}/ws/tasks`),
            onConnect: () => {
                client.subscribe("/topic/tasks", (msg) => {
                    const { type, payload } = JSON.parse(msg.body);
                    switch (type) {
                        case "task_created":
                            // Only add if it belongs to this project
                            if (String(payload?.projectId ?? payload?.project?.id) === String(projectId)) {
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
            reconnectDelay: 3000,
        });

        client.activate();
        return () => {
            client.deactivate();
        };
    }, [projectId, setTasks]);
}