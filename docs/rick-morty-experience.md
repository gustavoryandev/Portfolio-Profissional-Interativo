# Garagem e Cidadela

## Implementação

| Área | Componentes, recursos e estados |
| --- | --- |
| Cenário e composição | `PortfolioPage` e `DimensionalScene` montam o cenário fixo, a apresentação, o console, a área da nave e o retrato. A Garagem usa `rick-assets/garage.webp`. A Cidadela usa `rick-assets/citadel-plaza.webp` no portfólio e `rick-assets/citadel.webp` na chegada. |
| Travessia e abertura | `DimensionPortal` desenha o portal com `rick-assets/portal.webp`. `DimensionTransit` cobre a troca entre `lab` e `corrupted`. `DimensionalIntro` usa o mesmo recorte `rick-assets/spaceship.webp` da área de voo e de pouso. `ThemeContext` mantém dimensão, travessia, cena em curso, mensagem do easter egg e registros da abertura e do voo na sessão. |
| Personagens | `RickDimensionExperience` reúne a caixa e o visitante Meeseeks na bancada, Pickle Rick e o traje de rato no Laboratório, Morty nos cartões e na recepção e os personagens nas janelas da Cidadela. Os recortes e avatares estão em `public/rick-assets/`. |
| Astra e som | `DimensionAstraSignal` exibe o estado do console. A conversa compacta conserva Sr. Meeseeks. A página completa conserva Squanchy na Garagem e Sr. Bunda Cagada na Cidadela. `ThemeSelector` avisa sobre a prévia oficial antes da seleção. `useRickThemeMusic` e `RickThemeMusic` compartilham reprodução, pausa, retomada e erro entre o cabeçalho, o menu e os controles da cena. |

As paletas, o portal, a travessia e os tokens ficam em [dimensions.css](../src/dimensions.css). A composição, os cenários e o movimento dos personagens ficam em [rick-experience.css](../src/rick-experience.css). As origens dos recursos estão no [inventário de imagens e música](rick-morty-assets.md).

## Padrões para as próximas etapas

- **Composição.** Reserve espaço para cada objeto animado antes de definir a trajetória. A nave usa a faixa de voo, a caixa abre o Meeseeks na bancada, Pickle Rick tem uma pista própria e Morty aparece ao lado da imagem do projeto. As participações da Cidadela ficam nas margens em telas largas e na doca em larguras intermediárias. Use superfícies de leitura estáveis e deixe a arte do cenário visível ao redor delas.
- **Camadas.** Use os tokens de cenário, personagens, controles, abertura e travessia de `dimensions.css`. Objetos decorativos ficam fora da ordem de foco e não interceptam cliques. Controles usam elementos nativos, com foco visível. Os diálogos conservam a camada superior nativa do navegador.
- **Movimento.** Use os tempos de 160, 280 e 420 ms para resposta, entrada e revelação. Animações de personagens usam transformação e opacidade dentro de áreas delimitadas. As aberturas têm tempos próprios de 2,45 s na Garagem e 1,65 s na Cidadela. No celular, `data-rick-motion` libera apenas os elementos selecionados para cenas e interações breves.
- **Interrupção.** Aberturas aceitam o botão de pular e Escape, com retorno de foco ao portal quando o foco estava na cena. Mudanças de tamanho durante a travessia concluem a troca. Movimento reduzido leva ao estado final e conserva a rolagem horizontal nativa dos projetos. A lógica de cada interação deve alcançar o estado final mesmo quando a animação foi cancelada ou omitida.

## Verificação da composição e da travessia

As duas dimensões foram exercitadas no Chrome em 390 × 844, 820 × 1180, 1366 × 768 e 1920 × 1080. A verificação incluiu travessia por teclado, easter eggs, avanço horizontal dos projetos, pausa e retomada da prévia oficial, movimento reduzido e redimensionamento durante a travessia. A amostragem do pouso por `requestAnimationFrame` no Chrome headless registrou variações entre quadros, com pico de 83 ms. O build e 11 testes focados passaram.

## Atuação dos personagens

