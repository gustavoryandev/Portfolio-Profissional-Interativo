import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import PortfolioPage from './pages/PortfolioPage';
import PortfolioIntro from './components/PortfolioIntro';
const ChatPage = lazy(() => import('./pages/ChatPage'));
export default function App() {
  const { i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/chat') return <Suspense fallback={<main className="route-loading" aria-busy="true"><p role="status">{en ? 'Loading Astra…' : 'Carregando a Astra…'}</p><a href="/">{en ? 'Back to portfolio' : 'Voltar ao portfólio'}</a></main>}><ChatPage /></Suspense>;
  if (path !== '/') return <main className="route-loading"><h1>404</h1><a href="/">{en ? 'Back to portfolio' : 'Voltar ao portfólio'}</a></main>;
  return <PortfolioIntro en={en}><PortfolioPage /></PortfolioIntro>;
}
