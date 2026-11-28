# Preparacao de assets para implementacoes futuras

Snapshot histórico de preparação em 27 de novembro de 2026, anterior à integração dos temas, personas e dimensão Beyond. As frases abaixo sobre assets “não integrados”, funcionalidades planejadas e caminhos propostos descrevem aquele estágio e foram preservadas como registro; não representam o estado atual do runtime.

**Estado após a integração (`codex/release-integration`, commit `595e4a98`):** La Casa Dark/Light usa os fundos, avatares, máscara de header e fotografia de revelação versionados; Rick and Morty usa os avatares de Pessoa-Pássaro, Rick Maligno e Evil Morty, o cenário da mansão e o ícone amarelo compacto versionados. A faixa de Beyond está versionada, mas o código a habilita apenas como preview em desenvolvimento enquanto a distribuição não estiver confirmada. Os demais candidatos de cenas/imagens da Curva continuam fora do Git e sem referência no runtime. Consulte [ASSETS_PENDENTES.md](ASSETS_PENDENTES.md) para o estado por arquivo e [heistThemes.js](../src/data/heistThemes.js), [assistantPersonas.js](../src/data/assistantPersonas.js), [sceneAssets.js](../src/components/rick/sceneAssets.js) e [rickThemeMusic.js](../src/services/rickThemeMusic.js) para as referências atuais. A integração não confirma licenças ou direitos de distribuição.

Este guia complementar foi baseado em [ASSET_INVENTORY.md](ASSET_INVENTORY.md), [CURRENT_THEME_INVENTORY.md](CURRENT_THEME_INVENTORY.md), [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md), [SESSION_HANDOFF.md](SESSION_HANDOFF.md) e buscas pontuais nos componentes referenciados. A importacao seletiva V11.2 esta registrada abaixo e no [relatorio de importacao](ASSET_IMPORT_V11_2_REPORT.md). O registro descreve preparação e recomendações daquela etapa.

## Convencoes e limites do inventario

- O inventario anterior registrava 85 arquivos de midia; a importacao V11.2 adicionou 16 assets a `public/` e 4 referencias separadas em `references/`. Em `public/rick-assets/` os fundos usam WebP, retratos usam `avatar-<id>.webp`, e cenas compactas sao selecionadas por [sceneAssets.js](../src/components/rick/sceneAssets.js). As variacoes compactas existentes sao selecionadas em telas estreitas em orientacao retrato; validar o enquadramento real antes de fixar dimensoes.
- Referencias de dimensao para propostas: fundos atuais variam de 1536 x 1024 a 1920 x 1080; os avatares Rick atuais medem 256–399 px no menor eixo, com uma arte alta de 256 x 746. Para novos fundos, preparar uma versao desktop de cerca de 1920 x 1080 e uma composicao vertical separada quando o crop nao for suficiente. Para retratos quadrados, preparar WebP com transparencia em torno de 512 x 512. Sao alvos de producao, nao dimensoes impostas pelo codigo.
- O portal dimensional procedural e a textura estao separados: [DimensionalPortal.tsx](../src/components/rick/portal/DimensionalPortal.tsx) desenha energia em SVG; a textura raster atual e [portal.webp](../public/rick-assets/portal.webp), 410 x 655; [dimensional-portal.svg](../public/dimensional-portal.svg) tem viewBox 600 x 900. A paleta procedural so tem `garage` e `citadel` em [portalConfig.ts](../src/components/rick/portal/portalConfig.ts).
- O registro [sources.json](../public/rick-assets/sources.json) documenta proveniencia de assets Rick existentes. URL de origem, inventario ou existencia no repositorio nao demonstram permissao de redistribuicao.
- Direitos de novas artes nao foram verificados. Preferir arte original encomendada, fornecida pelo usuario ou licenciada para os usos pretendidos; registrar autor, URL/fonte, licenca, comprovante e hash ao incorporar. Nao copiar imagens da referencia de fotografia interativa.

## 1. Terceira dimensao: Alem da Curva Finita Central

