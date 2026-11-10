# Portfólio Interativo com IA 👨‍💻

![React](https://img.shields.io/badge/React-19-007ec6?style=for-the-badge&logo=react&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-6-007ec6?style=for-the-badge&logo=vite&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) ![GitHub repo size](https://img.shields.io/github/repo-size/gustavoryan-del/Portfolio-Profissional-Interativo?style=for-the-badge&logo=files) ![GitHub stars](https://img.shields.io/github/stars/gustavoryan-del/Portfolio-Profissional-Interativo?style=for-the-badge&logo=github) ![GitHub forks](https://img.shields.io/github/forks/gustavoryan-del/Portfolio-Profissional-Interativo?style=for-the-badge&logo=git) ![GitHub language count](https://img.shields.io/github/languages/count/gustavoryan-del/Portfolio-Profissional-Interativo?style=for-the-badge&logo=javascript)

---

## 📚 Índice

- [Links úteis](#-links-úteis)
- [Sobre o projeto](#-sobre-o-projeto)
- [Capturas de tela](#-capturas-de-tela)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Instalação e execução](#-instalação-e-execução)
- [Segurança e arquivos locais](#-segurança-e-arquivos-locais)
- [Deploy](#-deploy)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Testes e build](#-testes-e-build)
- [Documentação](#-documentação)
- [Autor](#-autor)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🔗 Links úteis

- 🌐 **Portfólio:** [gustavoryan.vercel.app](https://gustavoryan.vercel.app)
- 💻 **GitHub:** [gustavoryandev](https://github.com/gustavoryandev)
- 💼 **LinkedIn:** [Gustavo Ryan Gomes Guedes](https://linkedin.com/in/gryangomesguedes)
- 📧 **Contato:** [gryangomesguedes@gmail.com](mailto:gryangomesguedes@gmail.com)

## 📝 Sobre o projeto

Portfólio de Gustavo Ryan Gomes Guedes, graduando em Engenharia de Software na PUC Minas. A página inicial (`/`) reúne projetos, tecnologias, experiência, formação e contato. O botão flutuante **Perguntar pra Astra** abre a conversa rápida em um painel lateral, em tela cheia no celular. Os links **Astra** e **Conversar com Astra** levam à interface completa em `/chat`, com acesso ao xadrez, ao Arcade e aos cards de integrações.

O conteúdo do perfil é mantido em `src/data/perfil.json`. A seção de habilidades apresenta o globo e a lista de tecnologias. A Astra pode mostrar a proficiência em um card da conversa.

## 📸 Capturas de tela

**Portfólio no desktop**

![Página inicial com apresentação de Gustavo, atalhos para projetos e Astra e retrato de perfil](docs/screenshots/portfolio-desktop.jpg)

**Chat e habilidades no mobile**

<p>
  <img src="docs/screenshots/astra-mobile.jpg" alt="Chat da Astra com campo de mensagem e navegação na base" width="320" />
  <img src="docs/screenshots/habilidades-mobile.jpg" alt="Grade de tecnologias em duas colunas e navegação inferior" width="320" />
</p>

## ✨ Funcionalidades

- **Assistente Astra:** perguntas sobre perfil, projetos e trajetória, com histórico contextual e respostas em fluxo. Nas duas interfaces, digite `/help` ou abra Recursos para ver atalhos de navegação, projetos, métricas, tema, idioma e Laboratório.
- **Catálogo de projetos:** busca por texto, filtros por categoria e rolagem horizontal com gestos no celular.
- **Laboratório de código:** exemplos editáveis em desktop e celular. JavaScript e Python rodam no navegador. Java usa Wandbox. Experimente pedir “Abra o Laboratório, selecione Python, carregue Bro Fit e mude o nome do aluno para Ana”. A Astra mostra a alteração para revisão antes de aplicá-la. Rascunhos e resultados ficam em memória enquanto você navega entre as interfaces e são limpos ao recarregar a página.
- **Interface mobile:** navegação inferior para Astra e Projetos, campo de mensagem na base do chat e habilidades em duas colunas. As demais seções ficam no Menu.
- **Cards interativos na conversa:** projetos, habilidades, experiência, currículo, contato e dados de serviços externos aparecem junto às respostas.
- **Integrações ao vivo:** estatísticas do GitHub, linguagens e repositórios; atividade de programação via WakaTime; música atual via Spotify; tarefas acadêmicas do Canvas LMS; agenda do Atlético Mineiro; e perfil/partida de xadrez do Chess.com.
- **Jogos:** xadrez local com Stockfish e Astra Arcade em `/chat?arcade=1`. O Arcade inclui Snake, Pong, Frogger, Pulse Maze e Orbit Blocks, com recordes salvos no navegador.
- **Atualização de dados:** os cards indicam quando a fonte está indisponível e permitem tentar novamente quando aplicável.
- **Navegação por seções:** sobre mim, projetos, experiência, educação, habilidades, proficiência e contato.
- **Currículo para download:** arquivos PDF em português e inglês.
- **Contato por formulário:** envio de mensagem e confirmação ao visitante via EmailJS.
- **Português e inglês:** seletor de idioma na interface e suporte a respostas da assistente nos dois idiomas.
- **Aparência:** temas claro e escuro, Galo CAM Light e Dark e outras paletas personalizadas. A logo GR acompanha o tema, e a interface respeita a preferência por movimento reduzido.

## 🛠 Tecnologias

### Front-end

- React 19 e Vite
- JavaScript (ES modules)
- Tailwind CSS 3
- i18next e react-i18next
- Framer Motion e Lucide React
- Axios
- `chess.js` e `react-chessboard` para a experiência de xadrez

### API e serviços

- Node.js e funções serverless da Vercel
- Google Gemini API para a assistente e tradução de respostas
- GitHub API, WakaTime, Spotify, Canvas LMS, ESPN e Chess.com para dados dos cards
- EmailJS Browser SDK para o formulário de contato

## 🏗 Arquitetura

```mermaid
flowchart LR
    U[Visitante] --> UI[React + Vite]
    UI -->|mensagens, tradução e atualização| API[/api/chat/]
    API --> AI[Google Gemini]
    API --> LIVE[GitHub · WakaTime · Spotify · Canvas · ESPN · Chess.com]
    UI -->|formulário de contato| EMAIL[EmailJS]
    UI --> DATA[perfil.json e arquivos estáticos]
```

O front-end envia mensagens, pedidos de tradução e atualização de contexto para `/api/chat`. Em produção, `api/chat.js` funciona como função serverless da Vercel. No desenvolvimento, o plugin de `server/devApi.js` encaminha a mesma rota ao handler local. A conversa rápida e a Astra completa compartilham a sessão em memória na mesma aba. O formulário EmailJS é enviado diretamente do navegador com identificadores públicos próprios do serviço.

## 🚀 Instalação e execução

### Pré-requisitos

- Node.js 22.13 ou superior (requisito do `pdfjs-dist` usado no projeto)
- npm
- Chaves das integrações que deseja habilitar (opcionais para abrir a interface)

### 1. Instale as dependências

```bash
npm ci
```

### 2. Configure o ambiente

Copie [`.env.example`](.env.example) para `.env.local` e preencha apenas as variáveis das integrações que pretende usar.

| Variável | Uso |
| --- | --- |
| `GEMINI_API_KEY` | Respostas e tradução da assistente Astra |
| `GITHUB_USERNAME`, `GITHUB_TOKEN` | Métricas e repositórios do GitHub |
| `WAKATIME_API_KEY` ou `WAKATIME_ACCESS_TOKEN` | Métricas de tempo de programação |
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` | Música atual no Spotify |
| `CANVAS_API_TOKEN`, `CANVAS_BASE_URL` | Informações acadêmicas do Canvas LMS |
| `CHESS_USERNAME` | Perfil e dados de xadrez do Chess.com |
| `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID_FOR_ME`, `VITE_EMAILJS_TEMPLATE_ID_FOR_SENDER`, `VITE_EMAILJS_PUBLIC_KEY` | Formulário e confirmação de contato |

Para detalhes dos templates de contato, consulte [`docs/contact-email.md`](docs/contact-email.md).

### 3. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Abra a URL local exibida pelo Vite. A configuração do projeto disponibiliza `/api/chat` durante o desenvolvimento. Reinicie o servidor após alterar variáveis de ambiente.

### Build local

```bash
npm run build
npm run preview
```

## 🔒 Segurança e arquivos locais

- Guarde chaves privadas, senhas e tokens em `.env.local` no desenvolvimento e nas variáveis de ambiente da hospedagem em produção. Mantenha apenas nomes de variáveis e valores de exemplo em `.env.example`.
- O Vite inclui variáveis `VITE_` no código entregue ao navegador e copia `public/` para o build, inclusive arquivos ignorados pelo Git. Reserve `VITE_` para valores públicos, como os identificadores do EmailJS, e coloque em `public/` apenas materiais destinados à publicação.
- O [`.gitignore`](.gitignore) cobre arquivos de ambiente, credenciais locais, chaves privadas, bancos de dados, dumps, backups, arquivos compactados, logs e caches de desenvolvimento. Migrações SQL, código e arquivos públicos usados pela aplicação são versionados.

Antes de um commit, confira a regra aplicada ao arquivo local e os nomes dos arquivos preparados para versionamento.

```bash
git check-ignore -v -- .env.local
git diff --cached --name-only
```

O `.gitignore` só atua sobre arquivos ainda fora do índice. Use `git ls-files -- <caminho>` para verificar se um arquivo já foi rastreado. Se uma credencial aparecer em um commit, revogue-a e gere outra no provedor. O valor antigo pode continuar no histórico mesmo depois de o arquivo sair do índice.

## ☁️ Deploy

Na Vercel, o Vite gera o front-end e `api/chat.js` atende à rota serverless `/api/chat`. Configure no painel da hospedagem as variáveis privadas das integrações e as variáveis públicas do EmailJS antes do build. O arquivo `vercel.json` direciona `/chat` para a aplicação React.

## 📂 Estrutura do projeto

```text
.
├── api/
│   └── chat.js                 # Assistente, tradução e fontes de dados ao vivo
├── docs/                       # Notas das integrações e capturas de tela
├── public/                     # Imagens, ícones e currículos PDF
├── server/
│   ├── devApi.js                # Rota local /api/chat para o Vite
│   └── liveCache.js             # Cache de integrações no servidor
├── src/
│   ├── arcade/                  # Jogos e recordes locais da Astra
│   ├── components/              # Chat, cards e seções do portfólio
│   ├── context/                 # Estado global do tema
│   ├── data/                    # Perfil, projetos e tecnologias
│   ├── hooks/                   # Hooks de contexto ao vivo
│   ├── i18n/                    # Traduções em português e inglês
│   ├── pages/                   # Rotas do portfólio e do chat
│   └── services/                # Cliente da API, contato e contexto ao vivo
├── supabase/migrations/        # Esquema para futura sincronização do Arcade
├── tests/                       # Testes automatizados existentes
├── .env.example                 # Modelo das variáveis de ambiente
└── vite.config.js               # Vite e middleware local da API
```

## 🧪 Testes e build

Os testes existentes usam o test runner nativo do Node.js. Para executá-los:

```bash
node --test tests/*.test.mjs
```

Para verificar a compilação de produção:

```bash
npm run build
```

## 📖 Documentação

- [Configuração do contato EmailJS](docs/contact-email.md)
- [Astra Arcade e recordes locais](docs/astra-arcade.md)
- [Catálogo e origem dos projetos do GitHub](docs/github-projects.md)
- [Documentação do React](https://react.dev/)
- [Documentação do Vite](https://vite.dev/)
- [Documentação do Gemini API](https://ai.google.dev/gemini-api/docs)

## 👤 Autor

**Gustavo Ryan Gomes Guedes** — graduando em Engenharia de Software na PUC Minas.

- [GitHub](https://github.com/gustavoryandev)
- [LinkedIn](https://linkedin.com/in/gryangomesguedes)
- [E-mail](mailto:gryangomesguedes@gmail.com)

## 🤝 Contribuição

Sugestões e correções podem ser enviadas por meio de *issues* ou *pull requests* no repositório. Para alterações maiores, descreva primeiro a proposta e o comportamento esperado.

## 📄 Licença

Consulte o autor antes de redistribuir ou reutilizar o código do portfólio. As licenças de terceiros estão documentadas nos [avisos do projeto](public/THIRD_PARTY_NOTICES.txt).
