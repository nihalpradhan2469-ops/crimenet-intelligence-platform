import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, Search, Network, Users,
  Bell, FileText, Database, BarChart3, ScrollText, Settings,
  Shield, ChevronRight, Sun, Moon
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/cases", label: "Cases", icon: Briefcase },
  { to: "/investigations", label: "Investigations", icon: Search },
  { to: "/network", label: "Network Graph", icon: Network },
  { to: "/entities", label: "Entities", icon: Users },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/evidence", label: "Evidence", icon: FileText },
  { to: "/data-sources", label: "Data Sources", icon: Database },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/audit-logs", label: "Audit Logs", icon: ScrollText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const { theme, setTheme } = useTheme();

  return (
    <aside style={{
      width: 240,
      minHeight: "100vh",
      background: "var(--bg-primary)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      position: "sticky",
      top: 0,
      height: "100vh",
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px var(--glow-primary)",
          }}>
            <Shield size={17} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>CRIMENET</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.5px", fontWeight: 500 }}>INTELLIGENCE</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 10px", flex: 1 }}>
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.8px", padding: "0 8px 8px", textTransform: "uppercase" }}>
          Navigation
        </div>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 10px",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              marginBottom: 2,
              transition: "all 0.15s ease",
              background: isActive ? "rgba(124, 92, 255, 0.12)" : "transparent",
              color: isActive ? "var(--text-primary)" : "var(--text-muted)",
              border: isActive ? "1px solid rgba(124, 92, 255, 0.22)" : "1px solid transparent",
              boxShadow: isActive ? "0 0 12px var(--glow-secondary)" : "none",
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={15} color={isActive ? "var(--bright-accent)" : "currentColor"} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={12} color="var(--bright-accent)" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom theme toggle & branding */}
      <div style={{ padding: "14px 18px 20px", borderTop: "1px solid var(--border)" }}>
        {/* Dark / Light Toggle */}
        <div style={{
          display: "flex",
          alignItems: "center",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 3,
          marginBottom: 12,
          gap: 2,
        }}>
          <button
            onClick={() => setTheme("dark")}
            title="Dark Mode"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "6px 0",
              border: "none",
              borderRadius: 7,
              background: theme === "dark" ? "var(--primary-accent)" : "transparent",
              color: theme === "dark" ? "#FFFFFF" : "var(--text-muted)",
              fontWeight: 600,
              fontSize: 11,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Moon size={12} /> Dark
          </button>
          <button
            onClick={() => setTheme("light")}
            title="Light Mode"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "6px 0",
              border: "none",
              borderRadius: 7,
              background: theme === "light" ? "var(--primary-accent)" : "transparent",
              color: theme === "light" ? "#FFFFFF" : "var(--text-muted)",
              fontWeight: 600,
              fontSize: 11,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Sun size={12} /> Light
          </button>
        </div>

        <div style={{
          background: "rgba(255, 106, 0, 0.06)",
          border: "1px solid rgba(255, 106, 0, 0.2)",
          borderRadius: 8,
          padding: "10px 12px",
          boxShadow: "0 0 12px rgba(255, 106, 0, 0.1)",
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--orange)", letterSpacing: "0.5px", marginBottom: 2 }}>
            🛡️ CRIMENET
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
            Connect. Analyze. Investigate.
          </div>
          <div style={{ fontSize: 9.5, color: "var(--text-muted)", lineHeight: 1.3 }}>
            AI-Powered Criminal Network Intelligence Platform
          </div>
        </div>
      </div>
    </aside>
  );
}
