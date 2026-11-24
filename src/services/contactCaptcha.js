let loading;
function loadCaptcha(siteKey, language) {
  if (window.grecaptcha?.ready && window.grecaptcha?.execute) return Promise.resolve(window.grecaptcha);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    let settled = false;
    const timer = setTimeout(() => finish(new Error('CAPTCHA unavailable')), 15000);
    function finish(error) {
      if (settled) return;
      settled = true; clearTimeout(timer);
      if (error) { script.remove(); reject(error); } else resolve(window.grecaptcha);
    }
    script.src = 'https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(siteKey) + '&hl=' + (language === 'en' ? 'en' : 'pt-BR');
    script.async = true;
    script.onload = () => finish();
    script.onerror = () => finish(new Error('CAPTCHA unavailable'));
    document.head.appendChild(script);
  }).catch(error => { loading = undefined; throw error; });
  return loading;
}
export function createContactCaptcha(container, siteKey, language) {
  let active, disposed = false;
  function finish(error, token) {
    if (!active) return;
    const request = active; active = undefined; clearTimeout(request.timer);
    if (error) request.reject(error); else request.resolve(token);
  }
  return {
    getToken() {
      if (!siteKey || disposed || active) return Promise.reject(new Error('CAPTCHA unavailable'));
      return new Promise((resolve, reject) => {
        const request = { resolve, reject, timer: setTimeout(() => finish(new Error('CAPTCHA expired')), 15000) };
        active = request;
        loadCaptcha(siteKey, language).then(api => {
          if (active !== request) return;
          api.ready(() => {
            if (active !== request || disposed || !container.isConnected) return;
            Promise.resolve().then(() => api.execute(siteKey, { action: 'contact' })).then(token => {
              if (active === request) finish(token ? null : new Error('Empty CAPTCHA'), token);
            }, error => { if (active === request) finish(error); });
          });
        }).catch(error => { if (active === request) finish(error); });
      });
    },
    dispose() { disposed = true; finish(new Error('CAPTCHA cancelled')); },
  };
}
