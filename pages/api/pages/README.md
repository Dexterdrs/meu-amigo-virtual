# Meu Amigo Virtual

App simples (Next.js) com backend na rota `/api/chat` chamando a API da OpenAI.
O usuário final **não precisa configurar nada**. A chave da OpenAI fica no **servidor (Vercel)**.

## Como rodar local (opcional)
1. `npm i`
2. Coloque `OPENAI_API_KEY` no ambiente (`.env.local`)
3. `npm run dev`

## Deploy na Vercel
- Conecte o repositório no painel da Vercel.
- Em **Settings → Environment Variables**, adicione:
  - **OPENAI_API_KEY** = `sua_chave_da_openai`
- Deploy. Pronto!
