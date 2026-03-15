import { useState } from "react";
import { C } from "../constants.js";

function StatusPill({ status }) {
  const cfg = {
    idle:    { label: "Idle",    bg: C.grayCard,  color: C.textSec,   dot: "#CBD5E1"    },
    waiting: { label: "Waiting", bg: C.grayCard,  color: C.textSec,   dot: "#CBD5E1"    },
    running: { label: "Running", bg: C.blueSoft,  color: C.primary,   dot: C.primary    },
    done:    { label: "Done",    bg: C.greenSoft, color: C.secondary, dot: C.secondary  },
    error:   { label: "Error",   bg: C.redSoft,   color: C.red,       dot: C.red        },
  };
  const c = cfg[status] || cfg.idle;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: c.bg, color: c.color, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block", animation: status === "running" ? "blink 0.9s infinite" : "none" }} />
      {c.label}
    </span>
  );
}

export default function AgentCard({ agent, status, output, task, errorMsg, index = 0 }) {
  const [expanded, setExpanded] = useState(false);

  const isRunning = status === "running";
  const isDone    = status === "done";
  const isError   = status === "error";
  const isWait    = status === "waiting" || status === "idle";

  const borderColor = isDone ? C.secondary : isRunning ? C.primary : isError ? C.red : C.border;
  const bgColor     = isDone ? "#F0FDF4"   : isRunning ? C.blueSoft : isError ? C.redSoft : C.white;

  return (
    <div style={{
      background:   bgColor,
      border:       `1.5px solid ${borderColor}`,
      borderRadius: 16,
      padding:      "20px",
      transition:   "all 0.4s ease",
      opacity:      isWait ? 0.45 : 1,
      boxShadow:    isRunning
        ? `0 0 0 4px ${C.primary}18`
        : isDone
          ? "0 4px 12px rgba(16,185,129,0.08)"
          : "0 1px 3px rgba(0,0,0,0.06)",
      animation: `fadeUp 0.4s ease ${index * 0.08}s both`,
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: (task || output || isRunning || isError) ? 12 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, fontSize: 20,
            background: isRunning ? C.blueSoft : isDone ? C.greenSoft : C.grayCard,
            border: `1px solid ${borderColor}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {agent.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.textPri }}>{agent.name}</div>
            <div style={{ fontSize: 12, color: C.textSec }}>{agent.role}</div>
          </div>
        </div>
        <StatusPill status={status} />
      </div>

      {/* Task instruction */}
      {task && (
        <div style={{ fontSize: 13, color: C.textSec, background: C.grayCard, borderRadius: 8, padding: "8px 12px", marginBottom: 10, lineHeight: 1.5 }}>
          📌 {task.instruction}
        </div>
      )}

      {/* Running animation */}
      {isRunning && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary, display: "inline-block", animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out both` }} />
            ))}
          </div>
          <span style={{ fontSize: 13, color: C.primary, fontWeight: 500 }}>Analyzing...</span>
        </div>
      )}

      {/* Output */}
      {isDone && output && (
        <div>
          <div style={{
            fontSize: 13, color: "#374151", lineHeight: 1.75, whiteSpace: "pre-wrap",
            maxHeight: expanded ? "none" : "80px", overflow: "hidden",
            maskImage: !expanded && output.length > 160 ? "linear-gradient(to bottom,black 40%,transparent 100%)" : "none",
          }}>
            {output}
          </div>
          {output.length > 160 && (
            <button onClick={() => setExpanded(e => !e)} style={{ marginTop: 6, background: "none", border: "none", color: C.primary, cursor: "pointer", fontSize: 13, padding: 0, fontWeight: 600 }}>
              {expanded ? "▲ Show less" : "▼ Show more"}
            </button>
          )}
        </div>
      )}

      {/* Real error message */}
      {isError && (
        <div style={{ fontSize: 12, color: C.red, background: C.redSoft, borderRadius: 8, padding: "10px 14px", fontFamily: "monospace", lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>❌ Agent Error:</div>
          <div style={{ wordBreak: "break-word" }}>{errorMsg || "Unknown error — check activity log for details"}</div>
        </div>
      )}
    </div>
  );
}
