# pcp-ai-agent — Cloudflare Worker

Backend do Agente de IA do Portal de Planejamento PCP. Recebe um snapshot de
dados de PCP (estoque, demandas, curva ABC de ferramentais, programas de corte)
e chama o provedor de IA escolhido (Anthropic, Gemini ou OpenAI), mantendo as
chaves de API fora do navegador. Ver a seção "Agente de IA" do
[README.md](../README.md) na raiz para o fluxo completo de configuração.

## Comandos

```bash
npx wrangler login                          # autenticação única (abre o navegador)
npx wrangler secret put ANTHROPIC_API_KEY   # configure só o(s) provedor(es) que for usar
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put OPENAI_API_KEY
npx wrangler dev                            # testar localmente
npx wrangler deploy                         # publicar (imprime a URL pública)
npx wrangler secret list                    # ver quais secrets já estão configuradas (sem mostrar valores)
```

Depois do primeiro `deploy`, copie a URL impressa para `VITE_AI_WORKER_URL` no
`.env` da raiz do projeto (veja `.env.example`).