1. **Recursos existentes:** fundos da Garagem e Cidadela, nave, portal generico e transicao sob cobertura; conferir [garage.webp](../public/rick-assets/garage.webp), [citadel-plaza.webp](../public/rick-assets/citadel-plaza.webp), [spaceship.webp](../public/rick-assets/spaceship.webp) e [portal.webp](../public/rick-assets/portal.webp). A camada de dados sugere o ID `beyond-curve` dentro do tema `rick-morty`.
2. **Recursos V11.2:** cenas distintas da Curva, ruptura, viagem, portal e mansao; sete arquivos sob `public/rick-assets/beyond-curve/`. `evil-morty-mansion.webp` (1125 x 603) e o fundo principal solicitado. Os retratos Rick novos tambem foram recebidos (secoes 2–4). Variante vertical/mobile e arte independente de chegada continuam ausentes. O pacote fornece ainda `public/rick-assets/audio/evil-morty-30s.mp3` (30,067 s, verificado), sem referencia no player; o proprietario informou autorizacao, mas nao foi inspecionado documento comprobatório.
3. **Caminhos atuais:** usar a mansao recebida como principal; manter as cenas de sequencia nos seus caminhos V11.2. Nao criar `beyond-curve.webp` duplicado nem mover o audio para outro diretorio.
4. **Formato/dimensoes:** manter WebPs originais e nao embutir audio nas imagens. Em viewport 375 x 812, um `cover` central da mansao mostraria cerca de 25% da largura-fonte; um asset mobile dedicado pode ser necessario, mas nao foi gerado sem layout/foco aprovado.
5. **Componentes reutilizaveis:** [ThemeContext.jsx](../src/context/ThemeContext.jsx), [DimensionPortal.jsx](../src/components/DimensionPortal.jsx), [RickDimensionExperience.jsx](../src/components/RickDimensionExperience.jsx), [sceneAssets.js](../src/components/rick/sceneAssets.js), [PortfolioIntro.jsx](../src/components/PortfolioIntro.jsx) e [RickThemeMusic.jsx](../src/components/RickThemeMusic.jsx).
6. **Dependencias/conflitos:** o estado atual persiste `lab`/`corrupted`; `crossDimension` alterna entre esses dois destinos e `DimensionTransit` escolhe o pouso por essa mesma distincao. `sceneAssets` e o preloader conhecem apenas Garagem/Cidadela. O plano exige destinos explicitos, restauracao da nova dimensao, retorno e atualizacao do primeiro paint, transicao, descoberta e musica.
7. **Mobile:** fornecer crop vertical dedicado sem ocultar controles ou elementos narrativos; carregar apenas a cena de destino e dimensionar a transicao para viewport estreita.
8. **Desempenho/acessibilidade:** conservar fallback sem asset e conclusao de viagem com movimento reduzido, Escape, aba oculta e redimensionamento. Manter foco e anuncio do destino; nao fazer a chegada depender exclusivamente de animacao ou musica.
9. **Permissoes:** personagens, cenarios e musica de Rick and Morty nao tem permissao de redistribuicao demonstrada por este inventario. Confirmar direitos de cada novo asset e da faixa antes de adicionar arquivos locais.

## 2. Rick Maligno

1. **Recursos existentes:** o retrato de Rick regular, [rick.webp](../public/rick-assets/rick.webp), pode informar proporcao e convencao de carga; nao e arte do Rick Maligno. O sistema de avatar atual deriva o caminho do ID.
2. **Recebido:** `public/rick-assets/avatar-evil-rick.webp`, 512 x 512, WebP RGB com fundo original. Nao foi conectado ao resolver; direitos de adaptacao/distribuicao permanecem por confirmar.
3. **Caminho recebido:** `public/rick-assets/avatar-evil-rick.webp`. Caso seja necessaria uma arte de cena, decidir separadamente; nao reutilizar o retrato normal como substituto.
4. **Formato/dimensoes:** WebP RGB 512 x 512, sem alfa e com fundo original preservado; validar o enquadramento na exibicao real.
5. **Componentes reutilizaveis:** [AssistantAppearanceContext.jsx](../src/context/AssistantAppearanceContext.jsx) resolve tema/dimensao/superficie; [AssistantPortrait.jsx](../src/components/rick/AssistantPortrait.jsx) anima retratos com geometria ocular; [assistantPersonas.js](../src/data/assistantPersonas.js) e as traducoes concentram os IDs existentes.
6. **Dependencias/conflitos:** o plano propoe Rick Maligno na superficie compacta da nova dimensao. A resolucao de persona precisa reconhecer a combinacao sem alterar as identidades existentes; `AssistantPortrait` tem geometrias apenas para Meeseeks, Squanchy e Sr. Bunda Cagada e espera uma geometria para cada ID.
7. **Mobile:** um unico retrato quadrado pode servir aos dois tamanhos; conferir contraste, area facial e crop em bolhas compactas.
8. **Desempenho/acessibilidade:** usar carga assincrona e fallback textual/inicial; a arte e decorativa quando o nome da persona ja esta exposto como texto. Nao depender de expressao animada para comunicar estado.
9. **Permissoes:** permissao para adaptar ou redistribuir imagem do personagem nao foi verificada. Usar material expressamente autorizado/original e registrar a fonte.

