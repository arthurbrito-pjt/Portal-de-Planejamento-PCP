/**
 * Agente de IA do Portal de Planejamento PCP — Cedisa Central de Aço
 * ------------------------------------------------------------------
 * Cloudflare Worker que recebe um snapshot dos dados de PCP (estoque de
 * bobinas, demandas por slitter, programas de corte já calculados pelo
 * motor de otimização, curva ABC de ferramentais, KPIs e histórico) e usa
 * um provedor de IA à escolha (Anthropic, Gemini ou OpenAI) para gerar,
 * em português:
 *
 *   - "recommendations": recomendações priorizadas de quais programas
 *      de corte executar primeiro;
 *   - "planning": planejamento otimizado considerando Curva ABC de
 *      ferramentais, estoque, ferramental cadastrado, melhor
 *      aproveitamento de bobina (menor perda) e limitações operacionais
 *      (menos trocas de faca/setups, menos retrabalho);
 *   - "alerts": alertas proativos de risco (ruptura de estoque, baixa
 *      eficiência, sobras fora da faixa ideal de refilo, etc.);
 *   - "summary": um resumo executivo da situação atual da produção.
 *
 * As chaves de API (ANTHROPIC_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY)
 * ficam como Worker Secrets do Cloudflare — nunca são expostas ao
 * navegador. Configure a(s) que for usar com:
 *   npx wrangler secret put ANTHROPIC_API_KEY
 *   npx wrangler secret put GEMINI_API_KEY
 *   npx wrangler secret put OPENAI_API_KEY
 * Veja o README.md na raiz do projeto para instruções completas.
 */

const CLAUDE_MODEL = 'claude-sonnet-4-5';
const ANTHROPIC_VERSION = '2023-06-01';
// Modelos "-lite" por escolha explícita do usuário (cota diária maior que os
// modelos "cheios" no plano gratuito). São mais lentos (10-30s de resposta),
// então o loading da tela precisa suportar essa espera.
const GEMINI_MODEL = 'gemini-3.5-flash-lite';
// Usado só quando GEMINI_MODEL esgota as tentativas com erro de sobrecarga —
// geração "-lite" anterior, cota separada, como rede de segurança.
const GEMINI_FALLBACK_MODEL = 'gemini-3.1-flash-lite';
const OPENAI_MODEL = 'gpt-4o-mini';

const BASE_CONTEXT = [
  'Você é o Agente de IA do Portal de Planejamento PCP da Cedisa Central de Aço,',
  'especializado em otimização de corte Slitter de bobinas de aço para produção',
  'de Tubos e Perfis U. A regra de refilo técnico ideal é entre 10 e 18 mm (~1,5%).',
  'Você recebe um snapshot em JSON com estoque de bobinas disponíveis, demandas',
  'agrupadas por slitter, programas de corte já calculados por um motor de',
  'otimização combinatória (respeitando a regra de refilo), a curva ABC de',
  'ferramentais e o histórico recente de produção. Baseie sua análise SOMENTE',
  'nos dados fornecidos — nunca invente códigos, lotes ou números que não',
  'estejam no JSON recebido. Quando o JSON incluir "historicoFeedbackIA", use a',
  '"taxaAceitacaoRecentePercent" e o padrão de "ultimasSugestoes" (quais foram',
  'aceitas de fato pelo usuário, "statusReal": "ACEITA", vs. apenas sugeridas e',
  'ignoradas, "statusReal": "SUGERIDA") como sinal real de calibração — se um',
  'tipo de recomendação historicamente tem baixa aceitação, seja mais',
  'conservador na prioridade ou explique melhor a justificativa; se a taxa de',
  'aceitação for alta para um padrão (ex: mesma classe de ferramental ou',
  'mesma faixa de aproveitamento), reforce esse padrão nas próximas sugestões.'
].join(' ');

