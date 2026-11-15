# Relatório técnico do Portfólio Profissional Interativo

Este relatório descreve os 177 arquivos versionados, excluindo imagens e ícones gráficos, no checkout de 15 de novembro de 2026, na revisão `edc9a7c`. O próprio relatório foi criado depois desse levantamento.

## Índice

- [Arquitetura e fluxos](#arquitetura-e-fluxos)
- [Raiz e configuração](#raiz-e-configuração)
- [API, módulos do servidor e banco](#api-módulos-do-servidor-e-banco)
- [Entrada, rotas, estado e hooks](#entrada-rotas-estado-e-hooks)
- [Componentes React](#componentes-react)
- [Serviços do navegador](#serviços-do-navegador)
- [Dados e internacionalização](#dados-e-internacionalização)
- [Estilos e efeitos](#estilos-e-efeitos)
- [Astra Arcade](#astra-arcade)
- [Arquivos públicos](#arquivos-públicos)
- [Documentação original](#documentação-original)
- [Testes e ambientes de validação](#testes-e-ambientes-de-validação)
- [Arquivos locais](#arquivos-locais)

## Arquitetura e fluxos

O projeto é um portfólio em React com Vite. A rota `/` apresenta o perfil, os projetos, o Laboratório de código, as habilidades, a trajetória e o contato. O botão flutuante abre a Astra compacta dentro do portfólio. A rota `/chat` exibe a Astra completa e, com `?arcade=1` ou o identificador de um jogo, pode abrir o Arcade. A navegação e o estado compartilhado dessas experiências são coordenados por `src/App.jsx`.

| Fluxo | Caminho no código e comportamento |
| --- | --- |
| Abrir um projeto | `perfil.json` abastece `ProjectsCard`, que filtra o catálogo e usa `ProjectCard` para exibir cada item. `ProjectsScrollSection` controla a vitrine e o foco quando a URL aponta para um projeto. O catálogo é curado em JSON. As consultas ao GitHub abastecem os cards de atividade, linguagens e repositórios. |
| Enviar uma mensagem à Astra | `ChatPage` intercepta alguns comandos e envia as demais mensagens a `/api/chat` por `services/api.js`. O handler usa o perfil, o histórico e, quando necessário, o contexto das integrações e o Gemini. A resposta pode chegar em NDJSON, com um evento JSON por linha. `StreamingReply` mostra a prévia e `MessageBubble` renderiza a mensagem final e interpreta os marcadores dos cards. |
| Executar uma ação pela conversa | `server/portfolioTools.js` descreve as ferramentas que o modelo pode solicitar. O cliente valida ações e alvos, e o motor de ações despacha navegação, mudança de tema ou idioma e operações do Laboratório. Uma proposta de alteração de código passa por `LaboratoryReview`, que pede aprovação antes de aplicar a edição. |
| Atualizar métricas | `useLiveContext` acompanha as fontes associadas aos cards da conversa. O handler consulta as fontes necessárias, usando `liveCache.js` para reaproveitar resultados e preservar dados anteriores quando há falhas temporárias. Os detalhes e o status de atividade do WakaTime também têm consultas próprias. |
| Rodar código | `CodePlayground` e a Astra compartilham a instância de `laboratory.js`. JavaScript roda no navegador, Python roda no navegador com Pyodide obtido de uma CDN, e o worker de Java envia o código ao Wandbox. Os três devolvem a saída ao editor por mensagens de worker. Rascunhos e resultados ficam em memória durante a sessão da aplicação. |
| Jogar | `ChessCard.jsx` contém o tabuleiro jogável, que usa `chess.js` e o motor Stockfish local. O Arcade carrega os jogos sob demanda, desenha em canvas e grava as partidas em `localStorage`. A migração do Supabase prepara uma tabela para eventual sincronização. |
| Enviar contato | `ContactSection` chama `services/contact.js`, que usa o EmailJS diretamente no navegador para encaminhar a mensagem ao dono do portfólio e enviar a confirmação ao visitante. |

Em desenvolvimento, o middleware do Vite atende `/api/chat` com o mesmo handler usado pela Vercel em produção. O servidor mantém caches em memória. O contexto resumido do chat volta ao cliente e acompanha as requisições seguintes.

## Raiz e configuração

| Arquivo | Função |
| --- | --- |
| `.env.example` | Modelo de variáveis de ambiente para Gemini, GitHub, WakaTime, Spotify, Canvas, Chess.com e EmailJS. Serve de referência para montar a configuração local. |
| `.gitignore` | Define o que o Git ignora, incluindo dependências instaladas, build, cache, logs, configuração local e arquivos de credenciais. |
| `.vscode/settings.json` | Configura o VS Code para atualizar automaticamente a configuração de build do Java. |
| `README.md` | Apresenta o portfólio, as rotas, as funcionalidades, a arquitetura e os comandos de instalação, teste e deploy. |
| `index.html` | Documento de entrada com metadados, favicon, nó raiz do React e importação de `src/main.jsx`. Um script antecipa a aplicação do tema salvo para que a primeira pintura respeite a preferência. |
| `package.json` | Declara dependências, formato de módulos e comandos do npm para desenvolvimento, build, prévia e OAuth do WakaTime. |
| `package-lock.json` | Registra as versões resolvidas, inclusive dependências transitivas, para reproduzir a instalação com `npm ci`. |
| `postcss.config.js` | Registra Tailwind e Autoprefixer no processamento do CSS. |
| `tailwind.config.js` | Indica os arquivos que o Tailwind examina e associa cores utilitárias às variáveis CSS do tema. |
| `vercel.json` | Reescreve acessos diretos a `/chat` para `index.html`, de onde a aplicação React resolve a rota. |
| `vite.config.js` | Configura a transformação do React e instala o plugin que oferece a API local no servidor de desenvolvimento. |

## API, módulos do servidor e banco

| Arquivo | Função |
| --- | --- |
| `api/chat.js` | Handler `POST /api/chat`. Encaminha consultas de chat, tradução, catálogo de modelos, atualização das integrações e detalhes/atividade do WakaTime. Reúne dados de GitHub, WakaTime, Spotify, Canvas, ESPN e Chess.com. Também seleciona modelos do Gemini, formata o contexto de perfil, resume o histórico antigo, encaminha ferramentas e entrega respostas JSON ou NDJSON. |
| `server/cardIntents.js` | Detecta quais cards são pertinentes à mensagem, instrui o modelo sobre os marcadores permitidos e filtra marcadores indevidos na resposta. |
| `server/devApi.js` | Middleware do Vite que encaminha `/api/chat` para o handler real. Adapta corpo, status e resposta ao formato esperado pela função serverless, inclusive para streaming. |
| `server/liveCache.js` | Cache por fonte externa. Compartilha buscas simultâneas, aplica tempos de validade e intervalos de nova tentativa, e devolve o último resultado disponível quando a fonte falha. |
| `server/modelCache.js` | Cache de descoberta dos modelos Gemini por credencial. Compartilha descobertas concorrentes, limita a espera inicial e permite trabalhar com um catálogo anterior ou uma lista de fallback. |
| `server/ndjson.js` | Escreve eventos JSON delimitados por nova linha. Aguarda o sinal `drain` quando a resposta está congestionada e trata interrupção da conexão. |
| `server/portfolioTools.js` | Define nomes, argumentos e regras das ferramentas de portfólio e Laboratório oferecidas ao Gemini. Converte as chamadas do modelo em ações que o cliente reconhece. |
| `server/wakatime.js` | Implementa consultas por período e atividade recente, renovação OAuth e formatação das métricas. Aplica as regras de divulgação a nomes de projetos, bibliotecas e detalhes de atividade. |
| `scripts/wakatime-oauth.mjs` | Inicia o fluxo OAuth em uma máquina local, recebe o retorno em um servidor temporário, troca o código por tokens e atualiza `.env.local`. É acionado por `npm run wakatime:oauth`. |
| `supabase/migrations/20261109000000_create_arcade_sessions.sql` | Cria a tabela de sessões do Arcade, suas restrições, o índice do histórico e políticas de acesso por usuário autenticado. O Arcade atual grava os recordes no navegador. |

## Entrada, rotas, estado e hooks

| Arquivo | Função |
| --- | --- |
| `src/main.jsx` | Monta o React, importa estilos globais e i18n, aplica o provedor de tema e exibe as ondas decorativas antes de renderizar `App`. |
| `src/App.jsx` | Interpreta rota, âncora e parâmetros de projeto e Arcade. Mantém a instância compartilhada do Laboratório e do motor de ações, carrega a página do chat sob demanda, abre e fecha a Astra compacta e coordena foco, rolagem e histórico de navegação. |
| `src/pages/PortfolioPage.jsx` | Monta o portfólio contínuo em `/`. Acompanha a seção visível durante a rolagem e informa ao cabeçalho e à navegação móvel qual item deve ficar ativo. |
| `src/pages/ChatPage.jsx` | Controla o histórico em memória, a caixa de entrada, sugestões, carregamento, streaming e cards nas duas versões da Astra. Encaminha ações e comandos, abre recursos e integra a experiência completa ao Arcade. |
| `src/context/AstraContext.jsx` | Disponibiliza ações de navegação e acesso ao Laboratório em componentes descendentes. `useLaboratory` inscreve os componentes nas mudanças do estado do editor. |
| `src/context/ThemeContext.jsx` | Resolve o tema inicial, aceita identificadores antigos, atualiza atributos e classes do elemento HTML e persiste a escolha em `localStorage`. |
| `src/hooks/useEntranceInteraction.js` | Compartilha a interação de ponteiro das telas de entrada. Atualiza posição e deslocamento por quadro de animação e respeita a preferência por movimento reduzido. |
| `src/hooks/useLiveContext.js` | Gerencia os dados ao vivo do chat. Mescla respostas, deduplica consultas simultâneas, atualiza fontes observadas enquanto a aba está visível e controla os indicadores de carregamento. |
| `src/hooks/useMobileLayout.js` | Inscreve o React na consulta de mídia de largura para decidir quando usar a apresentação móvel. |
| `src/hooks/useMobileViewport.js` | Ajusta o diálogo da Astra à área visível em dispositivos móveis usando `visualViewport`, inclusive quando o teclado virtual ocupa parte da tela. |
| `src/hooks/useWakaTime.js` | Busca detalhes do WakaTime por período ou o status de atividade. Mantém resultados por chave, oferece nova tentativa e reaproveita o dado anterior em falhas temporárias. |

## Componentes React

### Chat, navegação e identidade visual

| Arquivo | Função |
| --- | --- |
| `src/components/AstraAvatar.jsx` | Renderiza a imagem da Astra. Escolhe as versões específicas para os temas Galo e usa o avatar padrão nos demais temas. |
| `src/components/AstraEntrance.jsx` | Tela de entrada da Astra completa, com avatar, interação visual e comandos para seguir para a conversa ou voltar ao portfólio. |
| `src/components/AstraHero.jsx` | Apresentação inicial do chat vazio. Exibe saudação, sugestões de perguntas e atalhos para iniciar uma interação. |
| `src/components/AstraResources.jsx` | Painel de recursos da Astra. Oferece atalhos para navegação, integrações, jogos, temas, idiomas e Laboratório, com gerenciamento de foco e fechamento. |
| `src/components/FullAstraCardLink.jsx` | Link reutilizado em cards compactos para abrir o conteúdo correspondente na Astra completa. |
| `src/components/MessageBubble.jsx` | Renderiza mensagens do visitante e da Astra. Divide texto e marcadores de cards, formata blocos de código, oferece cópia e tradução e conecta os cards a dados e novas tentativas. |
| `src/components/MobileNav.jsx` | Navegação inferior para celular, com início, projetos, Astra e menu complementar com seções e controles. |
| `src/components/Navbar.jsx` | Cabeçalho do portfólio. Exibe links de seção, marca a seção ativa e exporta `HeaderActions`, com controles de tema, idioma e currículo. |
| `src/components/OptionMenu.jsx` | Menu genérico de opções com estado selecionado, tratamento de foco e fechamento. É usado em controles como o seletor de tema. |
| `src/components/PortfolioIntro.jsx` | Controla a apresentação inicial do portfólio, incluindo a opção de pular, a condição para tocar a animação e a entrega de foco ao conteúdo. |
| `src/components/PortfolioLogo.jsx` | Desenha a marca GR usando a imagem local e tratamento SVG que permite acompanhar a paleta ativa. |
| `src/components/GaloCrest.jsx` | Renderiza o escudo do Atlético Mineiro para superfícies que usam a identidade Galo. |
| `src/components/Sidebar.jsx` | Exporta a lista de seções reaproveitada pela navegação e pelo conteúdo. O arquivo também contém a implementação de um menu lateral de perfil e perguntas. As rotas atuais reaproveitam a lista. |
| `src/components/StreamingReply.jsx` | Assina o buffer da resposta em fluxo, mostra o texto parcial e acompanha a rolagem quando habilitada. Os cards ficam para a renderização da mensagem final. |
| `src/components/ThemeSelector.jsx` | Mostra os temas disponíveis e suas amostras e encaminha a escolha ao provedor de tema. |
| `src/components/ThemeWaves.jsx` | Desenha o fundo de ondas em SVG com cores derivadas do tema. Inclui uma composição específica para os temas Galo. |

### Conteúdo do portfólio e Laboratório

| Arquivo | Função |
| --- | --- |
| `src/components/CodePlayground.jsx` | Interface do Laboratório. Exibe escolhas de linguagem e exemplo, editor, botões para executar, parar e restaurar, e área de saída. Consome o estado compartilhado e pode mostrar a revisão solicitada pela Astra. |
| `src/components/ContactSection.jsx` | Exibe o formulário de contato no site ou na conversa, reúne os campos e apresenta estados de envio, sucesso e erro. |
| `src/components/DesignSystemCard.jsx` | Guia visual interativo para a conversa. Demonstra cores, tipografia, espaçamento, formas e componentes, incluindo informações sobre contraste. |
| `src/components/EducationSection.jsx` | Mostra formação acadêmica, instituições e destaques a partir do perfil. |
| `src/components/ExperienceCard.jsx` | Apresenta as experiências declaradas no perfil em um card reutilizado no portfólio e no chat. |
| `src/components/LaboratoryReview.jsx` | Exibe a revisão de uma proposta do Laboratório. O visitante pode conferir as mudanças e aprovar ou recusar a proposta. |
| `src/components/LanguageIcon.jsx` | Renderiza o ícone tecnológico local correspondente ao nome recebido. Usa um ícone genérico quando o nome é desconhecido ou a imagem falha. |
| `src/components/PortfolioSection.jsx` | Seleciona qual conteúdo de portfólio mostrar conforme o identificador recebido. A página atual o usa para experiência, formação e contato. |
| `src/components/ProfilePanel.jsx` | Define o painel de perfil, links e atalhos. `SocialLinks`, exportado pelo mesmo módulo, é usado pela apresentação da rota inicial. |
| `src/components/ProjectCard.jsx` | Card individual de projeto. Exibe prévia, descrição localizada, tecnologias e ações externas ou de conversa com a Astra. Trata imagens ausentes ou com falha. |
| `src/components/ProjectsCard.jsx` | Monta o catálogo a partir de `perfil.json`, com busca, filtros de categoria, seleção de destaques e opções para controlar a vitrine ou mostrar uma prévia. |
| `src/components/ProjectsScrollSection.jsx` | Envolve o catálogo na vitrine da página inicial. Em telas compatíveis, converte parte da rolagem vertical em deslocamento horizontal. Coordena navegação por teclado, rolagem nativa em outros layouts e foco vindo da URL. |
| `src/components/RedesignHome.jsx` | Implementa uma apresentação alternativa em formato de painel, com abertura animada, navegação e integrações. Fica fora das rotas montadas pelo `App` atual. |
| `src/components/ResumeCard.jsx` | Abre o currículo do idioma ativo e usa PDF.js para desenhar páginas em canvas. Oferece controles de leitura e link para o PDF. |
| `src/components/SkillsGlobe.jsx` | Apresenta habilidades em um globo interativo, com tratamento para layouts ou preferências que reduzem movimento. |
| `src/components/SkillsProficiencyCard.jsx` | Mostra os níveis e percentuais declarados no perfil com barras acessíveis e indicação para valores ainda indefinidos. |
| `src/components/SwarmCursors.jsx` | Anima cursores decorativos de acordo com o progresso da abertura de `RedesignHome`. |
| `src/components/TechnologyLink.jsx` | Mostra a tecnologia com ícone e adiciona link para a documentação quando existe um destino cadastrado. |

### Cards de dados e elementos reutilizáveis

| Arquivo | Função |
| --- | --- |
| `src/components/CanvasCard.jsx` | Apresenta dados acadêmicos do Canvas LMS, como cursos e tarefas, com links e estados contextuais. |
| `src/components/ChessCard.jsx` | Mostra dados do perfil do Chess.com, como ratings, resultados e partidas. Exporta também `ChessGame`, o tabuleiro local com lances legais, dificuldade e resposta do Stockfish. |
| `src/components/GaloCard.jsx` | Apresenta jogos do Atlético Mineiro obtidos pelo servidor, com adversários, placares, datas, situação e informações de local quando disponíveis. |
| `src/components/GithubActivityCard.jsx` | Transforma o calendário de contribuições e os dados de commits em resumos, sequências e visualizações de atividade. |
| `src/components/GithubCard.jsx` | Mostra o perfil e os principais indicadores do GitHub em um resumo de leitura rápida. |
| `src/components/GithubLanguagesCard.jsx` | Normaliza a distribuição de linguagens recebida, agrupa itens menores e renderiza os respectivos percentuais. |
| `src/components/LiveDataNotice.jsx` | Mostra mensagens de carregamento, desatualização ou indisponibilidade dos dados ao vivo e uma nova tentativa quando há ação disponível. |
| `src/components/RepositoriesCards.jsx` | Lista repositórios do GitHub e apresenta dados como descrição, linguagem e métricas, com links para os projetos. |
| `src/components/SpotifyCard.jsx` | Apresenta música ou atividade recente do Spotify e listas de faixas e artistas quando esses dados estão disponíveis. |
| `src/components/StatsCard.jsx` | Exibe os detalhes do WakaTime. Inclui seleção de período, atividade recente e detalhamentos como linguagens, projetos, categorias e outras quebras disponíveis. |
| `src/components/WakaTimeCard.jsx` | Renderiza o resumo do WakaTime recebido no contexto da conversa, com tempo, indicadores e distribuição de linguagens. |
| `src/components/ui/CardShell.jsx` | Define a estrutura visual comum de card e exporta versões reutilizáveis de cabeçalho e rodapé, com título, ícone, estado ou link. |
| `src/components/ui/ScrollReveal.jsx` | Marca elementos que revelam conteúdo ao entrar na área visível. Define a tag e o atraso, enquanto o efeito é coordenado pelo CSS e por `glassFx.js`. |
| `src/components/ui/StatTile.jsx` | Peça pequena para apresentar um indicador com ícone, rótulo, valor, informação complementar e destaque opcional. |

## Serviços do navegador

| Arquivo | Função |
| --- | --- |
| `src/services/api.js` | Cliente da API do portfólio. Permite enviar uma mensagem, traduzir respostas, atualizar o contexto e consultar o WakaTime. Seleciona o transporte de chat conforme as opções recebidas. |
| `src/services/astraActionEngine.js` | Executa planos validados da Astra. Despacha navegação e preferências, lê estados autorizados do Laboratório e encaminha operações de edição para revisão quando necessário. |
| `src/services/astraActionReply.js` | Converte identificadores de resultado das ações em mensagens determinísticas em português ou inglês. |
| `src/services/chatStream.js` | Lê respostas do chat em NDJSON, lida com fragmentos de texto e encaminha eventos de conteúdo, substituição, finalização e erro. Também deduplica o aquecimento do catálogo de modelos. |
| `src/services/contact.js` | Normaliza os dados do formulário, envia os templates do EmailJS e controla recuperação e duplicidade, incluindo falha apenas no email de confirmação. |
| `src/services/conversationResource.js` | Reconhece pedidos de xadrez, ratings e proficiência em PT/EN e interpreta confirmações curtas à luz da última resposta. |
| `src/services/dialogInteraction.js` | Distingue cliques na área externa do diálogo de interações dentro do painel. É usado pelas interfaces modais. |
| `src/services/laboratory.js` | Mantém seleção, código, saída, estado e revisão por linguagem e exemplo. Gerencia o ciclo dos workers, limites de tempo, interrupção e aplicação de mudanças aprovadas à revisão correta. |
| `src/services/liveContext.js` | Associa os marcadores de cards às fontes, identifica dados que precisam de atualização e mescla resultados parciais preservando valores válidos. |
| `src/services/portfolioActions.js` | Centraliza identificadores, limites e formatos usados por ações de navegação e Laboratório. Valida ações e higieniza o estado que pode entrar no fluxo da Astra. |
| `src/services/stockfish.js` | Abre o worker do Stockfish, negocia o protocolo UCI, configura a dificuldade, envia a posição FEN e interpreta o melhor lance. Encerra a busca ao finalizar ou cancelar. |
| `src/services/streamBuffer.js` | Acumula fragmentos da resposta e agrupa notificações à interface para evitar uma atualização do React a cada pedaço recebido. |

## Dados e internacionalização

| Arquivo | Função |
| --- | --- |
| `src/assets/.gitkeep` | Marcador vazio que mantém o diretório de recursos no Git. |
| `src/data/designSystem.js` | Declara o marcador de resposta e a ação que abrem o guia visual. Inclui reconhecimento de pedidos voltados ao design system. |
| `src/data/languageIcons.js` | Mapeia nomes e aliases de linguagens e ferramentas a SVGs distribuídos localmente. |
| `src/data/perfil.json` | Base editorial consumida pela página e pelo servidor. Reúne biografia, contatos, formação, experiências, habilidades, percentuais declarados e catálogo de projetos em formato estruturado. |
| `src/data/playgroundExamples.js` | Catálogo de exemplos do Laboratório, com identificação, textos de apresentação e os exemplos em Python. |
| `src/data/playgroundFreeCode.js` | Código inicial de cada linguagem para o modo livre do Laboratório. |
| `src/data/playgroundLanguages.js` | Metadados de Python, JavaScript e Java e versões em JavaScript e Java para os exemplos do catálogo. |
| `src/data/projectContent.js` | Resolve o texto de cada campo de projeto para o idioma ativo a partir de texto direto, valor por idioma ou chave i18n. |
| `src/data/skillProficiency.js` | Valida percentuais entre 0 e 100 e converte os valores em níveis básico, intermediário e avançado, com rótulos nos dois idiomas. |
| `src/data/technologyDocs.js` | Mapeia nomes de tecnologias a endereços utilizados nos links para suas documentações. |
| `src/data/themes.js` | Cataloga as paletas, seus identificadores e amostras, os aliases de temas antigos e a função que identifica os temas Galo. |
| `src/i18n/index.js` | Inicializa o i18next e o react-i18next em português com fallback em inglês. Atualiza o atributo de idioma do HTML quando o visitante troca a língua. |
| `src/i18n/pt.json` | Dicionário de rótulos, textos e mensagens em português para navegação, chat, cards e demais partes da interface. |
| `src/i18n/en.json` | Dicionário em inglês para as mesmas áreas da interface, usado ao selecionar inglês e como fallback do i18next. |

## Estilos e efeitos

| Arquivo | Função |
| --- | --- |
| `src/index.css` | Camadas do Tailwind e estilos globais de controles, rolagem, cards, bolhas, chat, currículo embutido e superfícies compartilhadas. |
| `src/astra.css` | Layout da conversa compacta e completa, da área de trabalho e do campo de mensagem, com regras de encaixe no viewport móvel. |
| `src/entrance-theme.css` | Aparência compartilhada das telas de abertura, com variações de tema e comportamento para movimento reduzido. |
| `src/glass-neon.css` | Define transparência, bordas neon, brilho, fundos e transições. Inclui ajustes para movimento e transparência reduzidos. |
| `src/glassFx.js` | Efetiva revelações por visibilidade e calcula a posição do realce sob o ponteiro. Agrupa atualizações por quadro e desativa efeitos conforme a preferência de movimento e as condições de layout. |
| `src/header.css` | Define visual e organização responsiva do cabeçalho, marca, navegação e controles de tema, idioma e currículo. |
| `src/intro.css` | Estiliza a abertura animada do portfólio, seus elementos visuais e o controle para pular. |
| `src/mobile.css` | Camada de regras para navegação inferior e adaptação de módulos a telas pequenas. |
| `src/motionPreferences.js` | Centraliza as consultas de mídia usadas para o layout móvel e a preferência por movimento estático. |
| `src/scroll.css` | Estiliza a página contínua do portfólio, incluindo o hero, as seções, a vitrine de projetos, a lista de habilidades e as revelações. |
| `src/themes.css` | Mapeia cada tema para variáveis CSS de cor, superfície, contorno e brilho usadas na página, no chat e nas amostras do seletor. |
| `src/components/AstraEntrance.css` | Aparência e animações específicas da tela de entrada da Astra completa. |
| `src/components/CodePlayground.css` | Estilos do editor de código, controles, terminal, estados e painel de revisão do Laboratório. |
| `src/components/RedesignHome.css` | Folha de estilo do painel alternativo `RedesignHome`, incluindo sua introdução, o layout e os estados responsivos. |
| `src/components/designSystem.css` | Estiliza o card que demonstra cores, tipografia, dimensões e outros elementos da interface. |

## Astra Arcade

| Arquivo | Função |
| --- | --- |
| `src/arcade/FullArcade.jsx` | Monta o lobby, os controles de dificuldade e aparência, o painel de recordes e a tela de jogo com controles adaptados ao dispositivo. |
| `src/arcade/arcade.css` | Estilos do lobby, cartões de jogos, tabuleiro, HUD, placar e controles, incluindo regras responsivas e de acessibilidade. |
| `src/arcade/audio.js` | Gera efeitos sonoros com Web Audio e gerencia o ciclo do contexto de áudio da sessão. |
| `src/arcade/catalog.js` | Registra jogos, apelidos, regras, controles, instruções bilíngues, métricas e desafios. Valida identificadores e monta URLs do Arcade. |
| `src/arcade/commands.js` | Interpreta comandos do chat relacionados a jogos, desafios, recordes ou controle da partida e valida as ações do Arcade. |
| `src/arcade/gameInput.js` | Coordena o desenho e o ciclo do canvas. Traduz teclado, ponteiro e toque em ações da sessão, com apoio ao redimensionamento e à escala do dispositivo. |
| `src/arcade/records.js` | Valida, grava e recupera partidas no `localStorage`. Consolida resultados, melhores marcas, tempo e desafios. |
| `src/arcade/replies.js` | Processa as intenções do Arcade reconhecidas no chat. Gera respostas bilíngues e encaminha comandos ao jogo ou à Astra completa. |
| `src/arcade/session.js` | Gerencia carregamento de jogos sob demanda, dificuldade, controles, simulação de passo fixo e início, pausa e encerramento. Envia o resultado ao armazenamento de recordes. |
| `src/arcade/games/blocks.js` | Motor do Orbit Blocks. Controla a geração de peças, rotação, colisões, reserva, sombra, queda e limpeza de linhas. |
| `src/arcade/games/frogger.js` | Motor do Frogger. Controla saltos, tráfego, troncos, abrigos, tempo, colisões e avanço de fase. |
| `src/arcade/games/maze.js` | Motor do Pulse Maze. Implementa os mapas, pulsos, orbes e comportamento dos guardiões em perseguição, vulnerabilidade e retorno. |
| `src/arcade/games/pong.js` | Motor do Pong. Simula raquetes, rebotes da bola, adversário controlado pelo jogo, trocas e pontuação. |
| `src/arcade/games/shared.js` | Funções compartilhadas de movimento, limites, coordenadas, estado e formas desenhadas no canvas. |
| `src/arcade/games/snake.js` | Motor do Snake. Faz a serpente se mover em grade e crescer ao coletar energia. Trata direção, velocidade, pontuação e colisões. |

## Arquivos públicos

O Vite serve os arquivos de `public/` pela raiz do site e os copia para o build. As referências registradas abaixo refletem a árvore atual do projeto.

### Currículos e avisos

| Arquivo | Função |
| --- | --- |
| `public/Currículo Gustavo Ryan.pdf` | Currículo em português, disponível pelo cabeçalho e pela visualização de currículo na Astra. |
| `public/Gustavo Ryan Resume (English).pdf` | Currículo em inglês, selecionado conforme o idioma da interface. |
| `public/THIRD_PARTY_NOTICES.txt` | Avisos de atribuição para os trechos adaptados de Tetr.js e Basic Frogger usados no Arcade. |

### Workers do Laboratório e motor de xadrez

| Arquivo | Função |
| --- | --- |
| `public/java-playground.worker.js` | Envia código Java para compilar e rodar no Wandbox. Limita a espera e devolve mensagens de compilação, saída e erros à interface. |
| `public/javascript-playground.worker.js` | Executa o código JavaScript em uma thread de worker, coleta a saída dos métodos de console e informa conclusão ou erro. |
| `public/python-playground.worker.js` | Carrega o Pyodide, roda o código Python de forma assíncrona no navegador e devolve saída e erros ao editor. |
| `public/stockfish/Copying.txt` | Texto da GPLv3 que acompanha a distribuição do Stockfish. |
| `public/stockfish/Source.txt` | Identifica a versão e a origem do motor, a rede de avaliação e os endereços de código-fonte e instruções de compilação. |
| `public/stockfish/stockfish-19-lite-single.js` | Código distribuído pelo Stockfish.js que inicia o motor no worker e carrega o módulo WebAssembly. |
| `public/stockfish/stockfish-19-lite-single.wasm` | Binário WebAssembly do Stockfish Lite em thread única. Faz a busca e avaliação das posições para determinar o lance. |

### Documentação e licença dos ícones

Os SVGs locais fornecem os símbolos de tecnologias para componentes como `LanguageIcon`, a lista de habilidades e os cards de projetos e linguagens.

| Arquivo | Função |
| --- | --- |
| `public/icons/LICENSE-devicon.txt` | Texto da licença MIT distribuída com os ícones Devicon. |
| `public/icons/README.md` | Documenta origem, versões, caminhos de origem e comportamento de fallback dos ícones. |

## Documentação original

| Arquivo | Função |
| --- | --- |
| `docs/astra-arcade.md` | Registra a implementação do Arcade, as referências de jogos avaliadas e o estado da persistência local e da migração do Supabase. |
| `docs/contact-email.md` | Explica configuração, templates, estados, recuperação e tratamento de duplicatas no formulário EmailJS. |
| `docs/github-projects.md` | Registra a revisão que fundamentou o catálogo, os projetos analisados e a origem de descrições, links e prévias. |

## Testes e ambientes de validação

Os arquivos `.test.mjs` são entradas do test runner do Node. Alguns compilam um cenário em JSX com esbuild para testar componentes e interações com um DOM simulado pelo jsdom.

| Arquivo | Função |
| --- | --- |
| `tests/arcade.test.mjs` | Testa regras dos cinco jogos, diferenças de dificuldade, início de sessão, descarte de carregamentos antigos, reconhecimento de comandos e recordes. |
| `tests/astra-actions.test.mjs` | Cobre planos do Laboratório, aprovação por revisão, rejeição de ações inválidas, limites de leitura e entrega de ações no fim do streaming. |
| `tests/astra-integration.jsx` | Cenário de integração com React e jsdom para conferir o estado compartilhado do Laboratório e a continuidade da revisão entre as duas versões da Astra. |
| `tests/astra-integration.test.mjs` | Verifica a aplicação inicial de temas atuais e antigos e compila e executa o cenário de integração da Astra. |
| `tests/chat-stream.test.mjs` | Cobre decodificação NDJSON, UTF-8 dividido, falhas parciais, substituição da prévia, aquecimento de modelos, agrupamento de atualizações e escrita com controle de fluxo. |
| `tests/conversation-resource.test.mjs` | Testa reconhecimento de xadrez jogável, rating e proficiência, incluindo confirmações, pedidos de tabuleiro e frases sem intenção de abrir recurso. |
| `tests/dev-api.test.mjs` | Testa o middleware local com a API real e com respostas simuladas para validar encaminhamento, corpo, status, streaming e mensagens de erro. |
| `tests/fixtures/conversation.html` | Página HTML para abrir o cenário local de conversa com dados de exemplo. |
| `tests/fixtures/conversation.jsx` | Monta o app para validação local com respostas e dados de integração simulados, permitindo observar os cards na conversa. |
| `tests/glass-effects.test.mjs` | Verifica atualização do brilho sob o ponteiro, limpeza dos efeitos, movimento reduzido e repetição das revelações ao reentrar no viewport. |
| `tests/live-context.test.mjs` | Cobre cache das integrações, concorrência, rate limit, falhas temporárias, preservação de dados parciais, associação de fontes e resolução local de ícones. |
| `tests/live-endpoint.test.mjs` | Exercita o handler da API com respostas simuladas. Cobre validação de fontes e períodos, métricas, proteção de marcadores na tradução, fallback do Gemini e ações da Astra. |
| `tests/metrics-ui.jsx` | Cenário de interface com React e jsdom que monta cards e superfícies do chat e faz as verificações de apresentação e interação. |
| `tests/metrics-ui.test.mjs` | Compila e executa o cenário de cards, métricas e controles de tradução. |
| `tests/model-cache.test.mjs` | Testa descoberta de modelos por credencial, reaproveitamento simultâneo, validade, falhas de atualização e espera inicial limitada. |
| `tests/portfolio-routing.jsx` | Cenário de interface que monta o portfólio para verificar rotas, seções, âncoras e transições entre portfólio e Astra. |
| `tests/portfolio-routing.test.mjs` | Compila e executa o cenário da navegação entre o portfólio contínuo e a rota do chat. |
| `tests/projects-catalog.test.mjs` | Renderiza o catálogo para verificar presença dos projetos, conteúdo bilíngue e links individuais. |
| `tests/projects-scroll.jsx` | Cenário com medidas de layout simuladas para testar rolagem da vitrine, filtros, teclado e transições de comportamento. |
| `tests/projects-scroll.test.mjs` | Compila e executa o cenário da vitrine horizontal de projetos. |
| `tests/python-playground.test.mjs` | Testa o worker Python com runtime simulado, incluindo recebimento do código, limite de saída, liberação de resultados e falha ao baixar o runtime. |
| `tests/skills-proficiency.test.mjs` | Valida valores declarados, limites de nível, ausência de percentual e barras acessíveis no card de proficiência. |
| `tests/stockfish.test.mjs` | Usa um worker simulado para testar negociação UCI, configuração de dificuldade, cancelamento, lances com promoção e falha ao carregar. |
| `tests/wakatime.test.mjs` | Cobre consulta de períodos, filtragem de dados públicos, sessões que passam da meia-noite e reuso da renovação OAuth em pedidos concorrentes. |
| `validation-cards.html` | Entrada HTML para abrir a página de validação visual dos cards no ambiente local. |
| `validation-cards.jsx` | Monta diferentes cards com dados de exemplo para inspeção visual independente da conversa real. |

## Arquivos locais

Na cópia de trabalho também havia itens locais fora do inventário versionado. A descrição abaixo indica a finalidade desses itens, sem reproduzir o conteúdo de credenciais.

| Item | Função |
| --- | --- |
| `.env.local` | Armazena os valores de configuração e credenciais usados localmente pelas integrações. |
| `.reformulacao-tests.log` | Log local associado a execuções de testes da reformulação. |
| `.cache/` | Diretório local de cache gerado por ferramentas ou rotinas do projeto. |
| `.git/` | Metadados e histórico do Git deste checkout. |
| `.vercel/` | Configuração e dados locais das ferramentas da Vercel para o checkout. |
| `.vite/` | Cache local das ferramentas do Vite. |
| `dist/` | Saída gerada pelo build de produção, com HTML, bundles e recursos públicos. |
| `node_modules/` | Dependências instaladas pelo npm conforme o manifesto e o lockfile. |
| `email-templates/` | Diretório local sem arquivos visíveis no levantamento. A configuração dos templates usados pelo formulário está descrita em `docs/contact-email.md`. |