## 3. Evil Morty

1. **Recursos existentes:** [morty.webp](../public/rick-assets/morty.webp) e a implementacao de `CharacterArt` representam Morty regular e podem servir apenas como referencia de dimensoes, nao como arte de Evil Morty.
2. **Recebido:** `public/rick-assets/avatar-evil-morty.webp`, 512 x 512, WebP RGB com fundo original. A silhueta de chegada continua ausente e opcional; nao foi criada.
3. **Caminhos:** `public/rick-assets/avatar-evil-morty.webp` foi recebido; se a silhueta for um asset independente em vez de arte inline, `public/rick-assets/evil-morty-silhouette.svg` e uma possibilidade futura.
4. **Formato/dimensoes:** retrato WebP RGB 512 x 512, sem alfa e com fundo original; silhueta continua sem arquivo. O tamanho quadrado corresponde ao formato de avatar, mas nao substitui a geometria do retrato animado.
5. **Componentes reutilizaveis:** [AssistantPortrait.jsx](../src/components/rick/AssistantPortrait.jsx), [AssistantAppearanceContext.jsx](../src/context/AssistantAppearanceContext.jsx), [RickDimensionExperience.jsx](../src/components/RickDimensionExperience.jsx) e [DimensionPortal.jsx](../src/components/DimensionPortal.jsx).
6. **Dependencias/conflitos:** o plano propoe Evil Morty na superficie completa de `beyond-curve` e uma silhueta na chegada. O retrato depende do mesmo registro de geometria/ID e do novo destino; evitar duplicar assets da cena como avatar.
7. **Mobile:** assegurar leitura da silhueta em altura reduzida e oferecer alternativa quando a animacao de chegada for ignorada; preparar crop de retrato que funcione em avatar pequeno.
8. **Desempenho/acessibilidade:** carregar a silhueta junto da cena somente quando necessario; respeitar movimento reduzido e nao esconder o nome/estado da dimensao em imagem.
9. **Permissoes:** direitos de arte de Evil Morty nao estao documentados. A silhueta tambem requer fonte autorizada, mesmo que seja monocromatica.

## 4. Pessoa-Pássaro

1. **Recursos existentes:** [avatar-squanchy.webp](../public/rick-assets/avatar-squanchy.webp) demonstra a convencao de avatar quadrado, mas nao representa Pessoa-Pássaro. Nao ha arte dele listada.
2. **Recebido:** `public/rick-assets/avatar-birdperson.webp`, 512 x 512, WebP RGB com fundo original. A geometria ocular para o retrato animado nao existe; a imagem ainda nao esta integrada.
3. **Caminho proposto:** `public/rick-assets/avatar-birdperson.webp`.
4. **Formato/dimensoes:** WebP RGB 512 x 512, sem alfa e com fundo original. Para animar, sera necessario definir geometria ocular propria ou escolher apresentacao estatica.
5. **Componentes reutilizaveis:** [AssistantPortrait.jsx](../src/components/rick/AssistantPortrait.jsx) para a apresentacao, [AssistantAppearanceContext.jsx](../src/context/AssistantAppearanceContext.jsx) para resolucao, [assistantPersonas.js](../src/data/assistantPersonas.js) para identidade.
6. **Dependencias/conflitos:** o plano pede substituir Squanchy por Pessoa-Pássaro na completa da Garagem. Atualmente a lista de retratos e a resolucao de personas sao explicitas; adicionar o ID e geometria sem deixar referencias antigas apontando para imagem inexistente.
7. **Mobile:** servir o mesmo retrato comprimido; testar legibilidade e recorte em avatar pequeno e manter o texto/nome visivel mesmo se a imagem falhar.
8. **Desempenho/acessibilidade:** usar `decoding=async`/fallback existente; retrato animado e decorativo para tecnologia assistiva, com autoria nomeada em texto.
9. **Permissoes:** nao ha permissao de uso documentada para personagem ou arte. Obter arte original/licenciada antes de incluir.