const PROMPTS = {
  recommendations: `${BASE_CONTEXT}

Sua tarefa: analisar "programasSugeridos" e "demandas" e recomendar, em ordem de
prioridade, quais programas de corte a equipe de PCP deve executar primeiro nesta
semana. Priorize: (1) demandas com status BLOQUEADO ou PARCIAL e maior volume em
toneladas, (2) melhor aproveitamento e sobra dentro da faixa ideal (10 a 18 mm),
(3) risco de ruptura de estoque para o produto principal.

Responda SOMENTE com um JSON válido, sem nenhum texto fora do JSON, no formato:
{
  "resumo": "1 a 2 frases gerais sobre a priorização sugerida",
  "recomendacoes": [
    {
      "titulo": "string curta e objetiva",
      "programId": "id de um item de programasSugeridos quando aplicável, ou omitir",
      "prioridade": "ALTA" | "MEDIA" | "BAIXA",
      "justificativa": "1 a 2 frases explicando o motivo, citando números do JSON",
      "impactoEstimado": "string curta opcional, ex: 'Atende 4.2t de demanda parcial'"
    }
  ]
}
Gere no máximo 8 recomendações, as de prioridade ALTA primeiro.`,

  planning: `${BASE_CONTEXT}

Sua tarefa: montar um PLANEJAMENTO OTIMIZADO de quais programas de corte executar
primeiro, cruzando simultaneamente estes critérios (nesta ordem de importância):
  1. Curva ABC de Ferramentais ("ferramentalAbc"): priorize sempre que possível
     ferramentais Classe A ("prontaParaSetup": true, sempre roda). Ferramentais
     Classe C só devem ser recomendados quando "prontaParaSetup" for true (lote
     mínimo já atingido) — nunca recomende iniciar um setup Classe C que ainda
     está "Aguardando Lote Mínimo".
  2. Estoque ("estoque"): só recomende programas cuja bobina de origem realmente
     conste em "estoque.bobinas" ou em "programasSugeridos".
  3. Ferramental cadastrado ("demandas[].ferramentalCadastrado" e
     "ferramentaisSemCadastro"): NUNCA recomende como prioridade ALTA um item cujo
     ferramental não está cadastrado (ferramentalCadastrado=false) — sinalize-o
     em vez disso como pendência de cadastro, não como corte a executar.
  4. Melhor aproveitamento de bobina / menor perda ("programasSugeridos[].
     aproveitamentoPercent" e "sobraMm"): entre opções equivalentes nos critérios
     acima, prefira sempre o maior aproveitamento e a sobra mais próxima de 10-18mm.
  5. Limitações operacionais / menos retrabalho ("limitacoesOperacionais"): agrupe
     recomendações por espessura igual quando possível para reduzir trocas de
     faca (setup); evite recomendar poucas toneladas isoladas de uma espessura
     que já tem alerta de fragmentação de setup.

Responda SOMENTE com um JSON válido, sem nenhum texto fora do JSON, no formato:
{
  "resumo": "2 a 4 frases explicando a lógica geral do plano montado, citando quais critérios pesaram mais",
  "recomendacoes": [
    {
      "titulo": "string curta e objetiva",
      "programId": "id de um item de programasSugeridos quando aplicável, ou omitir",
      "prioridade": "ALTA" | "MEDIA" | "BAIXA",
      "justificativa": "1 a 3 frases citando NÚMEROS REAIS do JSON (classe do ferramental, % aproveitamento, ton de estoque, etc.)",
      "impactoEstimado": "string curta opcional, ex: 'Atende 4.2t de demanda parcial, aproveitamento 96%'"
    }
  ]
}
Gere no máximo 10 recomendações, as de prioridade ALTA primeiro. Se um critério
bloquear um item (ferramental sem cadastro, ou Classe C aguardando lote), diga
isso explicitamente na justificativa em vez de omitir o item.`,

  alerts: `${BASE_CONTEXT}

Sua tarefa: revisar "estoque", "demandas", "ordensRecentes" e "historicoRecente" e
identificar riscos e pontos de atenção para a equipe de PCP: rupturas de bobina
para itens com demanda planejada, baixo aproveitamento recorrente, sobras fora da
faixa ideal (10 a 18 mm), concentração de estoque em poucas espessuras, ou queda
na taxa de atendimento de demanda.

Responda SOMENTE com um JSON válido, sem nenhum texto fora do JSON, no formato:
{
  "resumo": "1 a 2 frases gerais sobre a situação de risco",
  "insights": [
    {
      "titulo": "string curta e objetiva",
      "categoria": "estoque" | "eficiencia" | "demanda" | "operacional",
      "severidade": "info" | "atencao" | "critico",
      "descricao": "1 a 3 frases explicando o risco, citando números do JSON",
      "acaoSugerida": "string curta opcional com a próxima ação recomendada"
    }
  ]
}
Gere no máximo 10 alertas, ordenados do mais crítico para o menos crítico.`,

  summary: `${BASE_CONTEXT}

Sua tarefa: escrever um resumo executivo em português, claro e direto, sobre a
situação atual da produção de slitter, cobrindo: estoque disponível, taxa de
atendimento de demanda, eficiência média de corte e o que foi produzido
recentemente segundo "historicoRecente" e "ordensRecentes".

Responda SOMENTE com um JSON válido, sem nenhum texto fora do JSON, no formato:
{
  "resumo": "3 a 6 frases em tom executivo, citando os principais números do JSON",
  "insights": [
    {
      "titulo": "string curta",
      "categoria": "estoque" | "eficiencia" | "demanda" | "operacional",
      "severidade": "info" | "atencao" | "critico",
      "descricao": "1 a 2 frases"
    }
  ]
}
Limite "insights" a no máximo 5 pontos-chave.`
};

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Extrai o primeiro objeto JSON de um texto livre (alguns modelos retornam markdown/prosa em volta). */
function extractJson(rawText) {
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
}

