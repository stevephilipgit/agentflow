import { C, SECTION_ICONS, SECTION_COLORS } from "../constants.js";

function parseSections(output) {
  const HEADERS = Object.keys(SECTION_ICONS);
  const sections = [];
  let current = null;
  output.split("\n").forEach(line => {
    const t = line.trim();
    if (HEADERS.includes(t)) {
      if (current) sections.push(current);
      current = { title: t, lines: [] };
    } else if (current && t) {
      current.lines.push(t);
    }
  });
  if (current) sections.push(current);
  return sections;
}

export default function FinalReport({ output, goal, onDownload }) {
  const sections  = parseSections(output);
  const showRaw   = sections.length === 0;

  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>

      {/* Report header */}
      <div style={{ padding: "24px 32px", borderBottom: `1px solid ${C.border}`, background: "linear-gradient(135deg,#EEF2FF,#F0FDF4)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📋</div>
            <span style={{ fontWeight: 800, fontSize: 20, color: C.textPri }}>Executive Report</span>
            <span style={{ padding: "3px 10px", borderRadius: 20, background: C.greenSoft, color: C.secondary, fontSize: 12, fontWeight: 700, border: `1px solid #A7F3D0` }}>✓ AI Generated</span>
          </div>
          <p style={{ fontSize: 14, color: C.textSec, margin: 0 }}>
            Mission: <span style={{ fontWeight: 600, color: C.textPri }}>"{goal}"</span>
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ padding: "10px 20px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, color: C.textSec, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            🔗 Share Link
          </button>
          <button
            onClick={onDownload}
            style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: C.primary, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            ⬇️ Download Report
          </button>
        </div>
      </div>

      {/* Report body */}
      <div style={{ padding: "28px 32px" }}>
        {showRaw ? (
          <pre style={{ fontSize: 14, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "Inter,sans-serif" }}>
            {output}
          </pre>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {sections.map((sec, i) => {
              const color      = SECTION_COLORS[sec.title] || C.primary;
              const icon       = SECTION_ICONS[sec.title]  || "📌";
              const isFullWidth= sec.title === "EXECUTIVE SUMMARY";

              return (
                <div
                  key={i}
                  style={{
                    gridColumn:   isFullWidth ? "1 / -1" : "auto",
                    background:   C.grayCard,
                    borderRadius: 14,
                    padding:      "20px 22px",
                    border:       `1px solid ${C.border}`,
                    animation:    `fadeUp 0.4s ease ${i * 0.08}s both`,
                  }}
                >
                  {/* Section header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: C.textPri }}>{sec.title}</span>
                    <div style={{ flex: 1, height: 1, background: C.border, marginLeft: 4 }} />
                  </div>

                  {/* Section lines */}
                  {sec.lines.map((line, j) => {
                    const isBullet  = line.startsWith("•") || line.startsWith("-");
                    const isNum     = /^\d+\./.test(line.trim());
                    const isPlain   = !isBullet && !isNum;

                    if (isPlain) {
                      return <p key={j} style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: "0 0 8px" }}>{line}</p>;
                    }

                    const content = line.replace(/^[•\-\d+\.\s]+/, "");
                    const parts   = content.split(":");

                    return (
                      <div key={j} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 7 }} />
                        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.65, margin: 0 }}>
                          {parts.length > 1
                            ? <><strong style={{ color: C.textPri }}>{parts[0]}:</strong>{parts.slice(1).join(":")}</>
                            : content
                          }
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
