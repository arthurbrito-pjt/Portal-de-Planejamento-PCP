# CLAUDE.md

Portal de Planejamento PCP — app React/TS/Vite para planejamento de corte de bobinas em slitter (Cedisa Central de Aço).

## Comandos

- `npm run dev` — servidor de desenvolvimento (Vite, porta 5173)
- `npm run build` — `tsc && vite build` (type-check + build de produção em `dist/`)
- `npm run preview` — servir o build de produção localmente
- Não há suite de testes automatizados. Após qualquer mudança, rode `npx tsc --noEmit` para validar tipos antes de finalizar.
- Deploy: `npx firebase deploy --only hosting` (projeto `slitterpcp`, ver `.firebaserc`)

## Arquitetura

- 100% client-side: dados em `localStorage` com sync best-effort para Firestore (`src/services/storageService.ts` + `src/firebase/firestoreService.ts`). Sem backend/API própria.
- Views em `src/views/`, componentes reutilizáveis em `src/components/`, tipos centralizados em `src/types/pcp.ts`.
- Novas entidades de dados seguem o padrão CRUD já existente em `storageService.ts` (cache estático em memória + `localStorage` + espelho best-effort no Firestore via `firestoreService.ts`).
- Serviços de domínio:
  - `slitterOptimizer.ts`: Algoritmo de refilo mínimo e combinações de corte de bobinas.
  - `readinessService.ts`: Prontidão de slitters, horizonte de programação de 3 dias (`generate3DaySchedule`) e análise da Curva ABC de Ferramentais (`analyzeToolingABC`).
  - `productionForecastService.ts`: Cálculo de prazos D+2 úteis para comercial/cotação, checagem de estoque intermediário e lote mínimo de ferramental.

## Regras de Negócio & Operação PCP

- **Previsão de Produção Comercial (D+2)**: A disponibilidade comercial é sempre calculada como data de início do corte + 2 dias úteis de lead time operacional até expedição.
- **Estoque Físico vs. Contábil (`statusContabil`)**: Bobinas com status `'PENDENTE_AJUSTE'` (físico presente na baia aguardando regularização contábil) podem ser planejadas e cortadas normalmente, sinalizadas com badge de alerta para não travar a fábrica.
- **Curva ABC de Ferramentais**:
  - **Classe A**: "Sempre Roda" — alta rotação e campanhas frequentes.
  - **Classe B**: "Giro Regular" — campanhas em ciclos semanais/quinzenais.
  - **Classe C**: "Menos Roda" — ferramental especial/sob encomenda; exige acúmulo de lote mínimo em carteira antes de autorizar o setup.
- **Política de Volume por Ferramental e Item**: Faixas operacionais em toneladas (`capacidadeMinimaT`, `capacidadeIdealT`, `capacidadeMaximaT`).
- **Grau de Dificuldade de Produção**: `'BAIXO' | 'MEDIO' | 'ALTO'`, associado a tolerâncias de espessura e geometrias de perfil/tubo.
- **Estoque Intermediário WIP (`SlitterIntermediaryItem`)**: Fitas de slitters já cortadas e disponíveis na baia intermediária devem ser priorizadas antes de cortar novas bobinas matrizes.
- **Horizonte Rolante de 3 Dias & Produtividade**: Agrupamento prioritário por espessura/aço para reduzir trocas de faca. Alerta operacional de fragmentação de lote (*"Quanto menos matéria-prima, mais setups"*) disparado quando o volume médio por setup é inferior a 20 t.

## Estilo de código

- TypeScript com tipos explícitos; união de strings literais para variantes (`'BAIXO' | 'MEDIO' | 'ALTO'`), não `enum`.
- Tailwind CSS utilitário inline nas classes; sem CSS-in-JS.
- Sem comentários explicando "o quê" — só quando a razão não é óbvia.
- Textos de UI em português (pt-BR).

## Arquivos a não ler por padrão

Planilhas `.xlsx`/`.xls` na raiz são dados de referência de origem (não documentação) e não devem ser abertas a menos que a tarefa peça explicitamente para analisar seu conteúdo.