## 5. Portal dimensional amarelo

1. **Recursos existentes:** [portal.webp](../public/rick-assets/portal.webp), [dimensional-portal.svg](../public/dimensional-portal.svg) e [citadel-dimension.svg](../public/citadel-dimension.svg); [DimensionPortal.jsx](../src/components/DimensionPortal.jsx) ja fornece botao e transicao.
2. **Recebidos:** `yellow-portal-scene.webp` e `yellow-portal.webp`, ambos 640 x 479, sao cenas completas RGB sem canal alfa e permanecem inalterados. Na fase 14 foi preparado separadamente `public/rick-assets/beyond-curve/yellow-portal-icon.png` (678 x 708, RGBA) e `yellow-portal-icon-header.png` (123 x 128); o original recebido permanece em `references/header-assets/yellow-portal-icon-original.png`.
3. **Preparacao futura:** o icone isolado esta disponivel para avaliacao do header, mas nao esta integrado. A transparencia externa e o recorte foram verificados; manter as cenas raster e a energia procedural atuais. Confirmar permissao antes de publicar ou integrar.
4. **Formato/dimensoes:** para textura, WebP em proporcao proxima de 410 x 655; para vetor, SVG com viewBox 600 x 900. Reusar os vetores atuais se a aprovacao artistica permitir.
5. **Componentes reutilizaveis:** [DimensionPortal.jsx](../src/components/DimensionPortal.jsx), [DimensionalPortal.tsx](../src/components/rick/portal/DimensionalPortal.tsx) e [portalConfig.ts](../src/components/rick/portal/portalConfig.ts).
6. **Dependencias/conflitos:** `PortalVariant` aceita apenas `garage`/`citadel`; as paletas atuais sao verde/ciano e a transicao usa tokens CSS. O destino nao deve ser inferido como “nao Cidadela = Garagem”; deve acompanhar a dimensao selecionada.
7. **Mobile:** manter a area clicavel do portal e o ponto de expansao dentro do viewport, sem depender de hover; respeitar tamanhos e duracoes compactas existentes.
8. **Desempenho/acessibilidade:** limitar filtros SVG, particulas e ciclos de atualizacao conforme `qualityLevels`; manter `prefers-reduced-motion`, Escape, aba oculta e resize. O portal decorativo deve ser `aria-hidden`; o botao continua com rotulo localizado, estado ocupado e operacao por teclado.
9. **Permissoes:** permissao dos assets existentes nao se estende automaticamente a um novo desenho. Confirmar origem/licenca antes de adaptar ou redistribuir.

## 6. La Casa de Papel Dark

