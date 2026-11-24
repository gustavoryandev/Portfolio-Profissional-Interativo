// Editorial facts from the catalog review in docs/github-projects.md and the linked commits.
const text = (pt, en) => ({ pt, en });

export const projectDossiers = {
  portfolio: {
    problem: text('Reunir projetos, trajetória e formas de contato em uma interface que também aceite perguntas sobre o portfólio.', 'Bring projects, experience and ways to get in touch into an interface that also accepts questions about the portfolio.'),
    contribution: text('Implementei a vitrine que converte rolagem vertical em percurso horizontal nos projetos.', 'I implemented the project gallery that maps vertical scrolling to a horizontal track.'),
    decision: text('A página pública e a conversa completa têm rotas próprias. As duas interfaces da Astra compartilham o contexto do Laboratório.', 'The public page and full chat have separate routes. Both Astra interfaces share the Laboratory context.'),
    result: text('A galeria oferece busca, filtros e links diretos para projetos. O Laboratório permite editar e executar os exemplos.', 'The gallery offers search, filters and direct project links. The Laboratory lets visitors edit and run examples.'),
    blueprint: [['screen', 'Portfólio', 'Portfolio'], ['chat', 'Astra', 'Astra'], ['terminal', 'Laboratório', 'Laboratory']],
  },
  'github-profile': {
    problem: text('Apresentar minha trajetória e destacar projetos no ponto de entrada do meu perfil GitHub.', 'Introduce my background and highlight projects on the landing page of my GitHub profile.'),
    decision: text('Usei um README em Markdown com trechos HTML e cartões de estatísticas e integrações.', 'I used a Markdown README with HTML snippets and cards for statistics and integrations.'),
    result: text('O perfil público reúne apresentação, tecnologias, projetos e o painel de contribuições.', 'The public profile brings together an introduction, technologies, projects and the contribution panel.'),
    blueprint: [['file', 'README', 'README'], ['list', 'Projetos', 'Projects'], ['chart', 'Contribuições', 'Contributions']],
  },
  pokedex: {
    problem: text('Facilitar a consulta e a comparação dos Pokémon de Kanto.', 'Make it easier to look up and compare Kanto Pokémon.'),
    decision: text('A interface React consulta a PokéAPI e guarda os Pokémon capturados no navegador.', 'The React interface reads from PokéAPI and stores caught Pokémon in the browser.'),
    result: text('O catálogo inclui os 151 Pokémon de Kanto, com busca, filtro por tipo e comparação de atributos.', 'The catalog includes all 151 Kanto Pokémon, with search, type filters and stat comparison.'),
    blueprint: [['cloud', 'PokéAPI', 'PokéAPI'], ['list', 'Pokédex', 'Pokédex'], ['storage', 'Capturados', 'Caught']],
  },
  geosolar: {
    problem: text('Construir a interface acadêmica de acesso e recuperação de senha do GEOSOLAR.', 'Build the academic GEOSOLAR sign-in and password recovery interface.'),
    decision: text('Controladores MVC servem as páginas Thymeleaf e o envio de e-mail fica em um serviço próprio.', 'MVC controllers serve Thymeleaf pages and email delivery is handled in its own service.'),
    status: text('Módulo acadêmico em dupla com telas, rotas e serviço de e-mail.', 'Pair-built academic module with screens, routes and an email service.'),
    blueprint: [['screen', 'Telas', 'Pages'], ['code', 'MVC', 'MVC'], ['mail', 'E-mail', 'Email']],
  },
  snakepy: {
    problem: text('Criar em equipe um jogo Snake com dificuldades e placares separados.', 'Build a team Snake game with distinct difficulty levels and rankings.'),
    contribution: text('Trabalhei na estilização dos ícones do jogo em src/jogo.py.', 'I worked on styling the game icons in src/jogo.py.'),
    contributionSource: 'https://github.com/warlleyz/SnakePy/commit/a3dac33b84a9f591242f48f101395edde4671b91',
    decision: text('O jogo usa Pygame, persiste rankings em arquivos por dificuldade e usa Pytest para as regras.', 'The game uses Pygame, persists rankings in files by difficulty and uses Pytest for its rules.'),
    result: text('O repositório inclui três dificuldades, pausa, vidas e testes das regras do jogo.', 'The repository includes three difficulties, pause, lives and tests for game rules.'),
    blueprint: [['game', 'Controles', 'Controls'], ['grid', 'Tabuleiro', 'Board'], ['chart', 'Ranking', 'Ranking']],
  },
  'secure-login': {
    problem: text('Estudar autenticação e autorização com áreas para usuário e administrador.', 'Study authentication and authorization with separate areas for users and administrators.'),
    decision: text('O estudo combina Spring Security, telas Thymeleaf e validação reCAPTCHA.', 'The study combines Spring Security, Thymeleaf views and reCAPTCHA validation.'),
    result: text('O repositório documenta as classes e contém o fluxo de recuperação de senha por e-mail.', 'The repository documents the classes and contains the email password recovery flow.'),
    blueprint: [['screen', 'Acesso', 'Sign-in'], ['lock', 'Segurança', 'Security'], ['mail', 'Recuperação', 'Recovery']],
  },
  'terminal-portfolio': {
    problem: text('Explorar uma apresentação profissional navegável por comandos de terminal.', 'Explore a professional presentation that can be navigated with terminal commands.'),
    decision: text('A interface em React combina navegação por comandos e visualizações, incluindo um globo 3D.', 'The React interface combines command navigation and visualizations, including a 3D globe.'),
    result: text('Há comandos para consultar projetos, currículo e habilidades.', 'Commands are available for viewing projects, the résumé and skills.'),
    blueprint: [['terminal', 'Comandos', 'Commands'], ['list', 'Portfólio', 'Portfolio'], ['cloud', 'Integrações', 'Integrations']],
  },
  'votacao-fazenda': {
    problem: text('Simular uma votação e exibir a apuração por participante em um exercício acadêmico.', 'Simulate voting and display the count by contestant in an academic exercise.'),
    decision: text('A navegação usa React Router e os votos são registrados em localStorage.', 'Navigation uses React Router and votes are recorded in localStorage.'),
    result: text('A página de resultados ordena os participantes e exibe percentuais calculados com os votos locais.', 'The results page ranks contestants and shows percentages calculated from local votes.'),
    blueprint: [['list', 'Participantes', 'Contestants'], ['storage', 'Votos locais', 'Local votes'], ['chart', 'Apuração', 'Tally']],
  },
  'carrinho-cli': {
    problem: text('Praticar orientação a objetos com um faturamento simples no terminal.', 'Practice object-oriented programming with a simple terminal billing flow.'),
    decision: text('O exercício usa encapsulamento e ArrayList para manipular os itens.', 'The exercise uses encapsulation and ArrayList to manage items.'),
    result: text('O terminal permite escolher produtos, mudar quantidades e calcular a fatura.', 'The terminal lets users choose products, change quantities and calculate the invoice.'),
    blueprint: [['list', 'Catálogo', 'Catalog'], ['cart', 'Carrinho', 'Cart'], ['file', 'Fatura', 'Invoice']],
    replacesCatalogImage: true,
  },
  academia: {
    problem: text('Modelar planos de treino associados a alunos em um exercício de Programação Modular.', 'Model training plans tied to students in a Modular Programming exercise.'),
    decision: text('O modelo Java representa alunos, academia, exercícios e planos de treino.', 'The Java model represents students, the gym, exercises and training plans.'),
    result: text('O exercício permite manipular fichas e fazer consultas por séries e repetições.', 'The exercise supports managing workout plans and querying by sets and repetitions.'),
    blueprint: [['users', 'Alunos', 'Students'], ['file', 'Planos', 'Plans'], ['activity', 'Exercícios', 'Exercises']],
    replacesCatalogImage: true,
  },
  'mini-commerce': {
    problem: text('Montar um catálogo navegável a partir de uma base local de produtos.', 'Build a browsable catalog from a local product dataset.'),
    decision: text('O código usa JSON local e manipulação do DOM em JavaScript.', 'The code uses local JSON and JavaScript DOM manipulation.'),
    result: text('O catálogo oferece busca por nome, filtro por categoria e detalhes de produtos.', 'The catalog offers name search, category filtering and product details.'),
    blueprint: [['storage', 'Dados', 'Data'], ['search', 'Filtro', 'Filter'], ['cart', 'Produtos', 'Products']],
  },
  meddesk: {
    problem: text('Prototipar em equipe interfaces para agenda, consultas, histórico e internações.', 'Prototype interfaces for scheduling, appointments, records and hospital stays as a team.'),
    decision: text('O repositório reúne documentação UML, templates Thymeleaf e uma base Spring Boot.', 'The repository brings together UML documentation, Thymeleaf templates and a Spring Boot foundation.'),
    status: text('Protótipo acadêmico de interface e estrutura inicial da aplicação.', 'Academic prototype covering the interface and initial application structure.'),
    blueprint: [['file', 'Modelo UML', 'UML model'], ['screen', 'Telas', 'Views'], ['code', 'Spring Boot', 'Spring Boot']],
  },
  'car-rental': {
    problem: text('Modelar os dados de uma locadora, dos cadastros às solicitações, contratos e análises de crédito.', 'Model vehicle rental data, from account and vehicle records to requests, contracts and credit checks.'),
    contribution: text('Implementei a migração Flyway com o esquema inicial do banco de locação.', 'I implemented the Flyway migration for the initial rental database schema.'),
    contributionSource: 'https://github.com/gustavoryandev/LABORATORIO-2-DIAW/commit/db93029f205310d8a69366660ad767949a9c1aee',
    decision: text('A base usa entidades Java e migrações SQL versionadas para PostgreSQL.', 'The foundation uses Java entities and versioned SQL migrations for PostgreSQL.'),
    status: text('Base em desenvolvimento, com modelagem UML, persistência e configuração inicial React/Vite.', 'Foundation in development, with UML models, persistence and an initial React/Vite setup.'),
    blueprint: [['file', 'Modelo UML', 'UML model'], ['code', 'Entidades Java', 'Java entities'], ['storage', 'Migrações SQL', 'SQL migrations']],
  },
  'clima-api': {
    problem: text('Estudar como consultar dados meteorológicos de um serviço externo a partir de uma API Java.', 'Study how a Java API can look up weather data from an external service.'),
    decision: text('O serviço usa RestTemplate para consultar a Open-Meteo.', 'The service uses RestTemplate to query Open-Meteo.'),
    status: text('Estudo em construção, com consulta de cidades e endpoints meteorológicos em esboço.', 'Work-in-progress study with city lookup and draft weather endpoints.'),
    blueprint: [['search', 'Cidade', 'City'], ['code', 'RestTemplate', 'RestTemplate'], ['cloud', 'Open-Meteo', 'Open-Meteo']],
  },
  'oficina-java': {
    problem: text('Modelar ordens de serviço, mecânicos e boxes em um exercício de orientação a objetos.', 'Model service orders, mechanics and workshop bays in an object-oriented exercise.'),
    decision: text('O exercício representa essas entidades em classes Java e usa um menu de terminal.', 'The exercise represents these entities in Java classes and uses a terminal menu.'),
    status: text('Exercício em desenvolvimento, com parte do menu e das operações ainda em construção.', 'Exercise in development with parts of the menu and operations still under construction.'),
    blueprint: [['file', 'Ordens', 'Orders'], ['users', 'Mecânicos', 'Mechanics'], ['grid', 'Boxes', 'Bays']],
    replacesCatalogImage: true,
  },
};
