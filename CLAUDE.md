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
- **Estúdio de Corte & Isolamento de Bobinas (`SimulationView`)**: É terminantemente proibido juntar ou concatenar fitas de bobinas matrizes distintas em um único corte transversal ou gráfico de `SlitterVisualizer`. Em planos ou OPs multi-bobinas, cada bobina matriz física possui seu próprio plano de corte, refilo independente (faixa ideal de 10 a 18 mm) e ajuste de facas isolado. A visualização suporta seletor de bobinas (cards/abas com lote, peso, fitas, refilo e aproveitamento), alternador entre visão detalhada de ajuste fino e visão geral de todas as bobinas, e propagação preservada para a Ordem de Produção (`OrderCoilInput[]`).
- **Cancelamento & Descarte de Simulação**: O Estúdio de Corte possui botão explícito de cancelamento ("Cancelar Simulação" com ícone `XCircle`), além de limpeza automática do workspace ativo ao clicar em "Voltar ao Planejamento" ou "Voltar ao Painel". Isso impede o acúmulo de bobinas fantasmas na memória e garante que a tela inicial vazia (`EmptyState`) seja exibida quando não houver simulação em andamento.

## Identidade Visual & Cores Oficiais (CEDISA CENTRAL DE AÇO)

- **Cor Primária**: **Azul Escuro** (`cedisa.navy`: `#0B1F3A`, `cedisa.navy-dark`: `#05101E`, `cedisa.navy-light`: `#163866`). Aplicada na barra lateral (Sidebar), cabeçalhos principais, títulos da OP, tabelas e botões corporativos.
- **Cor Secundária**: **Laranja** (`cedisa.orange`: `#FF6B00`, `orange-500`: `#F97316`, `orange-600`: `#EA580C`). Aplicada em CTAs de avanço, badges de destaque no menu, alertas operacionais, indicador de etapa ativa e barras de progresso.
- **Regra Estrita de Cores**: Proibido o uso de tons genéricos de azul claro do Tailwind (`blue-50`, `blue-100`, `blue-600`, etc.). Qualquer elemento azul deve adotar exclusivamente a paleta oficial Cedisa Navy (`#0B1F3A` ou `bg-[#0B1F3A]/5` com `border-[#0B1F3A]/15` para fundos suaves) ou acentos em Laranja Cedisa (`#FF6B00`).
- **Navegação Fabril (Menu Lateral)**:
  - `Painel Geral`: Dashboard com indicadores e visão de 3 dias.
  - `Planejamento Slitter`: Motor de 3 etapas de corte de bobinas.
  - `Gestão de Estoque`: Consulta de estoque físico x contábil, fitas prontas e Previsão de Produção D+2 (Cotação Comercial).
  - `Estúdio de Corte`: Simulador visual milimétrico e ajuste de facas.
  - `Ordem de Produção (OP)`: Ficha fabril emitida e pronta para impressão.
  - `Relatórios & Histórico`: Balanços e histórico de cortes.
  - `Importador & Cadastros`: Importação de planilhas Excel e cadastros mestres.
  - `Agente de IA`: Diagnósticos inteligentes e otimização de campanha.
- **Uso de Logotipos Oficiais** (`public/assets/` e `src/assets/` via `<CedisaLogo />`):
  - `cedisa-logo-horizontal-white.png`: Aplicado na **Sidebar** de fundo azul escuro profundo para contraste nítido e elegante.
  - `cedisa-logo-horizontal-color.png`: Aplicado na **Navbar** superior e cabeçalhos em tela clara (símbolo com arco azul escuro + centro laranja).
  - `cedisa-symbol-color.png`: Aplicado como **Favicon** da aba do navegador (`index.html`) e selos compactos.
  - `cedisa-logo-horizontal-black.png`: Aplicado em **impressão de OP** e **etiquetas térmicas de fitas de slitter** (`PrintTagsPortal.tsx`) para fidelidade em impressoras monocromáticas.

## Estilo de código

- TypeScript com tipos explícitos; união de strings literais para variantes (`'BAIXO' | 'MEDIO' | 'ALTO'`), não `enum`.
- Tailwind CSS utilitário inline nas classes; sem CSS-in-JS.
- Sem comentários explicando "o quê" — só quando a razão não é óbvia.
- Textos de UI em português (pt-BR).

## Arquivos a não ler por padrão

Planilhas `.xlsx`/`.xls` na raiz são dados de referência de origem (não documentação) e não devem ser abertas a menos que a tarefa peça explicitamente para analisar seu conteúdo.
