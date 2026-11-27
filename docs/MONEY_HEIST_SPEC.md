# La Casa de Papel — O Assalto

27 de novembro de 2026. A Fase 03 partiu do commit consolidado `2e84d2b` em `codex/la-casa-de-papel-dark`. O Vite atende por loopback na porta 5177. A worktree de Rick and Morty manteve sua execução independente na porta 5176. [Portfólio](http://127.0.0.1:5177/) · [Astra completa](http://127.0.0.1:5177/chat)

## Tema e superfícies

O seletor existente continua oferecendo 15 temas. `midnight-pink`, `obsidian-gold` e `grafite-coral` migram diretamente para `la-casa-de-papel-dark` no bootstrap, no provider e na validação das ações da Astra. O nome é La Casa de Papel — O Assalto em português e Money Heist — The Heist em inglês.

| Uso | Cor |
| --- | --- |
| Fundo, superfície e cartões | `#080808`, `#141414`, `#202020` |
| Primária, realce visual e vermelho profundo | `#D90416`, `#FF1734`, `#780B14` |
| Texto principal e secundário | `#F1EEE8`, `#A6A6A6` |
| Borda decorativa, detalhes, sombra e neutro | `#4D151B`, `#C9B99A`, `#030303`, `#777777` |
| Texto de realce, borda interativa e foco | `#FF6477`, `#87777A`, `#FF96A2` |

A hero usa o enquadramento noturno da Casa da Moeda, com a fachada preservada por pontos focais CSS e degradês distintos em celular e desktop. A mesma linguagem de cartões grafite, bordas e texto papel percorre o portfólio e as ferramentas da Astra. As regras se aplicam às seções existentes, inclusive cartões de projeto, laboratório, métricas, contato e rodapé. Os estilos dos dossiês ficam preparados para os componentes existentes. O Arcade mantém as cores semânticas de cada jogo sobre a superfície temática, e o tabuleiro de replay usa bronze claro e vinho. A análise e os motores continuam compartilhados.

A grade e a largura do card seguem os mesmos breakpoints do tema Escuro. A escala do nome é compartilhada pela família La Casa de Papel e serve de referência para O Plano. O Assalto mantém caixa alta, faixa vermelha e o enquadramento de 425:500 do PhotoReveal.

| Viewport | Fonte do nome antes → depois | Largura do card antes → depois | Card do tema Escuro |
| --- | --- | --- | --- |
| 375 × 844 | 61 → 49 px | 316 → 343 px | 343 px |
| 768 × 1024 | 72,19 → 57,75 px | 249,84 → 380 px | 380 px |
| 1024 × 900 | 96,26 → 77 px | 316 → 357,44 px | 357,44 px |
| 1440 × 810 | 135,36 → 108,29 px | 316 → 340 px | 340 px |
| 1920 × 946 | 138 → 110 px | 316 → 437,16 px | 437,16 px |

Em nove viewports no Chrome, a diferença entre os centros verticais ficou em até 0,02 px no layout de duas colunas. No empilhado, o card fica centralizado abaixo do texto. A alternância das fotos manteve a geometria do quadro e o rastro foi verificado antes e depois de redimensionar a janela.

A máscara do cabeçalho abre uma sequência de 2,65 s com obturadores CSS, varredura vermelha, fachada e dissolução para a hero. O botão e Escape pulam a sequência. O fechamento devolve o foco ao acionador. A abertura automática funciona uma vez por sessão no portfólio. Com movimento reduzido, a máscara abre um quadro estático descartável. O Registro da operação revela atalhos para o catálogo de projetos e para o laboratório. As interações são locais e a abertura é silenciosa.

| Superfície | Persona | Identidade |
| --- | --- | --- |
| Compacta | `berlin` | Berlim / Berlin. Respostas breves, precisas e corteses |
| Completa | `professor` | Professor / The Professor. Explicações metódicas sob demanda e acesso ao Arcade |

A seleção usa o mesmo resolvedor e as mesmas ferramentas da Astra. Cada mensagem mantém o autor imutável. Nome, saudação, resposta de identidade, avisos, avatar e sugestões usam os catálogos PT/EN e o ID estável da mensagem. O servidor resolve a combinação permitida a partir do tema e da superfície. Dimensões continuam associadas a Rick. Perguntas diretas de identidade passam pela API local com resposta determinística.

## Mídia e reprodução

| Caminho local | Uso |
| --- | --- |
| `public/la-casa-de-papel/dark-background.webp` | Casa da Moeda, 1600 × 900. Hero e abertura |
| `public/la-casa-de-papel/dali-mask-header.png` | Ícone transparente da máscara. Símbolo vetorial de interface na falha |
| `public/la-casa-de-papel/avatar-berlin.webp` | Conversa compacta |
| `public/la-casa-de-papel/avatar-professor.webp` | Conversa completa |
| `public/perfil-foto.jpeg` | Retrato profissional versionado |
| `public/la-casa-de-papel/masked-portrait-candidate.webp` | Alternativa autorizada para o Vite em loopback |

Os arquivos com direitos de distribuição pendentes estão disponíveis localmente, fora dos commits. A worktree também recebeu seis mídias já usadas pelo código consolidado de Rick and Morty. As cópias foram conferidas por SHA-256 e o servidor entregou as 13 mídias públicas verificadas sem divergência. Para reproduzir a demonstração em outro checkout, providenciar os mesmos arquivos locais e instalar com `npm ci`. A fotografia mascarada definitiva e a liberação de publicação das artes são pendências. [Recortes e fallback](HEIST_PORTRAIT_HANDOFF.md)

## Validação

- A suíte principal passou com 131 testes: 128 reproduzidos no export limpo de `2e84d2b` e três novos casos de migração, personas e PhotoReveal. O handoff histórico cita 130 para a Fase 02.1. A contagem aqui se refere à execução do commit versionado. A suíte isolada da Astra passou com 16 testes.
- Build temporário, typecheck do portal, importação do handler e `git diff --check` passaram. O aviso preexistente de chunks acima de 500 kB permanece. O build local transformou 2.281 módulos, ante 2.276 na base. O JS inicial passou de 120,99 a 126,56 kB gzip e o CSS inicial de 42,73 a 45,61 kB gzip.
- Chrome em 375, 390, 768, 1024, 1440 e 1920 px conferiu cabeçalho, portfólio, projetos, laboratório, retrato, Astra compacta e completa, Arcade com cinco jogos e tabuleiro PGN. Também foram verificados menu mobile, foco devolvido, seleção e persistência, entrada direta em `/chat`, registro e laboratório, textura de fundo e ausência de overflow observado nas superfícies medidas.
- A API local respondeu as identidades em PT. O histórico mostrou as mesmas mensagens e avatares de Berlim e Professor ao alternar para EN, abrir a versão completa e mudar o tema. Os testes isolados cobrem cancelamento, respostas tardias, laboratório e dimensões de Rick com simulação de provedores.
- Contraste calculado nos pares sólidos de referência: texto principal e superfície 15,91:1, texto secundário e cartão 6,69:1, texto branco e botão primário 5,28:1, borda interativa e cartão 3,84:1, foco e superfície 8,89:1. A inspeção de mídia e toque usou navegador com emulação. Dispositivos físicos, leitor de tela, auditoria completa de contraste e Gemini real estão fora da amostra.

## Alterações para a integração

| Área | Arquivos |
| --- | --- |
| Tema e primeira pintura | `index.html`, `src/data/themes.js`, `src/data/heistThemes.js`, `src/themes.css`, `src/heist.css`, `src/main.jsx`, `ThemeWaves.jsx`, `ThemedFavicon.jsx` |
| Abertura e retrato | `src/components/heist/`, `PhotoReveal.jsx`, `PortfolioIntro.jsx`, `Navbar.jsx`, `PortfolioPage.jsx` |
| Astra | `ChatPage.jsx`, `AstraEntrance.jsx`, `DesignSystemCard.jsx`, `AssistantAppearanceContext.jsx`, `assistantPersonas.js`, `server/assistantPersona.js`, `api/chat.js`, `server/portfolioTools.js`, `portfolioActions.js`, catálogos PT/EN |
| Validação e handoff | `tests/heist.test.mjs`, `tests/heist-photo-reveal.jsx` e documentos de tema, retrato e sessão |

A leitura simultânea da Fase 02.2 identificou alterações compartilhadas em `ChatPage.jsx`, `src/i18n/pt.json`, `src/i18n/en.json` e `docs/SESSION_HANDOFF.md` nos commits, e em `api/chat.js`, `Navbar.jsx` e `PortfolioPage.jsx` na worktree original em andamento. Na integração, manter os blocos de cada fase. Em `ChatPage`, reaplicar as chaves de apresentação e `assistantAppearance` sobre o fluxo final de Rick. Em `api/chat.js`, conservar a busca por catálogo da persona nas respostas determinísticas. No cabeçalho e na hero, manter as condições de cada tema. Nos catálogos, combinar as chaves de ambas as fases. Reexecutar a matriz após a aprovação das duas tarefas.

| Commit | Entrega |
| --- | --- |
| `ac41ba4` | Paleta, migração e infraestrutura do tema |
| `e66c93d` | Personas e integração com o contrato compartilhado da Astra |
| `260bc41` | Cabeçalho, abertura procedural e retratos alinhados |
| `1431c8e` | Seções, ferramentas, registro e ajustes responsivos |
| Commit que contém este documento | Testes e handoff da Fase 03 |

## Próxima fase — O Plano

A família de temas reconhece `la-casa-de-papel-light` na infraestrutura. A variante entra no registro e na primeira pintura quando substituir Quartzo Framboesa. A máscara consulta as opções realmente registradas antes de liberar alternância. O Plano reaproveitará Berlim, Professor, PhotoReveal, traduções e o tratamento de movimento reduzido, com o fundo diurno existente. A implementação visual de O Plano aguarda a aprovação de O Assalto.
