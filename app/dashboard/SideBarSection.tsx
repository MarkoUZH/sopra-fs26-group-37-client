"use client";
import {
  DashboardOutlined,
  LogoutOutlined,
  ProjectOutlined,
  SettingOutlined,
  TagsOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { Divider, Menu } from "antd";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import ISO6391 from "iso-639-1";
import ManageSprintsModal from "./ManageSprintsModal";
import { User } from "@/types/user";

// --- DICTIONARY IMPORT ---
import { getSidebarTranslation } from "@/utils/dictionary_sidebar";
import ManageTagsModal from "@/dashboard/ManageTagsModal";

const SideBarSection = (): React.JSX.Element => {
  const router = useRouter();
  const [sprintsModalOpen, setSprintsModalOpen] = useState(false);
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const pathname = usePathname();
  const isInProject = pathname?.includes("/projects/");

  const projectId = isInProject ? pathname.split("/projects/")[1]?.split("/")[0] : undefined;

  const api = useApi();
  const { clear: clearLanguage } = useLocalStorage<string>("language", "");
  const { value: id, clear: clearId } = useLocalStorage<string>("id", "");

  const [user, setUser] = useState<User | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("en");

  // 1. Sync language from LocalStorage on mount
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

  // 2. Memoized UI Text - Instant lookup
  const uiText = useMemo(() => {
    return {
      managerRole: getSidebarTranslation("Manager", targetLanguage),
      memberRole: getSidebarTranslation("Member", targetLanguage),
      mainSection: getSidebarTranslation("MAIN", targetLanguage),
      dashboard: getSidebarTranslation("Dashboard", targetLanguage),
      projects: getSidebarTranslation("Projects", targetLanguage),
      tags: getSidebarTranslation("Tags", targetLanguage),
      sprints: getSidebarTranslation("Sprints", targetLanguage),
      settingsSection: getSidebarTranslation("SETTINGS_SECTION", targetLanguage),
      settings: getSidebarTranslation("Settings", targetLanguage),
      logout: getSidebarTranslation("Logout", targetLanguage),
    };
  }, [targetLanguage]);

  // 3. Fetch user data
  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const currentUser = await api.get<User>(`/users/${id}`);
        if (isMounted) {
          setUser(currentUser);
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
    return () => { isMounted = false; };
  }, [id, api]);

  const handleLogout = async (): Promise<void> => {
    try {
      const userId = localStorage.getItem("id");
      if (userId) await api.put(`/logout/${userId}`, {});
    } catch (error) {
      console.error("Failed to logout safely:", error);
    } finally {
      clearToken();
      clearLanguage();
      clearId();
      router.push("/login");
    }
  };

  const LANGUAGE_TO_FLAG: Record<string, string> = {
    af: "ZA", ar: "SA", az: "AZ", bn: "BD", cs: "CZ",
    de: "DE", en: "GB", es: "ES", et: "EE", fa: "IR",
    fi: "FI", fr: "FR", gl: "ES", gu: "IN", he: "IL",
    hi: "IN", hr: "HR", id: "ID", it: "IT", ja: "JP",
    ka: "GE", kk: "KZ", km: "KH", ko: "KR", lt: "LT",
    lv: "LV", mk: "MK", ml: "IN", mn: "MN", mr: "IN",
    my: "MM", ne: "NP", nl: "NL", pl: "PL", ps: "AF",
    pt: "PT", ro: "RO", ru: "RU", si: "LK", sl: "SI",
    sv: "SE", sw: "KE", ta: "IN", te: "IN", th: "TH",
    tl: "PH", tr: "TR", uk: "UA", ur: "PK", vi: "VN",
    xh: "ZA", zh: "CN",
  };

  const onMenuClick = (info: { key: string }) => {
    if (info.key === "logout") handleLogout();
    else if (info.key === "dashboard") router.push("/dashboard");
    else if (info.key === "settings") router.push("/settings");
    else if (info.key === "tags") setTagsModalOpen(true);
    else if (info.key === "sprints") setSprintsModalOpen(true);
    else if (info.key === "projects") router.push("/projects");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", marginTop: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 12px 12px 12px" }}>
        <span style={{ fontSize: 12, letterSpacing: "0.6px", fontWeight: 500, color: "#888" }}>
          {user?.manager ? uiText.managerRole : uiText.memberRole}
        </span>
        <span style={{ fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          {user ? user.username : "Loading..."}
          {user?.language && LANGUAGE_TO_FLAG[user.language.toLowerCase()] && (
            <span
              className={`fi fi-${LANGUAGE_TO_FLAG[user.language.toLowerCase()].toLowerCase()}`}
              style={{ fontSize: 16 }}
            />
          )}
        </span>
        <span style={{ fontSize: 14, fontWeight: 500, color: "#555" }}>
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
            { key: "dashboard", icon: <DashboardOutlined />, label: <span className="menu-item">{uiText.dashboard}</span> },
            { key: "sprints", icon: <RocketOutlined />, label: <span className="menu-item">{uiText.sprints}</span> },
            ...(isInProject ? [
              { key: "tags", icon: <TagsOutlined />, label: <span className="menu-item">{uiText.tags}</span> },
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
              key: "logout",
              icon: <LogoutOutlined style={{ color: "#d55f5a" }} />,
              label: <span style={{ color: "#d55f5a" }} className="menu-item">{uiText.logout}</span>
            },
          ]}
        />
      </div>
      <ManageSprintsModal open={sprintsModalOpen} onClose={() => setSprintsModalOpen(false)} />
      <ManageTagsModal open={tagsModalOpen} onClose={() => setTagsModalOpen(false)} projectId={projectId} />
    </div>
  );
};

export default SideBarSection;