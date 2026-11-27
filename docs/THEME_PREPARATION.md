# Especificacao tecnica de paletas futuras

27 de novembro de 2026. Preparacao exclusivamente documental para a dimensao Beyond the Curve e os temas La Casa de Papel Dark/Light. Nenhum tema, componente, traducao, asset, persona ou estilo de producao foi alterado.

Esta especificacao usa a arquitetura e o checkout local como fonte primaria. Alguns relatorios anteriores sao fotografias historicas: em especial, a indisponibilidade dos assets registrada antes da importacao V11.2 foi superada. O inventario atual e [ASSET_IMPORT_V11_2_REPORT.md](ASSET_IMPORT_V11_2_REPORT.md).

## 1. Resumo da arquitetura atual

### Registro, tokens e primeira pintura

- [themes.js](../src/data/themes.js) registra 15 temas, seis claros e nove escuros. Os ids alimentam `ThemeContext`, seletor e a allowlist derivada de `theme.set` em [portfolioActions.js](../src/services/portfolioActions.js). `themePalettes` e alias do proprio array. Um tema customizado tem `name`; um claro tem `light: true`.
- [themes.css](../src/themes.css) declara as paletas customizadas sob `--palette-*` e as mapeia para os tokens semanticos usados pelo portfolio e pela Astra. Os tokens centrais sao `--page`, `--panel`, `--panel-soft`, `--primary`, `--primary-hover`, `--on-primary`, `--accent`, `--ink`, `--muted`, `--line`, `--brand-400`, `--brand-500`, `--glass-tint`, `--glass-alpha`, `--surface`, `--surface-border`, `--surface-text`, `--surface-heading`, `--scrollbar-*` e `--wave-*`.
- [index.css](../src/index.css) define os tokens dos temas claro/escuro originais, controles, scrollbar, superficie de vidro, sombras, estados `--win`/`--loss`, `--on-accent` e tipografia mono. O token `--focus-ring` e definido em `themes.css`.
- [tailwind.config.js](../tailwind.config.js) usa `darkMode: 'class'` e expoe `page`, `panel`, `panel-soft`, `line`, `ink`, `muted`, `accent`, `brand-400`, `brand-500`, `win` e `loss`. Nao existe uma cor Tailwind generica `primary`; componentes com Tailwind usam os tokens existentes por classes ou `var(...)`.
- [index.html](../index.html) aplica `data-theme`, a classe `.dark`, `data-custom-theme` e o estado dimensional antes da primeira pintura. O mesmo mapa de aliases precisa existir em [themes.js](../src/data/themes.js) e no script do HTML. [ThemeContext.jsx](../src/context/ThemeContext.jsx) valida o tema, atualiza os atributos/classes e grava `theme` e `rick-morty-dimension` no localStorage.
- A preferencia principal persistida e `localStorage.theme`; a dimensao Rick usa `localStorage.rick-morty-dimension`. Outros estados Rick de efeitos/exploracao tem chaves proprias. `ThemeSelector` lista os temas registrados e filtra `hidden`; a contagem vem desse array.
- A classificacao clara/escura controla Tailwind, `color-scheme`, scrollbar e regras CSS. Para os temas escuros novos, `index.html` precisa reconhecer o id no conjunto escuro. Light precisa ser reconhecido no conjunto claro. Nao basta adicionar regras em `themes.css`.

### Dimensoes Rick e Astra

- `rick-morty` e um unico tema selecionavel; Garagem `lab` e Cidadela `corrupted` sao dimensoes internas, nao dois temas. [dimensions.css](../src/dimensions.css) troca a paleta da Cidadela por `data-dimension`; [ThemeContext.jsx](../src/context/ThemeContext.jsx) restaura somente `lab` ou `corrupted` hoje.
- `crossDimension` em `ThemeContext` alterna entre dois destinos. [DimensionPortal.jsx](../src/components/DimensionPortal.jsx) tambem interpreta apenas Garagem/Cidadela. [portalConfig.ts](../src/components/rick/portal/portalConfig.ts) define portais verdes e cianos; `DimensionalPortal.tsx` os desenha e tem niveis de qualidade. O preloader [sceneAssets.js](../src/components/rick/sceneAssets.js)/[SceneBackdrop.jsx](../src/components/rick/SceneBackdrop.jsx) ainda conhece as cenas atuais.
- `beyond-curve` e uma nova dimensao dentro de `rick-morty`, nao um id adicional no seletor. O plano preve acesso inicial pela chave secreta reconhecida pela Astra. Manter a entrada protegida e usar destinos dimensionais explicitos; nao converter a chave em tema ou em uma opcao convencional.
- A paleta de tema e global e atende Astra compacta e completa; a identidade/persona e resolvida separadamente em [assistantPersonas.js](../src/data/assistantPersonas.js) e [AssistantAppearanceContext.jsx](../src/context/AssistantAppearanceContext.jsx). Atualmente o resolver aceita apenas `lab`/`corrupted`; os IDs e imagens novos nao estao integrados. Para La Casa, a especificacao de personas exige Berlin compacta e Professor completa.
- [ThemedFavicon.jsx](../src/components/ThemedFavicon.jsx) ja le `--panel`, `--line`, `--ink` e `--accent` calculados, sem mapa de cores manual.

