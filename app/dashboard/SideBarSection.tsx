import {
  DashboardOutlined,
  LogoutOutlined,
  ProjectOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Divider, Menu } from "antd";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import ISO6391 from "iso-639-1"; // Importing the ISO 639-1 library for language code handling


const SideBarSection = (): React.JSX.Element => {
  const router = useRouter();
  const { clear: clearToken } = useLocalStorage<string>("token", "");

  const api = useApi();
  const { value: language, clear: clearLanguage } = useLocalStorage<string>("language", "");  
  const { value: id , clear: clearId } = useLocalStorage<string>("id", ""); // This was missing!
  // 1. Define the state for the logged-in user
  const [user, setUser] = useState<User | null>(null);

  // 2. Fetch the data when the component mounts
  useEffect(() => {
  const fetchUser = async () => {
      try {
        // Now requesting by ID: e.g., /users/1
        const currentUser = await api.get<User>(`/users/${id}`);
        setUser(currentUser);
      } catch (e) {
        console.error("Failed to fetch user", e);
      }
    };
    if (id) fetchUser();
  }, [id, api]);

  const handleLogout = (): void => {
    clearToken();
    clearLanguage();
    clearId();
    router.push("/login");
  };

  const getFlagEmoji = (countryCode: string) => {
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
    }
  };
  return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", marginTop: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 12px 12px 12px" }}>
        <span style={{ fontSize: 12, letterSpacing: "0.6px", fontWeight: 500, color: "#888" }}>
          {user?.manager ? "Manager" : "Member"}
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
          MAIN
        </span>
        <Menu
          mode="inline"
          selectable={false}
          style={{ border: "none", background: "transparent" }}
          items={[
            { key: "dashboard", icon: <DashboardOutlined />, label: <span className="menu-item">Dashboard</span>},
            { key: "projects", icon: <ProjectOutlined />, label: <span className="menu-item dropdown">Projects<span className="chevron">›</span></span> },
          ]}
        />
      </div>



      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: "auto", marginBottom: 16 }}>
      <Divider style={{ margin: "8px 0" }} />
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.6px", padding: "0 18px", color: "#888" }}>
          SETTINGS
        </span>
        <Menu
          mode="inline"
          selectable={false}
          onClick={onMenuClick}
          style={{ border: "none" }}
          items={[
            { key: "settings", icon: <SettingOutlined />, label: <span className="menu-item">Settings</span> },
            {
              key: "logout", icon: <LogoutOutlined style={{ color: "#d55f5a" }} />, label: <span style={{ color: "#d55f5a" }} className="menu-item">Logout</span> },
          ]}
        />
      </div>
    </div>
  );
};

export default SideBarSection;