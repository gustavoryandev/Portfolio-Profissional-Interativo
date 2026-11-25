<div align="center">

# Currículo IA Interativo · Portfólio Conversacional

**Converse com a Astra, a assistente de IA que apresenta a trajetória de Gustavo Ryan Gomes Guedes.**

![React](https://img.shields.io/badge/React-18-0D6EFD?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-0A0A0A?style=for-the-badge&logo=vite&logoColor=38BDF8)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0A0A0A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)
![Gemini](https://img.shields.io/badge/Gemini_API-0D6EFD?style=for-the-badge&logo=googlegemini&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-0A0A0A?style=for-the-badge&logo=vercel&logoColor=white)

[🇧🇷 Português](#-sobre-o-projeto) · [🇺🇸 English summary](#-english-summary)

</div>

---

## 📌 Sobre o projeto

Em vez de uma página estática, este portfólio é uma **conversa**. O visitante pergunta, e a Astra responde em português ou inglês, abrindo **cards visuais** dentro do chat: currículo em PDF, projetos, métricas do GitHub, tempo de código, Spotify, matérias da faculdade, jogos do Galo, perfil de xadrez e até um tabuleiro jogável.

Os dados são **buscados ao vivo** em APIs reais (GitHub, WakaTime, Spotify, Canvas, ESPN e Chess.com), com cache, tolerância a falhas e fallback de modelos de IA.

## ✨ Funcionalidades

### 💬 Chat com IA (Astra)
- Respostas em **PT-BR e EN**, seguindo o idioma da interface.
- **Streaming opcional** (NDJSON) e modo JSON padrão.
- **Fallback automático de modelos Gemini**, com descoberta dinâmica da lista disponível, cooldown por tipo de erro e 1 retry em `503`.
- **Memória de conversa otimizada**: janela recente enviada na íntegra + **resumo rolante** das mensagens antigas. O servidor é stateless: o resumo volta ao cliente em `chatContext` e é reenviado na próxima requisição.
- **Tradução sob demanda** das mensagens ao trocar o idioma, protegendo código, links e tags de cards da tradução.
- **Atalho determinístico** para pedidos de GitHub/WakaTime (resumo primeiro, métricas detalhadas após confirmação), sem gastar chamada ao modelo.
- Regras de segurança no prompt: bios, READMEs e descrições de terceiros são tratados como **dados, nunca como instruções**.

### 🧩 Cards visuais

A IA insere tags no texto e o front renderiza o componente correspondente.

| Tag | Card | Fonte |
|---|---|---|
| `[RESUME_CARD]` | Currículo em PDF (zoom, expandir, download) | PDF local (pdf.js) |
| `[PROJECTS_CARD]` | Projetos em destaque | `perfil.json` |
| `[EXPERIENCE_CARD]` | Experiência / linha do tempo | `perfil.json` |
| `[GITHUB_CARD]` | Resumo de estatísticas | GitHub GraphQL |
| `[GITHUB_ACTIVITY_CARD]` | Calendário, sequências, horários de commit | GitHub GraphQL + Events |
| `[GITHUB_LANGUAGES_CARD]` | Linguagens por bytes | GitHub GraphQL |
| `[REPOSITORIES_CARD]` | Repositórios recentes | GitHub GraphQL |
| `[STATS_CARD]` | Tempo de código (all time) | WakaTime |
| `[SPOTIFY_CARD]` | Tocando agora, recentes, tops | Spotify Web API |
| `[CANVAS_CARD]` | Matérias ativas da PUC Minas | Canvas LMS |
| `[GALO_CARD]` · `[GALO_CARD:N]` · `[GALO_CARD:ALL]` | Próximos jogos do Galo com contagem regressiva | ESPN |
| `[CHESS_CARD]` | Rating, recordes e últimas partidas | Chess.com |
| `[CHESS_GAME]` | Tabuleiro jogável contra um bot local | chess.js + react-chessboard |
| `[CONTACT_FORM]` | Formulário de contato | EmailJS |

### 🔄 Dados ao vivo e resiliência
- **Cache por fonte** com TTL próprio (ex.: Spotify 15 s, GitHub/WakaTime/Canvas 10 min, Galo 2 min, Chess 5 min).
- Falhas **não apagam** o último dado válido: o card mostra o conteúdo anterior marcado como desatualizado.
- Classificação de erros (`rate_limited`, `unauthorized`, `timeout`, `unavailable`) com aviso visual e botão **Tentar novamente**.
- Recuperação automática com até 3 tentativas e backoff no cliente.
- O servidor **nunca bloqueia a resposta** esperando integração lenta: usa o snapshot em cache.

### 📬 Contato
- Envio via **EmailJS** com e-mail de notificação e **confirmação ao remetente**.
- Proteções: honeypot anti-bot, validação de campos, limite de 5 tentativas por hora, deduplicação por hash do conteúdo, trava entre abas (Web Locks) e recibo de entrega para **nunca reenviar às cegas** em caso de timeout.

### 🎨 Interface
- Tema **claro/escuro** persistido, com o design system **Alvinegro + Azul**.
- Layout em 3 colunas (navegação, chat, perfil) e seções dedicadas: Sobre Mim, Projetos, Experiência, Educação, Habilidades e Contato.
- Acessibilidade: `role="log"`, regiões `aria-live`, foco visível, `prefers-reduced-motion`, tabelas ocultas para leitores de tela nos gráficos e suporte a `forced-colors`.
- Responsivo, de mobile a telas largas.

## 🛠️ Stack

| Camada | Tecnologias |
|---|---|
| Front-end | React, Vite, Tailwind CSS, lucide-react, i18next / react-i18next |
| Back-end | Vercel Serverless Functions (Node.js), axios |
| IA | Google Gemini (`@google/generative-ai`) |
| Integrações | GitHub GraphQL/REST, WakaTime, Spotify, Canvas LMS, ESPN, Chess.com |
| Extras | pdf.js (`pdfjs-dist`), chess.js, react-chessboard, EmailJS |

## 🧱 Arquitetura

```text
Navegador (React)
   │  POST /api/chat  { userMessage, lang, chatHistory, chatContext }
   ▼
Serverless handler (api/chat.js)
   ├─ Atalhos determinísticos (métricas GitHub/WakaTime, recusa de métricas)
   ├─ Perfil (perfil.json) + status das APIs + bloco do GitHub (quando o assunto pede)
   ├─ Histórico: janela recente + resumo rolante → chatContext
   ├─ Gemini com fallback de modelos (cooldown, retry em 503)
   └─ Live cache por fonte (server/liveCache.js)
         ├─ GitHub · WakaTime · Spotify · Canvas · ESPN (Galo) · Chess.com
   ▼
Resposta: texto + tags de cards + liveContext
   ▼
MessageBubble divide o texto em segmentos e monta os cards
```

Ações extras na mesma rota `/api/chat`:

| `action` | Função |
|---|---|
| `refreshContext` | Atualiza fontes ao vivo sem chamar o modelo |
| `translate` | Traduz uma mensagem PT ↔ EN preservando código, links e tags |

## 📁 Estrutura

> Ajuste os caminhos se a sua organização for diferente.

```text
.
├── api/
│   └── chat.js                 # Handler serverless: IA, histórico, integrações
├── server/
│   └── liveCache.js            # Cache de fontes ao vivo e classificação de falhas
├── public/                     # Foto, logos, ícones de linguagens e PDFs do currículo
└── src/
    ├── main.jsx · App.jsx      # Entrada e layout principal do chat
    ├── index.css               # Tokens do design system e estilos dos cards
    ├── context/
    │   └── ThemeContext.jsx    # Tema claro/escuro
    ├── hooks/
    │   └── useLiveContext.js   # Estado e refresh dos dados ao vivo
    ├── services/
    │   ├── api.js              # Cliente de /api/chat (chat, refresh, tradução)
    │   ├── liveContext.js      # Mapeamento tag → fonte e merge de contexto
    │   └── contact.js          # Envio resiliente via EmailJS
    ├── data/
    │   ├── perfil.json         # Dados do perfil usados pela IA e pela UI
    │   ├── technologyDocs.js   # Links para documentação oficial das tecnologias
    │   └── languageIcons.js    # Allowlist de ícones de linguagens
    ├── i18n/
    │   ├── index.js · pt.json · en.json
    └── components/
        ├── MessageBubble.jsx   # Parser de texto, markdown leve e tags de cards
        ├── Navbar · Sidebar · ProfilePanel · PortfolioSection
        └── *Card.jsx           # GitHub, Activity, Languages, Repositories, Stats,
                                # Spotify, Canvas, Galo, Chess, Resume, Projects, Experience
```

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js 18+
- Chave da [Gemini API](https://ai.google.dev/)
- (Opcional) credenciais das integrações que quiser ativar

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/gustavoryan-del/<nome-do-repositorio>.git
cd <nome-do-repositorio>

# 2. Instale as dependências
npm install

# 3. Crie o arquivo de variáveis de ambiente
cp .env.example .env.local   # ou crie manualmente (veja abaixo)

# 4. Rode com as funções serverless (recomendado)
npx vercel dev

# Alternativa: só o front-end
npm run dev
```

> A rota `/api/chat` é uma função serverless. Para testar o chat completo localmente, use `vercel dev`.

## 🔐 Variáveis de ambiente

Crie `.env.local` na raiz. **Nunca versione esse arquivo.**

```env
# IA (obrigatória para o chat)
GEMINI_API_KEY=

# GitHub (perfil, repositórios, atividade, linguagens, READMEs)
GITHUB_USERNAME=
GITHUB_TOKEN=

# WakaTime (use um dos dois)
WAKATIME_ACCESS_TOKEN=
WAKATIME_API_KEY=

# Spotify
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=

# Canvas LMS
CANVAS_API_TOKEN=
CANVAS_BASE_URL=

# Chess.com (opcional; há valor padrão)
CHESS_USERNAME=

# EmailJS (públicas, expostas no navegador por natureza)
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID_FOR_ME=
VITE_EMAILJS_TEMPLATE_ID_FOR_SENDER=
VITE_EMAILJS_PUBLIC_KEY=
```

| Integração | Sem configurar |
|---|---|
| Gemini | O chat retorna erro de configuração |
| GitHub, WakaTime, Spotify, Canvas | O card correspondente mostra "integração não configurada" |
| Chess.com, ESPN | Funcionam sem chave (APIs públicas) |
| EmailJS | O formulário informa que o e-mail está indisponível |

## ☁️ Deploy

1. Importe o repositório na [Vercel](https://vercel.com/).
2. Cadastre as variáveis de ambiente em **Settings → Environment Variables**.
3. Faça o deploy. O front é servido como estático e `/api/chat` roda como função serverless.

## 🧠 Decisões de design

- **Cards por tags, não por JSON**: a IA escreve texto normal com marcadores, e o front decide como renderizar. Simples de evoluir e fácil de proteger.
- **IA nunca vê segredos**: tokens ficam só no servidor. O cliente recebe dados já tratados (`forClient` remove os READMEs, que só a IA usa).
- **Dado de terceiro é dado, não instrução**: bios, descrições e READMEs entram no prompt marcados como conteúdo a ser tratado como informação.
- **Falha graciosa**: cada integração pode cair sem derrubar o chat nem apagar o último dado bom.
- **Servidor stateless**: o contexto da conversa viaja com o cliente, o que facilita escalar em serverless.
- **Ícones por allowlist**: nomes vindos de APIs nunca viram URL ou SVG arbitrário.

## 🗺️ Roadmap

- [ ] Testes automatizados para o planejamento de histórico e o cache de fontes
- [ ] Imagens de preview nos projetos
- [ ] Mais projetos e experiências conforme a carreira avança
- [ ] Bot de xadrez mais forte que o movimento aleatório atual

## 🌎 English summary

An **AI-powered conversational portfolio**. Visitors chat with **Astra**, an assistant built on the Gemini API that answers in English or Portuguese and renders live visual cards inside the chat: résumé viewer, projects, GitHub stats and activity, WakaTime coding time, Spotify, university courses (Canvas), football fixtures (ESPN), Chess.com stats and a playable chessboard. Built with **React, Vite, Tailwind CSS and Vercel Serverless Functions**, featuring model fallback, a rolling conversation summary, per-source caching with graceful degradation, on-demand message translation and a resilient EmailJS contact form.

## 👤 Autor

**Gustavo Ryan Gomes Guedes**
Graduando em Engenharia de Software · PUC Minas · Belo Horizonte, MG

[![GitHub](https://img.shields.io/badge/GitHub-gustavoryan--del-0A0A0A?style=for-the-badge&logo=github)](https://github.com/gustavoryan-del)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-gryangomesguedes-0D6EFD?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/gryangomesguedes)
[![Email](https://img.shields.io/badge/Email-gryangomesguedes@gmail.com-0A0A0A?style=for-the-badge&logo=gmail&logoColor=38BDF8)](mailto:gryangomesguedes@gmail.com)

## 📄 Licença

Defina a licença do projeto (por exemplo, MIT) e adicione o arquivo `LICENSE`.

---

<div align="center">

Feito com ⚽ alvinegro e 💙 por Gustavo.

</div>