### Integracao e excecoes de cores fixas

A maioria das superficies compartilha tokens; ha excecoes que a futura implementacao deve preservar ou revisar de forma pontual:

| Area | Implementacao observada | Consequencia para a paleta |
| --- | --- | --- |
| Header e menu mobile | Reutilizam tokens de vidro e cores compartilhadas; os temas customizados alteram `--glass-tint`/`--glass-alpha`. | Conferir texto, controles e fundo translucido sobre a imagem; manter fallback opaco. |
| Hero, cards e formularios | Usam principalmente `--page`, `--panel`, `--ink`, `--muted`, `--line`, `--accent`, `--action-*` e `--focus-ring`. | Devem acompanhar a nova paleta sem valores por componente. |
| Dossies | O renderizador dimensional e `project-dossier.css` tem estilo de relatorio Rick; a apresentacao universal dos dossies continua pendente. | Reusar a semantica de superficie, nao codificar vermelho ou dourado no conteudo factual. |
| Chat/codigo | `MessageBubble.jsx` mantem codigo inline e blocos em `#0A0A0A`/branco; icone de erro usa classes `red-600`/`dark:red-400`. | O bloco fixo e intencionalmente neutro; testar os dois temas sem recolori-lo por reflexo. |
| Laboratorio | `CodePlayground.css` usa tokens para a interface, mas fixa os estados em execucao/concluido/erro em tons claros. | Dark e Beyond preservam bom contraste; os tres estados claros falham no fundo Light. Ver secao 5. |
| Arcade | O shell participa da interface tematizada; os desenhos SVG dos jogos em `FullArcade.jsx` usam cores fixas de objetos/cenario. | Preservar a identificacao dos jogos; tema deve afetar superfices ao redor, nao recolorir sprites automaticamente. |
| Xadrez | `ChessCard.jsx` fornece `--chess-dark-square`/`--chess-light-square` com fallback fixo e usa `--win`/`--loss`. | Testar contraste entre casas e pecas; nao depender apenas da cor para indicar jogadas/resultado. |
| Design System | `RedesignHome.css` tem tokens locais e selecao azul fixa para `.agent-dashboard`. | E uma superficie isolada; nao e um token global nem deve ser substituida sem demonstrar que pertence ao tema. |
| Sobreposicao/selection/skeleton | Nao ha token global para overlay, selection ou skeleton. Modal/backdrop, `::selection` e estados locais tem regras proprias. | Nao inventar uma familia global. Revisar regras locais somente se a paleta revelar um problema reproduzivel. |

O mapa Tailwind `dark:` responde a `.dark`, nao ao atributo `data-theme`. Os temas customizados classificam essa classe na primeira pintura. Um seletor novo sem a classificacao correta causa cores de erro/vidro e variantes Tailwind inconsistentes mesmo que os tokens `--palette-*` existam.

## 2. Paletas definitivas para especificacao

As imagens V11.2 foram visualmente consultadas: o fundo dark (1600 x 900, 210.372 bytes) mostra a Casa da Moeda em grafite/preto com pontos de luz vermelha; o fundo light (1600 x 900, 335.368 bytes) mostra pedra clara, ceu e detalhes vermelhos. Ambas sao imagens completas, sem alfa, e os direitos de distribuicao ainda precisam ser confirmados. Os codigos abaixo sao os tokens finais propostos para implementacao, nao cores extraidas por media automatica de uma cena.

### Beyond the Curve — preservar literalmente a base aprovada

| Papel/token | Valor |
| --- | --- |
| `--palette-bg` / Background | `#080B14` |
| `--palette-surface` / Surface | `#121827` |
| `--palette-primary` / Portal dourado | `#FFD700` |
| `--palette-accent` / Ciano | `#77DFFF` |
| `--palette-text` / Texto principal | `#F5F7FF` |
| `--palette-muted` / Texto secundario e muted | `#9BA8BF` |
| `--palette-border` / Separadores discretos | `#393448` |

O fundo de cena e `public/rick-assets/beyond-curve/evil-morty-mansion.webp` (1125 x 603, 143.526 bytes). `beyond-curve` nao entra no seletor. Rick Maligno e a persona compacta; Evil Morty e a completa. O amarelo identifica o portal; nao substituir o ciano da paleta.

Complementos de paleta ja compativeis com as variaveis existentes:

