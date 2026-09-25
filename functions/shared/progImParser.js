// Porta para Node puro (sem browser/localStorage) da mesma lógica de
// derivação usada pelo importador do Portal (src/services/excelService.ts +
// src/services/slitterCatalogService.ts). Usada pela Cloud Function
// `importProgIm` para resolver espessura/largura de fita a partir da
// descrição de itens enviados diretamente pela planilha de programação
// (sem precisar de upload manual).

const { PERFIL_SLITTERS_CATALOG } = require('../data/perfilSlittersCatalog');
const { TUBO_WIDTH_TABLE } = require('../data/tuboWidthTable');

const WIDTH_TOLERANCE_MM = 0.6;
const THICKNESS_TOLERANCE_MM = 0.03;

function extractDimsSegment(desc) {
  const m = desc.match(/(\d+(?:,\d+)?(?:\s*[Xx]\s*\d+(?:,\d+)?)+)/);
  if (!m) return null;
  const tokens = m[1].split(/[Xx]/).map(t => parseFloat(t.trim().replace(',', '.')));
  return tokens.some(Number.isNaN) ? null : tokens;
}

function extractTuboTipo(desc) {
  const m = desc.match(/\b(RD|QD|RT)\b/i);
  return m ? m[1].toUpperCase() : null;
}

function inferFamilia(codigo, descricao) {
  const c = codigo.toUpperCase();
  if (c.startsWith('PRF') || c.startsWith('PMG')) return 'PERFIL';
  if (c.startsWith('TBI') || c.startsWith('TBZ')) return 'TUBO';
  const d = descricao.toUpperCase();
  if (d.includes('PERFIL')) return 'PERFIL';
  if (d.includes('TUBO')) return 'TUBO';
  return null;
}

function parseCatalogDesc(desc) {
  const m = desc.match(/^\S+\s+([\d,\sXx]+)MM/i);
  if (!m) return null;
  const tokens = m[1].split(/[Xx]/).map(t => t.trim()).filter(Boolean);
  if (tokens.length < 2) return null;
  const espessura = parseFloat(tokens[tokens.length - 1].replace(',', '.'));
  const dims = tokens.slice(0, -1).map(t => parseFloat(t.replace(',', '.')));
  if (Number.isNaN(espessura) || dims.some(Number.isNaN)) return null;
  return { dims, espessura };
}

function findPerfilBlankByDims(dims, espessura) {
  for (const item of PERFIL_SLITTERS_CATALOG) {
    const parsed = parseCatalogDesc(item.desc);
    if (!parsed) continue;
    if (Math.abs(parsed.espessura - espessura) > THICKNESS_TOLERANCE_MM) continue;
    if (parsed.dims.length !== dims.length) continue;
    const same = parsed.dims.every((d, i) => Math.abs(d - dims[i]) < WIDTH_TOLERANCE_MM);
    if (same) return item.blank;
  }
  return null;
}

function findTuboBlankByDims(tipo, dims, espessura) {
  const pairMatches = (pair, target) =>
    target.length === 2 &&
    ((Math.abs(pair[0] - target[0]) < WIDTH_TOLERANCE_MM && Math.abs(pair[1] - target[1]) < WIDTH_TOLERANCE_MM) ||
     (Math.abs(pair[0] - target[1]) < WIDTH_TOLERANCE_MM && Math.abs(pair[1] - target[0]) < WIDTH_TOLERANCE_MM));

  for (const row of TUBO_WIDTH_TABLE) {
    let rowMatches = false;
    if (tipo === 'RD' && dims.length === 1) {
      rowMatches = Math.abs(row.diamMm - dims[0]) < WIDTH_TOLERANCE_MM;
    } else if (tipo === 'QD' && row.quadrado) {
      rowMatches = pairMatches(row.quadrado, dims);
    } else if (tipo === 'RT') {
      rowMatches = row.retangular.some(p => pairMatches(p, dims));
    }
    if (!rowMatches) continue;

    const espMatch = row.blanks.find(([esp]) => Math.abs(esp - espessura) < THICKNESS_TOLERANCE_MM);
    if (espMatch) return espMatch[1];
  }
  return null;
}

/**
 * Resolve um item bruto {codigo, descricao, qtd} vindo direto da planilha
 * (via macro) em um Product completo, OU sinaliza como pendente quando não
 * dá pra derivar espessura/largura com segurança. `existing` é o produto já
 * cadastrado com esse código (se houver) — nesse caso só a demanda é atualizada.
 */
function resolveProgImItem(codigo, descricao, qtd, existing) {
  if (existing) {
    return { product: { ...existing, descricao: descricao || existing.descricao, demandaT: qtd }, pendente: null };
  }

  const familia = inferFamilia(codigo, descricao);
  const dims = descricao ? extractDimsSegment(descricao) : null;
  const espessura = dims && dims.length > 0 ? dims[0] : 0;
  let larguraFita = null;

  if (dims && dims.length > 1 && espessura > 0) {
    if (familia === 'PERFIL') {
      larguraFita = findPerfilBlankByDims(dims.slice(1), espessura);
    } else if (familia === 'TUBO') {
      const tipo = extractTuboTipo(descricao);
      if (tipo) larguraFita = findTuboBlankByDims(tipo, dims.slice(1), espessura);
    }
  }

  if (familia && espessura > 0 && larguraFita) {
    return {
      product: {
        id: `PROD_IMP_${codigo}`,
        codigo,
        descricao: descricao || codigo,
        tipo: familia,
        espessura,
        larguraFita,
        demandaT: qtd,
        familia
      },
      pendente: null
    };
  }

  return { product: null, pendente: { codigo, descricao, qtd } };
}

module.exports = { resolveProgImItem, extractDimsSegment, extractTuboTipo, inferFamilia, findPerfilBlankByDims, findTuboBlankByDims };
