# Warframe Vault

## Descrição

Warframe Vault é uma plataforma de planejamento e organização de progressão para jogadores de Warframe. Ela transforma dados públicos em ferramentas para planejar farms, organizar objetivos e acompanhar a evolução pessoal.

O projeto não substitui a Wiki oficial nem o Warframe Market. O catálogo é apenas um dos módulos do Vault: o foco é reunir planejamento, roadmaps e conhecimento de forma prática.

## Funcionalidades

Implementadas:

- Catálogo de Warframes, armas, mods e relíquias
- Pesquisa e filtros, incluindo relíquias vaulted
- Theme Engine inspirado na estética dos mods
- Roadmap Editor com dependências e modo de visualização
- Asset Picker e detalhes de itens
- Dashboard de farms ativos e progresso
- Tags, notas pessoais e status de progresso
- Importação e exportação de roadmaps em JSON
- Idioma dos dados da API e fallback para inglês

Em desenvolvimento:

- Build Planner e Farm Planner
- Collection/Progress Tracker
- Checklist inteligente
- Compartilhamento avançado de roadmaps
- Sincronização em nuvem
- Ferramentas para clãs

## Arquitetura

```text
Pages / Components
        ↓
Hooks
        ↓
WarframeRepository
        ↓
WarframeCache + LanguageResolver + WarframeMapper
        ↓
WarframeApi
        ↓
WFCD API
```

- **WarframeApi**: comunicação HTTP com a API pública.
- **LanguageResolver**: aplica idioma selecionado e fallback para inglês.
- **WarframeMapper**: converte respostas heterogêneas em um modelo interno consistente.
- **WarframeCache**: persiste resultados por idioma no LocalStorage como otimização.
- **WarframeRepository**: único ponto de entrada de dados para hooks e telas.

## Estrutura do projeto

```text
src/
├── components/       # Componentes visuais e de roadmap
├── hooks/            # Hooks de estado e acesso aos dados
├── pages/            # Telas da aplicação
├── services/
│   └── warframe/     # API, cache, mapper, idioma e repositório
└── lib/              # Utilitários e armazenamento local
```

## Como executar

Pré-requisito: Node.js LTS e npm.

```bash
npm install
npm run dev
```

Para criar a versão de produção:

```bash
npm run build
```

Para verificar o código:

```bash
npm run lint
```

## Fonte dos dados

Os dados oficiais utilizados pelo projeto são fornecidos pela API pública do [WFCD — Warframe Community Developers](https://api.warframestat.us/).

## Roadmap

- Melhorias no Roadmap Editor
- Build Planner
- Farm Planner
- Collection Tracker e Progress Tracker
- Checklist inteligente
- Compartilhamento de roadmaps
- Sincronização em nuvem
- Ferramentas para clãs

## Contribuição

Contribuições são bem-vindas. Faça um fork, crie uma branch com sua alteração, execute `npm run lint` e `npm run build`, e envie uma pull request descrevendo o contexto da mudança.

## Licença

A licença do projeto será definida antes da primeira publicação pública. Até lá, não reutilize o código ou os ativos fora do contexto de contribuição ao projeto sem autorização.

## Support Me

> Espaço reservado para links, QR Codes e informações de apoio que serão preenchidos manualmente.

- Patreon: _a preencher_
- LivePix: _a preencher_
- Buy Me a Coffee: _a preencher_