| Papel | Complemento |
| --- | --- |
| `--palette-on-primary` | `#101010` |
| `--palette-hover` | `#FFE34D` |
| `--palette-tint` | `18 24 39` |
| `--palette-primary-rgb` / `--palette-accent-rgb` | `255 215 0` / `119 223 255` |
| `--wave-one` / `--wave-two` / `--wave-glow` | `#FFD700` / `#77DFFF` / `#FFD700` |
| `--focus-ring` | `#FFD700` (o CSS Rick ja define o foco pela primária) |
| `--panel-soft` | Resultado existente de `color-mix(in srgb, surface, accent 5%)`: `#172232` |
| `--control-border` | Resultado existente de `color-mix(in srgb, muted 82%, panel)`: `#828EA4` |

Nao alterar nenhum dos sete valores base aprovados. A borda aprovada e deliberadamente discreta; usar `--control-border` em limites funcionais e o foco dourado em vez de clarear `--palette-border`.

### La Casa de Papel Dark

Paleta final proposta, coerente com a cena noturna e com vermelho concentrado em acao/realce:

| Papel/token | Valor |
| --- | --- |
| `--palette-bg` / Background | `#101012` |
| `--palette-surface` / Surface | `#1A191B` |
| `--palette-primary` / Vermelho de acao | `#FF5B65` |
| `--palette-on-primary` | `#25090C` |
| `--palette-accent` / Neutro quente | `#E7C8B9` |
| `--palette-text` | `#F5F1ED` |
| `--palette-muted` | `#C4B9B1` |
| `--palette-border` | `#51464A` |
| `--palette-tint` | `26 25 27` |
| `--palette-primary-rgb` / `--palette-accent-rgb` | `255 91 101` / `231 200 185` |
| `--primary-hover` | `#FF6F77`, resultado da regra atual de 12% branco nos temas customizados escuros |
| `--focus-ring` | `#EDD8CE`, resultado da mistura atual 60% accent + 40% ink |
| `--panel-soft` / `--control-border` | `#242223` / `#A59C96`, derivados pelas regras atuais |
| `--wave-one` / `--wave-two` / `--wave-glow` | `#A92531` / `#D7B5A9` / `#A92531` |
| Intensidade sugerida | `--wave-intensity: .18`; `--neon-strength: .16` |

O papel de fundo e `public/la-casa-de-papel/dark-background.webp`. Vermelho e reservado a acoes, estados e detalhes; textos corridos, superficies, bordas e ondas devem permanecer neutros. O tema toma o slot atual de `midnight-pink` quando autorizado, conservando a contagem do menu.

### La Casa de Papel Light

Versao independente em tons de papel/pedra quente; nao e uma inversao de Dark:

| Papel/token | Valor |
| --- | --- |
| `--palette-bg` / Background | `#F3EFE6` |
| `--palette-surface` / Surface | `#FFFCF6` |
| `--palette-primary` / Vermelho de acao | `#A9202D` |
| `--palette-on-primary` | `#FFFFFF` |
| `--palette-accent` / Neutro quente | `#713B35` |
| `--palette-text` | `#26211F` |
| `--palette-muted` | `#5B514B` |
| `--palette-border` | `#D4C8B8` |
| `--palette-tint` | `255 252 246` |
| `--palette-primary-rgb` / `--palette-accent-rgb` | `169 32 45` / `113 59 53` |
| `--primary-hover` | `#981D28`, resultado da regra atual de 10% preto para tema customizado claro |
| `--focus-ring` | `#53312C`, resultado da mistura atual 60% accent + 40% ink |
| `--panel-soft` / `--control-border` | `#F8F2EC` / `#79706A`, derivados pelas regras atuais |
| `--wave-one` / `--wave-two` / `--wave-glow` | `#A9202D` / `#D6B8A7` / `#B44A4F` |
| Intensidade sugerida | `--wave-intensity: .20`; `--neon-strength: .12` |

O fundo de referencia e `public/la-casa-de-papel/light-background.webp`. Light e opcional e substitui `quartzo-framboesa` somente quando for autorizado; Dark nao pode depender do registro, CSS ou arquivo de Light.

## 3. Mapeamento dos tokens usados pelo projeto

