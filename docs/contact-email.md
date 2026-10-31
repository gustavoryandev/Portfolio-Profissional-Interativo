# Contato com EmailJS no navegador

O chat (card [CONTACT_FORM]) e a seção estática Contato usam o mesmo ContactSection e o serviço src/services/contact.js. O envio é feito pelo SDK @emailjs/browser diretamente ao EmailJS. Não usa /api/contact, Redis, chave privada ou Gemini.

## Configuração existente

O .env.local não precisa ser alterado. O Vite lê as quatro variáveis já existentes:

- VITE_EMAILJS_SERVICE_ID
- VITE_EMAILJS_TEMPLATE_ID_FOR_ME
- VITE_EMAILJS_TEMPLATE_ID_FOR_SENDER
- VITE_EMAILJS_PUBLIC_KEY

A chave pública e os identificadores de templates são destinados à integração no navegador. Nunca coloque chaves privadas, senhas ou tokens de outras integrações nessas variáveis. Para produção, disponibilize os mesmos valores públicos no ambiente de build da hospedagem.

## Templates existentes

Nenhum template é criado ou alterado pelo código. For Me recebe name, email e message, conforme as capturas fornecidas. O assunto é incluído no início de message para aparecer no corpo existente. For Sender recebe name e email; o usuário confirmou que To Email usa {{email}}. Também são enviados subject, reference, to_email e reply_to para compatibilidade. O destinatário principal continua configurado no template; to_email usa o e-mail já existente em perfil.json.

O código chama explicitamente For Me e depois For Sender. Se houver uma automação de auto-reply vinculada no dashboard, ela não deve também disparar For Sender, para evitar confirmação duplicada. Nenhuma configuração do dashboard é alterada automaticamente.

## Estados e duplicatas

Validação de nome, e-mail, assunto e mensagem, honeypot e limite local de cinco tentativas por hora. O botão fica bloqueado durante o envio. As chamadas são sequenciais e espaçadas em pelo menos 1,1 segundo. Sucesso só aparece após ambos os templates serem aceitos pelo EmailJS.

O estado de cada e-mail fica salvo por 24 horas no navegador, usando um hash do conteúdo, referência e estados, sem armazenar o texto da mensagem ou credenciais. Se apenas a confirmação for rejeitada, tentar novamente envia somente ela. Uma resposta perdida ou timeout é tratado como entrega incerta e impede reenvio automático. Fechar a aba durante o envio também exige verificar a entrega antes de reenviar.

Web Locks coordena abas quando disponível; há uma fila em memória como fallback. Essas proteções não são garantias contra abuso externo, outros dispositivos, armazenamento apagado ou desabilitado. A confirmação de aceitação pela API não garante chegada à caixa de entrada.

## Execução

O contato funciona com npm run dev ou vercel dev. As demais integrações de backend continuam usando vercel dev. Reinicie o servidor de desenvolvimento após atualizar o código, se estiver usando uma sessão antiga.

A migração final para o navegador foi realizada sem executar testes, build ou envios reais, por solicitação do usuário.
