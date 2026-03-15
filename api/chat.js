// Vercel Serverless Function — api/chat.js
// Proxies requests to Groq API so the API key never touches the browser.
// Deploy: set GROQ_API_KEY in Vercel environment variables.

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { system, user } = req.body;

  if (!system || !user) {
    return res.status(400).json({ error: "Missing system or user field" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       "llama-3.3-70b-versatile",
        max_tokens:  1000,
        temperature: 0.7,
        messages: [
          { role: "system",  content: system },
          { role: "user",    content: user   },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({
        error: { message: err.error?.message || "Groq API error" }
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || "";

    // Return in Anthropic-compatible format so frontend code stays the same
    return res.status(200).json({
      content: [{ type: "text", text }],
    });

  } catch (err) {
    console.error("API proxy error:", err);
    return res.status(500).json({ error: { message: err.message } });
  }
}
