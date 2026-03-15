import { C } from "../constants.js";

export default function Navbar({ onReset, phase }) {
  return (
    <nav style={{ height: 64, background: C.white, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", padding: "0 32px", justifyContent: "space-between", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
        <span style={{ fontWeight: 700, fontSize: 18, color: C.textPri, letterSpacing: -0.5 }}>AgentFlow</span>
        <span style={{ padding: "2px 8px", borderRadius: 4, background: C.blueSoft, color: C.primary, fontSize: 11, fontWeight: 600, marginLeft: 4 }}>BETA</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {phase !== "setup" && (
          <button
            onClick={onReset}
            style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.textSec, fontSize: 14, cursor: "pointer", fontWeight: 500 }}
          >
            ↩ New Mission
          </button>
        )}
        <a href="https://github.com" target="_blank" rel="noreferrer" style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.textSec, fontSize: 14, cursor: "pointer", fontWeight: 500, textDecoration: "none" }}>
          GitHub
        </a>
        <a href="#" style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.textSec, fontSize: 14, cursor: "pointer", fontWeight: 500, textDecoration: "none" }}>
          Docs
        </a>
        <button style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: C.primary, color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>
          Deploy
        </button>
      </div>
    </nav>
  );
}
