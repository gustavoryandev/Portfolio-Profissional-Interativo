export default function LiveDataNotice({ data, pending, onRetry, lang = 'pt' }) {
  const en = lang.startsWith('en');
  const unavailable = !data || data.status !== 'ok';
  if (!pending && !unavailable && !data.stale) return null;
  const text = pending ? (en ? 'Loading integration data…' : 'Carregando dados da integração…')
    : data?.status === 'not_configured' ? (en ? 'Integration not configured.' : 'Integração não configurada.')
      : data?.reason === 'unauthorized' ? (en ? 'Integration authentication failed.' : 'Falha na autenticação da integração.')
        : data?.stale ? (en ? 'Showing the last available data. Update temporarily unavailable.' : 'Exibindo os últimos dados disponíveis. Atualização temporariamente indisponível.')
          : (en ? 'Data temporarily unavailable.' : 'Dados temporariamente indisponíveis.');
  return <div className="live-data-notice" role="status">
    <span>{text}</span>
    {!pending && onRetry && data?.status !== 'not_configured' && data?.reason !== 'unauthorized'
      && <button type="button" onClick={onRetry}>{en ? 'Try again' : 'Tentar novamente'}</button>}
  </div>;
}