Na Garagem, aperte a caixa para chamar o Meeseeks. Ele entra, inclina a cabeça, procura o portal com os olhos, levanta o braço e sorri antes de descansar. Aperte a caixa novamente para dispensá-lo. O componente [CharacterPerformance](../src/components/rick/CharacterPerformance.jsx) recebe a visibilidade e uma sequência de poses com suas durações. O desenho recebe a pose atual e aplica os ângulos nos ombros, na base do tronco e no pescoço. A boca muda de contorno; as pálpebras acompanham o olhar. [Ver a gravação da bancada](screenshots/garagem-meeseeks.webp).

No Laboratório, a primeira ativação do pepino monta o traje e percorre a pista. As próximas ativações alternam o sentido da corrida. O mesmo relógio do Framer Motion seleciona o desenho da passada e a posição no chão.

A bancada, o experimento e as aberturas da Garagem e da Cidadela carregam suas imagens antes de iniciar a cena. O clique durante a carga fica pendente. Se uma imagem falhar ou exceder 2,5 s, a bancada e a pista usam o desenho vetorial local. Uma abertura incompleta devolve o controle ao portfólio. Com movimento reduzido, a caixa e a pista chegam diretamente à pose final.

**Verificação em movimento.** No Chrome, a amostragem por quadro registrou os cinco estados do Meeseeks, mudanças no contorno da boca e nas pálpebras, os cinco quadros de montagem e os seis da corrida. Os pivôs de cabeça, tronco e braços permaneceram alinhados às respectivas juntas durante o gesto. Foram exercitados o clique durante a decodificação, falha dos PNGs, reabertura durante a saída, Escape e a ativação de movimento reduzido durante a corrida. A bancada e a pista foram verificadas também em viewport móvel de 390 × 844.

## Etapa 3 · Entrada da Garagem, nave e portal

A abertura de 2,45 s roda uma vez por sessão e aceita o botão de pular ou Escape. A porta cede no trilho, ganha velocidade e acomoda no alto. Dois circuitos iluminam a Garagem em sequência. O monitor abre a imagem a partir de uma linha, e a nave recua e vibra antes de acelerar. O celular usa uma saída mais curta e uma aproximação lateral mais rasa. Na doca, a nave freia, toca o chão e acomoda. Farol, propulsão e fumaça chegam a opacidade zero. [Gravação das cenas no portfólio](screenshots/garagem-e-portal.webp).

Ao ativar o portal, a energia se concentra no centro do botão enquanto o carregador da etapa 2 prepara o destino. A borda irregular se expande e as correntes internas giram em planos diferentes. O cenário troca sob cobertura opaca, antes do primeiro quadro de revelação. Na ida, o portal aceita uma nova travessia quando os 1,65 s da chegada terminam ou o visitante pula a cena. Na volta, a liberação acontece ao fim da revelação.

Escape, redimensionamento e ativação de movimento reduzido durante a travessia concluem a troca uma única vez, inclusive durante a carga. Se a arte do pouso falhar, a Cidadela abre diretamente. O botão de pular continua disponível nas duas aberturas.

**Verificação funcional.** No Chrome, em 1366 × 768 e 390 × 844, a amostragem em movimento acompanhou a ordem dos circuitos, a abertura do monitor, a vibração do casco, a propulsão, a acomodação e a dissipação dos efeitos. Nas duas direções foram observadas a concentração, a expansão e a revelação. A edição do laboratório e a posição do trecho em leitura sobreviveram à ida e à volta, inclusive com a diferença de altura da doca no celular. Cliques repetidos durante a expansão e o pouso, redimensionamento, troca de tema e movimento reduzido foram exercitados. O build de produção passou.

## Etapa 4 · Atuação e interações

