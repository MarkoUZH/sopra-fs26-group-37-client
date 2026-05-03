import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {ProjectDTO} from "@/projects/projectTypes";
import {useEffect, useState} from "react";
import {getApiDomain} from "@/utils/domain";

export function useProjectWebSocket() {
    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [status, setStatus] = useState<"connecting"|"open"|"closed">("connecting");

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(`${getApiDomain()}/ws/projects`),
            onConnect: () => {
                setStatus("open");

                // Subscribe to broadcasts
                client.subscribe("/topic/projects", (msg) => {
                    const { type, payload } = JSON.parse(msg.body);
                    switch (type) {
                        case "projects_snapshot": setProjects(payload); break;
                        case "project_created":   setProjects(p => [...p, payload]); break;
                        case "project_updated":   setProjects(p => p.map(x => x.id === payload.id ? payload : x)); break;
                        case "project_deleted":   setProjects(p => p.filter(x => x.id !== payload.id)); break;
                    }
                });

                // Request initial snapshot
                client.publish({ destination: "/app/subscribe_projects", body: "{}" });
            },
            onDisconnect: () => setStatus("closed"),
            reconnectDelay: 3000,
        });

        client.activate();
        return () => { client.deactivate(); };
    }, []);

    return { projects, status };
}