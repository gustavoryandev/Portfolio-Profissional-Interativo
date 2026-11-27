# Inventário atual de temas

27 de novembro de 2026 · Fase 02. O seletor oferece **15 temas, seis claros e nove escuros**. Garagem, Cidadela e Além da Curva Finita Central são dimensões do tema Rick and Morty. **O rosa escuro é `midnight-pink` e o rosa claro é `quartzo-framboesa`.** “Papel violeta” é outra paleta.

## Registro que alimenta o menu

Os pares hexadecimais indicam fundo e primária da amostra do seletor. Nas paletas personalizadas, o CSS também define superfície, texto, bordas, ondas e realces. As paletas regulares compartilham retrato, seções, conversa Astra e ondas SVG com cores do tema. [Registro](../src/data/themes.js) · [Seletor](../src/components/ThemeSelector.jsx) · [Tokens](../src/themes.css)

| ID persistido | Nome na interface | Tipo | Amostra e recursos distintivos |
| --- | --- | --- | --- |
| `light` | Claro | Claro | #F4F4F5 / #0B5ED7. Original |
| `dark` | Escuro | Escuro | #030A10 / #0B5ED7. Original e padrão |
| `rick-morty` | Rick and Morty | Escuro | Duas cenas, portais, aberturas, dossiês, exploração, música e três personagens da Astra |
| `galo` | Galo CAM Dark | Escuro | #080808 / #F5C400. Escudo, ondas próprias, avatar escuro, saudação e hino |
| `galo-light` | Galo CAM Light | Claro | #F8F8F8 / #D49A00. Variante clara com avatar próprio e mesmo player do hino |
| `aurora` | Aurora | Escuro | #090E1C / #3B82F6. Realce violeta e ondas multicoloridas |
| `midnight-violet` | Midnight Violet | Escuro | #080910 / #8B5CF6. Controles violeta e intensidade de onda própria |
| `papel-violeta` | Papel violeta | Claro | #EFEDF5 / #56429E |
| `midnight-pink` | Midnight Pink | Escuro | #0C0910 / #FF3BA7. Superfície #19121E e onda rosa atenuada |
| `quartzo-framboesa` | Quartzo framboesa | Claro | #F7E8F0 / #9A3D72. Superfície #FCF5F9 e realce #71498A |
| `ardosia-cobalto` | Ardósia e Cobalto | Claro | #E7EDF5 / #244DA8 |
| `cobalto-intenso` | Cobalto intenso | Escuro | #101D44 / #97AEFF |
| `petroleo-gelo` | Petróleo e Gelo | Claro | #EAF6F5 / #0D675F |
| `petroleo-eletrico` | Petróleo elétrico | Escuro | #0B2529 / #79E0D1 |
| `floresta-mineral` | Floresta mineral | Escuro | #16261C / #94DDB0 |

## Persistência e compatibilidade

O script no HTML aplica `data-theme`, a classe `dark`, `data-custom-theme` e, para Rick, `data-dimension` antes da primeira pintura, inclusive na rota direta `/chat`. O provider restaura e grava as chaves `theme` e `rick-morty-dimension` em localStorage. Um tema desconhecido cai em `dark`. O seletor divide os dois originais do grupo expansível de personalizados. `theme.set` usa os IDs do registro. As duas tabelas de migração (HTML e JS) precisam concordar. Os testes locais de primeira pintura passaram. [Bootstrap](../index.html) · [Provider](../src/context/ThemeContext.jsx) · [Contrato de ações](../src/services/portfolioActions.js)

| ID antigo | ID atual | Efeito na restauração |
| --- | --- | --- |
| `rick-morty-secret` | `rick-morty` | Entra em `corrupted` |
| `obsidian-gold`, `grafite-coral` | `midnight-pink` | Ambos levam ao rosa escuro |
| `champagne-gold` | `ardosia-cobalto` | Claro |
| `mint-frost` | `petroleo-gelo` | Claro |
| `porcelain-indigo` | `papel-violeta` | Claro |

