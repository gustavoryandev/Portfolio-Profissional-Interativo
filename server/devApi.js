const MAX_BODY_BYTES = 1024 * 1024;

// Run the same Vercel handler locally, alongside the Vite frontend.
export function localApiPlugin({ loadHandler = () => import('../api/chat.js') } = {}) {
  return {
    name: 'local-chat-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split('?')[0] !== '/api/chat') return next();
        res.status = code => { res.statusCode = code; return res; };
        res.json = body => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(body));
          return res;
        };
        try {
          const chunks = [];
          let bytes = 0;
          for await (const chunk of req) {
            bytes += Buffer.byteLength(chunk);
            if (bytes > MAX_BODY_BYTES) {
              res.status(413).json({ error: 'Mensagem muito grande.' });
              return;
            }
            chunks.push(chunk);
          }
          const raw = Buffer.concat(chunks).toString('utf8');
          try {
            req.body = raw ? JSON.parse(raw) : {};
          } catch {
            res.status(400).json({ error: 'JSON inválido.' });
            return;
          }
          const { default: handler } = await loadHandler();
          await handler(req, res);
        } catch (error) {
          server.config.logger.error(`[local-chat-api] ${error.message}`);
          if (res.headersSent) res.end();
          else res.status(500).json({ error: 'Não foi possível processar a mensagem.' });
        }
      });
    },
  };
}