| Necessidade semantica | Token atual e uso proposto |
| --- | --- |
| Background | `--page` mapeia `--palette-bg`. |
| Surface | `--panel` mapeia `--palette-surface`; `--surface` e alias usado por alguns cards. |
| Surface soft/elevated | Nao ha `--surface-elevated`. `--panel-soft` serve a controles/selecoes sutis; superfícies elevadas reutilizam `--panel`, `--line` e sombras atuais. Nao adicionar token sem necessidade de layout comprovada. |
| Primary e hover | `--primary` mapeia `--palette-primary`; `--action-bg` e alias. `--primary-hover`/`--action-hover` ja existem e seguem mistura clara/escura; `--palette-hover` deve ser usado na dimensao Rick que ja faz override. |
| Active | Nao existe `--primary-active` global. Preservar transformacao/estado `aria-pressed` dos componentes e usar hover/foco ja existentes; nao inventar uma cor de pressed. |
| Secondary/accent | Nao ha `--secondary`; `--accent` mapeia `--palette-accent`, e `--brand-400`/`--brand-500` expoem RGB para efeitos. |
| Texto primary/secondary/muted | `--ink` mapeia `--palette-text`. `--muted` atende texto secundario e muted; `--surface-text` e alias. Nao criar dois tokens sem uma hierarquia visual que exija isso. |
| Border e hover | `--line`/`--surface-border` sao separadores. `--control-border` deriva borda forte de controles. Hover de controles usa `--accent`, `--action-bg` ou `--control-border` conforme o componente. |
| Focus | `--focus-ring`; manter outline visivel e offset do CSS atual. |
| Selection, overlay e shadow | Nao existem tokens globais. `::selection`, scrims e sombras sao regras locais; usar valores locais ponderados, nao ampliar o contrato sem evidencia. `--surface-shadow` e `--glass-shadow` ja existem nos estilos de superficie. |
| Glow/gradients | `--neon-strength`, `--wave-intensity`, `--wave-opacity`, `--wave-one`, `--wave-two`, `--wave-glow`, `--palette-gradient`; manter intensidades baixas. |
| Status | `--win`/`--loss` sao tokens usados pelo xadrez. `--bench-state` e local ao Laboratorio. Nao ha `--success`, `--warning`, `--error` ou `--info` global. |
| Disabled | Sem token semantico; controles usam `disabled` e opacidade local. Manter semantica/rotulo, sem alegar contraste para controle desativado. |
| Scrollbar | `--scrollbar-track`, `--scrollbar-thumb`, `--scrollbar-thumb-hover`, `--scrollbar-thumb-active`; paletas customizadas derivam dos tokens semanticos. Preservar `forced-colors`. |
| Skeleton | Nao foi encontrado token/componente global de skeleton. Estados de carregamento existentes usam texto ou status local. |
| Links | Texto de link e geralmente `--accent`; garantir sublinhado/foco onde a cor sozinha nao identifica interacao. |

O `glass-panel` usa fundos semitransparentes, blur de 12 px e alguns paineis de 40 px, com fallback para `--panel` e suporte a `prefers-reduced-transparency`. Nao elevar blur. O brilho interno azul fixo em `--glass-shadow` pode destoar de La Casa; so substituir por sombra neutra em uma implementacao futura e apos conferir o conjunto de paineis.

## 4. Aplicacao nas interfaces

| Componente | Dark / Light / Beyond |
| --- | --- |
| Header e menu mobile | Reusar vidro, tokens e `--focus-ring`. Dark/Beyond recebem texto claro; Light, texto escuro. Sobre fundos fotograficos, preferir fallback de superficie opaca ou camada local, sem deixar texto diretamente sobre pixels variaveis. |
| Seletor de temas | La Casa Dark substitui o slot `midnight-pink`; Light só entra quando aprovado. Swatch acompanha os tokens. Beyond e uma dimensao secreta de Rick, fora do seletor. |
| Hero e footer | `--page`, `--panel`, `--ink`, `--muted`, `--accent`; evitar contornar toda a tipografia com vermelho/dourado. |
| Fotografia pessoal | A foto atual permanece intacta. `PhotoReveal` existe sem integracao; `perfil-foto-reveal.webp` esta ausente e a candidata recebida nao alinha com o retrato atual. Nao confundir a fotografia da pessoa com o fundo La Casa. |
| Cards e dossies | `--panel`, `--panel-soft`, `--line`, `--ink`, `--muted`; manter foco, diagramas, filtros e a linguagem editorial do dossie Rick. A universalizacao de dossies e outra etapa e nao deve depender de cor. |
| Botoes e badges | `--action-bg`, `--action-hover`, `--action-text`, `--accent`; garantir cor de texto calculada com `--on-primary`. Estados ativos continuam com `aria-pressed`/estado estrutural. |
| Modais e formularios | Fundo `--panel`, texto `--ink`, campo `--panel-soft`, borda `--control-border`, foco `--focus-ring`; backdrop e local e deve ser revisto sobre imagem. |
| Astra compacta/completa | Mesmos tokens globais, sem duas paletas paralelas. Berlim compacta/Professor completa em La Casa; Rick Maligno/Evil Morty na dimensao secreta. Nome/estado devem continuar em texto; imagem nao carrega instrucoes de cor. |
| Mensagens e codigo | Bolhas usam tokens; blocos de codigo pretos/brancos sao excecao intencional. Conferir erro e links, preservar legibilidade do codigo nos tres contextos. |
| Laboratorio | Superficies/editor usam tokens. Verificar os tres estados locais do benchmark; a paleta clara precisa de cores de status escuras (secao 5). |
| Arcade | Preservar cores dos desenhos e dos objetos interativos; tematizar apenas o entorno que ja usa os tokens. |
| Xadrez | Revisar `--chess-dark-square`/`--chess-light-square` e manter `--win`/`--loss`, pecas e indicacao de movimento distinguiveis. |
| Tooltip, notificacao e loading | Superficie e texto seguem tokens; icone, texto e estado acessivel devem reforcar a mensagem, nunca comunicar sucesso/erro só por cor. |

