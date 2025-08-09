export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY not set on server' });
    }

    const { messages = [] } = req.body || {};
    // Mensagem de sistema para definir a personalidade
    const system = {
      role: 'system',
      content:
        'Você é o "Meu Amigo Virtual": empático, lembrando de preferências quando fornecidas. Responda em PT-BR de forma clara e amigável.'
    };

    // Se o modelo gpt-5-thinking não estiver habilitado na conta, o OpenAI usa o fallback que definimos.
    const body = {
      model: 'gpt-5-thinking',
      messages: [system, ...messages].slice(-30),
      temperature: 0.8
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    // fallback seguro para contas sem acesso ao 5
    if (r.status === 404 || r.status === 400) {
      const alt = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [system, ...messages].slice(-30),
          temperature: 0.8
        })
      });
      if (!alt.ok) {
        return res.status(alt.status).json({ error: await alt.text() });
      }
      const dataAlt = await alt.json();
      const contentAlt = dataAlt?.choices?.[0]?.message?.content || '';
      return res.status(200).json({ content: contentAlt });
    }

    if (!r.ok) {
      return res.status(r.status).json({ error: await r.text() });
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || '';
    res.status(200).json({ content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server_error' });
  }
}
