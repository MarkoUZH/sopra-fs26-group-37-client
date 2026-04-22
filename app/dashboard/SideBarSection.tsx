"use client";
import {
  DashboardOutlined,
  LogoutOutlined,
  ProjectOutlined,
  SettingOutlined,
  TagsOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { Divider, Menu, message } from "antd";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import ISO6391 from "iso-639-1";
import ManageTagsModal from "./ManageTagsModal";
import ManageSprintsModal from "./ManageSprintsModal";
// ----------------------------

// 1. Extract base English text to avoid recreation on every render
const baseText = {
  managerRole: "Manager",
  memberRole: "Member",
  mainSection: "MAIN",
  dashboard: "Dashboard",
  projects: "Projects",
  tags: "Tags",
  sprints: "Sprints",
  settingsSection: "SETTINGS",
  settings: "Settings",
  logout: "Logout",
};

const SideBarSection = (): React.JSX.Element => {
  const router = useRouter();
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  const [sprintsModalOpen, setSprintsModalOpen] = useState(false);
  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const pathname = usePathname();
  const isInProject = pathname?.includes("/projects/");

  const api = useApi();
  const { value: language, clear: clearLanguage } = useLocalStorage<string>("language", "");  
  const { value: id , clear: clearId } = useLocalStorage<string>("id", "");
  
  // Define the state for the logged-in user
  const [user, setUser] = useState<User | null>(null);

  // Translation State
  const [uiText, setUiText] = useState(baseText);
  const [targetLanguage, setTargetLanguage] = useState("en");

  // Read preferred language from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("language");
      if (savedLang) {
        try {
          setTargetLanguage(JSON.parse(savedLang));
        } catch {
          setTargetLanguage(savedLang);
        }
      }
    }
  }, []);

  // Fetch the data when the component mounts
  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const currentUser = await api.get<User>(`/users/${id}`);
        if (isMounted) {
          setUser(currentUser);
          
          // Optionally sync targetLanguage if the backend has a different language stored
          if (currentUser.language && currentUser.language !== targetLanguage) {
             setTargetLanguage(currentUser.language);
             if (typeof window !== "undefined") {
               localStorage.setItem("language", JSON.stringify(currentUser.language));
             }
          }
        }
      } catch (e) {
        console.error("Failed to fetch user", e);
      }
    };
    if (id) fetchUser();
    
    return () => {
      isMounted = false;
    };
  }, [id]); // Omitted `api` and `targetLanguage` intentionally to prevent infinite loops

  // Translate page whenever targetLanguage changes
  useEffect(() => {
    let authErrorShown = false;

    const translatePage = async () => {
      // Revert to English instantly if English is selected
      if (targetLanguage === "en") {
        setUiText(baseText);
        return;
      }

      const translate = async (text: string) => {
        try {
          const result = await api.post<any>("/translate", {
            text: text,
            sourceLanguage: "en",
            language: targetLanguage,
          });

          // Extract plain text if the API returns a raw Response object
          if (result && typeof result.text === 'function') {
            return await result.text();
          }

          return typeof result === 'string' ? result : text;
        } catch (err) {
          // Gracefully catch any 401s without spamming the console
          if (err instanceof Error && err.message.includes("401") && !authErrorShown) {
            authErrorShown = true;
            message.warning("Translation requires authorization. Please log in.");
          } else if (!authErrorShown) {
            console.error("Translation failed for text:", text, err);
          }
          return text; // Fallback to English on error
        }
      };

      // Resolve all translations concurrently
      const keys = Object.keys(baseText) as Array<keyof typeof baseText>;
      const translations = await Promise.all(
        keys.map((key) => translate(baseText[key]))
      );

      const newUiText = {} as typeof baseText;
      keys.forEach((key, index) => {
        newUiText[key] = translations[index];
      });

      setUiText(newUiText);
    };

    translatePage();
  }, [targetLanguage]); // Omitted `api` intentionally to prevent infinite loops

  const handleLogout = async (): Promise<void> => {
    try {
      const userId = localStorage.getItem("id"); // Or wherever you store the ID

      if (userId) {
        // 1. Call the backend to set status to OFFLINE
        // Note: We use an empty body {} because the ID is in the URL
        await api.put(`/logout/${userId}`, {});
      }
    } catch (error) {
      console.error("Failed to logout safely:", error);
      // Even if the backend call fails, we usually want to clear the local state
    } finally {
      // 2. Clear local storage regardless of API success
      clearToken();
      clearLanguage();
      clearId();
      
      // 3. Redirect to login
      router.push("/login");
    }
  };

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode) return "";
    // Most ISO language codes match the country code, 
    // though some need manual mapping (e.g., 'en' -> 'GB' or 'US')
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char =>  127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };
  
  // Centralized click handler for the menus
  const onMenuClick = (info: { key: string }) => {
    if (info.key === "logout") {
      handleLogout();
    } else if (info.key === "dashboard") {
      router.push("/dashboard");
    } else if (info.key === "settings") {
      router.push("/settings");
    } else if (info.key === "tags") {
      setTagsModalOpen(true);
    } else if (info.key == "sprints") {
        setSprintsModalOpen(true);
    }
    else if (info.key === "projects") {
      router.push("/projects");
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", marginTop: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 12px 12px 12px" }}>
        <span style={{ fontSize: 12, letterSpacing: "0.6px", fontWeight: 500, color: "#888" }}>
          {user?.manager ? uiText.managerRole : uiText.memberRole}
        </span>
        <span style={{ fontSize: 18, fontWeight: 700 }}>
         {user ? user.username : "Loading..."}{" "}{user?.language ? ` ${getFlagEmoji(user.language)}` : ""}
        </span>

        <span style={{ fontSize: 18, fontWeight: 700 }}>
        {user?.language ? ISO6391.getNativeName(user.language) : ""}
        </span>
      </div>

      <Divider style={{ margin: "0 0 8px 0" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.6px", padding: "0 18px", color: "#888" }}>
          {uiText.mainSection}
        </span>
        <Menu
          mode="inline"
          selectable={false}
          onClick={onMenuClick}
          style={{ border: "none", background: "transparent" }}
          items={[
            { key: "dashboard", icon: <DashboardOutlined />, label: <span className="menu-item">Dashboard</span>},
            { key: "projects", icon: <ProjectOutlined />, label: <span className="menu-item dropdown">Projects<span className="chevron">›</span></span> },
            ...(isInProject ? [
              { key: "tags", icon: <TagsOutlined />, label: <span className="menu-item">Tags</span> },
              { key: "sprints", icon: <RocketOutlined />, label: <span className="menu-item">Sprints</span> },
            ] : []),
          ]}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: "auto", marginBottom: 16 }}>
        <Divider style={{ margin: "8px 0" }} />
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.6px", padding: "0 18px", color: "#888" }}>
          {uiText.settingsSection}
        </span>
        <Menu
          mode="inline"
          selectable={false}
          onClick={onMenuClick}
          style={{ border: "none" }}
          items={[
            { key: "settings", icon: <SettingOutlined />, label: <span className="menu-item">{uiText.settings}</span> },
            {
              key: "logout", icon: <LogoutOutlined style={{ color: "#d55f5a" }} />, label: <span style={{ color: "#d55f5a" }} className="menu-item">{uiText.logout}</span> },
          ]}
        />
      </div>
      <ManageSprintsModal open={sprintsModalOpen} onClose={() => setSprintsModalOpen(false)} />
    </div>
  );
};

export default SideBarSection;