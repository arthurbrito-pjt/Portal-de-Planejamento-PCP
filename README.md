# 🏭 Portal de Planejamento PCP (Planejamento e Controle da Produção)
### ⚡ Otimização do Consumo de Bobinas no Processo de Slitter

Aplicação web completa desenvolvida para o planejamento de produção de **tubos industriais e perfis estruturais** a partir de bobinas de aço, passando pelo processo de corte longitudinal (**Slitter**), maximizando o aproveitamento da largura da bobina e garantindo a regra de negócio de **sobra máxima permitida de 10 mm**.

---

## 🎯 Principais Funcionalidades

### 📊 TELA 1 – Dashboard PCP
- **Estoque de Bobinas Disponíveis**: visualização do total de lotes, peso em toneladas e distribuição gráfica por espessura e largura.
- **Produções Planejadas**: acompanhamento de demandas prioritárias para Tubos e Perfis.
- **Eficiência e Aproveitamento Médio**: taxa histórica com meta de \( \ge 99.0\% \).
- **Controle de Perdas / Refilo**: monitoramento contínuo de sobras e refilos gerados.
- **Alertas de PCP**: identificação automática de déficits de matéria-prima.

### 🧭 TELA 2 – Planejamento de Produção (Fluxo Guiado em 6 Passos)
1. **Passo 1**: Seleção do produto final a produzir (tubo redondo, quadrado, retangular ou perfil U).
2. **Passo 2**: Informação da quantidade desejada em toneladas.
3. **Passo 3**: Localização automática de bobinas compatíveis e lotes disponíveis no estoque por espessura.
4. **Passo 4**: Seleção do lote específico da bobina.
5. **Passo 5**: Cálculo imediato de quantas fitas do produto principal cabem na bobina e cálculo da sobra resultante.
6. **Passo 6**: Se a sobra for superior a 10 mm, o **motor de otimização combinatória** sugere automaticamente combinações com produtos complementares de mesma espessura para preencher a sobra, priorizando soluções com **sobra entre 0 e 10 mm** (até 100% de aproveitamento).

### ✂️ TELA 3 – Estúdio de Simulação de Corte Slitter
- Representação gráfica realista do corte transversal da bobina (ex: `|240|240|240|240|240|50|`).
- Réguas milimétricas, cores distintas por produto, cálculo proporcional do peso de cada fita e rendimento linear em metros.
- Ajuste fino interativo com ferramentas para adicionar/remover fitas em tempo real.

### 📋 TELA 4 – Resultado Final do Planejamento & Ordem de Slitter (OS)
- Resumo da Bobina (Código, Lote, Peso original, Largura, Aproveitamento %).
- Sequência oficial de facas e fitas para o operador de máquina no chão de fábrica.
- **Exportação para Excel (.xlsx)** formatado para impressão e arquivo.
- **Impressão direta da Ordem de Produção (PDF / Chão de fábrica)**.
- Gravação direta no Firebase Firestore e no banco de dados local.

### 📈 TELA 5 – Relatórios Gerenciais & Histórico
- Relatório de Planejamento por Bobina e por Produto.
- Balanço de consumo de matéria-prima e histórico de ordens liberadas.
- Análise de perdas e sobras com exportação consolidada em Excel.

### 📁 TELA 6 – Gestão de Dados & Importador Excel
- Importação drag-and-drop de arquivos Excel (`.xlsx`, `.xls`) para atualizar estoque de bobinas e demandas.
- Cadastro manual de novas bobinas e novos produtos/blanks.
- Painel de monitoramento e sincronização com o Firebase Firestore.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons
- **Visualização de Dados**: Recharts + Canvas Confetti
- **Processamento de Planilhas**: SheetJS (XLSX)
- **Persistência & Nuvem**: Firebase Firestore (`slitterpcp`) + LocalStorage / IndexedDB com suporte a modo offline resiliente

---

## 🚀 Como Executar o Projeto

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Executar em modo de desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Compilar para produção**:
   ```bash
   npm run build
   ```

4. **Visualizar build de produção**:
   ```bash
   npm run preview
   ```

---

## 📦 Repositório Oficial
- GitHub: [https://github.com/arthurbrito-pjt/Portal-de-Planejamento-PCP.git](https://github.com/arthurbrito-pjt/Portal-de-Planejamento-PCP.git)