### Fundos e scrims

Os tres fundos recebidos sao cenas completas 16:9, nao texturas planas. Para legibilidade, manter `--page` como fallback, carregar a imagem em camada decorativa e preservar um painel de conteudo suficientemente opaco. Se a composicao futura exigir um scrim local, ponto inicial para teste: Beyond `rgb(8 11 20 / .72)`, Dark `rgb(16 16 18 / .76)`; Light `rgb(243 239 230 / .35)` somente em areas necessarias, sem lavar a cena inteira. Esses valores nao sao novos tokens nem comprovam contraste sobre a imagem.

## 5. Acessibilidade e contraste calculado (WCAG 2.2)

Calculos feitos para cores sRGB solidas, sem alpha: linearizacao por canal conforme WCAG, luminancia relativa `0.2126R + 0.7152G + 0.0722B` e razao `(Lmaisclaro + 0.05) / (Lmaisescuro + 0.05)`. Valores arredondados a duas casas. Nas celulas com tres resultados, a ordem e page / surface / panel-soft. `--focus-ring` e `--control-border` foram calculados pelas misturas CSS indicadas acima.

| Combinação relevante | Beyond | La Casa Dark | La Casa Light |
| --- | ---: | ---: | ---: |
| Texto principal sobre page / surface / soft | 18.38 / 16.56 / 14.97 | 16.91 / 15.59 / 14.07 | 13.87 / 15.54 / 14.32 |
| Texto muted sobre page / surface / soft | 8.19 / 7.38 / 6.67 | 9.88 / 9.11 / 8.22 | 6.72 / 7.53 / 6.94 |
| Accent como link sobre page / surface / soft | 12.90 / 11.63 / 10.51 | 12.09 / 11.14 / 10.06 | 7.69 / 8.62 / 7.95 |
| Primary como texto/indicador sobre page / surface / soft | 14.02 / 12.63 / 11.42 | 6.28 / 5.79 / 5.22 | 6.24 / 7.00 / 6.45 |
| Texto de foco sobre page / surface / soft | 14.02 / 12.63 / 11.42 | 13.86 / 12.77 / 11.53 | 9.93 / 11.12 / 10.25 |
| Texto do botao (`--on-primary`) sobre primary / hover | 13.57 / 14.81 | 6.18 / 6.94 | 7.16 / 8.26 |
| Borda geral `--line` sobre page / surface | 1.65 / 1.48 | 2.10 / 1.94 | 1.43 / 1.61 |
| Borda de controle `--control-border` sobre page / surface / soft | 5.95 / 5.36 / 4.85 | 7.06 / 6.50 / 5.87 | 4.22 / 4.73 / 4.36 |

Texto normal requer 4.5:1 e texto grande 3:1. Os pares textuais propostos excedem 4.5:1. Foco e bordas funcionais excedem 3:1. `--line` nao chega a 3:1 e deve permanecer decorativa, nao ser o unico limite de um campo/controle essencial. A borda aprovada Beyond `#393448` fica intacta; controles usam `--control-border` e foco usa dourado. Em La Casa, a mesma separacao entre linha estetica e limite funcional tambem se aplica.

O texto do botao usa `--on-primary`: escuro sobre o ouro Beyond e o vermelho claro Dark; branco sobre o vermelho escuro Light. Nao colocar texto branco sobre o ouro aprovado Beyond. Hover usa os valores/formulas existentes, e os contrastes do texto de botao permanecem acima de 4.5:1. `:active` nao ganha cor nova; conservar a resposta estrutural, e nao depender de mudanca de cor.

#### Estado do Laboratorio

Os estados `running`, `done` e `error` em `CodePlayground.css` usam atualmente `#F3CE7F`, `#A9E895` e `#FFAB9F`. Sobre o surface claro Light `#FFFCF6`, os contrastes sao **1.47:1**, **1.40:1** e **1.77:1**, respectivamente: falha para texto normal e para indicadores essenciais. Se La Casa Light for implementado, override local sugerido para `--bench-state`: em execucao/aviso `#7A4A00` (7.31:1), concluido `#176B45` (6.36:1), erro/timeout `#A9202D` (7.00:1). Acompanhar cada estado com texto/icone, sem depender da cor.

`--win`/`--loss` existentes tem 5.36:1 e 6.32:1 em Light; em superficies escuras, os valores atuais claros excedem 6:1. A avaliacao nao cobre alfa do vidro, sombras, imagens, todos os graficos do Arcade/xadrez, usuarios em alto contraste ou cada combinacao interativa. Portanto, **nao declara conformidade integral WCAG**. Validar foco de teclado, zoom, forced colors, estado desabilitado e a imagem real em navegador.

## 6. Responsividade e desempenho