| Personagem | Ação e técnica |
| --- | --- |
| Astra compacta e completa | Sr. Meeseeks, Squanchy e Sr. Bunda Cagada usam os retratos originais com pálpebras desenhadas. A respiração e os gestos de cumprimento, atenção, processamento, resposta e erro movem o retrato inteiro. O início do texto no fluxo dispara uma apresentação breve. A boca conserva a expressão original. |
| Meeseeks na bancada | O botão da caixa desce sobre a base fixa. Um anel curto acompanha a entrada. O personagem articula braços, tronco, cabeça e rosto na acomodação e no gesto de apresentação. As três ações abrem o catálogo filtrado pela tecnologia Java, o PDF no idioma atual ou o chat com uma pergunta editável sobre o ROTA. |
| Pickle Rick | Três quadros de antecipação antecedem os cinco de montagem e os seis da corrida. Depois da descoberta, outra ativação inverte a direção. Uma interrupção conclui o deslocamento e conserva o traje durante a visita. |
| Morty | Espia da faixa reservada à arte do cartão e reage à expansão da descrição, das tecnologias ou dos detalhes. O corpo usa o PNG inteiro e as pupilas se movem separadamente. Na recepção ele olha para a placa e oferece acesso ao formulário de contato. |
| Janelas da Cidadela | Quatro figuras fazem movimentos de imagem inteira em horários diferentes. Apenas uma atua por vez. |

**Verificação.** No Chrome, foram exercitados acionamento por teclado e toque em viewport móvel, reabertura durante a saída, fuga interrompida, troca de dimensão e de tema, movimento reduzido e retorno à conversa. A resposta em fluxo e a falha do serviço (HTTP 503) foram simuladas localmente na interface real. O histórico e a pergunta editável foram conferidos. A amostragem observou as pálpebras e a respiração em movimento, quatro figuras distantes sem sobreposição de gestos e zero animações no retrato ao colocar a aba em segundo plano.

## Etapa 5 · Projetos e Laboratório

Os 15 projetos usam a expansão do cartão para abrir um dossiê de pesquisa na Garagem ou um relatório técnico na Cidadela. O [conteúdo bilíngue](../src/data/projectDossiers.js) usa a [revisão do catálogo](github-projects.md) e o histórico Git. Os dossiês do ROTA e do SnakePy também ligam a contribuição pessoal ao commit correspondente. Oito projetos sem captura própria usam diagramas identificados como **Ilustração técnica**, incluindo os três que exibiam uma imagem genérica do GitHub. Os cartões com captura conservam a ampliação. Se a imagem falhar, o cartão exibe sua ilustração.

No percurso fixado, a altura da vitrine e a distância horizontal permanecem estáveis ao abrir o dossiê e durante a reação de Morty. A leitura longa rola dentro do cartão. Os controles nas extremidades respeitam o estado desabilitado e a página continua governando a posição horizontal durante o trecho fixado.

A bancada lê os estados do executor existente. O indicador diferencia processamento, sucesso, erro e interrupção. O console conserva a saída e o diagnóstico originais. Morty reage a uma execução recém-concluída em uma área própria do painel e o movimento reduzido suprime os efeitos.

**Verificação.** No Chrome, em 1366 × 768, 1920 × 1080 e 390 × 844, foram conferidos filtro, busca, expansão por teclado, links, ampliação de captura e navegação pela galeria. A roda atravessou o fim da vitrine, e a rolagem reversa retomou o percurso horizontal. A amostragem durante a abertura registrou mudanças na opacidade do dossiê e na posição de Morty com altura constante do percurso. O executor real concluiu exemplos de JavaScript, Python e Java via Wandbox. Em JavaScript, também foram exercitados diagnóstico de erro e interrupção. Com movimento reduzido, os dossiês abriram sem animação e a galeria manteve rolagem horizontal nativa.

## Etapa 6 · Som, movimento e carregamento