1. **Recursos existentes:** o tema [`midnight-pink`](../src/data/themes.js) e seus tokens podem informar a paleta inicial; `obsidian-gold` e `grafite-coral` ja migram para ele. A V11.2 recebeu `dark-background.webp` e `light-background.webp`, ambos 1600 x 900.
2. **Recebidos, ainda nao integrados:** os dois fundos e os avatares de Berlim/Professor estao em `public/la-casa-de-papel/`. A identidade visual veio do pacote do proprietario; os direitos de distribuicao das imagens ainda precisam ser confirmados. Nao usar `dark-mockup.webp` como fundo: ele continua em `references/`.
3. **Caminhos recebidos:** `public/la-casa-de-papel/dark-background.webp` e `light-background.webp`. Nenhuma variante mobile foi gerada; testar enquadramento no layout antes de recortar.
4. **Formato/dimensoes:** WebP ~1920 x 1080 para desktop e versao vertical ~1080 x 1920 quando o crop nao preserva o foco. Evitar video como fundo por padrao; se aprovado, exigir poster estatico leve.
5. **Componentes reutilizaveis:** [ThemeSelector.jsx](../src/components/ThemeSelector.jsx), [ThemeContext.jsx](../src/context/ThemeContext.jsx), [themes.js](../src/data/themes.js), [themes.css](../src/themes.css), [ThemedFavicon.jsx](../src/components/ThemedFavicon.jsx) e [AssistantAppearanceContext.jsx](../src/context/AssistantAppearanceContext.jsx).
6. **Dependencias/conflitos:** ID proposto `la-casa-de-papel-dark`. Migrar aliases diretamente, pois o bootstrap so resolve um salto; manter sincronizados o primeiro paint em `index.html`, `legacyThemeIds`, seletor, `theme.set`, tokens, favicon e aparencia/persona. Definir se substitui `midnight-pink` para nao aumentar a lista sem intencao.
7. **Mobile:** fornecer crop ou arte mobile aprovada; verificar contraste em areas sobrepostas e que controles continuem acessiveis em telas estreitas.
8. **Desempenho/acessibilidade:** fundo estatico otimizado, sem baixar variantes desktop e mobile juntas; texto/controles precisam de contraste independente da imagem, sem comunicar estados apenas por cor. Evitar flash de tema incorreto na primeira pintura.
9. **Permissoes:** os fundos foram entregues no ZIP pelo proprietario; os direitos de uso/distribuicao ainda nao estao confirmados. Nao usar `dark-mockup.webp` como fundo nem reutilizar stills/logotipos sem direitos especificos.

## 7. La Casa de Papel Light

1. **Recursos existentes:** `quartzo-framboesa` e uma paleta clara existente; tema e tokens podem ser aproveitados. La Casa Light esta condicionada no plano a Dark ser aceita. A V11.2 fornece `light-background.webp` (1600 x 900), ainda sem uso/registro de tema.
2. **Recebidos, ainda nao integrados:** `light-background.webp` e os mesmos avatares compartilhados de Berlim/Professor estao disponiveis. Nao duplicar imagens por tema; confirmar contraste e permissao antes da publicacao.
3. **Caminhos:** `public/la-casa-de-papel/light-background.webp`; `light-background-mobile.webp` e opcional e ausente. Se usar a mesma arte autorizada do Dark, nao criar copia redundante.
4. **Formato/dimensoes:** mesma recomendacao WebP desktop ~1920 x 1080 e derivado vertical ~1080 x 1920, condicionada a composicao e aprovacao.
5. **Componentes reutilizaveis:** os mesmos componentes de tema listados para Dark, mais [DesignSystemCard.jsx](../src/components/DesignSystemCard.jsx) para validar tokens; personagens devem compartilhar o registro de personas, nao duplicar retratos por paleta.
6. **Dependencias/conflitos:** ID proposto `la-casa-de-papel-light`; migracao direta de `quartzo-framboesa` somente quando aprovado, conservando a classificacao clara no HTML antes da primeira pintura. O plano indica nao iniciar antes da aprovacao do Dark.
7. **Mobile:** validar contraste de retratos e controles sobre a arte em cada breakpoint; fornecer fundo vertical apenas quando necessário para conservar foco e legibilidade.
8. **Desempenho/acessibilidade:** respeitar `light` na primeira pintura e tokens de texto/borda/foco; validar contraste WCAG e nao confiar em sombras para legibilidade. Reusar o asset do Dark se for apropriado para evitar duplicacao de download.
9. **Permissoes:** mesmas pendencias de direitos do Dark; nenhuma arte especifica de La Casa Light tem origem/licenca registrada.

## 8. Berlim

