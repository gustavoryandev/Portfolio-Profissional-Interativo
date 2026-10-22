Você é um especialista em arquitetura Frontend React e Vercel.

Preciso que você crie SOMENTE a estrutura de pastas e os arquivos base (com esqueletos e configurações) para um projeto de Portfólio Interativo usando React (Vite), Tailwind CSS e Vercel Serverless Functions. NÃO desenvolva a lógica completa dos componentes ainda, apenas monte a árvore de diretórios e crie os arquivos vazios/base.

ESTRUTURA DE PASTAS E ARQUIVOS QUE VOCÊ DEVE CRIAR:

/portfolio-chat
├── /api
│   └── chat.js                   # Vercel Serverless Function (Backend em Node.js)
├── /public
│   ├── /cv-gustavo.pdf           # Placeholder do PDF do currículo
│   └── favicon.ico
├── /src
│   ├── /assets
│   ├── /components
│   │   ├── Navbar.jsx            # Cabeçalho com idioma (PT/EN), tema e download do CV
│   │   ├── Sidebar.jsx           # Navegação entre Chat e Seções Tradicionais
│   │   ├── MessageBubble.jsx     # Renderizador de mensagens e interceptador de cards
│   │   ├── StatsCard.jsx         # Card visual do Wakatime
│   │   ├── SpotifyCard.jsx       # Card visual do Spotify
│   │   ├── GithubCard.jsx        # Card visual do GitHub Stats
│   │   ├── CanvasCard.jsx        # Card visual de matérias/tarefas da PUC Minas (Canvas API)
│   │   ├── GaloCard.jsx          # Card visual de jogos do Atlético Mineiro (ESPN API)
│   │   └── ContactSection.jsx    # Formulário de e-mail via EmailJS
│   ├── /context
│   │   └── ThemeContext.jsx      # Gerenciamento de Dark/Light Mode
│   ├── /data
│   │   └── perfil.json           # Dados do Gustavo (PUC Minas, bio, skills, projetos)
│   ├── /i18n
│   │   ├── index.js              # Configuração do i18next
│   │   ├── pt.json               # Traduções em Português
│   │   └── en.json               # Traduções em Inglês
│   ├── /services
│   │   └── api.js                # Cliente Axios para chamar a rota /api/chat
│   ├── App.jsx                   # Componente principal integrando o Chat
│   ├── index.css                 # Importação do Tailwind CSS
│   └── main.jsx                  # Ponto de entrada do React
├── .env.local                    # Variáveis de ambiente locais
├── .gitignore
├── index.html
├── package.json                  # Com dependências: react, vite, tailwindcss, lucide-react, framer-motion, i18next, react-i18next, @emailjs/browser, axios, @google/generative-ai
├── tailwind.config.js            # Configurado com darkMode: 'class'
├── vercel.json                   # Configuração de rotas serverless da Vercel
└── vite.config.js

Crie essa estrutura de pastas e gere os arquivos de configuração (`package.json`, `tailwind.config.js`, `vercel.json`, `vite.config.js`, `.env.local`) devidamente preenchidos.