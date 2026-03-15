import { C, WORKER_POOL } from "../constants.js";

function PipeNode({ icon, label, sub, status }) {
  const statusColor = s => s === "done" ? C.secondary : s === "running" ? C.primary : s === "error" ? C.red : C.border;
  const statusBg    = s => s === "done" ? C.greenSoft : s === "running" ? C.blueSoft : s === "error" ? C.redSoft : C.grayCard;
  const statusLabel = s => s === "running" ? "⏳ Running" : s === "done" ? "✓ Done" : s === "error" ? "✗ Error" : "Idle";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 82 }}>
      <div style={{
        width: 52, height: 52, borderRadius: 12,
        background: statusBg(status),
        border: `2px solid ${statusColor(status)}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        transition: "all 0.4s",
        boxShadow: status === "running" ? `0 0 0 4px ${statusColor(status)}22` : "none",
      }}>
        {status === "done" ? "✅" : status === "error" ? "❌" : icon}
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.textPri }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: C.textSec }}>{sub}</div>}
        <div style={{ fontSize: 10, fontWeight: 600, color: statusColor(status), marginTop: 2, textTransform: "uppercase", letterSpacing: 0.3 }}>
          {statusLabel(status)}
        </div>
      </div>
    </div>
  );
}

function Arrow({ active }) {
  return (
    <div style={{ display: "flex", alignItems: "center", paddingBottom: 26, flex: "0 0 32px" }}>
      <div style={{ width: "100%", height: 2, background: active ? `linear-gradient(90deg,${C.primary},${C.secondary})` : C.border, transition: "all 0.5s" }} />
      <div style={{ width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: `6px solid ${active ? C.secondary : C.border}`, marginLeft: -1, transition: "all 0.5s" }} />
    </div>
  );
}

export default function PipelineFlow({ plannerStatus, workerStatuses, synthStatus, tasks }) {
  const workerList     = tasks.length > 0 ? tasks : Object.values(WORKER_POOL);
  const allWorkersDone = tasks.length > 0 && Object.values(workerStatuses).length > 0 &&
    Object.values(workerStatuses).every(s => s === "done" || s === "error");

  return (
    <section style={{ background: C.white, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "28px 40px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>
          🔗 Agent Pipeline
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 4, overflowX: "auto", paddingBottom: 4 }}>

          {/* Planner */}
          <PipeNode icon="🧠" label="Planner" sub="Goal Decomposer" status={plannerStatus} />
          <Arrow active={plannerStatus === "done"} />

          {/* Workers */}
          <div style={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
            {workerList.map((w, i) => {
              const agent  = WORKER_POOL[w.id] || WORKER_POOL.analyst;
              const status = workerStatuses[w.id] || "idle";
              return (
                <div key={w.id} style={{ display: "flex", alignItems: "flex-start" }}>
                  <PipeNode icon={agent.icon} label={agent.name} sub={agent.role} status={status} />
                  {i < workerList.length - 1 && (
                    <div style={{ width: 12, height: 2, background: C.border, marginTop: 26, flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </div>

          <Arrow active={allWorkersDone} />

          {/* Synthesizer */}
          <PipeNode icon="📋" label="Synthesizer" sub="Report Compiler" status={synthStatus} />
        </div>
      </div>
    </section>
  );
}
