# Portfólio Interativo com IA 👨‍💻

![React](https://img.shields.io/badge/React-19.1.1-007ec6?style=for-the-badge&logo=react&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-7.1.3-007ec6?style=for-the-badge&logo=vite&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) ![GitHub repo size](https://img.shields.io/github/repo-size/gustavoryandev/gustavoryan-portfolio?style=for-the-badge&logo=files) ![GitHub stars](https://img.shields.io/github/stars/gustavoryandev/gustavoryan-portfolio?style=for-the-badge&logo=github) ![GitHub forks](https://img.shields.io/github/forks/gustavoryandev/gustavoryan-portfolio?style=for-the-badge&logo=git) ![GitHub language count](https://img.shields.io/github/languages/count/gustavoryandev/gustavoryan-portfolio?style=for-the-badge&logo=javascript) ![GitHub license](https://img.shields.io/github/license/gustavoryandev/gustavoryan-portfolio?style=for-the-badge&color=007ec6&logo=opensourceinitiative)

-----

## 📚 Índice

- [Links Úteis](#-links-úteis)
- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Interagindo com a IA](#-interagindo-com-a-ia)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura](#-arquitetura)
- [Instalação e Execução](#-instalação-e-execução)
  - [Pré-requisitos](#pré-requisitos)
  - [Variáveis de Ambiente](#-variáveis-de-ambiente)
  - [Instalação de Dependências](#-instalação-de-dependências)
  - [Como Executar a Aplicação](#-como-executar-a-aplicação)
- [Deploy](#-deploy)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Testes e Validação](#-testes-e-validação)
- [Documentações utilizadas](#-documentações-utilizadas)
- [Autores](#-autores)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🔗 Links Úteis

- 🌐 **Demo Online:** [https://gustavoryan.vercel.app](https://gustavoryan.vercel.app)
- 💻 **Repositório:** [gustavoryandev/gustavoryan-portfolio](https://github.com/gustavoryandev/gustavoryan-portfolio)
- 👤 **Perfil do GitHub:** [gustavoryandev](https://github.com/gustavoryandev)
- 🏫 **PUC Minas:** [Portal institucional](https://www.pucminas.br/)

---

## 📖 Sobre o Projeto

O Portfólio Interativo com IA é uma aplicação React moderna que substitui a navegação tradicional de um site por uma **interface de chat inteligente**. Alimentado pela API do Google Gemini, o assistente virtual compreende linguagem natural, responde perguntas sobre minha trajetória profissional e injeta dinamicamente "cards visuais" na interface para apresentar métricas e integrações ao vivo.

O projeto consolida:
- Respostas dinâmicas sobre stack, educação e projetos via IA Generativa;
- Integração de métricas de código (GitHub e WakaTime);
- Status em tempo real de reprodução de música (Spotify);
- Prazos e informações acadêmicas (Canvas LMS);
- Suporte a envio de mensagens de contato.

---

## ✨ Funcionalidades Principais

### 🧠 Assistente Virtual Integrado
- Compreensão de gírias e contextos (ex: "trampos", "facul", "Galo");
- Memória de contexto baseada no histórico recente da conversa;
- Gatilhos inteligentes que renderizam componentes React (Cards) no meio da resposta em texto.

### 🌎 Internacionalização
- Respostas dinâmicas e interface com suporte nativo a Português (PT) e Inglês (EN);
- A IA adapta seu idioma baseando-se na pergunta do usuário ou no seletor do cabeçalho.

### 🎨 Design System e Temas
- Interface limpa com suporte a modo Claro (Light) e Escuro (Dark);
- Componentização com Tailwind CSS para responsividade total em dispositivos móveis e desktops.

### 📊 Integrações de Terceiros (Cards Visuais)
- **GitHub:** Estatísticas de repositórios, commits e streak atual;
- **WakaTime:** Linguagens mais utilizadas e média diária de horas codadas;
- **Spotify:** Exibição da faixa musical sendo reproduzida no momento;
- **Canvas LMS:** Tarefas e prazos acadêmicos da faculdade;
- **Galo:** Próximos jogos do Clube Atlético Mineiro;
- **EmailJS:** Formulário nativo renderizado no chat para envio de e-mails de contato.

---

## 💬 Interagindo com a IA

Em vez de comandos fixos, você pode fazer perguntas naturais. A IA processará a intenção e retornará o texto junto com o Card visual correspondente.

| Intenção | Exemplos de Perguntas | Card Acionado |
| :--- | :--- | :--- |
| **Projetos/Carreira** | "Quais são seus projetos?", "Me fale dos seus trampos" | `[GITHUB_CARD]` |
| **Habilidades/Tempo** | "Quanto tempo você programa?", "Qual sua stack?" | `[STATS_CARD]` |
| **Faculdade** | "O que estuda?", "Como estão as tarefas na PUC?" | `[CANVAS_CARD]` |
| **Música** | "O que você está ouvindo agora no Spotify?" | `[SPOTIFY_CARD]` |
| **Futebol** | "Quando é o jogo do Galo?", "Pra que time torce?" | `[GALO_CARD]` |
| **Contato** | "Quero te contratar", "Como mando um email?" | `[CONTACT_FORM]` |

---

## 🛠️ Tecnologias Utilizadas

### Front-end
- **React 18/19** (Hooks, Context API);
- **Vite** para build e bundling rápido;
- **Tailwind CSS** para estilização utilitária e suporte a dark mode;
- **i18next** e **react-i18next** para gestão de idiomas;
- **Axios** para requisições HTTP;
- **Lucide React** para iconografia.

### Back-end e Integrações
- **Vercel Serverless Functions** (Node.js) operando na pasta `/api`;
- **Google Generative AI SDK** (`@google/generative-ai`) modelo `gemini-1.5-flash` / `gemini-2.0-flash`;
- **APIs REST externas:** WakaTime, Spotify, GitHub e Canvas.

---

## 🏗️ Arquitetura

1. **Frontend (App.jsx):** Captura a entrada do usuário e gerencia o array de mensagens e histórico.
2. **Requisição:** O texto e o histórico são enviados para a Serverless Function `/api/chat.js` via Axios.
3. **Backend Serverless:** 
   - Carrega o contexto estático do arquivo `perfil.json`.
   - Constrói a `systemInstruction` com diretrizes de resposta, idiomas e gatilhos de tags (`[SPOTIFY_CARD]`, etc).
   - Comunica-se de forma segura com o **Google Gemini API** (sem expor a chave no cliente).
4. **Renderização Dinâmica:** A resposta em texto volta para o Frontend, que utiliza a função `.split()` no componente `MessageBubble.jsx` para encontrar as tags e substituí-las pelos componentes React correspondentes na tela.

---

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js (v18 ou superior);
- Vercel CLI instalada globalmente (`npm install -g vercel`);
- Chaves de API das plataformas (Gemini, GitHub, Spotify, Wakatime).

### 🔐 Variáveis de Ambiente

Crie um arquivo `.env.local` na **raiz do projeto** e preencha com suas chaves. As variáveis sem o prefixo `VITE_` são privadas e lidas apenas pelo backend.

```env
# FRONTEND (Public)
VITE_API_BASE_URL=http://localhost:3000
VITE_EMAILJS_SERVICE_ID=seu_service_id
VITE_EMAILJS_TEMPLATE_ID_FOR_ME=seu_template
VITE_EMAILJS_TEMPLATE_ID_FOR_SENDER=seu_template
VITE_EMAILJS_PUBLIC_KEY=sua_public_key

# BACKEND / SERVERLESS (Private)
GEMINI_API_KEY=AIzaSy...
WAKATIME_API_KEY=sua_chave_wakatime
SPOTIFY_CLIENT_ID=seu_client_id
SPOTIFY_CLIENT_SECRET=seu_client_secret
SPOTIFY_REFRESH_TOKEN=seu_refresh_token
GITHUB_USERNAME=gustavoryandev
GITHUB_TOKEN=seu_github_token
CANVAS_API_TOKEN=seu_canvas_token
CANVAS_BASE_URL=[https://canvas.instructure.com](https://canvas.instructure.com)

```

## Contact email and autoresponder

Both contact interfaces use the existing EmailJS browser SDK, public key and templates. See [contact integration details](docs/contact-email.md). No private credentials are sent to the browser.
