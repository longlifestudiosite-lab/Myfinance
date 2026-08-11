# MyFinance 🎙️💰

App de controle financeiro com comando por voz. Fale quanto gastou e o app registra automaticamente.

## Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Deploy**: Vercel
- **Mobile**: PWA (Progressive Web App)
- **Voz**: Web Speech API (pt-BR)

## Como usar

1. Instale o app no celular (Add to Home Screen no Chrome)
2. Toque no botão de microfone
3. Fale sua transação: "Gastei 50 reais no mercado"
4. O app detecta valor, descrição e categoria automaticamente

## Exemplos de comandos de voz

- "Gastei 80 no supermercado"
- "Paguei 150 de luz"
- "Recebi 3000 de salário"
- "Uber 25 reais"
- "Comprei tênis por 200"

## Setup local

```bash
npm install
npm run dev
```

## Configuração do Supabase

Execute o SQL em `supabase/migrations/001_create_transactions.sql` no SQL Editor do Supabase Dashboard.

## Deploy na Vercel

1. Conecte o repositório GitHub na Vercel
2. Adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automático a cada push
