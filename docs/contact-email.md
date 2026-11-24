# Contato com reCAPTCHA v3

O formulário gera um token novo com a ação contact para cada e-mail. A API /api/contact valida o token no Google antes de enviar pelo EmailJS. Funciona no Vite local e nas funções da Vercel.

## Configuração

1. No Google, registre uma chave com base em pontuação (v3). Use uma etiqueta como Portfolio Gustavo. Cadastre gustavoryan.vercel.app (ou seu domínio real) e localhost, sem protocolo nem caminho.
2. Preencha .env.local e as variáveis da Vercel:
   - VITE_RECAPTCHA_SITE_KEY: chave do site, pública.
   - RECAPTCHA_SECRET_KEY: chave secreta, somente no servidor.
   - RECAPTCHA_ALLOWED_HOSTNAMES: domínios permitidos separados por vírgulas. Precisa corresponder aos domínios do Google.
   - RECAPTCHA_MIN_SCORE: 0.5 inicialmente; ajuste conforme o tráfego.
   - EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_FOR_ME, EMAILJS_TEMPLATE_ID_FOR_SENDER e EMAILJS_PUBLIC_KEY: mesmos valores da configuração anterior, agora no servidor.
   - EMAILJS_PRIVATE_KEY: chave privada do EmailJS (Account / API Keys).
3. No EmailJS, habilite chamadas de aplicações fora do navegador nas configurações de segurança. Para impedir chamadas diretas que contornem a API, exija autorização com chave privada e desabilite os envios diretos pelo navegador. Verifique a disponibilidade dessa configuração no seu plano antes de publicar.
4. Desative Enable reCAPTCHA V2 verification nos dois templates: o v3 é validado pelo servidor do projeto. Mantenha For Me com destinatário fixo e For Sender com o destinatário do visitante. Não adicione outro auto-reply.
5. Reinicie npm run dev. Na Vercel, faça novo deploy depois de configurar as variáveis.

Não coloque segredos em variáveis VITE_*. As antigas VITE_EMAILJS_* não são mais usadas pelo formulário. Se já foram publicadas, os identificadores antigos continuam disponíveis em versões anteriores; a restrição no painel do EmailJS é necessária para impedir envios diretos.

## Validação e limites

O servidor exige success, ação contact, pontuação mínima, hostname permitido e token com até dois minutos. Sem configuração ou com falha do CAPTCHA, nenhum e-mail é enviado. Os destinatários são definidos no servidor.

Os limites de cinco tentativas por hora, intervalo de um minuto, fila entre formulários e prevenção de duplicatas continuam no navegador; são auxiliares e podem ser contornados. Não há limitador distribuído no servidor. Tokens não são armazenados. Falhas de entrega incerta impedem reenvio automático; falha apenas na confirmação permite tentar somente ela.

Os testes usam mocks e não enviam e-mails. Após configurar os painéis, teste os dois e-mails, script Google bloqueado e rejeição de chamadas diretas sem chave privada ao EmailJS.

Referências: https://developers.google.com/recaptcha/docs/v3 e https://www.emailjs.com/docs/rest-api/send/
