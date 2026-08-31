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

## Estilo de código

- TypeScript com tipos explícitos; união de strings literais para variantes (`'BAIXO' | 'MEDIO' | 'ALTO'`), não `enum`.
- Tailwind CSS utilitário inline nas classes; sem CSS-in-JS.
- Sem comentários explicando "o quê" — só quando a razão não é óbvia.
- Textos de UI em português (pt-BR).

## Arquivos a não ler por padrão

Planilhas `.xlsx`/`.xls` na raiz são dados de referência de origem (não documentação) e não devem ser abertas a menos que a tarefa peça explicitamente para analisar seu conteúdo.
