// Garante Node 18+ na Vercel (fetch nativo)
export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { messages = [] } = await req.json();

    const system = {
      role: "system",
      content:
        'Você é o "Meu Amigo Virtual": empático, claro, prestativo. Responda em PT-BR.'
    };

    async function askOpenAI(model) {
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

    // tenta gpt-5; se não tiver acesso, cai para 4o-mini
    let resp = await askOpenAI("gpt-5-thinking");
    if (resp.status === 404 || resp.status === 400) {
      resp = await askOpenAI("gpt-4o-mini");
    }

    if (!resp.ok) {
      const txt = await resp.text();
      return new Response(JSON.stringify({ error: txt }), {
        status: resp.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "server_error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