1. **Recursos existentes:** convencao de avatar Rick e pipeline de `persona.image`; a V11.2 adiciona o retrato no caminho definitivo fora de `rick-assets`.
2. **Recebido:** `public/la-casa-de-papel/avatar-berlin.webp`, 512 x 512, WebP RGB com fundo preservado. Nao esta integrado e nao tem direitos de distribuicao confirmados.
3. **Caminho definitivo recebido:** `public/la-casa-de-papel/avatar-berlin.webp`; compartilhar entre Dark/Light, sem copiar para `rick-assets`.
4. **Formato/dimensoes:** WebP RGB 512 x 512, sem alfa e com fundo preservado; uma imagem por personagem, compartilhada entre Dark/Light.
5. **Componentes reutilizaveis:** [AssistantAppearanceContext.jsx](../src/context/AssistantAppearanceContext.jsx), [AssistantPortrait.jsx](../src/components/rick/AssistantPortrait.jsx), [assistantPersonas.js](../src/data/assistantPersonas.js) e [ThemeSelector.jsx](../src/components/ThemeSelector.jsx) indiretamente via contexto de tema.
6. **Dependencias/conflitos:** o plano propoe Berlim na superficie compacta em ambos os temas; a combinacao tema x dimensao x superficie, allowlist do servidor, nomes e mensagens PT/EN precisam concordar. `AssistantPortrait` precisa de geometria facial para o ID ou caminho explicito de retrato estatico.
7. **Mobile:** retrato quadrado comum; manter rosto legivel em resolucao reduzida, sem uma variante mobile separada salvo necessidade comprovada.
8. **Desempenho/acessibilidade:** usar imagem otimizada e fallback de texto; nome/persona sempre disponivel fora da imagem. Evitar animar quando fora da viewport ou com movimento reduzido.
9. **Permissoes:** imagem/representacao de Berlim e material da serie nao tem permissao registrada. Preferir retrato original/autorizado e verificar direitos de adaptacao.

## 9. Professor

1. **Recursos existentes:** pipeline compartilhado de retratos/personas e convencao de WebP; a V11.2 adiciona o retrato no caminho definitivo fora de `rick-assets`.
2. **Recebido:** `public/la-casa-de-papel/avatar-professor.webp`, 512 x 512, WebP RGB com fundo preservado. Geometrias faciais nao foram adicionadas; direitos de distribuicao ainda precisam ser confirmados.
3. **Caminho definitivo recebido:** `public/la-casa-de-papel/avatar-professor.webp`, compartilhado por Dark e Light.
4. **Formato/dimensoes:** WebP RGB 512 x 512, sem alfa e com fundo preservado; privilegiar leitura em tamanho pequeno e validar a area segura de rosto.
5. **Componentes reutilizaveis:** [AssistantAppearanceContext.jsx](../src/context/AssistantAppearanceContext.jsx), [AssistantPortrait.jsx](../src/components/rick/AssistantPortrait.jsx) e [assistantPersonas.js](../src/data/assistantPersonas.js).
6. **Dependencias/conflitos:** o plano propoe Professor na superficie completa. Resolver ambos os IDs de tema para o mesmo retrato sem duplicacao e sem colisao com `rick.<id>`/traducao ou comportamento de sessao antiga.
7. **Mobile:** reaproveitar a mesma imagem, com crop que continue reconhecivel em layout compacto.
8. **Desempenho/acessibilidade:** preload somente do retrato da persona ativa; manter resposta textual sem depender da imagem e movimento reduzido para qualquer gesticulacao.
9. **Permissoes:** nenhuma permissao para retrato oficial ou adaptacao foi verificada. Exigir material licenciado/autorizado antes de publicar.

## 10. Fotografia interativa