async function callAnthropic(apiKey, systemPrompt, userContent) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }]
    })
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('Erro retornado pela API da Anthropic', res.status, errText);
    throw new HttpError(502, 'internal', 'Falha ao consultar o agente de IA (Anthropic).');
  }

  const data = await res.json();
  const textBlock = Array.isArray(data.content) ? data.content.find((b) => b.type === 'text') : null;
  return textBlock ? textBlock.text : '{}';
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 503 = sobrecarga passageira do modelo (vale re-tentar); 429 = cota do dia
// já esgotada (re-tentar o mesmo modelo não resolve, é direto para o
// fallback). Modelos "-lite" já são lentos por requisição (10-30s), então
// menos tentativas por modelo evita empilhar espera — preferimos cair pro
// fallback logo.
const GEMINI_MAX_ATTEMPTS = 2;
const GEMINI_RETRY_DELAYS_MS = [1500];

async function callGeminiModel(apiKey, model, systemPrompt, userContent) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userContent }] }],
    generationConfig: {
      maxOutputTokens: 8000,
      responseMimeType: 'application/json'
    }
  });

  let lastErrText = '';
  let lastStatus = 0;

  for (let attempt = 0; attempt < GEMINI_MAX_ATTEMPTS; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body
    });

    if (res.ok) {
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '{}';
    }

    lastStatus = res.status;
    lastErrText = await res.text().catch(() => '');

    // 429 (cota esgotada) não se resolve tentando de novo o mesmo modelo —
    // só 503 (sobrecarga temporária) justifica retry com espera.
    const isRetryable = res.status === 503;
    const hasMoreAttempts = attempt < GEMINI_MAX_ATTEMPTS - 1;
    if (!isRetryable || !hasMoreAttempts) break;

    console.error(`Gemini ${model} ${lastStatus} (tentativa ${attempt + 1}/${GEMINI_MAX_ATTEMPTS}), tentando de novo`, lastErrText);
    await sleep(GEMINI_RETRY_DELAYS_MS[attempt]);
  }

  const message =
    lastStatus === 429
      ? `Cota gratuita do Gemini (${model}) esgotada por hoje. Tente novamente mais tarde ou peça um aumento de cota em ai.google.dev/gemini-api/docs/rate-limits.`
      : 'Falha ao consultar o agente de IA (Gemini) — o modelo está indisponível no momento.';
  const err = new HttpError(502, 'internal', message);
  err.status_ = lastStatus;
  console.error(`Erro retornado pela API do Gemini (${model})`, lastStatus, lastErrText);
  throw err;
}

