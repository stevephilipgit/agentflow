import { C, EXAMPLES } from "../constants.js";

export default function HeroInput({ goalInput, setGoalInput, onStart, error }) {
  return (
    <section style={{ background: C.bg, padding: "80px 24px 60px", textAlign: "center" }}>
      <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 20, background: C.blueSoft, color: C.primary, fontSize: 13, fontWeight: 600, marginBottom: 20, border: `1px solid #C7D2FE` }}>
        ✨ Powered by LLaMA 3.3 70B · Multi-Agent Orchestration
      </div>

      <h1 style={{ fontSize: 52, fontWeight: 800, color: C.textPri, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1.5 }}>
        Build AI Agent Teams<br />
        <span style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          in Seconds
        </span>
      </h1>

      <p style={{ fontSize: 18, color: C.textSec, maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7 }}>
        Describe your goal. A Planner AI decomposes it. Specialist agents execute in parallel. Get a full executive report.
      </p>

      <div style={{ maxWidth: 620, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Input */}
        <div style={{ display: "flex", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <input
            style={{ flex: 1, padding: "17px 20px", border: "none", outline: "none", fontSize: 16, color: C.textPri, background: "transparent", fontFamily: "Inter,sans-serif" }}
            placeholder="e.g. Launch a B2B SaaS product for HR teams"
            value={goalInput}
            onChange={e => setGoalInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onStart()}
          />
          <button
            onClick={onStart}
            style={{ padding: "17px 28px", background: C.primary, border: "none", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8 }}
          >
            🚀 Deploy Agents
          </button>
        </div>

        {/* Example chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => setGoalInput(ex)}
              style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${C.border}`, background: C.white, color: C.textSec, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: "12px 16px", borderRadius: 10, background: C.redSoft, border: `1px solid #FECACA`, color: C.red, fontSize: 14, textAlign: "left", lineHeight: 1.5 }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Feature pills */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
        {[
          { icon: "🧠", label: "1 Planner Agent" },
          { icon: "⚡", label: "4 Worker Agents" },
          { icon: "📋", label: "1 Synthesizer" },
          { icon: "⏱", label: "~30 seconds" },
        ].map(f => (
          <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 20, background: C.white, border: `1px solid ${C.border}`, fontSize: 13, color: C.textSec, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <span>{f.icon}</span>
            <span style={{ fontWeight: 500 }}>{f.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
