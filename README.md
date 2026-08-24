<div align="center">

# ⚙️ Portal de Planejamento PCP — Otimização de Slitter de Bobinas
### *Sistema Integrado de Engenharia de Produção, Corte Longitudinal & Gestão de Aço*

**A plataforma definitiva para Planejamento e Controle da Produção (PCP) na indústria de tubos e perfis de aço, focada na maximização do aproveitamento de bobinas no Slitter com garantia da regra de refilo técnico ideal entre 10 e 18 mm (~1,5%).**

[![React](https://img.shields.io/badge/React-18.3.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.0.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting_%7C_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://slitterpcp.web.app)
[![Web Demo](https://img.shields.io/badge/Web%20App-Live%20Demo-10B981?style=for-the-badge&logo=google-chrome&logoColor=white)](https://slitterpcp.web.app)
[![SheetJS](https://img.shields.io/badge/Excel_Engine-XLSX_Import_%2F_Export-217346?style=for-the-badge&logo=microsoft-excel&logoColor=white)](https://sheetjs.com)
[![License](https://img.shields.io/badge/License-Proprietary_%2F_Industrial-blue?style=for-the-badge)](LICENSE)

</div>

---

## 🏭 Visão Geral do Sistema

O **Portal de Planejamento PCP** foi projetado para transformar o processo de corte e fatiamento de bobinas de aço (**Slitter**) em uma operação matemática precisa, inteligente e visual. Ele atende ao fluxo fabril de transformação:

$$\text{Bobina de Matéria-Prima} \xrightarrow{\text{Slitter}} \text{Fitas de Slitter Produzidas} \xrightarrow{\text{Conformação/Solda}} \text{Tubos e Perfis U de Destino}$$

```
                          ┌──────────────────────────┐
                          │   BASE DE DADOS & ERP    │
                          │  Excel (.xlsx) + Cloud   │
                          │   Firebase Firestore     │
                          └────────────┬─────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │                                             │
    ┌───────────▼───────────┐                     ┌───────────▼───────────┐
    │     MOTOR PCP CORE    │                     │  INTERFACE OPERACIONAL│
    │  Otimização & Regras  │                     │   Painéis & Estúdio   │
    ├───────────────────────┤                     ├───────────────────────┤
    │ • Algoritmo Mochila   │                     │ • TELA 1: Dashboard   │
    │ • Refilo 10 a 18 mm   │                     │ • TELA 2: Wizard 6-P  │
    │ • Balanceamento Pesos │                     │ • TELA 3: Simulação   │
    │ • Rendimento Linear   │                     │ • TELA 4: Ordem OP    │
    │ • Multi-Produtos      │                     │ • TELA 5: Relatórios  │
    │ • Sincronização Cloud │                     │ • TELA 6: Gestor Base │
    └───────────────────────┘                     └───────────────────────┘
```

---

## 🌟 Módulos e Telas do Sistema

### 📊 1. TELA 1 — Dashboard PCP Executivo
Visão macro da fábrica e indicadores de performance operacional em tempo real:
- **Estoque de Bobinas Disponíveis**: Quantidade de lotes em estoque, peso total acumulado em toneladas e distribuição gráfica de bitolas por espessura e largura via *Recharts*.
- **Demandas Planejadas**: Acompanhamento de metas de produção para as famílias de **Tubos Industriais** e **Perfis U Estruturais**.
- **Eficiência Média de Corte**: Indicador de rendimento global com benchmark e meta industrial de aproveitamento $\ge 99.0\%$.
- **Alertas Proativos de PCP**: Identificação automática de itens com demanda planejada que não possuem bobinas com espessura compatível disponível em estoque.
- **Atalhos Rápidos**: Botões de ação imediata para iniciar planejamento a partir dos produtos mais críticos.

---

### 🧭 2. TELA 2 — Planejamento de Produção (Fluxo Guiado em 6 Passos)
Wizard passo a passo para o programador do PCP construir o plano de corte perfeito:

```
[Passo 1: Produto Final] ──► [Passo 2: Quantidade (t)] ──► [Passo 3: Localizar Bobinas]
                                                                     │
[Passo 6: Otimização Slitter] ◄── [Passo 5: Cálculo Fitas] ◄── [Passo 4: Selecionar Lote]
```

1. **Passo 1 — Seleção do Produto Final**: Busca dinâmica por código ou descrição, filtro por família (*Tubos* vs *Perfis*) e filtro por espessura nominal.
2. **Passo 2 — Quantidade Desejada**: Entrada da meta em toneladas com cálculo de equivalência.
3. **Passo 3 — Localização Automática de Bobinas**: O sistema filtra no estoque os lotes disponíveis com espessura idêntica à do produto.
4. **Passo 4 — Seleção do Lote**: Escolha do lote específico da bobina de aço (visualizando código, largura, espessura e peso em toneladas).
5. **Passo 5 — Cálculo do Corte Principal & Sobra**:
   - Exibição da largura da bobina ($W_{\text{bobina}}$).
   - Cálculo do número de fitas do produto principal que cabem: $k = \lfloor W_{\text{bobina}} / w_{\text{fita}} \rfloor$.
   - Cálculo da sobra resultante inicial: $\text{Sobra} = W_{\text{bobina}} - (k \times w_{\text{fita}})$.
6. **Passo 6 — Motor de Otimização & Combinação Complementar**:
   - Se a sobra for **superior a 10 mm**, o motor de otimização combinatória varre todos os produtos compatíveis de mesma espessura.
   - Gera combinações ranqueadas priorizando **sobras entre 0 e 10 mm** (Aproveitamento de até **100%**).
   - *Exemplo Real:* Bobina $1250\text{ mm}$ com 5 fitas de $240\text{ mm} = 1200\text{ mm}$ (sobra $50\text{ mm}$) $\to$ o sistema sugere 1 fita de $50\text{ mm}$, atingindo **Sobra 0 mm e 100% de aproveitamento**!

---

### ✂️ 3. TELA 3 — Estúdio de Simulação de Corte Slitter
Visualizador interativo milimétrico do corte transversal da bobina de aço:
- **Representação Gráfica Realista**: Visualização em blocos proporcionais coloridos:
  ```
  |── 240 mm ──|── 240 mm ──|── 240 mm ──|── 240 mm ──|── 240 mm ──|── 50 mm ──|[ 0 mm ]|
  [   Tubo A   ][   Tubo A   ][   Tubo A   ][   Tubo A   ][   Tubo A   ][  Perfil B ][ Refilo]
  ```
- **Régua Milimétrica & Indicadores**: Escala gráfica de 0 ao limite da bobina, identificação de facas e badges de conformidade (Verde para sobra $\le 10\text{ mm}$, Âmbar para refilo padrão, Vermelho para sobra alta).
- **Métricas Dinâmicas**: Aproveitamento %, Sobra em mm, Peso alocado por fita ($t$), Peso total consumido ($t$) e Rendimento linear estimado em metros ($m$).
- **Estúdio Interativo**: Permite adicionar fitas complementares avulsas ou remover tiras em tempo real com recálculo instantâneo de toda a bobina.

---

### 📋 4. TELA 4 — Resultado Final & Emissão de Ordem de Slitter (OS)
Documento oficial de programação de facas para os operadores de máquina no chão de fábrica:
- **Resumo da Matéria-Prima**: Código da Bobina, Lote, Peso Original ($t$), Largura ($mm$), Espessura ($mm$) e Aproveitamento Final ($99.17\% - 100\%$).
- **Tabela de Fitas da Máquina**:
  - Posição da fita (`Fita 01`, `Fita 02`...)
  - Produto Final Destino e Código do Item
  - Família do Produto (Tubo / Perfil)
  - Largura da Fita ($mm$) e Espessura ($mm$)
  - Peso Alocado ($t$ e $kg$)
  - Rendimento Linear ($m$)
- **Exportação para Excel (.xlsx)**: Gera a planilha oficial de Ordem de Produção formatada com colunas ajustadas e pronta para uso.
- **Impressão Direta / PDF**: Folha de ordem de fabricação estilizável para impressão no chão de fábrica.
- **Gravação & Histórico**: Baixa de status da bobina para *Consumida*, registro no histórico de cortes e sincronização na nuvem com o Firebase Firestore.

---

### 📈 5. TELA 5 — Relatórios Gerenciais & Histórico
Central de auditoria e relatórios do PCP:
- **Histórico de Slitters Gerados**: Lista cronológica de todas as Ordens de Slitter com status de execução (*Planejada*, *Liberada*, *Concluída*).
- **Consumo por Bobina / Lote**: Consulta a todos os lotes de matéria-prima disponíveis e consumidos.
- **Planejamento por Produto**: Catálogo completo de tubos e perfis com suas larguras de fita (blanks) e demandas planejadas.
- **Relatório de Perdas e Sobras**: Indicadores de refilos gerados, peso residual e rendimento de aço.
- **Exportação Consolidada**: Botão para exportar todos os relatórios em pasta de trabalho Excel única com múltiplas abas.

---

### 📁 6. TELA 6 — Gestão de Dados & Importador Excel
Flexibilidade total para gerenciar o catálogo e o estoque de materiais:
- **Importador Excel (.xlsx / .xls)**: Upload drag-and-drop para importação de novas planilhas de estoque de bobinas e de produtos/demanda.
- **Cadastro Rápido**: Formulários para inserção avulsa de novas bobinas ou novos produtos e blanks.
- **Painel Firebase**: Monitor de conectividade com a nuvem, sincronização forçada e persistência offline transparente em LocalStorage/IndexedDB.
- **Restauração de Fábrica**: Botão de restauração para a base de dados original consolidada das planilhas industriais.

---

## 🧮 Motor Matemático de Otimização & Fórmulas

### 1. Aproveitamento e Perdas
$$\text{Aproveitamento (\%)} = \left( \frac{\sum_{i=1}^{n} w_i}{W_{\text{bobina}}} \right) \times 100$$

$$\text{Perda / Refilo (\%)} = \left( \frac{\text{Sobra (mm)}}{W_{\text{bobina}}} \right) \times 100$$

### 2. Distribuição Proporcional de Peso por Fita
$$P_{\text{fita } i} = P_{\text{bobina}} \times \left( \frac{w_i}{W_{\text{bobina}}} \right)$$

### 3. Rendimento Linear Estimado (Metros)
$$L_i = \frac{P_{\text{fita } i} \times 1000}{\rho_{\text{linear}} \text{ (kg/m)}} \quad \text{onde} \quad \rho_{\text{linear}} \approx \frac{w_i \times e \times 7.85}{1000}$$

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Descrição |
|---|---|---|
| **Linguagem & Tipagem** | TypeScript 5.6+ | Tipagem estrita de entidades metalúrgicas, bobinas, fitas e ordens de slitter |
| **Framework Web** | React 18.3+ • Vite 6 | Renderização reativa de alto desempenho e recálculo instantâneo de cortes |
| **Estilização & UI** | Tailwind CSS 3.4 • Lucide Icons | Design industrial escuro moderno com glassmorphism e texturas metálicas |
| **Gráficos & Visualização** | Recharts 2.15 • Canvas Confetti | Gráficos de barras, rosca e área para KPIs e comemoração de sobra zero |
| **Planilhas & Dados** | SheetJS (XLSX 0.18+) | Parser e gerador nativo de planilhas Excel `.xlsx` e `.xls` |
| **Banco de Dados & Nuvem** | Firebase Firestore (`slitterpcp`) | Sincronização em nuvem com arquitetura offline-first resiliente |
| **Algoritmo de Corte** | Mochila Combinatória / Cutting Stock | Otimizador com priorização estrita de refilo padrão entre $10\text{ a }18\text{ mm}$ ($\approx 1,5\%$) |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js versão **18.x** ou superior
- Gerenciador de pacotes **npm** ou **yarn**

### 1. Clonar o repositório
```bash
git clone https://github.com/arthurbrito-pjt/Portal-de-Planejamento-PCP.git
cd Portal-de-Planejamento-PCP
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Executar o servidor de desenvolvimento
```bash
npm run dev
```
> O portal será aberto automaticamente no navegador em: `http://localhost:3000`

### 4. Compilar para produção
```bash
npm run build
```

### 5. Visualizar o build de produção localmente
```bash
npm run preview
```

---

## 📁 Estrutura de Diretórios do Projeto

```
Portal-de-Planejamento-PCP/
├── index.html                     # Ponto de entrada HTML com fontes Inter e JetBrains Mono
├── package.json                   # Dependências e scripts de execução do projeto
├── tsconfig.json                  # Configuração do compilador TypeScript
├── vite.config.ts                 # Configuração do Vite e servidor de desenvolvimento
├── tailwind.config.js             # Design tokens, cores de aço e gradientes industriais
├── postcss.config.js              # Pipeline PostCSS e Autoprefixer
├── src/
│   ├── main.tsx                   # Ponto de entrada React DOM
│   ├── App.tsx                    # Roteador principal de abas e gerenciador de estado global
│   ├── index.css                  # Estilos globais Tailwind, scrollbars e texturas metálicas
│   ├── firebase/
│   │   ├── config.ts              # Inicialização do Firebase com credenciais do projeto slitterpcp
│   │   └── firestoreService.ts    # Operações Firestore de bobinas, produtos e histórico de cortes
│   ├── types/
│   │   └── pcp.ts                 # Modelos TypeScript (Product, Coil, SlitterStrip, SlitterOrder, KPIs)
│   ├── data/
│   │   └── initialData.ts         # Base de dados inicial consolidada dos 7 arquivos Excel
│   ├── services/
│   │   ├── slitterOptimizer.ts    # Motor de otimização combinatória de cortes no Slitter
│   │   ├── excelService.ts        # Importador e exportador de planilhas Excel (SheetJS)
│   │   └── storageService.ts      # Persistência híbrida LocalStorage + sincronização Firestore
│   ├── components/
│   │   ├── Navbar.tsx             # Topbar com status da nuvem Firebase e botão de sincronização
│   │   ├── Sidebar.tsx            # Menu de navegação lateral com atalhos para os módulos
│   │   ├── SlitterVisualizer.tsx  # Visualizador gráfico interativo do corte transversal da bobina
│   │   ├── CoilCard.tsx           # Cartão interativo para seleção de lotes de bobina
│   │   └── MetricsBadge.tsx       # Badges de aproveitamento, sobras e status
│   └── views/
│       ├── DashboardView.tsx      # TELA 1: Painel Executivo PCP com KPIs e Gráficos
│       ├── PlanningView.tsx       # TELA 2: Planejamento de Produção em 6 Passos (Wizard)
│       ├── SimulationView.tsx     # TELA 3: Estúdio de Simulação e Ajuste Fino Slitter
│       ├── SlitterOrderView.tsx   # TELA 4: Resultado Final, Emissão de OS e Impressão
│       ├── ReportsView.tsx        # TELA 5: Relatórios de Consumo, Produtos e Perdas
│       └── DataManagementView.tsx # TELA 6: Gestão de Estoque e Importador Excel
```

---

<div align="center">

**Portal de Planejamento PCP — Slitter de Bobinas**  
Desenvolvido para **Setor Projetos - Logística** • 2026

</div>
