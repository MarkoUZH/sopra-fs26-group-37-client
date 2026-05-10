import { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {Project, ProjectDTO} from "@/projects/projectTypes";
import { ApiService } from "@/api/apiService";
import { getApiDomain } from "@/utils/domain";

export function useProjectWebSocket(userId: string | null) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isManager, setIsManager] = useState(false);
    const [status, setStatus] = useState<"loading" | "ready">("loading");

    // REST seed — runs whenever userId becomes available
    useEffect(() => {
        const id = localStorage.getItem("id");
        if (!id) return;

        const api = new ApiService();
        Promise.all([
            api.get<{ manager: boolean }>(`/users/${id}`),
            api.get<ProjectDTO[]>(`/projects/users/${id}`),
        ]).then(([userData, projectData]) => {
            console.log("projects loaded:", projectData);
            setIsManager(userData.manager); // add this state back temporarily
            setProjects(projectData ?? []);
        });
    }, []); // re-runs when userId goes from null → "123"

    // WebSocket — real-time updates only, separate from REST
    useEffect(() => {
        if (!userId) return;

        const client = new Client({
            webSocketFactory: () =>
                new SockJS(`${getApiDomain()}/ws/projects`),
            onConnect: () => {
                client.subscribe("/topic/projects", (msg) => {
                    const { type, payload } = JSON.parse(msg.body);
                    switch (type) {
                        case "project_created":
                            if ((payload as ProjectDTO).members?.some((m) => String(m.id) === userId)) {
                                setProjects((prev) => [...prev, payload]);
                            }
                            break;
                        case "project_updated":
                            setProjects((prev) =>
                                prev.map((p) => (p.id === payload.id ? payload : p))
                            );
                            break;
                        case "project_deleted":
                            setProjects((prev) => prev.filter((p) => p.id !== payload.id));
                            break;
                    }
                });
                // Publish so backend registers this client for future broadcasts
                client.publish({
                    destination: "/app/subscribe_projects",
                    body: JSON.stringify({ userId }),
                });
            },
            reconnectDelay: 3000,
        });

        client.activate();
        return () => { client.deactivate(); };
    }, [userId]);

    return { projects, setProjects, isManager, status };
}