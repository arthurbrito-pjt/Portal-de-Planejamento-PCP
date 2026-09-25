/**
 * Agente de IA do Portal de Planejamento PCP — Cedisa Central de Aço
 * ------------------------------------------------------------------
 * Cloud Function callable que recebe um snapshot dos dados de PCP
 * (estoque de bobinas, demandas por slitter, programas de corte já
 * calculados pelo motor de otimização, curva ABC de ferramentais, KPIs
 * e histórico) e usa um provedor de IA à escolha (Anthropic, Gemini ou
 * OpenAI) para gerar, em português:
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
 * ficam em Firebase Secret Manager — nunca são expostas ao navegador.
 * Configure a(s) que for usar com:
 *   firebase functions:secrets:set ANTHROPIC_API_KEY
 *   firebase functions:secrets:set GEMINI_API_KEY
 *   firebase functions:secrets:set OPENAI_API_KEY
 * Veja o README.md na raiz do projeto para instruções completas.
 */

const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
  admin.firestore().settings({ ignoreUndefinedProperties: true });
}
const logger = require('firebase-functions/logger');

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

// Modelos usados por padrão. Se precisar trocar, confira os modelos
// disponíveis para sua conta em cada provedor:
// Anthropic: https://docs.claude.com/en/docs/about-claude/models
// Gemini:    https://ai.google.dev/gemini-api/docs/models
// OpenAI:    https://platform.openai.com/docs/models
const CLAUDE_MODEL = 'claude-sonnet-4-5';
const ANTHROPIC_VERSION = '2023-06-01';
const GEMINI_MODEL = 'gemini-2.5-flash';
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
  'estejam no JSON recebido.'
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
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }]
    })
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    logger.error('Erro retornado pela API da Anthropic', { status: res.status, errText });
    throw new HttpsError('internal', 'Falha ao consultar o agente de IA (Anthropic).');
  }

  const data = await res.json();
  const textBlock = Array.isArray(data.content) ? data.content.find((b) => b.type === 'text') : null;
  return textBlock ? textBlock.text : '{}';
}

async function callGemini(apiKey, systemPrompt, userContent) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userContent }] }],
      generationConfig: {
        maxOutputTokens: 2000,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    logger.error('Erro retornado pela API do Gemini', { status: res.status, errText });
    throw new HttpsError('internal', 'Falha ao consultar o agente de IA (Gemini).');
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '{}';
  return text;
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
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    logger.error('Erro retornado pela API da OpenAI', { status: res.status, errText });
    throw new HttpsError('internal', 'Falha ao consultar o agente de IA (OpenAI).');
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '{}';
}

const PROVIDERS = {
  anthropic: { secret: ANTHROPIC_API_KEY, envVar: 'ANTHROPIC_API_KEY', call: callAnthropic },
  gemini: { secret: GEMINI_API_KEY, envVar: 'GEMINI_API_KEY', call: callGemini },
  openai: { secret: OPENAI_API_KEY, envVar: 'OPENAI_API_KEY', call: callOpenAI }
};

exports.aiAgentAssistant = onCall(
  {
    secrets: [ANTHROPIC_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY],
    region: 'us-central1',
    timeoutSeconds: 60,
    cors: true
  },
  async (request) => {
    const { mode, context, provider } = request.data || {};

    if (!mode || !PROMPTS[mode]) {
      throw new HttpsError(
        'invalid-argument',
        'Parâmetro "mode" inválido. Use "recommendations", "planning", "alerts" ou "summary".'
      );
    }

    if (!context || typeof context !== 'object') {
      throw new HttpsError('invalid-argument', 'Parâmetro "context" ausente ou inválido.');
    }

    const providerKey = provider && PROVIDERS[provider] ? provider : 'anthropic';
    const providerConfig = PROVIDERS[providerKey];

    const apiKey = providerConfig.secret.value();
    if (!apiKey) {
      throw new HttpsError(
        'failed-precondition',
        `${providerConfig.envVar} não configurada. Rode "firebase functions:secrets:set ${providerConfig.envVar}" e faça o deploy. Veja o README.md para instruções.`
      );
    }

    const systemPrompt = PROMPTS[mode];
    // Limita o tamanho do payload enviado ao modelo por segurança de custo/latência.
    const contextJson = JSON.stringify(context).slice(0, 60000);
    const userContent = `Dados atuais do portal (JSON):\n${contextJson}\n\nResponda SOMENTE com o JSON no formato especificado, sem texto adicional antes ou depois.`;

    let rawText;
    try {
      rawText = await providerConfig.call(apiKey, systemPrompt, userContent);
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      logger.error(`Falha de rede ao chamar a API (${providerKey})`, err);
      throw new HttpsError('unavailable', 'Não foi possível contatar o serviço de IA. Tente novamente.');
    }

    let parsed;
    try {
      parsed = extractJson(rawText);
    } catch (err) {
      logger.error('Resposta da IA não pôde ser interpretada como JSON', { rawText });
      throw new HttpsError('internal', 'A resposta do agente de IA não pôde ser interpretada.');
    }

    return { geradoEm: new Date().toISOString(), mode, provider: providerKey, ...parsed };
  }
);

