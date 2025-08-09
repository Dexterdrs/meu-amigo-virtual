import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [msgs, setMsgs] = useState([
    { role: "assistant", content: "Oi! Eu sou o Meu Amigo Virtual 😊 Como posso te ajudar hoje?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

async function send() {
  const text = input.trim();
  if (!text || loading) return;
  setInput("");
  const nextMsgs = [...msgs, { role: "user", content: text }];
  setMsgs(nextMsgs);
  setLoading(true);
  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: nextMsgs })
    });
    const data = await r.json();

    if (!r.ok) {
      const err = typeof data?.error === "string" ? data.error : JSON.stringify(data);
      setMsgs((prev) => [...prev, { role: "assistant", content: `⚠️ Erro do servidor: ${err}` }]);
      return;
    }

    const answer = data?.content || "Sem conteúdo.";
    setMsgs((prev) => [...prev, { role: "assistant", content: answer }]);
  } catch (e) {
    setMsgs((prev) => [...prev, { role: "assistant", content: `Falha de rede: ${String(e)}` }]);
  } finally {
    setLoading(false);
  }
}

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f4f6f8", minHeight: "100vh" }}>
      <header style={{ background: "#2065d1", color: "white", padding: "12px 16px", fontWeight: 700 }}>
        Meu Amigo Virtual
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
        <div style={{ background: "white", borderRadius: 12, padding: 12, minHeight: "65vh", boxShadow: "0 2px 10px rgba(0,0,0,.06)" }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
              <div
                style={{
                  background: m.role === "user" ? "#e3f2fd" : "#fff",
                  color: "#333",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "8px 12px",
                  maxWidth: "80%"
                }}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div style={{ color: "#666", fontSize: 12, paddingLeft: 4 }}>digitando…</div>}
          <div ref={endRef} />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Escreva sua mensagem…"
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 999,
              border: "1px solid #d1d5db",
              outline: "none"
            }}
          />
          <button
            onClick={send}
            disabled={loading}
            style={{
              background: "#2065d1",
              color: "white",
              border: "none",
              borderRadius: 999,
              padding: "12px 18px",
              cursor: "pointer",
              opacity: loading ? 0.6 : 1
            }}
          >
            Enviar
          </button>
        </div>
      </main>
    </div>
  );
}