async function callGemini(apiKey, systemPrompt, userContent) {
  try {
    return await callGeminiModel(apiKey, GEMINI_MODEL, systemPrompt, userContent);
  } catch (err) {
    const wasOverloaded = err instanceof HttpError && (err.status_ === 503 || err.status_ === 429);
    if (!wasOverloaded) throw err;
    console.error(`${GEMINI_MODEL} indisponível após retries, tentando fallback ${GEMINI_FALLBACK_MODEL}`);
    return await callGeminiModel(apiKey, GEMINI_FALLBACK_MODEL, systemPrompt, userContent);
  }
}

async function callOpenAI(apiKey, systemPrompt, userContent) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('Erro retornado pela API da OpenAI', res.status, errText);
    throw new HttpError(502, 'internal', 'Falha ao consultar o agente de IA (OpenAI).');
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '{}';
}

function providersFor(env) {
  return {
    anthropic: { apiKey: env.ANTHROPIC_API_KEY, envVar: 'ANTHROPIC_API_KEY', call: callAnthropic },
    gemini: { apiKey: env.GEMINI_API_KEY, envVar: 'GEMINI_API_KEY', call: callGemini },
    openai: { apiKey: env.OPENAI_API_KEY, envVar: 'OPENAI_API_KEY', call: callOpenAI }
  };
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400'
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...corsHeaders(origin) }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== 'POST') {
      return json({ error: 'method-not-allowed' }, 405, origin);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'invalid-argument', message: 'Corpo da requisição inválido (JSON esperado).' }, 400, origin);
    }

    const { mode, context, provider } = payload || {};

    if (!mode || !PROMPTS[mode]) {
      return json(
        { error: 'invalid-argument', message: 'Parâmetro "mode" inválido. Use "recommendations", "planning", "alerts" ou "summary".' },
        400,
        origin
      );
    }

    if (!context || typeof context !== 'object') {
      return json({ error: 'invalid-argument', message: 'Parâmetro "context" ausente ou inválido.' }, 400, origin);
    }

    const providers = providersFor(env);
    const providerKey = provider && providers[provider] ? provider : 'anthropic';
    const providerConfig = providers[providerKey];

    const apiKey = providerConfig.apiKey;
    if (!apiKey) {
      return json(
        {
          error: 'failed-precondition',
          message: `${providerConfig.envVar} não configurada. Rode "npx wrangler secret put ${providerConfig.envVar}" (dentro da pasta worker/) e faça o deploy. Veja o README.md para instruções.`
        },
        412,
        origin
      );
    }

    const systemPrompt = PROMPTS[mode];
    // Limita o tamanho do payload enviado ao modelo por segurança de custo/latência.
    const contextJson = JSON.stringify(context).slice(0, 60000);
    const userContent = `Dados atuais do portal (JSON):\n${contextJson}\n\nResponda SOMENTE com o JSON no formato especificado, sem texto adicional antes ou depois.`;

    // Modelos preview ocasionalmente devolvem um JSON malformado/truncado
    // mesmo com responseMimeType: "application/json" — uma segunda tentativa
    // resolve a grande maioria desses casos sem incomodar o usuário.
    const PARSE_RETRY_ATTEMPTS = 2;
    let parsed;
    let lastNetworkErr = null;

    for (let attempt = 0; attempt < PARSE_RETRY_ATTEMPTS; attempt++) {
      let rawText;
      try {
        rawText = await providerConfig.call(apiKey, systemPrompt, userContent);
      } catch (err) {
        if (err instanceof HttpError) {
          return json({ error: err.code, message: err.message }, err.status, origin);
        }
        console.error(`Falha de rede ao chamar a API (${providerKey})`, err);
        lastNetworkErr = err;
        break;
      }

      try {
        parsed = extractJson(rawText);
        break;
      } catch {
        console.error(`Resposta da IA não pôde ser interpretada como JSON (tentativa ${attempt + 1}/${PARSE_RETRY_ATTEMPTS})`, rawText);
      }
    }

    if (lastNetworkErr) {
      return json({ error: 'unavailable', message: 'Não foi possível contatar o serviço de IA. Tente novamente.' }, 503, origin);
    }
    if (!parsed) {
      return json({ error: 'internal', message: 'A resposta do agente de IA não pôde ser interpretada. Tente novamente.' }, 502, origin);
    }

    return json({ geradoEm: new Date().toISOString(), mode, provider: providerKey, ...parsed }, 200, origin);
  }
};