- **Som e movimento** fica junto ao botão de pausa no cabeçalho e no menu móvel. Volume e pausa de efeitos contínuos são preferências locais. O player suaviza a entrada, a pausa e a saída do tema, trata carregamento, falha e término da prévia e retoma após voltar à aba somente quando já havia iniciado a reprodução. Uma pausa manual cancela a retomada. A travessia usa o mesmo player. A experiência usa a prévia musical oficial como única fonte de áudio.
- A pausa de efeitos mantém as interações e interrompe os ciclos contínuos do portal, dos personagens e do globo. Com movimento reduzido do sistema, a ambientação permanece e o portal troca de dimensão diretamente. O globo pode ser explorado por arraste sem rotação automática. A observação de visibilidade é compartilhada e o globo para de agendar quadros fora da tela.
- Os recursos do tema passaram de **4.860.657 para 1.188.748 bytes** em `public/rick-assets` e no antigo arquivo de Garagem, cerca de **76%** a menos. A soma inclui as duas variantes responsivas dos cenários. Os PNGs idênticos foram consolidados e duas artes de referência passaram para a documentação. O navegador carrega o cenário atual com prioridade e prepara o alternativo em tempo ocioso. A troca tem duração própria e usa as cores da dimensão enquanto a arte atrasada carrega. A íris tem uma base de 384 px e é substituída por um véu do tamanho da viewport durante a revelação.

**Validação.** No build de produção, confirmei Garagem e Cidadela nas cinco larguras da tabela. Usei teclado e toque emulado, textos em PT/EN, foco ao fechar chat e controles, viewport equivalente a 200%, movimento reduzido, troca repetida de tema, travessia e abertura do chat. A prévia oficial foi exercitada com troca real de abas, pausa manual, fim, repetição, falha de carregamento induzida e nova tentativa. Ao atrasar as imagens da próxima dimensão em 1,65 s, a transição terminou em cerca de 0,94 s. A pausa do globo e a suspensão dos seus quadros fora da tela foram verificadas. Nos pontos de texto amostrados sobre o fundo renderizado da apresentação, dos controles, dos projetos e do console, o menor contraste foi **6,17:1**. O build e **16 testes focados** passaram.

A amostragem abaixo usou `requestAnimationFrame` no Chrome headless, com o build de produção local. Os valores são intervalos do relógio do navegador, em milissegundos.

| Viewport | Abertura da Garagem (p95) | Pouso (p95) | Maior intervalo na revelação do portal |
| --- | ---: | ---: | ---: |
| 390 × 844 | 18 | 18 | 90 |
| 768 × 1024 | 18 | 18 | 126 |
| 1280 × 720 | 18 | 18 | 126 |
| 1366 × 768 | 18 | 18 | 126 |
| 1920 × 1080 | 18 | 18 | 144 |

## Etapa 7 · Extras dimensionais

- **Registro opcional.** O rodapé reúne o registro, as reprises e os créditos. Quando ativado, o registro salva neste navegador quatro descobertas das interações existentes. A limpeza afeta somente as descobertas. O registro é independente do acesso a projetos, currículo e contato.
- **Reprises.** As duas cenas podem ser revistas sem mudar a dimensão ou iniciar música. Escape encerra a reprise e devolve o foco ao acionador. Em movimento reduzido, a mesma escolha abre uma imagem estática da cena.
- **Instrumentos, credencial e TV.** Os instrumentos explicam as migrações do ROTA e o executor do Laboratório, com atalhos para os conteúdos. A credencial da Cidadela reutiliza o nome, o foco técnico e os links profissionais. A TV fica fora da área fixada da galeria e usa as capturas existentes do Portfólio Interativo e do GEOSOLAR, com links para as fichas.
- **Trajetória e contato.** O diário aplica o estilo da dimensão aos cards de experiência e formação com seus dados originais. A transmissão mantém o formulário, a validação e os estados de entrega existentes. Os créditos usam o [inventário de artes](rick-morty-assets.md) e a referência da música oficial.

**Verificação.** No Chrome, em 1366 × 768 e 390 × 844, conferi os atalhos diretos, a galeria fixada, o registro após recarregar, a limpeza isolada, o retorno do foco em ambas as reprises, as imagens estáticas com movimento reduzido, a credencial e as datas da trajetória. O formulário bloqueou um e-mail inválido, mostrou a falha simulada e confirmou o sucesso após as duas respostas esperadas. O build e 15 testes focados passaram.

## Revisão das correções prioritárias