Selecionar Rick explicitamente inicia em `lab`, salvo quando a última dimensão ativa era `beyond-curve`. Recarregar com Rick selecionado restaura uma dimensão válida. Em localStorage também ficam `rick-morty-beyond-unlocked`, `rick-morty-volume`, `rick-morty-music-paused`, `rick-morty-effects-paused` e `rick-morty-exploration`. Em sessionStorage, `rick-garage-intro-seen` e `rick-ship-departed` controlam a abertura e o voo. Mensagens de easter egg são mantidas por dimensão em memória. O favicon usa as cores computadas e reage à mudança de tema.

## Garagem e Cidadela dos Ricks

| Recurso | Garagem · `lab` | Cidadela · `corrupted` |
| --- | --- | --- |
| Ambiente | Bancada e fundo `garage.webp`, variante vertical | Praça `citadel-plaza.webp` e variante vertical. O pouso usa `citadel.webp` |
| Abertura | Porta, luzes, monitor e partida da nave. 2.450 ms de animação, uma vez por sessão | Chegada à doca e pouso da mesma nave. 1.650 ms na ida pelo portal |
| Portais | Botão com textura local, expansão que cobre a troca. Retrato SVG verde, energia #39FF14 | Retorno à Garagem. Retrato ciano, energia #45F6ED |
| Astra compacta | Sr. Meeseeks, breve e orientado à tarefa | Sr. Meeseeks |
| Astra completa | Pássaro-Pessoa / Birdperson, calmo e reflexivo | Sr. Bunda Cagada / Mr. Poopybutthole, afetuoso e reflexivo |
| Interações | Caixa e Meeseeks articulado, filtro Java, currículo, pergunta sobre ROTA. Experimento com Pickle Rick, traje e corrida reversível | Morty vira a placa da recepção. Rick, Morty, nave e janelas compõem a cena. Credencial com links profissionais |
| Recursos compartilhados | Dossiês, diagramas para projetos sem prévia adequada, Morty nos cards, arquivos de exploração e reprise | Dossiês apresentados como relatórios. TV com canais estáticos Portfólio e GEOSOLAR |

`DimensionTransit` bloqueia a dupla travessia, pré-carrega o destino e troca a dimensão sob cobertura. Escape, página oculta e redimensionamento concluem a viagem. Movimento reduzido permite troca direta. O portal do retrato tem relógio próprio que cede fora da viewport ou com a aba oculta. `/portal.html` demonstra as duas variantes. A abertura geral do portfólio e a entrada dedicada da Astra têm relógios distintos das cenas Rick. [Travessia](../src/components/DimensionPortal.jsx) · [Cenas](../src/components/RickDimensionExperience.jsx) · [Portal do retrato](portal-dimensional.md)

O diário registra `citadel`, `meeseeks`, `pickle` e `reception` quando habilitado. A chegada a `beyond-curve` concede sua conquista diretamente. A limpeza do progresso remove todas as descobertas. A inspeção dos objetos liga a migração de ROTA e o runner do Laboratório. Com movimento reduzido, a reprise apresenta um quadro estático da cena selecionada. O arquivo de extras reúne créditos e reprises. [Descobertas](../src/hooks/useRickExploration.js) · [Extras](../src/components/rick/RickPortfolioExtras.jsx)

Garagem e Cidadela compartilham a prévia oficial de “Rick and Morty Theme”. Selecionar o tema inicia a tentativa de reprodução conforme a preferência de som. O padrão é 22%, com pausa, repetição e tratamento de erro. O Galo usa o MP3 local em ambas as variantes, com pausa e reinício ao sair da família. O Arcade gera efeitos próprios. [Player Rick](../src/services/rickThemeMusic.js) · [Inventário das mídias](ASSET_INVENTORY.md)

## Além da Curva Finita Central

O comando local da Astra abre `beyond-curve`. Depois do desbloqueio, o portal amarelo entra no cabeçalho das três dimensões. A viagem procedural revela a mansão, que usa a paleta grafite e dourada e concede a conquista Viajante Interdimensional na primeira chegada. O canal da mansão permite rever a sequência completa. Rick Maligno e Evil Morty representam a Astra compacta e completa. A música da mansão está ligada à demonstração local, com distribuição pendente. [Especificação](DIMENSION_SPEC.md)