/**
 * ---------------------------------------------------------------------------
 * Ingestão automática de dados — Portal de Planejamento PCP
 * ---------------------------------------------------------------------------
 * Duas APIs HTTP que substituem o upload manual de planilha: a fonte de dados
 * chama diretamente esse endpoint (via macro VBA na planilha de programação,
 * ou via Power Automate lendo o dataset do Power BI) e os dados já aparecem
 * no Portal, sem passar por e-mail nem por tela de importação.
 *
 * Autenticação: header "x-api-key" comparado contra o secret IMPORT_API_KEY.
 * Configure com:
 *   firebase functions:secrets:set IMPORT_API_KEY
 * (gere uma chave aleatória longa, ex: openssl rand -hex 32, e guarde uma
 * cópia seja no cofre de senhas da empresa — ela vai para dentro da macro do
 * Excel e do fluxo do Power Automate).
 */

const { resolveProgImItem } = require('./shared/progImParser');

const IMPORT_API_KEY = defineSecret('IMPORT_API_KEY');

function checkApiKey(req, res) {
  const provided = req.get('x-api-key');
  if (!provided || provided !== IMPORT_API_KEY.value()) {
    res.status(401).json({ error: 'API key ausente ou inválida (header x-api-key).' });
    return false;
  }
  return true;
}

async function commitInChunks(db, buildOps, refs) {
  const CHUNK = 400; // margem de segurança abaixo do limite de 500 do Firestore
  for (let i = 0; i < refs.length; i += CHUNK) {
    const batch = db.batch();
    refs.slice(i, i + CHUNK).forEach(ref => buildOps(batch, ref));
    await batch.commit();
  }
}

/**
 * POST /importProgIm
 * Body: { "linha": "PERFIL_3MM" | "PERFIL_475MM" | "TUBO_MARAFON" | "TUBO_ZIKELI",
 *         "itens": [{ "codigo": "PRF10005", "descricao": "...", "qtd": 16 }, ...] }
 *
 * Espelha a lógica de src/services/excelService.ts::parseProductsFile: item já
 * cadastrado só tem a demanda atualizada; item novo tem espessura/largura de
 * fita derivadas da descrição via catálogo oficial (perfil ou tubo); o que não
 * dá pra resolver com segurança vai para "importPendencias" em vez de entrar
 * com dado inventado.
 */
exports.importProgIm = onRequest({ secrets: [IMPORT_API_KEY], region: 'us-central1', cors: true }, async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  if (!checkApiKey(req, res)) return;

  const { linha, itens } = req.body || {};
  if (!Array.isArray(itens)) return res.status(400).json({ error: 'Campo "itens" deve ser um array' });

  const db = admin.firestore();

  const codigos = [...new Set(itens.map(i => String(i.codigo || '').trim()).filter(Boolean))];
  const existingByCodigo = {};
  for (let i = 0; i < codigos.length; i += 10) {
    const chunk = codigos.slice(i, i + 10);
    if (chunk.length === 0) continue;
    const snap = await db.collection('produtos').where('codigo', 'in', chunk).get();
    snap.forEach(d => { existingByCodigo[d.data().codigo] = { ...d.data(), id: d.id }; });
  }

  const resolved = [];
  const pendentes = [];
  let atualizados = 0;
  let novos = 0;

  for (const raw of itens) {
    const codigo = String(raw.codigo || '').trim();
    if (!codigo) continue;
    const descricao = String(raw.descricao || '').trim();
    const qtd = Number(raw.qtd) || 0;
    const existing = existingByCodigo[codigo] || null;

    const { product, pendente } = resolveProgImItem(codigo, descricao, qtd, existing);
    if (product) {
      resolved.push(product);
      existing ? atualizados++ : novos++;
    } else if (pendente) {
      pendentes.push(pendente);
    }
  }

  await commitInChunks(db, (batch, product) => batch.set(db.collection('produtos').doc(product.id), product, { merge: true }), resolved);

  if (pendentes.length > 0) {
    await db.collection('importPendencias').add({
      linha: linha || 'DESCONHECIDA',
      recebidoEm: admin.firestore.FieldValue.serverTimestamp(),
      itens: pendentes
    });
  }

  res.status(200).json({ atualizados, novos, pendentes: pendentes.length, pendentesDetalhe: pendentes });
});

