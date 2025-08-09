// pages/api/chat.js  (Node runtime)
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY not set" });
    }

    const { messages = [] } = req.body || {};

    const system = {
      role: "system",
      content:
        'Você é o "Meu Amigo Virtual": empático, claro e prestativo. Responda em PT-BR.'
    };

    async function ask(model) {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [system, ...messages].slice(-30),
          temperature: 0.8
        })
      });
      return r;
    }

    // tenta gpt-5-thinking; se não der, cai para 4o-mini
    let resp = await ask("gpt-5-thinking");
    if (resp.status === 404 || resp.status === 400) {
      console.error("Modelo gpt-5-thinking indisponível. Fazendo fallback para gpt-4o-mini.");
      resp = await ask("gpt-4o-mini");
    }

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("OpenAI error:", resp.status, txt);
      return res.status(resp.status).json({ error: txt });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || "";
    return res.status(200).json({ content });
  } catch (e) {
    console.error("Server error:", e);
    return res.status(500).json({ error: "server_error" });
  }
}
