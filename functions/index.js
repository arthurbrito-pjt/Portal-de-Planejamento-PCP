/**
 * Agente de IA do Portal de Planejamento PCP — Cedisa Central de Aço
 * ------------------------------------------------------------------
 * Cloud Function callable que recebe um snapshot dos dados de PCP
 * (estoque de bobinas, demandas por slitter, programas de corte já
 * calculados pelo motor de otimização, KPIs e histórico) e usa a API
 * da Anthropic (Claude) para gerar, em português:
 *
 *   - "recommendations": recomendações priorizadas de quais programas
 *      de corte executar primeiro;
 *   - "alerts": alertas proativos de risco (ruptura de estoque, baixa
 *      eficiência, sobras fora da faixa ideal de refilo, etc.);
 *   - "summary": um resumo executivo da situação atual da produção.
 *
 * A chave da API (ANTHROPIC_API_KEY) fica em Firebase Secret Manager —
 * nunca é exposta ao navegador. Veja o README.md na raiz do projeto
 * para instruções de configuração e deploy.
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');

// Modelo Claude usado pelo agente. Se precisar trocar, confira os
// modelos disponíveis para sua conta em:
// https://docs.claude.com/en/docs/about-claude/models
const CLAUDE_MODEL = 'claude-sonnet-4-5';
const ANTHROPIC_VERSION = '2023-06-01';

const BASE_CONTEXT = [
  'Você é o Agente de IA do Portal de Planejamento PCP da Cedisa Central de Aço,',
  'especializado em otimização de corte Slitter de bobinas de aço para produção',
  'de Tubos e Perfis U. A regra de refilo técnico ideal é entre 10 e 18 mm (~1,5%).',
  'Você recebe um snapshot em JSON com estoque de bobinas disponíveis, demandas',
  'agrupadas por slitter, programas de corte já calculados por um motor de',
  'otimização combinatória (respeitando a regra de refilo) e o histórico recente',
  'de produção. Baseie sua análise SOMENTE nos dados fornecidos — nunca invente',
  'códigos, lotes ou números que não estejam no JSON recebido.'
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

exports.aiAgentAssistant = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: 'us-central1', timeoutSeconds: 60, cors: true },
  async (request) => {
    const { mode, context } = request.data || {};

    if (!mode || !PROMPTS[mode]) {
      throw new HttpsError(
        'invalid-argument',
        'Parâmetro "mode" inválido. Use "recommendations", "alerts" ou "summary".'
      );
    }

    if (!context || typeof context !== 'object') {
      throw new HttpsError('invalid-argument', 'Parâmetro "context" ausente ou inválido.');
    }

    const apiKey = ANTHROPIC_API_KEY.value();
    if (!apiKey) {
      throw new HttpsError(
        'failed-precondition',
        'ANTHROPIC_API_KEY não configurada. Veja o README.md para instruções.'
      );
    }

    const systemPrompt = PROMPTS[mode];
    // Limita o tamanho do payload enviado ao modelo por segurança de custo/latência.
    const contextJson = JSON.stringify(context).slice(0, 60000);
    const userContent = `Dados atuais do portal (JSON):\n${contextJson}\n\nResponda SOMENTE com o JSON no formato especificado, sem texto adicional antes ou depois.`;

    let anthropicRes;
    try {
      anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
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
    } catch (err) {
      logger.error('Falha de rede ao chamar a API da Anthropic', err);
      throw new HttpsError('unavailable', 'Não foi possível contatar o serviço de IA. Tente novamente.');
    }

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text().catch(() => '');
      logger.error('Erro retornado pela API da Anthropic', { status: anthropicRes.status, errText });
      throw new HttpsError('internal', 'Falha ao consultar o agente de IA.');
    }

    const data = await anthropicRes.json();
    const textBlock = Array.isArray(data.content) ? data.content.find((b) => b.type === 'text') : null;
    const rawText = textBlock ? textBlock.text : '{}';

    let parsed;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    } catch (err) {
      logger.error('Resposta da IA não pôde ser interpretada como JSON', { rawText });
      throw new HttpsError('internal', 'A resposta do agente de IA não pôde ser interpretada.');
    }

    return { geradoEm: new Date().toISOString(), mode, ...parsed };
  }
);
