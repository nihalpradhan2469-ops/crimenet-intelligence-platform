import { useState } from "react";
import { Search, Bell, ChevronDown, User, Zap, Sun, Moon } from "lucide-react";
import { alerts } from "../data/mockData";
import { useTheme } from "../context/ThemeContext";

const openAlerts = alerts.filter(a => a.status === "Open").length;

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header style={{
      height: 56,
      background: "rgba(9,9,20,0.95)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      gap: 16,
      backdropFilter: "blur(8px)",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      {/* Search */}
      <div style={{ flex: 1, maxWidth: 480, position: "relative" }}>
        <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
        <input
          type="text"
          placeholder="Search person, phone, vehicle, location, case..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            width: "100%",
            paddingLeft: 34,
            paddingRight: 12,
            height: 36,
            background: "var(--bg-secondary)",
            border: `1px solid ${searchFocused ? "var(--orange)" : "var(--border)"}`,
            borderRadius: 10,
            color: "var(--text-primary)",
            fontSize: 13,
            outline: "none",
            boxShadow: searchFocused ? "0 0 0 3px var(--glow-secondary)" : "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Case selector */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "6px 12px",
        cursor: "pointer",
        fontSize: 12,
        color: "var(--text-secondary)",
      }}>
        <Zap size={13} color="var(--primary-accent)" />
        <span>Operation Silverline</span>
        <ChevronDown size={12} color="var(--text-muted)" />
      </div>

      {/* Theme Toggle (Dark / Light) */}
      <button
        onClick={toggleTheme}
        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        style={{
          width: 36,
          height: 36,
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--text-secondary)",
          transition: "all 0.15s ease",
        }}
      >
        {theme === "dark" ? <Sun size={16} color="#FF9A3D" /> : <Moon size={16} color="var(--primary-accent)" />}
      </button>

      {/* Notifications */}
      <div style={{ position: "relative", cursor: "pointer" }}>
        <div style={{
          width: 36, height: 36,
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.15s",
        }}>
          <Bell size={15} color="var(--text-secondary)" />
        </div>
        {openAlerts > 0 && (
          <div style={{
            position: "absolute", top: -4, right: -4,
            background: "var(--danger)",
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            width: 16, height: 16,
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {openAlerts}
          </div>
        )}
      </div>

      {/* User */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        cursor: "pointer",
      }}>
        <div style={{
          width: 32, height: 32,
          background: "rgba(124, 92, 255, 0.14)",
          border: "1px solid rgba(124, 92, 255, 0.28)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 10px var(--glow-secondary)",
        }}>
          <User size={14} color="var(--bright-accent)" />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>Insp. Verma</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Senior Investigator</div>
        </div>
        <ChevronDown size={12} color="var(--text-muted)" />
      </div>
    </header>
  );
}