- **Mobile:** header/menu precisam de superficie opaca suficiente e alvos intactos; nao depender de hover. `cover` central da mansao (proporcao 1.866) mostra cerca de 25% da largura-fonte em 375 x 812; o Light/Dark 16:9 mostra aproximadamente 26%. Rosto/mascara e informacao lateral podem sair do quadro. Nao usar a candidata mascarada como foto de revelacao.
- **Tablet:** em 768 x 1024, `cover` central mostra cerca de 40–42% da largura-fonte; testar a posicao do predio, bandeira e elementos nas bordas. Se o foco nao sobreviver, solicitar/aprovar variante vertical, sem gerar crop arbitrario.
- **Desktop:** em 1440 x 900, os fundos 16:9 perdem pouco conteudo lateral/vertical. Em 1920 x 1080, a mansao preserva aproximadamente 95% da largura-fonte.
- **Ultrawide:** viewport perto de 3440 x 1440 mostra cerca de 74% da altura-fonte das imagens 16:9; ajustar `background-position`/camada, sem esticar. Nao ampliar imagem alem da resolucao fornecida.
- **Overlay:** nao usar texto diretamente sobre fotografia complexa. Usar painel/surface e scrim localizado; validar manualmente em pontos claros e escuros. Os scrims da secao 4 sao ponto de partida, nao garantia.
- **Carregamento:** mansion e backgrounds so devem carregar quando a dimensao/tema correspondente for ativa. Nao adicionar preload de todas as tres cenas; para Rick, estender o preloader atual a cena de destino sem antecipar dimensoes bloqueadas. Os arquivos mobile nao existem.
- **Efeitos:** nao aumentar o blur atual de vidro (12 px geral, 40 px em alguns paineis), sombras grandes ou glow. Em mobile, manter a reducao de vidro existente (`prefers-reduced-transparency`) e testar scroll.
- **Movimento:** paleta nao requer animacao. Transicoes de portal/fundo devem respeitar `prefers-reduced-motion`, Escape, aba oculta e resize ja adotados nas dimensoes Rick. Nenhuma animacao deve ser requisito para distinguir estado.

## 7. Compatibilidade, IDs e migracao

| Futuro estado | ID | Compatibilidade/migracao |
| --- | --- | --- |
| Beyond the Curve | Tema continua `rick-morty`; `data-dimension="beyond-curve"` | Nao adicionar ao seletor. Estender leitura/restauracao dimensional, primeiro paint e destinos explicitos apos o acesso pela Astra. Preservar `lab`/`corrupted`; manter entrada secreta autorizada, retorno e fallback. |
| La Casa Dark | `la-casa-de-papel-dark` | Substituir o slot `midnight-pink`, sem aumentar os 15 temas. Migrar diretamente `obsidian-gold` e `grafite-coral` para o novo ID nos dois mapas de aliases; nunca encadear alias. |
| La Casa Light | `la-casa-de-papel-light` | Opcional e sem dependencia tecnica para Dark. Manter `quartzo-framboesa` ate autorizacao de Light. Quando substituido, alias direto `quartzo-framboesa` → `la-casa-de-papel-light` em JS e primeira pintura. |

Aliases atuais que nao devem ser afetados: `rick-morty-secret` → `rick-morty`, `champagne-gold` → `ardosia-cobalto`, `mint-frost` → `petroleo-gelo`, `porcelain-indigo` → `papel-violeta`. Nao mudar paletas de Garagem/Cidadela.

Chaves i18n necessarias no futuro, em `pt.json` e `en.json`:

- `navbar.appearance.la-casa-de-papel-dark`: nome do tema Dark. Substitui o texto `navbar.appearance.midnight-pink`/fallback.
- `navbar.appearance.la-casa-de-papel-light`: nome do tema Light somente quando registrado; o id antigo de Quartzo nao deve ganhar texto enganoso antes disso.
- Uma namespace dimensional Rick coerente para nome/acesso/retorno de `beyond-curve`; nao criar entrada em `navbar.appearance`.
- Nomes/saudacoes das personas devem seguir `NEW_PERSONAS_SPEC.md`; paleta nao deve alterar prompt, modelo, streaming, autoria ou traducoes existentes nesta etapa.

`AssistantAppearanceContext` deriva avatar de `rick-assets` e o resolver nao tem as novas combinacoes. Os assets recebidos estao em `avatar-evil-rick.webp`, `avatar-evil-morty.webp`, `avatar-birdperson.webp` e `la-casa-de-papel/avatar-{berlin,professor}.webp`, todos RGB sem alfa. Para retrato animado, faltam geometrias faciais; nao quebrar o fallback estatico. Direitos das imagens continuam por confirmar.

## 8. Arquivos de integracao futura

