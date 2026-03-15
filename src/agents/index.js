// ─── BASE API CALL ────────────────────────────────────────────────────────────
async function callCl(system, user) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, user }),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(`[${res.status}] ${e.error?.message || e.message || "API error"}`);
  }

  const d = await res.json();
  return d.content?.[0]?.text?.trim() || d.text?.trim() || "";
}

// ─── JSON EXTRACTOR ───────────────────────────────────────────────────────────
// Handles markdown fences, extra text, all LLaMA output edge cases
function extractJSON(raw) {
  // Step 1: strip markdown fences ```json ... ``` or ``` ... ```
  let cleaned = raw.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();

  // Step 2: try direct parse on cleaned string
  try { return JSON.parse(cleaned); } catch (_) {}

  // Step 3: find outermost { ... } block and parse that
  const start = cleaned.indexOf("{");
  const end   = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch (_) {}
  }

  // Step 4: try raw string as-is
  try { return JSON.parse(raw.trim()); } catch (_) {}

  // Step 5: give up — include actual response in error so it shows in UI
  throw new Error(`Invalid JSON from model. Response was: "${raw.slice(0, 200)}"`);
}

// ─── PLANNER ──────────────────────────────────────────────────────────────────
export async function runPlanner(goal) {
  const system = `You are a strategic AI planner. Decompose the goal into exactly 4 subtasks.
CRITICAL: Respond with ONLY a raw JSON object. No markdown code fences. No backticks. No explanation. Start your response with { and end with }.
Use ONLY these agent IDs: analyst, engineer, strategist, risk
Required JSON format:
{"tasks":[{"id":"analyst","title":"short title","instruction":"specific 1-sentence task"},{"id":"engineer","title":"short title","instruction":"specific 1-sentence task"},{"id":"strategist","title":"short title","instruction":"specific 1-sentence task"},{"id":"risk","title":"short title","instruction":"specific 1-sentence task"}]}`;

  const raw = await callCl(system, `Goal: "${goal}"`);
  return extractJSON(raw);
}

// ─── WORKER ───────────────────────────────────────────────────────────────────
export async function runWorker(agent, task, goal) {
  const system = `You are ${agent.name}, a specialist in ${agent.role}.
Be direct and actionable. No lengthy intros.
Respond with exactly 4 bullet points starting with •
Format each bullet: • Bold Label: 1-2 sentence insight.
Example: • Market Size: The global HR tech market is $35B growing at 11% CAGR.`;

  return callCl(system, `Overall goal: "${goal}"\nYour assigned task: ${task.instruction}`);
}

// ─── SYNTHESIZER ──────────────────────────────────────────────────────────────
export async function runSynthesizer(goal, workerResults) {
  const system = `You are a senior management consultant synthesizing a team analysis into an executive brief.
Be crisp, structured, and actionable.
Use EXACTLY these 5 section headers, each on their own line with no extra text around them:
EXECUTIVE SUMMARY
KEY INSIGHTS
ACTION PLAN
SUCCESS KPIS
RISK MATRIX
Under each header write exactly 3-4 bullet points starting with •
Format each bullet: • Bold Label: 1-2 sentence content.`;

  const context = workerResults
    .map(r => `[${r.agentName} — ${r.role}]\n${r.output}`)
    .join("\n\n");

  return callCl(system, `Goal: "${goal}"\n\nSpecialist Team Analysis:\n\n${context}`);
}