As medições desta revisão usam o build de produção local no Chrome headless, com zoom de 100%. Escuro e Galo serviram de referência. Na Garagem e na Cidadela, a largura útil e a escala do título agora acompanham as dos dois temas. O console vem depois da apresentação e dos links. O mínimo da seção inicial nas telas largas é a altura da viewport menos a altura medida do cabeçalho. A seção pode crescer com o conteúdo. Nas telas estreitas, as colunas passam a seguir o fluxo vertical.

| Viewport | Largura útil nos três temas | Título nos três temas | Foto em Escuro / Galo / abertura oval em Rick | Início de “Sobre mim” em Rick, medido no título |
| --- | ---: | ---: | --- | ---: |
| 1280 × 720 | 1143 px | 89,6 px | 314 / 320 / 261 px | 944 px |
| 1366 × 768 | 1180 px | 95,6 px | 314 / 343 / 261 px | 963 px |
| 1920 × 1080 | 1180 px | 112 px | 399 / 374 / 329 px | 1210–1262 px |

Antes da correção, a altura mínima da apresentação tinha um teto de 740 px e o tamanho do título e da foto dependia da altura da janela. Em 1920 × 1080, o título de “Sobre mim” aparecia a 1020 px do topo. Em 390 × 844 e 768 × 1024, as duas dimensões foram verificadas também em coluna, com todos os elementos no fluxo e sem transbordamento horizontal da página.

| Falha | Correção e evidência |
| --- | --- |
| Moldura do portal | O botão combinava uma borda permanente, estado de alternância e retorno de foco programático. Agora seu nome anuncia a próxima ação e o status anuncia a dimensão atual. A pressão dura o acionamento. A travessia sinaliza ocupação até a liberação. Depois do pouso, o foco voltou ao portal sem moldura por mouse ou toque emulado. Depois de Escape ou Enter, o contorno de teclado ficou visível. |
| Foto antes da cena | A abertura renderizava um espaço vazio durante a decodificação, começava transparente e, no celular, cobria apenas uma faixa. Na ida pelo portal, a página de destino aparecia sob o véu antes da montagem do pouso. Agora a abertura monta uma superfície opaca e pulável desde o primeiro quadro. A ilustração e seu relógio começam com os recursos prontos. Na ida, o pouso monta sob o véu ainda opaco. A navegação por âncora também conserva o foco dentro da abertura. |
| Fala intermitente | A pose de acomodação liberava o texto antes que a pose de atenção voltasse a ocultá-lo. Fala e ações agora reservam espaço desde a entrada e ficam visíveis juntas em `reaction` e `idle`. O console anuncia a chamada uma vez. Em 1366 × 768, a área medida manteve 158 px nas cinco poses. Foram exercitados fechamento, reabertura durante a saída, carga lenta, falha de imagem e movimento reduzido. |
| Apresentação do assistente | Antes da correção, “me fale sobre vc senhor cagada” chegava a `POST /api/chat`, escapava da regra de identidade e terminava em NDJSON com `degraded: true`. A configuração local do serviço estava presente. Uma pergunta generativa de controle também completou o streaming em outra requisição. O motivo remoto da falha original permanece indeterminado. Agora a intenção de apresentação em PT e EN consulta a identidade bilíngue da persona ativa. No chat completo da Cidadela, a frase original produziu uma requisição, uma pergunta no histórico e uma única resposta. Uma falha HTTP 503 induzida numa pergunta técnica manteve o histórico e restituiu o texto ao editor. |

**Validação em movimento.** Com cache frio e a arte atrasada, a amostragem por quadro encontrou a cobertura da Garagem antes da ilustração. Com o cache aquecido, as imagens foram revalidadas com HTTP 304. Uma recarga normal da mesma sessão preservou a regra de frequência. O centro e os limites da viewport permaneceram cobertos na passagem do véu para o pouso, inclusive no celular. Pular durante a carga, Escape, cliques repetidos, redimensionamento, troca de tema, falha de imagem e o limite de 2,5 s liberaram a interface. A roda avançou a faixa fixada em 580 px no notebook. O código editado e a posição de leitura do Laboratório sobreviveram às duas travessias. O build e 43 testes focados passaram.

