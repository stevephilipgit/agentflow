import { useRef, useEffect } from "react";

export default function ActivityLog({ logs }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs]);

  const getColor = (type) => {
    switch (type) {
      case "success": return "#34D399";
      case "error":   return "#F87171";
      case "active":  return "#818CF8";
      case "header":  return "#FCD34D";
      default:        return "#475569";
    }
  };

  return (
    <div style={{ background: "#0F172A", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
      {/* macOS-style title bar */}
      <div style={{ background: "#1E293B", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        {["#EF4444", "#F59E0B", "#10B981"].map(color => (
          <div key={color} style={{ width: 12, height: 12, borderRadius: "50%", background: color }} />
        ))}
        <span style={{ fontSize: 12, color: "#475569", marginLeft: 8, fontFamily: "monospace" }}>
          agent-activity-log — bash
        </span>
      </div>

      {/* Log lines */}
      <div
        ref={ref}
        style={{ padding: "16px 20px", height: 220, overflowY: "auto", fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: 12, lineHeight: 2 }}
      >
        {logs.length === 0 && (
          <span style={{ color: "#334155" }}>$ awaiting mission deployment...</span>
        )}
        {logs.map((l, i) => (
          <div key={i} style={{ color: getColor(l.type) }}>
            <span style={{ color: "#334155", marginRight: 12, userSelect: "none" }}>{l.time}</span>
            {l.msg}
          </div>
        ))}
        {logs.length > 0 && (
          <span style={{ color: "#6366F1", animation: "blink 1s infinite" }}>█</span>
        )}
      </div>
    </div>
  );
}