1. **Recursos existentes:** [perfil-foto.jpeg](../public/perfil-foto.jpeg), 572 x 777, e a moldura do retrato em [PortfolioPage.jsx](../src/pages/PortfolioPage.jsx), [PortraitPortal.jsx](../src/components/rick/PortraitPortal.jsx), [DimensionalPortal.tsx](../src/components/rick/portal/DimensionalPortal.tsx) e [profile-photo.css](../src/components/rick/portal/profile-photo.css).
2. **Candidata recebida, mas nao alinhada:** `public/la-casa-de-papel/masked-portrait-candidate.webp` (918 x 1713) nao substitui `public/perfil-foto.jpeg` (572 x 777). A referencia original incluida no pacote (417 x 777) tem crop semelhante a candidata, mas tambem nao e a foto atualmente usada. As quatro referencias permanecem em `references/`, fora de `public/`.
3. **Caminho definitivo para uma futura alternativa aprovada:** `public/la-casa-de-papel/perfil-foto-reveal.webp`, como no exemplo do [PhotoReveal](PHOTO_REVEAL_COMPONENT.md). Esse arquivo ainda nao foi criado; nao renomear a candidata para esse destino.
4. **Formato/dimensoes:** base 572 x 777 (0,736); referencia 417 x 777 (0,537); candidata 918 x 1713 (0,536). A referencia/candidata partilham proporcao aproximada entre si, nao com a foto atual. `PhotoReveal` usa `cover` central sem foco independente; nao ativar a candidata.
5. **Componentes reutilizaveis:** os componentes de retrato e portal acima podem fornecer moldura, composicao e fallback. O efeito de revelacao deve permanecer distinto do portal dimensional para evitar acoplamento de duas interacoes.
6. **Dependencias/conflitos:** duas fotos precisam coincidir em tamanho, transformacao e `object-position`; o efeito tem que coexistir com a camada/mascara atual sem quebrar a transicao Rick. Reaproveitar a interacao descrita, nao copiar o componente/fotografias da referencia sem permissao.
7. **Mobile:** suportar toque sem hover, gestos sem bloquear scroll e tamanho de toque acessivel; reduzir/encerrar o efeito quando a aba fica oculta.
8. **Desempenho/acessibilidade:** se usar canvas, limitar DPR a 2, desenhar apenas enquanto houver movimento e cancelar RAF quando inativo. Respeitar `prefers-reduced-motion`; oferecer imagem unica/alternancia acessivel por teclado e toque como fallback, inclusive se a segunda imagem falhar.
9. **Permissoes:** direitos da fotografia atual nao estao detalhados no inventario; confirmar origem da segunda imagem e autorizacao do retratado. A referencia Lucas tem README que declara MIT, mas nao foi encontrado LICENSE independente e isso nao concede direitos sobre as fotografias. Implementar comportamento equivalente de forma independente e nao copiar midia de terceiros.

## Bloqueios para handoff ao Codex

- Confirmar os direitos de distribuicao de fundos, avatares, cenas e retratos recebidos; a entrega pelo proprietario nao foi tratada como comprovante de licenca.
- Definir geometria expressiva ou apresentacao estatica para cada novo avatar; os arquivos ainda nao sao resolvidos pelo sistema atual.
- Implementar futuramente a musica somente na primeira viagem apos desbloqueio, sob demanda, sem loop, volume inicial sugerido de 45%, respeitando preferencia de audio/autoplay e cancelamento. Nao alterar o MP3 recebido.
- Antes da terceira dimensao, decidir destinos explicitos e persistencia; antes da fotografia interativa, fornecer uma imagem alternativa alinhada e aprovada. O portal e as mascaras isoladas continuam sem arte adequada em transparencia.
- Ao concluir aprovacoes, registrar origem/licenca e hash; revisar crop desktop/tablet/mobile, contraste, fallback e movimento reduzido. Esta preparacao nao registra temas/personas nem altera o plano de implementacao.

## Atualizacao da fase 14

- A mascara Dali esta preparada em `public/la-casa-de-papel/dali-mask.png` (587 x 701, RGBA) e `dali-mask-header.png` (107 x 128); fonte preservada em `references/header-assets/dali-mask-original.png`.
- O portal amarelo isolado esta preparado em `public/rick-assets/beyond-curve/yellow-portal-icon.png` (678 x 708, RGBA) e `yellow-portal-icon-header.png` (123 x 128); fonte preservada em `references/header-assets/yellow-portal-icon-original.png`.
- Ambos foram inspecionados em 24, 32, 40, 48 e 64 px sobre fundos claros e escuros. O canal alfa e as bordas externas transparentes foram verificados; os elementos internos escuros/brancos relevantes foram preservados. Nenhum icone foi integrado. Direitos continuam sem confirmacao. Ver [HEADER_ASSETS_REPORT.md](HEADER_ASSETS_REPORT.md).