### Portal procedural reutilizável

A versão atual do retrato usa o SVG procedural compartilhado com a demonstração em `/portal.html`. A foto mantém uma abertura oval própria. O portal de navegação continua usando a arte local. A comparação e as medições do retrato abaixo documentam a versão raster anterior. [API, exemplos e decisões de desempenho](portal-dimensional.md).

### Conferência das entregas

**Portal do retrato.** O cartão reserva uma área exclusiva para o portal. A silhueta e as manchas de energia usam a arte local de `portal.webp`. Duas camadas percorrem a faixa em velocidades diferentes, com uma variação suave de luminosidade. A Cidadela usa a mesma textura em azul/ciano. A abertura oval mantém a foto imóvel e deixa rosto e cabelo dentro do enquadramento. Em 390 × 844, a faixa ocupa 26–33 px nos eixos centrais. Em 1366 × 768, ocupa 29–37 px. As duas dimensões foram amostradas nas cinco viewports, com efeitos ativos, pausados e movimento reduzido. As duas animações pararam fora da tela e em uma aba em segundo plano. [Comparação da arte original com as capturas pausadas](screenshots/portal-retrato.webp).

**Corrida de Pickle Rick.** A arte do corpo olha para a esquerda. O traje, as garras e os seis desenhos da passada passaram a usar essa orientação de origem. A inclinação do tronco parte do quadril e leva consigo braços e arnês. Na volta, um único espelhamento orienta o personagem inteiro. Na amostragem das duas corridas, os pés alcançaram a linha 106 nos quadros de contato e a linha 104 nos de passagem, no campo de 104 × 112. Cliques repetidos, uma interrupção fora da tela e a corrida seguinte conservaram a descoberta e a direção.

| Estado | Entrega conferida |
| --- | --- |
| Concluído | Garagem, Cidadela, travessia, música com aviso e pausa, reprises, extras e dossiês continuam integrados. Meeseeks usa articulação própria e mantém as três ações. Pickle Rick combina os quadros de antecipação, montagem e corrida. |
| Parcial | As expressões dos assistentes combinam pálpebras desenhadas e gestos de retrato inteiro. Morty tem pupilas independentes e movimentos de corpo inteiro. Rick aparece como imagem inteira. A TV permite alternar capturas estáticas do Portfólio Interativo e do GEOSOLAR e abrir suas fichas. |
| Ausente | Articulação corporal independente de Rick e Morty, canais de TV com vídeo e efeitos sonoros próprios para caixa, nave e portal. O áudio implementado é a prévia musical. |
| Dependente de arte ou mídia | Gestos adicionais de braços e tronco precisam de artes em camadas ou poses. Vídeos e efeitos de cena exigem arquivos apropriados e origem documentada. |
| Dependente de validação externa | Áudio, toque, zoom e fluidez em aparelhos físicos. A entrega de e-mail no ambiente publicado depende de envio autorizado. |

## Pendências

- Para gestos independentes de braços e tronco de Rick e Morty, faltam artes corporais em camadas ou poses adicionais. A movimentação ocular de Morty usa a camada preparada nesta etapa.
- Persistem picos na troca de cenário. A revisão eliminou medições e restaurações de rolagem desnecessárias no topo e restringiu o trabalho dos cards fora da área visível da galeria fixada. Na amostragem que inclui a cobertura e a revelação, a ida registrou 83–100 ms nas três larguras de notebook/desktop e chegou a 283 ms em 768 × 1024. A travessia terminou nas duas direções. O registro anterior de até 83 ms no pouso refere-se a outra fase. Validar áudio, toque, zoom e fluidez em aparelhos físicos, incluindo iOS/Safari e Android.
- Complementar os dossiês quando houver fontes para outras contribuições individuais ou resultados mensurados.
- Conferir a entrega de e-mail no ambiente publicado com um envio autorizado. A verificação desta etapa usou transporte simulado.