| Arquivo | Escopo possivel, somente apos autorizacao |
| --- | --- |
| `src/data/themes.js` | Substituir o registro `midnight-pink`; incluir Light somente quando aprovado; aliases diretos. |
| `index.html` | Manter aliases, listas clara/escura e primeira pintura sincronizados; validar visita direta a `/chat`. |
| `src/themes.css`, `src/dimensions.css`, `src/index.css` | Registrar tokens/swatches, backgrounds e estados dimensionais; preservar os originais. Revisar exclusivamente excecoes demonstradas. |
| `src/context/ThemeContext.jsx`, `src/context/ThemeState.js` | Persistencia de nova dimensao, autorizacao, alvos de travessia e retorno; ids de tema continuam validados pelo array. |
| `src/components/ThemeSelector.jsx`, `src/i18n/pt.json`, `src/i18n/en.json` | Nome/amostra Dark e Light; manter Beyond fora do menu. |
| `src/components/ThemeWaves.jsx`, `src/components/ThemedFavicon.jsx`, `src/components/DesignSystemCard.jsx` | Confirmar consumo automatico dos tokens e atualizar demonstracoes/swatches que tenham ids codificados. Favicon ja le os tokens computados. |
| `src/components/RickDimensionExperience.jsx`, `src/components/DimensionPortal.jsx`, `src/components/rick/portal/portalConfig.ts`, `src/components/rick/portal/DimensionalPortal.tsx`, `src/components/rick/sceneAssets.js`, `src/components/rick/SceneBackdrop.jsx` | Extensao explicita Beyond: destino, portal dourado, fundo, preloader e fallback. Nao fazer a tarefa de paleta substituir a logica dimensional. |
| `src/data/assistantPersonas.js`, `src/context/AssistantAppearanceContext.jsx`, `src/components/AstraAvatar.jsx`, `src/components/rick/AssistantPortrait.jsx`, `src/components/DimensionAstraSignal.jsx` | Integrar personas/paths e fallback conforme especificacao separada; nao animar retrato sem geometria. |
| `src/components/CodePlayground.css` | Apenas se o tema Light for implementado: status `--bench-state` de alto contraste para claro. |
| `src/components/MessageBubble.jsx`, `src/components/ChessCard.jsx`, `src/arcade/FullArcade.jsx`, `src/components/rick/project-dossier.css` | Revisao de regressao das excecoes fixas; mudar somente cores que comprovadamente falhem. |
| `public/rick-assets/beyond-curve/evil-morty-mansion.webp`, `public/la-casa-de-papel/{dark,light}-background.webp` | Assets ja importados, ainda sem direitos confirmados e sem integracao. |
| `public/la-casa-de-papel/perfil-foto-reveal.webp` e icone Dali | Ausentes/nao preparados. Nao substituir por candidata desalinhada, mockup ou recorte de cena. |
| `tests/astra-integration.test.mjs` e testes de tema existentes | Preservar aliases, primeira pintura, contagem, classe `.dark`, storage, swatches, status e contraste. |

Tailwind nao requer nova paleta fixa: suas classes semanticas ja apontam para as variaveis. `portfolioActions.js` deriva temas aceitos de `themes`; nao duplicar uma allowlist sem necessidade.

## 9. Riscos e possiveis regressões

1. Alias desatualizado no HTML ou JS produz flash/queda para `dark`; mapa precisa ser direto e identico.
2. Esquecer classe `.dark`/conjunto claro afeta Tailwind, status e `color-scheme` apesar dos tokens novos.
3. Implementar Beyond como tema selecionavel expõe a dimensão e muda contagem/fluxo secreto; ele deve ser atributo dimensional de Rick.
4. Persistencia e `crossDimension` sao binarios hoje. Sem destino explicito, a nova cena pode alternar para dimensao incorreta, perder retorno ou iniciar efeito/musica na dimensao errada.
5. IDs de persona e caminho de imagem sao derivados de forma Rick-only; La Casa pode quebrar avatar e acesso ao chat se a resolucao nao for generalizada conforme especificacao separada.
6. Imagens de fundo tem informacao embutida e corte severo em portrait; nao colocar controles/textos em areas imprevisiveis.
7. Assets e personagens tem direitos de distribuicao nao confirmados; integracao visual nao implica autorizacao.
8. A candidata mascarada nao alinha com a foto atual; `PhotoReveal` usa cover central sem foco independente. Nao acoplar o efeito a esta paleta ate haver alternativa aprovada.
9. `--line` discreto, `glass-shadow` com azul fixo, erros/status do Laboratorio e graficos do Arcade podem destoar ou falhar contraste. Fazer verificacao direcionada, nao conversao global.
10. Alterar ondas, blur, shadows ou backgrounds globalmente pode causar regressao de fluidez, em especial em telas estreitas.

## 10. Criterios de aceitacao

