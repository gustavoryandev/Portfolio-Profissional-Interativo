# Preparação da contextualização dos projetos pela Astra

**26 de novembro de 2026 · levantamento documental, sem alterações de produção.**

Este relatório prepara a futura universalização dos dossiês e o contexto de projetos da Astra. Foram lidos `SESSION_HANDOFF.md`, `PROJECT_AUDIT.md`, `IMPLEMENTATION_PLAN.md`, `KNOWN_ISSUES.md` e `ASTRA_REGRESSION_REPORT.md`, além das fontes locais citadas abaixo. Não foram buscados nem reexaminados os repositórios remotos nesta etapa.

## Escopo e força das evidências

- `src/data/perfil.json` contém 15 registros, com nome, descrição PT/EN, tecnologias e metadados. As listas de tecnologia abaixo reproduzem o catálogo revisado, não uma afirmação de que cada versão ou fluxo foi executado novamente.
- `src/data/projectDossiers.js` tem uma entrada para cada um dos 15 IDs. Seus textos também são PT/EN. `problem` é tratado como objetivo/problema declarado; `result` e `status` preservam exatamente o estado editorial, sem transformar protótipos em produtos concluídos.
- `docs/github-projects.md` registra a revisão anterior das fontes primárias dos 14 projetos externos. Cada linha aponta os README, manifestos ou arquivos consultados, mas esses repositórios não estão neste checkout; portanto, não há números de linha locais para essas fontes. As linhas locais do catálogo e do dossiê são dadas em cada ficha.
- A auditoria anterior fez conferência adicional de ROTA, SnakePy, GEOSOLAR e ClimaAPI. Para ROTA e SnakePy há commits relacionados; para GEOSOLAR e ClimaAPI há controladores consultados. Isso não equivale a teste de ponta a ponta. Ver `PROJECT_AUDIT.md:96`.
- A expressão **comprovado no relatório anterior** identifica evidência já registrada; **registrado no catálogo/dossiê** identifica conteúdo editorial, sem nova execução nesta tarefa. Lacunas de contribuição, resultados ou execução continuam lacunas e não devem ser preenchidas por inferência.

## O que a Astra recebe hoje

1. `api/chat.js` lê `perfil.json` e `buildSystemInstruction` serializa o objeto inteiro em `DADOS COMPLETOS DO PERFIL`. Para cada projeto, o prompt atual pode receber ID, título e descrição PT/EN, `techs`, categoria, tipo, imagem e URLs, além de outros campos de perfil. O contexto não depende de o visitante abrir um card (`api/chat.js:1117-1152,1578-1604`).
2. As ferramentas de ação recebem também a lista de IDs e títulos, mas ela autoriza navegação; não é a fonte dos detalhes editoriais (`server/portfolioTools.js:34-39`).
3. O servidor não importa `projectDossiers.js`. Os campos editoriais `problem`, `contribution`, `decision`, `status`, `result` e os nós `blueprint` não entram no prompt como dossiê. O acesso a READMEs é seletivo e não cobre sistematicamente todas as fichas (`PROJECT_AUDIT.md:48-49,86-98`).
4. Há uma função `resolveProfile` em `api/chat.js:134-151`, mas não há chamada a ela no checkout. Ela não altera o contexto atual. **Não a ligar sem corrigir sua precedência:** para projetos sem `chavesI18n`, ela substituiria títulos e descrições diretos por `{ pt: null, en: null }`; para `portfolio`, `geosolar` e `carrinho-cli`, usaria chaves antigas dos locales em vez dos textos diretos atuais.
5. Assim, os fatos de dossiê que já aparecem na descrição do catálogo são cognoscíveis por essa descrição; isso não significa que a Astra receba o dossiê ou suas distinções editoriais. Os campos exclusivos abaixo não estão disponíveis no contexto estático.

## Como o dossiê aparece na interface

- `ProjectCard` só seleciona `projectDossiers[id]` quando `theme === 'rick-morty'`. Em outros temas mostra descrição e tecnologias sem o dossiê (`src/components/ProjectCard.jsx:56-86`).
- No tema Rick and Morty, um `<details>` apresenta “Dossiê de pesquisa” na dimensão normal e “Relatório técnico” na Cidadela. O corpo mostra apenas os campos preenchidos entre `problem`, `contribution`, `decision`, `status` e `result`. `blueprint` é uma ilustração separada, não texto do dossiê (`src/components/rick/ProjectDossier.jsx:15-49`; `src/components/ProjectCard.jsx:60-86`).
- A prévia desenha o blueprint quando o dossiê manda substituir a imagem, quando não há imagem ou quando a imagem falha. A ficha também fornece a sinopse e mantém as tecnologias/ações do card (`src/components/ProjectCard.jsx:14-44,84-90`).
- Os rótulos genéricos dos campos têm PT/EN em `src/i18n/pt.json:683-692` e `src/i18n/en.json:683-692`. A apresentação atual e o CSS são específicos de Rick (`src/components/rick/project-dossier.css:60-119`).
- Para universalizar, reaproveitar os dados, o card, a prévia, o `<details>` acessível e o blueprint opcional; separar o conteúdo semântico dos rótulos/skins dimensionais. Preservar sinopse, filtros, modal de imagem, ações, teclado e movimento reduzido, como já exige `IMPLEMENTATION_PLAN.md:34-40`.

