import { useState, useRef } from "react";
import Navbar        from "./components/Navbar.jsx";
import HeroInput     from "./components/HeroInput.jsx";
import PipelineFlow  from "./components/PipelineFlow.jsx";
import AgentCard     from "./components/AgentCard.jsx";
import ActivityLog   from "./components/ActivityLog.jsx";
import FinalReport   from "./components/FinalReport.jsx";
import { runPlanner, runWorker, runSynthesizer } from "./agents/index.js";
import { WORKER_POOL, C } from "./constants.js";
import { downloadReport } from "./utils/download.js";

export default function App() {
  const [goalInput,      setGoalInput]      = useState("");
  const [goal,           setGoal]           = useState("");
  const [phase,          setPhase]          = useState("setup"); // setup | running | done

  const [plannerStatus,  setPlannerStatus]  = useState("idle");
  const [plannerOutput,  setPlannerOutput]  = useState(null);
  const [tasks,          setTasks]          = useState([]);

  const [workerStatuses, setWorkerStatuses] = useState({});
  const [workerOutputs,  setWorkerOutputs]  = useState({});
  const [workerErrors,   setWorkerErrors]   = useState({});

  const [synthStatus,    setSynthStatus]    = useState("idle");
  const [synthOutput,    setSynthOutput]    = useState("");

  const [logs,           setLogs]           = useState([]);
  const [error,          setError]          = useState("");
  const runningRef = useRef(false);

  const addLog = (msg, type = "default") => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs(prev => [...prev, { time, msg, type }]);
  };

  const runPipeline = async (g) => {
    if (runningRef.current) return;
    runningRef.current = true;

    // Reset
    setLogs([]); setError(""); setTasks([]);
    setWorkerStatuses({}); setWorkerOutputs({}); setWorkerErrors({});
    setSynthOutput(""); setPlannerOutput(null);
    setPlannerStatus("idle"); setSynthStatus("idle");

    // ── STAGE 1: PLANNER ──────────────────────────────────
    addLog("$ mission received — deploying planner...", "header");
    addLog("🧠 Planner decomposing goal into subtasks...", "active");
    setPlannerStatus("running");

    let plannedTasks = [];
    try {
      const result = await runPlanner(g);
      plannedTasks = result.tasks;
      setTasks(plannedTasks);
      setPlannerOutput(plannedTasks.map(t => `• ${t.title}: ${t.instruction}`).join("\n"));
      setPlannerStatus("done");
      addLog(`✓ Planner done — ${plannedTasks.length} tasks queued`, "success");
      plannedTasks.forEach(t => addLog(`  → ${t.id}: "${t.title}"`, "default"));
      const init = {};
      plannedTasks.forEach(t => { init[t.id] = "waiting"; });
      setWorkerStatuses(init);
    } catch (e) {
      setPlannerStatus("error");
      setError("Planner failed: " + e.message);
      addLog("✗ Planner error: " + e.message, "error");
      runningRef.current = false;
      return;
    }

    await new Promise(r => setTimeout(r, 400));

    // ── STAGE 2: STAGGERED WORKERS ────────────────────────
    // Workers staggered 2s apart to avoid rate-limit 429s
    addLog(`⚡ Launching ${plannedTasks.length} workers (2s stagger to avoid rate limits)...`, "active");

    const workerPromises = plannedTasks.map(async (task, index) => {
      const agent = WORKER_POOL[task.id] || WORKER_POOL.analyst;

      // Stagger start: 0s / 2s / 4s / 6s
      await new Promise(r => setTimeout(r, index * 2000));

      setWorkerStatuses(prev => ({ ...prev, [task.id]: "running" }));
      addLog(`  → ${agent.name} activated: "${task.title}"`, "default");

      const attempt = async () => {
        const output = await runWorker(agent, task, g);
        setWorkerStatuses(prev => ({ ...prev, [task.id]: "done" }));
        setWorkerOutputs(prev => ({ ...prev, [task.id]: output }));
        addLog(`  ✓ ${agent.name} done`, "success");
        return { agentId: task.id, agentName: agent.name, role: agent.role, output };
      };

      try {
        return await attempt();
      } catch (e) {
        addLog(`  ⚠ ${agent.name} error: ${e.message} — retrying in 5s...`, "error");
        await new Promise(r => setTimeout(r, 5000));
        try {
          return await attempt();
        } catch (e2) {
          const errMsg = e2.message;
          setWorkerStatuses(prev => ({ ...prev, [task.id]: "error" }));
          setWorkerErrors(prev => ({ ...prev, [task.id]: errMsg }));
          const fallback = `• Analysis unavailable after retry.\n• Error: ${errMsg}`;
          setWorkerOutputs(prev => ({ ...prev, [task.id]: fallback }));
          addLog(`  ✗ ${agent.name} failed: ${errMsg}`, "error");
          return { agentId: task.id, agentName: agent.name, role: agent.role, output: fallback };
        }
      }
    });

    const workerResults = await Promise.all(workerPromises);
    addLog(`✓ All workers done — synthesizing report...`, "success");
    await new Promise(r => setTimeout(r, 300));

    // ── STAGE 3: SYNTHESIZER ──────────────────────────────
    addLog("📋 Synthesizer compiling final report...", "active");
    setSynthStatus("running");
    try {
      const report = await runSynthesizer(g, workerResults);
      setSynthOutput(report);
      setSynthStatus("done");
      addLog("✓ Final report ready", "success");
      addLog("$ pipeline complete ✓", "header");
    } catch (e) {
      setSynthStatus("error");
      setError("Synthesizer failed: " + e.message);
      addLog("✗ Synthesizer error: " + e.message, "error");
    }

    runningRef.current = false;
    setPhase("done");
  };

  const handleStart = () => {
    if (!goalInput.trim()) { setError("Please enter a mission goal"); return; }
    setError("");
    const g = goalInput.trim();
    setGoal(g);
    setPhase("running");
    runPipeline(g);
  };

  const handleReset = () => {
    runningRef.current = false;
    setPhase("setup"); setGoal(""); setGoalInput("");
    setPlannerStatus("idle"); setTasks([]);
    setWorkerStatuses({}); setWorkerOutputs({}); setWorkerErrors({});
    setSynthStatus("idle"); setSynthOutput("");
    setLogs([]); setError(""); setPlannerOutput(null);
  };

  const handleDownload = () => {
    if (synthOutput) downloadReport(goal, synthOutput, workerOutputs, tasks);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter,-apple-system,sans-serif", color: C.textPri }}>

      <Navbar onReset={handleReset} phase={phase} />

      {/* ── SETUP ── */}
      {phase === "setup" && (
        <HeroInput
          goalInput={goalInput}
          setGoalInput={setGoalInput}
          onStart={handleStart}
          error={error}
        />
      )}

      {/* ── RUNNING / DONE ── */}
      {(phase === "running" || phase === "done") && (
        <>
          {/* Mission bar */}
          <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: phase === "running" ? C.primary : C.secondary, animation: phase === "running" ? "blink 0.8s infinite" : "none" }} />
              <span style={{ fontWeight: 600, fontSize: 15, color: C.textPri }}>"{goal}"</span>
            </div>
            {phase === "running" && <span style={{ fontSize: 13, color: C.primary, fontWeight: 600, background: C.blueSoft, padding: "4px 12px", borderRadius: 20 }}>⏳ Pipeline Active</span>}
            {phase === "done"    && <span style={{ fontSize: 13, color: C.secondary, fontWeight: 600, background: C.greenSoft, padding: "4px 12px", borderRadius: 20 }}>✅ Mission Complete</span>}
          </div>

          {/* Pipeline visualization */}
          <PipelineFlow
            plannerStatus={plannerStatus}
            workerStatuses={workerStatuses}
            synthStatus={synthStatus}
            tasks={tasks}
          />

          {/* Main grid */}
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>

            {/* LEFT — Agent Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SectionTitle icon="🤖" label="Live Agent Execution" badge={phase === "running" ? { text: "Running", color: C.primary, bg: C.blueSoft } : null} />

              <AgentCard
                agent={{ id: "planner", name: "Planner", icon: "🧠", role: "Goal Decomposer" }}
                status={plannerStatus}
                output={plannerOutput}
                task={null}
                index={0}
              />

              {tasks.map((task, i) => {
                const agent = WORKER_POOL[task.id] || WORKER_POOL.analyst;
                return (
                  <AgentCard
                    key={task.id}
                    agent={agent}
                    status={workerStatuses[task.id] || "waiting"}
                    output={workerOutputs[task.id]}
                    errorMsg={workerErrors[task.id]}
                    task={task}
                    index={i + 1}
                  />
                );
              })}

              {synthStatus !== "idle" && (
                <AgentCard
                  agent={{ id: "synthesizer", name: "Synthesizer", icon: "📋", role: "Report Compiler" }}
                  status={synthStatus}
                  output={synthOutput ? "Report compiled — see Final Report below ↓" : null}
                  task={null}
                  index={tasks.length + 1}
                />
              )}
            </div>

            {/* RIGHT — Activity Log + Worker Status */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SectionTitle icon="📡" label="Activity Log" />
              <ActivityLog logs={logs} />

              {tasks.length > 0 && (
                <div style={{ background: C.white, borderRadius: 16, padding: "20px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 14, letterSpacing: 0.5, textTransform: "uppercase" }}>Worker Status</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {tasks.map(task => {
                      const agent  = WORKER_POOL[task.id] || WORKER_POOL.analyst;
                      const status = workerStatuses[task.id] || "waiting";
                      const bg     = status === "done" ? C.greenSoft : status === "running" ? C.blueSoft : status === "error" ? C.redSoft : C.grayCard;
                      const color  = status === "done" ? C.secondary : status === "running" ? C.primary : status === "error" ? C.red : C.textSec;
                      return (
                        <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: bg, borderRadius: 10, border: `1px solid ${color}33` }}>
                          <span style={{ fontSize: 16 }}>{agent.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.textPri }}>{agent.name}</div>
                            <div style={{ fontSize: 11, color }}>
                              {status === "done" ? "✓ Complete" : status === "running" ? "⏳ Running" : status === "error" ? "✗ Error" : "○ Waiting"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {error && (
                <div style={{ padding: "14px 18px", borderRadius: 12, background: C.redSoft, border: `1px solid #FECACA`, color: C.red, fontSize: 13, fontFamily: "monospace", lineHeight: 1.6 }}>
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>

          {/* Final Report */}
          {phase === "done" && synthOutput && (
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 60px" }}>
              <SectionTitle icon="📄" label="Final Report" badge={{ text: "AI Generated", color: C.secondary, bg: C.greenSoft }} />
              <div style={{ marginTop: 16 }}>
                <FinalReport output={synthOutput} goal={goal} onDownload={handleDownload} />
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F8FAFC; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        button:hover { opacity: 0.88; transition: opacity 0.15s; }
        input::placeholder { color: #94A3B8; }
        textarea::placeholder { color: #94A3B8; }
      `}</style>
    </div>
  );
}

function SectionTitle({ icon, label, badge }) {
  const C_local = { textPri: "#0F172A" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: 16, color: C_local.textPri }}>{label}</span>
      {badge && (
        <span style={{ padding: "2px 10px", borderRadius: 20, background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 600 }}>
          {badge.text}
        </span>
      )}
    </div>
  );
}