- Os 15 temas existentes e as cores atuais de Garagem/Cidadela permanecem idempotentes; contagem e identificadores so mudam pelos slots autorizados.
- Aliases antigos sao migrados diretamente nas duas rotas de primeira pintura; tema e classe clara/escura restauram igual no `/` e `/chat`.
- Beyond nao aparece no seletor e so e ativado pelo fluxo secreto autorizado; dimensoes antigas, retorno, Escape e reduced-motion continuam funcionando.
- Todas as superficies Astra compartilham os tokens adequados e exibem os IDs/assets corretos quando a integracao de personas for autorizada.
- Nomes de tema tem paridade PT/EN; Light nao precisa estar implementado para Dark funcionar.
- Conteudo legivel sobre fundo fotografico nos breakpoints 375, 390, 768, 1024, 1440, 1920 e ultrawide; nenhum texto depende do pixel do fundo.
- Texto comum atinge 4.5:1, texto grande 3:1, foco e limite de controle essencial 3:1; status do Laboratorio no tema claro usa alternativas com contraste suficiente.
- Testes cobrem primeira pintura, aliases, persistencia, selector count, swatches, forced colors, reduced motion e falha/atraso de asset.
- Laboratorio, Arcade, xadrez, dossies, chat/codigo, modal, formularios e menu mobile continuam funcionais; sem novas animacoes continuas ou carregamento antecipado das tres imagens.
- Direitos de uso e distribuicao de assets foram verificados antes da publicacao; testes visuais em aparelhos reais nao sao substituidos por calculos de cor.

## 11. Orientacoes para o Codex

1. Tratar os valores desta especificacao como fonte de tokens; nao refazer as duas dimensoes Rick existentes.
2. Implementar Dark substituindo `midnight-pink` no mesmo slot, corrigindo alias nos dois bootstraps em uma mudanca atomica e preservando outros temas.
3. Manter Light opcional: nao criar dependencia de Dark nem remover Quartzo antes da autorizacao explicita de Light.
4. Implementar Beyond como terceiro valor dimensional somente em etapa propria, com autorizacao pela Astra, destinos explícitos e fallback; nunca como tema do menu.
5. Reusar o mapa CSS de `--palette-*` para `--page` etc.; nao criar nomes globais paralelos. Manter `--panel-soft`, `--control-border`, `--focus-ring` derivados por formulas ja presentes.
6. Em La Casa Light, resolver os status do Laboratorio descritos na secao 5; nao recolorir o Arcade nem modificar logica de jogo.
7. Corrigir apenas hardcodes que falhem na validacao; conservar codigo preto/branco, cores de estado compreensiveis e identidades do Galo/Rick.
8. Carregar somente o asset selecionado, com fallback neutro; testar o corte real. Nao usar a candidata mascarada nem criar o icone Dali a partir das cenas.
9. Nao tocar em prompts, modelos, streaming, autoria/historico, conteudo dos dossies, API, traducoes nesta etapa documental ou dependencias.
10. Validar manualmente estados claro/escuro, WCAG, teclado, forced colors, reduced motion/transparency e breakpoints; usar os testes de primeira pintura/aliases existentes e `git diff --check`.

## 12. Pendencias e decisoes do proprietario

- Confirmar direitos de uso e distribuicao dos tres fundos, avatares e demais imagens antes de publica-los; a entrega do pacote nao foi considerada comprovante de licenca.
- Autorizar, em etapa propria, a substituicao `midnight-pink` → Dark; manter alias `obsidian-gold`/`grafite-coral`.
- Decidir se/quando substituir `quartzo-framboesa` por La Casa Light. Essa decisao nao bloqueia tecnicamente Dark.
- Aprovar o comportamento/crop dos fundos em dispositivos estreitos; nenhuma variante mobile existe.
- Fornecer foto mascarada alinhada e autorizada para o caminho `public/la-casa-de-papel/perfil-foto-reveal.webp`; a candidata atual permanece inadequada.
- Os icones Dali e do portal amarelo foram preparados na fase 14 e estao transparentes, mas nao foram integrados. Confirmar direitos de uso antes de publica-los e validar o alinhamento no header futuro; detalhes em [HEADER_ASSETS_REPORT.md](HEADER_ASSETS_REPORT.md).
- Definir o acesso secreto/retorno e a restauracao de Beyond em coordenacao com a etapa dimensional, sem expor a dimensao no seletor.
- Confirmar se o efeito de vidro/ondas deve ser mais discreto em La Casa apos visualizacao do tema implementado; qualquer ajuste deve ser medido em aparelhos reais.

Este arquivo nao registra aprovacao de implementacao, licenca de midia, tema, persona ou dimensao.

## Atualizacao de assets do header — fase 14

Os dois icones PNG isolados agora existem com alfa externo validado e variantes compactas; os originais foram preservados em `references/header-assets/`. Nenhum tema, fundo, portal existente ou header foi alterado. A integracao permanece condicionada a autorizacao e revisao visual no contexto real. Consulte [HEADER_ASSETS_REPORT.md](HEADER_ASSETS_REPORT.md) e [ACCESSIBILITY_PREPARATION_REPORT.md](ACCESSIBILITY_PREPARATION_REPORT.md).