## Fichas dos 15 projetos

Em todas as fichas, **Astra hoje** significa os metadados acima, incluindo o texto direto em ambos os idiomas. **Ausente** significa conteúdo do objeto de dossiê que não é serializado; quando a mesma afirmação já aparece na descrição do catálogo, isso é indicado como sobreposição, não como nova evidência. As funcionalidades são as registradas no catálogo/dossiê e na revisão anterior; não foram reexecutadas aqui.

### 1. `portfolio` — Portfólio Interativo IA Generativa / Interactive AI Portfolio

- **1–2. Identificação e descrição.** PT: “Portfólio conversacional com a assistente Astra, contexto profissional, cards de projetos, habilidades e integrações ao vivo.” EN: “Conversational portfolio featuring the Astra assistant, professional context, project and skill cards, and live integrations.”
- **3. Tecnologias do catálogo.** React, Vite, Tailwind CSS, Gemini API, i18next.
- **4–6. Objetivo, funcionalidades e decisão.** O problema declarado é reunir projetos, trajetória e contato numa interface que também aceite perguntas. O dossiê registra galeria, busca/filtros/links e Laboratório editável/executável. A contribuição declarada é converter rolagem vertical em trilha horizontal. Decisão: página pública e conversa completa em rotas próprias, com contexto do Laboratório compartilhado.
- **7–8. Dossiê e lacunas para Astra.** Há `problem`, `contribution`, `decision`, `result` e `blueprint`. Nenhum desses campos estruturados chega ao prompt; objetivo e parte do resultado se sobrepõem à descrição. A contribuição específica, a decisão de rotas/contexto compartilhado e a ilustração não estão descritas no catálogo. O dossiê não informa métrica de resultado nem fonte/commit para a contribuição.
- **9. Evidências locais.** [perfil.json:215](../src/data/perfil.json#L215); [projectDossiers.js:5](../src/data/projectDossiers.js#L5); implementação do card descrita em [PROJECT_AUDIT.md:86-98](PROJECT_AUDIT.md#L86).
- **10. Lacunas/duplicações.** O registro de resultado repete parcialmente a descrição e não quantifica adoção ou desempenho. O catálogo não informa URL de repositório (`githubUrl: null`); não inventar uma.
- **11. Internacionalização.** `chavesI18n` e as quatro chaves `projetos.portfolio_proj_{title,desc}` existem em PT/EN. São fallback legado: `projectContent` prefere os objetos diretos PT/EN. Os títulos coincidem; a descrição legada difere da atual.
- **12. Proveniência.** O código do portfólio atual está no próprio checkout; as capacidades listadas continuam sendo afirmações do catálogo/dossiê, não resultado de teste nesta preparação.

### 2. `github-profile` — Perfil GitHub — Gustavo Ryan / GitHub Profile — Gustavo Ryan

- **1–2. Identificação e descrição.** PT: “README personalizado do meu perfil no GitHub, com apresentação profissional, tecnologias, projetos em destaque, estatísticas, contribuições em 3D e integrações com WakaTime e Spotify.” EN: “Custom GitHub profile README with a professional introduction, technologies, featured projects, statistics, 3D contributions, and WakaTime and Spotify integrations.”
- **3. Tecnologias do catálogo.** Markdown, HTML, GitHub.
- **4–6. Objetivo, funcionalidades e decisão.** Objetivo: apresentar trajetória e projetos na entrada do perfil. O resultado registrado reúne apresentação, tecnologias, projetos e painel de contribuições. Decisão: README Markdown com trechos HTML e cartões de estatísticas/integrações.
- **7–8. Dossiê e lacunas para Astra.** Campos: `problem`, `decision`, `result`, `blueprint`; sem contribuição/status. Todos ficam fora do prompt. Problema e resultado se sobrepõem à descrição; o detalhe da composição Markdown/HTML não está explícito nela.
- **9. Evidências locais.** [perfil.json:242](../src/data/perfil.json#L242); [projectDossiers.js:12](../src/data/projectDossiers.js#L12); revisão/fonte README indicada em [github-projects.md:18](github-projects.md#L18).
- **10. Lacunas/duplicações.** Não há métrica, data de captura ou confirmação de atualização das estatísticas dinâmicas. A descrição não prova que os painéis continuam ativos.
- **11. Internacionalização.** Sem `chavesI18n` específicas; título e descrição diretos têm PT/EN. Rótulos do dossiê usam as chaves genéricas PT/EN.
- **12. Proveniência.** A revisão anterior aponta o README público; não foi feita nova consulta ao remoto.

### 3. `pokedex` — Legends Pokédex

- **1–2. Identificação e descrição.** PT: “Pokédex dos 151 Pokémon de Kanto com busca, filtros por tipo, comparação de atributos, capturados salvos no navegador e detalhes da PokéAPI. Projeto em dupla.” EN: “A Pokédex of the 151 Kanto Pokémon with search, type filters, stat comparisons, captured Pokémon saved in the browser and PokéAPI details. Built as a pair project.”
- **3. Tecnologias do catálogo.** React, Vite, JavaScript, CSS, PokéAPI.
- **4–6. Objetivo, funcionalidades e decisão.** Objetivo: facilitar consulta e comparação dos Pokémon de Kanto. O resultado registra os 151, busca/filtro/comparação. Decisão: interface React consulta PokéAPI e guarda capturados no navegador.
- **7–8. Dossiê e lacunas para Astra.** Campos: `problem`, `decision`, `result`, `blueprint`; sem contribuição/status. O conteúdo textual se sobrepõe à descrição e stack já enviados à Astra; o blueprint é visual e não integra resposta.
- **9. Evidências locais.** [perfil.json:258](../src/data/perfil.json#L258); [projectDossiers.js:18](../src/data/projectDossiers.js#L18); README, `package.json` e hook `usePokemonExtra.js` listados em [github-projects.md:19](github-projects.md#L19).
- **10. Lacunas/duplicações.** Trabalho em dupla é explicitado; não atribuir autoria individual de funcionalidades. Não há contribuição individual ou resultado medido no dossiê.
- **11. Internacionalização.** Sem chave específica; metadados diretos e blueprint são bilíngues. Rótulos são genéricos.
- **12. Proveniência.** A revisão anterior consultou README, manifesto e hook; execução atual não feita.

### 4. `geosolar` — GEOSOLAR — Interface de Autenticação / GEOSOLAR — Authentication Interface

- **1–2. Identificação e descrição.** PT: “Módulo acadêmico com páginas de login, cadastro e recuperação de senha renderizadas por Thymeleaf, rotas MVC e serviço de envio de e-mail. Desenvolvido em dupla.” EN: “Academic module with Thymeleaf login, registration and password recovery pages, MVC routes and an email service. Built as a pair project.”
- **3. Tecnologias do catálogo.** Java, Spring Boot, Thymeleaf, Maven, HTML, CSS.
- **4–6. Objetivo, funcionalidades e decisão.** Objetivo: construir a interface acadêmica de acesso e recuperação de senha. O estado registrado inclui telas, rotas e serviço de e-mail. Decisão: controladores MVC servem Thymeleaf e o envio fica em serviço próprio.
- **7–8. Dossiê e lacunas para Astra.** Campos: `problem`, `decision`, `status`, `blueprint`; sem `result` ou contribuição. A descrição já expõe telas, MVC, e-mail e trabalho em dupla; a separação do serviço é detalhe adicional do dossiê. Nenhum campo estruturado é enviado ao prompt.
- **9. Evidências locais.** [perfil.json:282](../src/data/perfil.json#L282); [projectDossiers.js:24](../src/data/projectDossiers.js#L24); README/controlador MVC e limite de não afirmar autenticação completa em [github-projects.md:20](github-projects.md#L20). A conferência de controlador registrada em [PROJECT_AUDIT.md:96](PROJECT_AUDIT.md#L96) confirma retorno das views de login, registro e recuperação.
- **10. Lacunas/duplicações.** A chave i18n antiga afirma “mapeamento de potencial solar”, ausente da descrição/dossiê atual e não sustentado pela evidência de controlador citada. Não afirmar autenticação completa nem mapeamento solar sem fonte adicional.
- **11. Internacionalização.** `chavesI18n` e chaves PT/EN existem, mas as chaves antigas de GEOSOLAR diferem do conteúdo direto atual; `projectContent` usa o conteúdo direto primeiro.
- **12. Proveniência.** Projeto em dupla; a evidência anterior é parcial, não teste funcional completo.

### 5. `snakepy` — SnakePy

- **1–2. Identificação e descrição.** PT: “Jogo Snake em equipe com três dificuldades, pontuação, vidas, pausa, sons gerados em código e rankings por nível salvos em arquivos. Inclui testes das regras com Pytest.” EN: “Team-built Snake game with three difficulty levels, scoring, lives, pause, code-generated sounds and per-level rankings saved to files. Includes rule tests with Pytest.”
- **3. Tecnologias do catálogo.** Python, Pygame, Pytest.
- **4–6. Objetivo, funcionalidades e decisão.** Objetivo: jogo em equipe com níveis e rankings distintos. O resultado lista três dificuldades, pausa, vidas e testes de regras. Decisão: Pygame, ranking em arquivo por dificuldade e regras cobertas por Pytest. Contribuição pessoal explicitada: estilização dos ícones em `src/jogo.py`.
- **7–8. Dossiê e lacunas para Astra.** Campos: `problem`, `contribution`, `contributionSource`, `decision`, `result`, `blueprint`. A contribuição e seu commit são a informação distintiva; não estão no catálogo enviado ao modelo. Outras funções repetem a descrição.
- **9. Evidências locais.** [perfil.json:309](../src/data/perfil.json#L309); [projectDossiers.js:30](../src/data/projectDossiers.js#L30); `requirements.txt` e `src/jogo.py` listados em [github-projects.md:21](github-projects.md#L21); commit e alteração dos ícones conferidos em [PROJECT_AUDIT.md:96](PROJECT_AUDIT.md#L96).
- **10. Lacunas/duplicações.** O projeto é de equipe; somente a contribuição explicitamente delimitada pode ser atribuída individualmente. O resultado não fornece placares nem métricas.
- **11. Internacionalização.** Sem chave de projeto; texto do perfil e campos do dossiê estão PT/EN. O rótulo “Minha contribuição” é genérico e traduzido.
- **12. Proveniência.** A contribuição aponta um commit específico; essa evidência, não o projeto inteiro, dá suporte à atribuição individual.

### 6. `secure-login` — SecureLoginPUC

- **1–2. Identificação e descrição.** PT: “Estudo de autenticação com perfis de usuário e administrador, Spring Security, validação reCAPTCHA, recuperação de senha e envio de e-mail, acompanhado de documentação por classe.” EN: “Authentication study with user and administrator roles, Spring Security, reCAPTCHA validation, password recovery and email delivery, supported by class-by-class documentation.”
- **3. Tecnologias do catálogo.** Java, Spring Boot, Spring Security, Thymeleaf, Maven.
- **4–6. Objetivo, funcionalidades e decisão.** Objetivo: estudar autenticação/autorização com áreas de usuário e administrador. O resultado registrado é documentação das classes e fluxo de recuperação por e-mail. Decisão: combinar Spring Security, Thymeleaf e validação reCAPTCHA.
- **7–8. Dossiê e lacunas para Astra.** Campos: `problem`, `decision`, `result`, `blueprint`; sem contribuição/status. As afirmações textuais se sobrepõem à descrição e às tecnologias do catálogo. A estrutura visual é o dado adicional, não útil como fato narrativo.
- **9. Evidências locais.** [perfil.json:329](../src/data/perfil.json#L329); [projectDossiers.js:38](../src/data/projectDossiers.js#L38); README, `pom.xml` e classes listados em [github-projects.md:22](github-projects.md#L22).
- **10. Lacunas/duplicações.** O tipo é `study`; apresentar como estudo, não como produto implantado. Não há status de implantação nem métrica.
- **11. Internacionalização.** Sem chave específica; descrição e conteúdo direto bilíngues; rótulos genéricos bilíngues.
- **12. Proveniência.** A revisão anterior consultou README, manifesto e estrutura, sem teste de segurança ou operação em runtime nesta etapa.

### 7. `terminal-portfolio` — Portfólio Terminal / Terminal Portfolio

- **1–2. Identificação e descrição.** PT: “Portfólio em uma interface de terminal com comandos para projetos, currículo e habilidades, globo 3D e integrações com GitHub, WakaTime, Spotify e Canvas.” EN: “Portfolio presented as a terminal with commands for projects, résumé and skills, a 3D globe, and GitHub, WakaTime, Spotify and Canvas integrations.”
- **3. Tecnologias do catálogo.** React, Vite, Three.js, Supabase, i18next.
- **4–6. Objetivo, funcionalidades e decisão.** Objetivo: apresentar a trajetória navegável por comandos de terminal. Funcionalidades registradas: comandos para projetos, currículo e habilidades, globo e integrações. Decisão: combinar interface React, comandos e visualizações.
- **7–8. Dossiê e lacunas para Astra.** Campos: `problem`, `decision`, `result`, `blueprint`; sem contribuição/status. A maior parte do conteúdo repete o catálogo; a formulação da decisão e o diagrama não chegam estruturados ao prompt.
- **9. Evidências locais.** [perfil.json:353](../src/data/perfil.json#L353); [projectDossiers.js:44](../src/data/projectDossiers.js#L44); README, `package.json` e estrutura listados em [github-projects.md:23](github-projects.md#L23).
- **10. Lacunas/duplicações.** Não confundir com o portfólio conversacional deste checkout: são IDs e repositórios distintos. As integrações listadas não foram verificadas ao vivo nesta tarefa.
- **11. Internacionalização.** Sem chave específica; título/descrição e dossiê estão em PT/EN.
- **12. Proveniência.** A fonte anterior aponta o repositório do Portfólio Terminal; nenhuma sincronização de conteúdo existe.

### 8. `votacao-fazenda` — Votação A Fazenda / A Fazenda Voting

- **1–2. Identificação e descrição.** PT: “Simulador acadêmico de votação com participantes, registro local de votos e resultados ordenados com percentuais. Navegação entre páginas com React Router e persistência no localStorage.” EN: “Academic voting simulator with contestants, locally recorded votes and ranked percentage results. Uses React Router for page navigation and localStorage for persistence.”
- **3. Tecnologias do catálogo.** React, Vite, JavaScript, React Router, CSS.
- **4–6. Objetivo, funcionalidades e decisão.** Objetivo: simular votação e exibir apuração por participante. Funcionalidades registradas: votos locais e resultados ordenados com percentuais. Decisão: React Router e `localStorage`.
- **7–8. Dossiê e lacunas para Astra.** Campos: `problem`, `decision`, `result`, `blueprint`; sem contribuição/status. Problema, resultado e decisão repetem a descrição; o blueprint não é contexto textual.
- **9. Evidências locais.** [perfil.json:377](../src/data/perfil.json#L377); [projectDossiers.js:50](../src/data/projectDossiers.js#L50); código, manifesto e serviço de votação citados em [github-projects.md:24](github-projects.md#L24).
- **10. Lacunas/duplicações.** O tipo é `study`. Não há dado de volume de votos, usuários ou persistência fora do navegador.
- **11. Internacionalização.** Sem chave específica; texto do catálogo e dossiê PT/EN.
- **12. Proveniência.** A revisão anterior aponta implementação e serviço; não houve teste de persistência nesta preparação.

### 9. `carrinho-cli` — Carrinho de Compras em Java / Java Shopping Cart

- **1–2. Identificação e descrição.** PT: “Sistema de faturamento no terminal com catálogo, inclusão e exclusão de itens, alteração de quantidades e cálculo da fatura, aplicando encapsulamento e ArrayList.” EN: “Terminal billing system with a product catalog, item addition and removal, quantity changes and invoice calculation, applying encapsulation and ArrayList.”
- **3. Tecnologias do catálogo.** Java, POO, CLI, ArrayList.
- **4–6. Objetivo, funcionalidades e decisão.** Objetivo: exercício de POO com faturamento no terminal. Funcionalidades: escolher itens, mudar quantidades e calcular fatura. Decisão: encapsulamento e `ArrayList`.
- **7–8. Dossiê e lacunas para Astra.** Campos: `problem`, `decision`, `result`, `blueprint`; sem contribuição/status. Texto funcional quase todo duplicado no perfil. `replacesCatalogImage` é metadado visual do card, não um fato do projeto nem contexto para a Astra.
- **9. Evidências locais.** [perfil.json:399](../src/data/perfil.json#L399); [projectDossiers.js:56](../src/data/projectDossiers.js#L56); README e estrutura de classes citados em [github-projects.md:25](github-projects.md#L25).
- **10. Lacunas/duplicações.** A chave i18n é mais genérica que a descrição atual; não é uma contradição funcional clara. Não há resultado quantitativo.
- **11. Internacionalização.** `chavesI18n` e chaves PT/EN existem como fallback; o conteúdo direto PT/EN tem precedência. Os rótulos do dossiê são genéricos.
- **12. Proveniência.** Catálogo registra estudo acadêmico; não afirmar implantação ou contribuição individual.

### 10. `academia` — Bro Fit — Gestão de Academia / Bro Fit — Gym Management

- **1–2. Identificação e descrição.** PT: “Exercício de Programação Modular em Java com alunos, academia, exercícios e planos de treino individuais. Inclui manipulação de fichas e consultas por séries e repetições.” EN: “Java Modular Programming exercise with students, a gym, exercises and individual training plans. Includes workout management and queries by sets and repetitions.”
- **3. Tecnologias do catálogo.** Java, POO, CLI.
- **4–6. Objetivo, funcionalidades e decisão.** Objetivo: modelar planos de treino vinculados a alunos. Funcionalidades: manipular fichas e consultar séries/repetições. Decisão: modelo Java para alunos, academia, exercícios e planos.
- **7–8. Dossiê e lacunas para Astra.** Campos: `problem`, `decision`, `result`, `blueprint`; sem contribuição/status. Os textos se sobrepõem à descrição. `replacesCatalogImage` afeta apenas a prévia.
- **9. Evidências locais.** [perfil.json:424](../src/data/perfil.json#L424); [projectDossiers.js:63](../src/data/projectDossiers.js#L63); README e classes citados em [github-projects.md:26](github-projects.md#L26).
- **10. Lacunas/duplicações.** Não há informação de persistência, interface além do terminal ou conclusão além do exercício descrito.
- **11. Internacionalização.** Sem chave específica; metadados/dossiê diretos bilíngues.
- **12. Proveniência.** A fonte anterior consultou README e estrutura de classes; nenhum teste novo.

### 11. `mini-commerce` — Mini Comércio Digital / Mini Digital Store

- **1–2. Identificação e descrição.** PT: “Catálogo interativo de produtos com busca por nome, filtro por categoria, detalhes e destaque de itens, usando dados locais e manipulação do DOM em JavaScript.” EN: “Interactive product catalog with name search, category filters, item details and highlighting, built with local data and JavaScript DOM manipulation.”
- **3. Tecnologias do catálogo.** HTML, CSS, JavaScript, JSON.
- **4–6. Objetivo, funcionalidades e decisão.** Objetivo: montar catálogo navegável sobre uma base local. Funcionalidades: busca, filtro, detalhes e destaque. Decisão: JSON local e manipulação do DOM.
- **7–8. Dossiê e lacunas para Astra.** Campos: `problem`, `decision`, `result`, `blueprint`; sem contribuição/status. O texto repete diretamente descrição e tecnologias; blueprint visual não vai ao contexto.
- **9. Evidências locais.** [perfil.json:444](../src/data/perfil.json#L444); [projectDossiers.js:70](../src/data/projectDossiers.js#L70); README e `public/main.js` citados em [github-projects.md:27](github-projects.md#L27).
- **10. Lacunas/duplicações.** Não há métricas de catálogo, origem dos dados ou validação de persistência.
- **11. Internacionalização.** Sem chave específica; conteúdo direto PT/EN.
- **12. Proveniência.** Fonte anterior aponta arquivo de implementação; execução não repetida.

### 12. `meddesk` — MedDesk — Gestão Hospitalar / MedDesk — Hospital Management

- **1–2. Identificação e descrição.** PT: “Protótipo acadêmico em equipe com interfaces para agenda, consultas, histórico e internações. O repositório contém telas Thymeleaf, estilos, documentação UML e a base Spring Boot.” EN: “Team academic prototype with appointment, consultation, history and hospitalization interfaces. The repository includes Thymeleaf templates, styles, UML documentation and a Spring Boot foundation.”
- **3. Tecnologias do catálogo.** Java, Spring Boot, Thymeleaf, Spring Security, CSS.
- **4–6. Objetivo, funcionalidades e decisão.** Objetivo: prototipar interfaces de agenda, consultas, histórico e internação. O estado é explicitamente “protótipo acadêmico de interface e estrutura inicial”. Decisão: reunir documentação UML, templates Thymeleaf e base Spring Boot.
- **7–8. Dossiê e lacunas para Astra.** Campos: `problem`, `decision`, `status`, `blueprint`; sem contribuição ou `result`. Os três campos textuais reiteram o perfil. Blueprint é apenas visual.
- **9. Evidências locais.** [perfil.json:467](../src/data/perfil.json#L467); [projectDossiers.js:76](../src/data/projectDossiers.js#L76); README, `pom.xml` e templates citados em [github-projects.md:28](github-projects.md#L28).
- **10. Lacunas/duplicações.** Trabalho em equipe e protótipo devem ser preservados; não afirmar fluxo hospitalar operacional nem autoria individual.
- **11. Internacionalização.** Sem chave específica; PT/EN direto.
- **12. Proveniência.** Registro de protótipo, sem verificação operacional nesta etapa.

### 13. `car-rental` — ROTA — Locação de Veículos / ROTA — Vehicle Rental

- **1–2. Identificação e descrição.** PT: “Base em desenvolvimento para locação de veículos, com entidades Java, modelagem UML e migrações SQL para contas, veículos, solicitações, contratos e análise de crédito. Inclui configuração inicial React/Vite.” EN: “Vehicle rental foundation in development with Java entities, UML models and SQL migrations for accounts, vehicles, requests, contracts and credit analysis. Includes an initial React/Vite setup.”
- **3. Tecnologias do catálogo.** Java, Spring Boot, PostgreSQL, Flyway, React, Vite.
- **4–6. Objetivo, funcionalidades e decisão.** Objetivo: modelar os dados de locadora, do cadastro a solicitações, contratos e análise de crédito. O estado é base em desenvolvimento com UML, persistência e configuração inicial React/Vite. Decisão: entidades Java e migrações SQL versionadas para PostgreSQL. Contribuição declarada: migração Flyway do esquema inicial.
- **7–8. Dossiê e lacunas para Astra.** Campos: `problem`, `contribution`, `contributionSource`, `decision`, `status`, `blueprint`; sem `result`. A contribuição individual e o link de commit não estão no perfil. Problema, decisão e estado se sobrepõem em grande parte à descrição.
- **9. Evidências locais.** [perfil.json:489](../src/data/perfil.json#L489); [projectDossiers.js:82](../src/data/projectDossiers.js#L82); código/migrações/entidades citados em [github-projects.md:29](github-projects.md#L29); migração específica conferida em [PROJECT_AUDIT.md:96](PROJECT_AUDIT.md#L96).
- **10. Lacunas/duplicações.** Não afirmar locação completa, crédito operacional ou funcionalidades de frontend prontas. A auditoria confirma migração/modelagem, não o fluxo integral. A contribuição tem commit como evidência.
- **11. Internacionalização.** Sem chave específica; campos diretos/dossiê PT/EN.
- **12. Proveniência.** `prototype` e status “em desenvolvimento” são limites obrigatórios para qualquer resposta.

### 14. `clima-api` — ClimaAPI — Estudo de API REST / ClimaAPI — REST API Study

- **1–2. Identificação e descrição.** PT: “Estudo em construção de integração com Open-Meteo via RestTemplate. Contém consulta de cidades e esboços de endpoints meteorológicos, com funcionalidades ainda incompletas.” EN: “Work-in-progress study integrating Open-Meteo through RestTemplate. Includes city lookup and draft weather endpoints, with features still incomplete.”
- **3. Tecnologias do catálogo.** Java, Spring Boot, Maven, Open-Meteo.
- **4–6. Objetivo, funcionalidades e decisão.** Objetivo: estudar consulta de dados meteorológicos de serviço externo por API Java. O estado inclui consulta de cidades e endpoints ainda em esboço. Decisão: `RestTemplate` consulta Open-Meteo.
- **7–8. Dossiê e lacunas para Astra.** Campos: `problem`, `decision`, `status`, `blueprint`; sem `result` ou contribuição. O conteúdo textual já está quase todo na descrição; blueprint não é fato textual.
- **9. Evidências locais.** [perfil.json:512](../src/data/perfil.json#L512); [projectDossiers.js:90](../src/data/projectDossiers.js#L90); serviço/controlador citados em [github-projects.md:30](github-projects.md#L30). A conferência anterior encontrou rotas delegadas ao serviço, não garantia de resposta externa funcional (`PROJECT_AUDIT.md:96`).
- **10. Lacunas/duplicações.** Não afirmar integração funcional, resposta válida da API ou endpoints completos a partir da existência de rotas.
- **11. Internacionalização.** Sem chave específica; PT/EN direto.
- **12. Proveniência.** Status de estudo incompleto preservado; não houve chamada à Open-Meteo.

### 15. `oficina-java` — Oficina — Ordens de Serviço / Workshop — Service Orders

- **1–2. Identificação e descrição.** PT: “Exercício acadêmico de orientação a objetos com classes para ordens de serviço, mecânicos e boxes de oficina. O menu e parte das operações ainda estão em construção.” EN: “Academic object-oriented exercise with service order, mechanic and workshop bay classes. The menu and some operations are still under construction.”
- **3. Tecnologias do catálogo.** Java, POO, CLI.
- **4–6. Objetivo, funcionalidades e decisão.** Objetivo: modelar ordens, mecânicos e boxes. O estado declara que menu e parte das operações estão em construção. Decisão: classes Java e menu de terminal.
- **7–8. Dossiê e lacunas para Astra.** Campos: `problem`, `decision`, `status`, `blueprint`; sem contribuição ou `result`. Os fatos textuais já se sobrepõem à descrição; blueprint é ilustrativo.
- **9. Evidências locais.** [perfil.json:533](../src/data/perfil.json#L533); [projectDossiers.js:96](../src/data/projectDossiers.js#L96); código Java, menu e ordens citados em [github-projects.md:31](github-projects.md#L31).
- **10. Lacunas/duplicações.** Não afirmar aplicação completa ou operações não listadas. Não há contribuição individual ou resultado concluído no dossiê.
- **11. Internacionalização.** Sem chave específica; conteúdo direto PT/EN.
- **12. Proveniência.** O status incompleto é a única indicação de conclusão; nenhuma execução refeita.

## Duplicações, contradições e lacunas transversais

1. **Bilinguismo.** Todos os 15 projetos têm objetos diretos `titulo.pt/en` e `descricao.pt/en`, e os 15 IDs têm dossiê (`PROJECT_AUDIT.md:86`). O helper `projectContent` prefere esses valores e só então chama a chave i18n (`src/data/projectContent.js:1-7`).
2. **Chaves por projeto.** Apenas `portfolio`, `geosolar` e `carrinho-cli` declaram `chavesI18n`; suas chaves existem nos dois locales (`perfil.json:236-239,304-307,419-422`; `pt.json` e `en.json:648-653`). Os outros 12 não têm chave própria, mas não têm lacuna atual de tradução porque os textos diretos são bilíngues.
3. **Conteúdo antigo.** As chaves de `portfolio` e `geosolar` descrevem versões diferentes/mais antigas do que os campos diretos; a chave de `carrinho-cli` é mais genérica. A UI atual evita sobrescrita por precedência. `resolveProfile` ignoraria essa precedência e também perderia os textos diretos dos 12 projetos sem chave; permanece função local sem chamada.
4. **Campos editoriais esparsos.** Dez fichas têm `result`; cinco têm `status`; três têm contribuição declarada e apenas duas têm link de commit, conforme auditoria (`PROJECT_AUDIT.md:86`). Ausência de campo é ausência de evidência, não campo a completar automaticamente. Apenas a interface renderiza os valores existentes; a Astra não lê nenhum objeto de dossiê.
5. **Conteúdo repetido.** Pokédex, SecureLoginPUC, Portfólio Terminal, Votação, Carrinho, Bro Fit, Mini Comércio, MedDesk, ROTA, ClimaAPI e Oficina têm sobreposição considerável entre descrição e problema/decisão/resultado/estado. O ganho de contexto está sobretudo em distinguir a estrutura editorial; não é motivo para enviar o mesmo parágrafo duplicado ao modelo.
6. **Atribuição e grau de conclusão.** GEOSOLAR, Pokédex e MedDesk identificam trabalho em dupla/equipe; SnakePy também é em equipe, com uma contribuição individual delimitada; ROTA tem contribuição individual ligada a commit. Para os demais, o dossiê não delimita autoria pessoal. ClimaAPI, Oficina e ROTA têm ressalvas explícitas de incompletude/protótipo. Não converter isso em alegações de produto completo.
7. **Fontes e linha de evidência.** As referências locais por projeto apontam a linha do registro de perfil e a linha inicial do objeto de dossiê. Para evidência de código externa, usar os caminhos/links da revisão em `github-projects.md:18-31` e as quatro conferências em `PROJECT_AUDIT.md:96`; os repositórios não foram baixados e seus números de linha não podem ser afirmados aqui.
8. **Exemplos do Laboratório.** O plano exige marcar exemplos de código como adaptações, não como prova da implementação original. Nenhum resultado do editor deve ser convertido automaticamente em funcionalidade do projeto.

## Estrutura centralizada proposta para o Codex

Não duplicar título, descrição, tecnologias ou URLs em um terceiro arquivo. Preservar `perfil.json` como catálogo já usado pelo frontend e pelo servidor e `projectDossiers.js` como fonte editorial bilíngue. Acrescentar, na implementação futura, um adaptador puro compartilhado, por exemplo `src/data/projectContext.js`, que receba `id`, idioma, registro de perfil e dossiê e devolva uma projeção única:

```js
{
  id,
  title: { pt, en },
  description: { pt, en },
  technologies: [],
  category,
  type,
  links: { source, demo },
  editorial: {
    problem,
    decision,
    contribution,
    contributionSource,
    status,
    result
  },
  blueprint
}
```

- O adaptador deve ser ESM puro, sem React, DOM, i18next obrigatório, CSS ou dependências novas. Receber dados/dicionário por argumento; os consumidores do Vite importam o catálogo existente e os handlers Node leem o perfil pela rotina atual. Ambos chamam a mesma função de resolução.
- Resolver `title` e `description` na ordem atual: objeto direto para o idioma (`en*` → `en`, demais → `pt`), chave i18n como fallback, valor indisponível quando não há fonte. Nunca converter campo ausente em texto ou inferência. Isso evita o defeito potencial de `resolveProfile`.
- Copiar somente campos editoriais presentes. Manter contribuição e `contributionSource` juntos; só alegar contribuição pessoal quando há campo explícito. Não enviar `blueprint` como prosa de prompt.
- No backend, selecionar o projeto mencionado (ou os projetos explicitamente comparados) e anexar somente a projeção factual correspondente, com ID e idioma do turno. Se nome/alias for ambíguo, pedir esclarecimento. Não depender de card aberto nem autorizar `[PROJECTS_CARD]` numa pergunta específica.
- O frontend usa a mesma projeção para os cartões e passa `editorial` ao corpo de dossiê independente do tema. Preservar o visual Rick/Cidadela por propriedades de apresentação; para outros temas, rótulo neutro e os mesmos campos, teclado e estados do card. O plano existente em `IMPLEMENTATION_PLAN.md:34-40` já descreve a direção mínima e os critérios.

## Sequência mínima e critérios de aceite

1. Implementar apenas o adaptador/serialização selecionada, sem reescrever os textos editoriais nem tocar no tom, prompts gerais ou mecanismos de persona.
2. Validar bijeção dos 15 IDs entre `perfil.json` e `projectDossiers.js`; campos opcionais ausentes continuam ausentes. Testar PT/EN, fallback das três chaves antigas e os 12 projetos com campos diretos sem chave.
3. Comparar a mesma projeção resolvida pelo Vite e Node; a ficha renderizada e a informação anexada à resposta devem coincidir, sem incluir `blueprint` no texto do modelo.
4. Perguntar, sem abrir cards, por ROTA, contribuição de SnakePy, fluxo de GEOSOLAR e estado de ClimaAPI em ambas as superfícies. Confirmar que não se inventam contribuições, resultados ou conclusão; comparar depois com o conteúdo exibido no card.
5. Regressão: pergunta de lista continua sendo o único caso de `[PROJECTS_CARD]`; perguntas específicas respondem em texto, cards funcionam em todos os temas, e imagem ausente/erro continuam usando o fallback atual.
6. Nenhuma execução de projeto remoto, teste de provedor real, alteração de tradução ou inserção de conteúdo sem fonte faz parte desta preparação documental.

## Limites desta preparação

Nenhuma suíte nem teste comportamental foi executado; foi feita somente uma checagem estrutural dos 15 IDs, dossiês e campos bilíngues. Nenhum código de produção, tradução, dossiê existente, prompt ou configuração foi modificado. A revisão não revalidou a execução dos 14 repositórios externos nem a qualidade de respostas do modelo. As conclusões descrevem o checkout local e as evidências arquivadas, respeitando os limites já documentados em `PROJECT_AUDIT.md` e `KNOWN_ISSUES.md`.