/**
 * POST /importEstoque
 * Body: { "tipo": "bobina", "itens": [{ "codigo", "lote", "espessura", "largura", "peso", "fornecedor"?, "localizacao"? }, ...] }
 *   ou: { "tipo": "slitter", "itens": [{ "codigoSlitter", "nomeSlitter"?, "larguraFita", "espessura", "pesoDisponivelTon", "metrosLineares", "dataCorte"?, "loteOrigem"?, "localizacao"?, "familiaDestino"? }, ...] }
 *
 * Assume que cada envio é o SNAPSHOT COMPLETO do estoque atual (como o BI/ERP
 * normalmente exporta) — substitui inteiramente a coleção correspondente em
 * vez de mesclar, para que itens já consumidos no ERP não fiquem "fantasmas"
 * no Portal. Se a origem passar a enviar deltas em vez de snapshot completo,
 * essa semântica precisa mudar.
 */
exports.importEstoque = onRequest({ secrets: [IMPORT_API_KEY], region: 'us-central1', cors: true }, async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  if (!checkApiKey(req, res)) return;

  const { tipo, itens } = req.body || {};
  if (tipo !== 'bobina' && tipo !== 'slitter') return res.status(400).json({ error: 'Campo "tipo" deve ser "bobina" ou "slitter"' });
  if (!Array.isArray(itens)) return res.status(400).json({ error: 'Campo "itens" deve ser um array' });

  const db = admin.firestore();
  const collectionName = tipo === 'bobina' ? 'bobinas' : 'estoque_slitter_intermediario';

  const existingSnap = await db.collection(collectionName).get();
  await commitInChunks(db, (batch, ref) => batch.delete(ref), existingSnap.docs.map(d => d.ref));

  const docs = [];
  let seq = 0;
  for (const raw of itens) {
    if (tipo === 'bobina') {
      const codigo = String(raw.codigo || '').trim();
      const lote = String(raw.lote || '').trim();
      if (!codigo || !lote) continue;
      docs.push({
        id: `COIL_${codigo}_${lote}`,
        codigo,
        lote,
        espessura: Number(raw.espessura) || 0,
        largura: Number(raw.largura) || 0,
        peso: Number(raw.peso) || 0,
        quantidade: Number(raw.quantidade) || 1,
        status: raw.status || 'Disponível',
        dataRecebimento: raw.dataRecebimento || new Date().toISOString().split('T')[0],
        fornecedor: raw.fornecedor,
        localizacao: raw.localizacao
      });
    } else {
      const codigoSlitter = String(raw.codigoSlitter || '').trim();
      if (!codigoSlitter) continue;
      seq++;
      docs.push({
        id: `SLTWIP_${codigoSlitter}_${seq}`,
        codigoSlitter,
        nomeSlitter: raw.nomeSlitter || codigoSlitter,
        larguraFita: Number(raw.larguraFita) || 0,
        espessura: Number(raw.espessura) || 0,
        pesoDisponivelTon: Number(raw.pesoDisponivelTon) || 0,
        metrosLineares: Number(raw.metrosLineares) || 0,
        dataCorte: raw.dataCorte || new Date().toISOString().split('T')[0],
        loteOrigem: raw.loteOrigem || '',
        localizacao: raw.localizacao,
        familiaDestino: raw.familiaDestino
      });
    }
  }

  await commitInChunks(db, (batch, doc) => batch.set(db.collection(collectionName).doc(doc.id), doc), docs);

  res.status(200).json({ importados: docs.length, tipo });
});
