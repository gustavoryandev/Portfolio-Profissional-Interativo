# La Casa de Papel — O Assalto e O Plano

27 de novembro de 2026. A Fase 03 partiu do commit consolidado `2e84d2b` em `codex/la-casa-de-papel-dark`. O Vite atende por loopback na porta 5177. A worktree de Rick and Morty manteve sua execução independente na porta 5176. [Portfólio](http://127.0.0.1:5177/) · [Astra completa](http://127.0.0.1:5177/chat)

> Registro histórico da Fase 03. Estados de worktree, portas, validação e integração abaixo referem-se àquela sessão; o estado de assets posterior está resumido na seção atualizada adiante e em [ASSETS_PENDENTES.md](ASSETS_PENDENTES.md).

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

A grade, a largura e o espaçamento interno do card seguem os mesmos breakpoints do tema Escuro. A escala do nome é compartilhada pela família La Casa de Papel e serve de referência para O Plano. O Assalto mantém caixa alta e faixa vermelha. O retrato original inteiro ocupa a largura interna na proporção natural de 572:777. [Enquadramento e alinhamento](HEIST_PORTRAIT_HANDOFF.md)

| Viewport | Fonte do nome antes → depois | Largura do card antes → depois | Card do tema Escuro |
| --- | --- | --- | --- |
| 375 × 844 | 61 → 49 px | 316 → 343 px | 343 px |
| 768 × 1024 | 72,19 → 57,75 px | 249,84 → 380 px | 380 px |
| 1024 × 900 | 96,26 → 77 px | 316 → 357,44 px | 357,44 px |
| 1440 × 810 | 135,36 → 108,29 px | 316 → 340 px | 340 px |
| 1920 × 946 | 138 → 110 px | 316 → 437,16 px | 437,16 px |

Em nove viewports no Chrome, a diferença entre os centros verticais ficou em até 0,02 px no layout de duas colunas. No empilhado, o card fica centralizado abaixo do texto. A alternância das fotos manteve a geometria do quadro e o rastro foi verificado antes e depois de redimensionar a janela.

A abertura de O Assalto usa uma sequência de 2,65 s com obturadores CSS, varredura vermelha, fachada e dissolução para a hero. O botão e Escape pulam a sequência. O fechamento devolve o foco ao acionador. A abertura automática funciona uma vez por sessão no portfólio. Com movimento reduzido, o comando de reprise abre um quadro estático descartável. O Registro da operação revela atalhos para o catálogo de projetos e para o laboratório. As interações são locais e a abertura é silenciosa.

| Superfície | Persona | Identidade |
| --- | --- | --- |
| Compacta | `berlin` | Berlim / Berlin. Respostas breves, precisas e corteses |
| Completa | `professor` | Professor / The Professor. Explicações metódicas sob demanda e acesso ao Arcade |

A seleção usa o mesmo resolvedor e as mesmas ferramentas da Astra. Cada mensagem mantém o autor imutável. Nome, saudação, resposta de identidade, avisos, avatar e sugestões usam os catálogos PT/EN e o ID estável da mensagem. O servidor resolve a combinação permitida a partir do tema e da superfície. Dimensões continuam associadas a Rick. Perguntas diretas de identidade passam pela API local com resposta determinística.

## Mídia e reprodução

| Caminho local | Uso |
| --- | --- |
| `public/la-casa-de-papel/dark-background.webp` | Casa da Moeda noturna, 1600 × 900. Hero e abertura |
| `public/la-casa-de-papel/light-background.webp` | Casa da Moeda diurna, 1600 × 900. Hero e abertura |
| `public/la-casa-de-papel/dali-mask-header.png` | Ícone transparente da máscara. Símbolo vetorial de interface na falha |
| `public/la-casa-de-papel/avatar-berlin.webp` | Conversa compacta |
| `public/la-casa-de-papel/avatar-professor.webp` | Conversa completa |
| `public/perfil-foto.jpeg` | Retrato profissional versionado |
| `public/la-casa-de-papel/perfil-foto-reveal.webp` | Fotografia mascarada definitiva, versão sem perdas de 1076 × 1462 |

**Estado registrado na Fase 03, em 27 de novembro de 2026:** os arquivos com direitos de distribuição pendentes estavam disponíveis localmente, fora dos commits. A worktree também recebeu seis mídias já usadas pelo código consolidado de Rick and Morty. As cópias foram conferidas por SHA-256 e o servidor entregou as 13 mídias públicas verificadas sem divergência. Para reproduzir aquela demonstração em outro checkout, era necessário providenciar os mesmos arquivos locais e instalar com `npm ci`. [Recortes e fallback](HEIST_PORTRAIT_HANDOFF.md)

**Estado após a integração, em 28 de novembro de 2026:** os caminhos da tabela para fundos, máscara, personas e fotografia de revelação estão versionados e referenciados pelo runtime. A fotografia `perfil-foto-reveal.webp` é usada por `HeistPortrait.jsx`/`PhotoReveal`; os avatares e a máscara são configurados em `heistThemes.js`. A existência no Git e o uso no código não resolvem a pendência de direitos de distribuição; confirmar a autorização aplicável antes de publicar esses arquivos.

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

## Fase 04 — O Plano

O Plano ocupa o slot de Quartzo Framboesa, com migração direta de `quartzo-framboesa` para `la-casa-de-papel-light` no HTML e nas ações da Astra. As duas variantes passam pelo seletor existente de quinze temas. O Plano é Money Heist — The Plan em inglês.

| Uso | Cor |
| --- | --- |
| Fundo e superfície | `#F2EEE5`, `#FFFDF7` |
| Primária e realce | `#B50920`, `#D90416` |
| Texto e texto secundário | `#24201D`, `#756A60` |
| Borda, documento e sombra | `#D4C8B6`, `#E5D8C3`, `#B9AA96` |
| Borda interativa e foco | `#8F7965`, `#9B0920` |

A Casa da Moeda diurna fica atrás da hero. As demais seções usam superfícies claras. As duas variantes mantêm a mesma grade, composição tipográfica e dimensões do card. O componente compartilhado `HeistPortrait` usa a fotografia profissional e o WebP definitivo sem reconstruir o rastro ou a lógica de interação.

A máscara alterna as variantes no cabeçalho. A seleção mantém a rota, a âncora de seção e as conversas. O Caderno de planejamento reúne os atalhos existentes e o botão de reprise da abertura. O Assalto também oferece a reprise no Registro da operação. A abertura de O Plano traça linhas de planta em papel, revela a Casa da Moeda e termina em 2,65 s. Escape e o botão de pular funcionam em ambas. Com movimento reduzido, a seleção é imediata e a reprise exibe um quadro estático.

A Astra usa as identidades existentes `berlin` e `professor`. O estilo claro se estende ao painel compacto, à mesa de planejamento da Astra completa, aos cards, ao laboratório, ao contato, ao Arcade e ao tabuleiro. Os componentes de dossiês mantêm a disponibilidade anterior e já têm cores para a superfície clara.

### Validação da Fase 04

- Passaram 132 testes principais e 17 isolados da Astra, build temporário, typecheck do portal, importação do handler e `git diff --check`. O build mantém o aviso de chunks acima de 500 kB.
- O Chrome conferiu 375, 390, 768, 1024, 1440 e 1920 px, com toque emulado nas larguras móveis. O teste mediu as mesmas dimensões de card e retrato nos dois modos, verificou a seção preservada na alternância e exercitou navegação mobile, laboratório, Astra nas duas superfícies, os cinco jogos do Arcade e replay PGN.
- Foram conferidos migração na entrada direta de `/chat`, persistência após recarga, favicon, seletor com 15 opções, inglês, abertura com animação e reprise estática com retorno do foco. O Canvas foi exercitado a 390 e 1440 px nas duas variantes. A API local respondeu as duas identidades, que se mantiveram no histórico após a alternância. O teste isolado cobre a troca durante o streaming.
- Contraste dos pares sólidos em O Plano: texto e superfície 15,89:1, secundário e fundo 4,55:1, branco e botão primário 6,94:1, borda interativa e superfície 4,06:1, foco e fundo 7,39:1. A amostra usa navegador emulado e respostas determinísticas do endpoint local. Aparelhos físicos, leitor de tela e conversas abertas com Gemini ficam fora dessa amostra.

Checkpoint local em `codex/checkpoint-la-casa-light-ac71231`. Os quatro commits de implementação são `c241003`, `3f0ed18`, `76db0e8` e `f5ef07f`. Para a integração posterior, conferir `src/i18n/pt.json`, `src/i18n/en.json`, `tests/isolated/astra-streaming.test.mjs` e `docs/SESSION_HANDOFF.md`, que também aparecem na linha da Fase 02.2. `HeistExperience.jsx` concentra a alternância e a abertura. `heist-light.css` concentra o visual claro. O retrato e o catálogo de personas permanecem compartilhados.
