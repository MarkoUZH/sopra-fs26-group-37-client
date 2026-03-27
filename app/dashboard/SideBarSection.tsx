import {
  DashboardOutlined,
  LogoutOutlined,
  ProjectOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Divider, Menu } from "antd";

const SideBarSection = (): JSX.Element => {
  return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", marginTop: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 12px 12px 12px" }}>
        <span style={{ fontSize: 12, letterSpacing: "0.6px", fontWeight: 500, color: "#888" }}>
          MANAGER / MEMBER
        </span>
        <span style={{ fontSize: 18, fontWeight: 700 }}>
          Average Joe
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