export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages harus berupa array" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b";

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENROUTER_API_KEY belum diatur di Vercel"
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenRouter error"
      });
    }

    const answer = data?.choices?.[0]?.message?.content || "";

    return res.status(200).json({ answer });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
