# Problemas conhecidos e limites de verificação

26 de novembro de 2026 · HEAD `e13942d`; árvore de trabalho com alterações preexistentes. A validação após as correções passou nos 120 testes, no build e no typecheck do portal. Os itens 1 e 5 foram cobertos pela validação atual; os demais registram evidências da auditoria anterior e não foram reproduzidos novamente nesta etapa. “Reproduzido” indica comportamento observado, “confirmado em código” indica uma condição verificável nas fontes, e “hipótese” indica uma explicação que ainda precisa de teste.

## 1. API da Astra indisponível em processo novo — resolvido

- **Correção registrada.** `764e90e` remove a atribuição inválida a `GENERATION_CONFIG`; `e13942d` corrige as fixtures de integração e roteamento.
- **Verificação atual.** A importação normal de `api/chat.js` retornou um handler válido e a suíte completa passou nos 120 testes, sem injeção de variável global. Build e typecheck do portal também passaram. Não foi feita validação de produção.
- O diff local independente em `api/chat.js` foi preservado e não fez parte desta validação corretiva. [Código](../api/chat.js) · [Resultados](SESSION_HANDOFF.md)

## 2. Respostas antigas recebem o nome da nova persona — alto, reproduzido

- **Evidência.** No cliente real com NDJSON controlado, texto enviado para Meeseeks terminou sob o rótulo Squanchy, texto enviado para Squanchy terminou sob Sr. Bunda Cagada e o turno dessa última persona terminou sob Astra ao selecionar Escuro.
- **Regressão isolada.** Os novos casos determinísticos repetem troca de dimensão e de tema depois do primeiro fragmento. Ambos confirmam que a prévia continua sob Squanchy, mas a mensagem final troca para Mr. Poopybutthole ou Astra. São duas falhas esperadas em `node --test tests/isolated/astra-streaming.test.mjs tests/isolated/project-question.test.mjs`; permanecem fora da suíte principal. [Matriz e limitações](ASTRA_REGRESSION_REPORT.md)
- **Causa.** `ChatPage` sobrevive às trocas, mantém o pedido em andamento e captura a aparência só no envio. A mensagem final não guarda identidade e a bolha consulta o contexto visual atual. O mesmo vale para mensagens anteriores já concluídas.
- **Risco associado.** Um plano ou continuação de revisão pode chegar depois da mudança. O código verifica abort e versão do editor, mas o teste de reprodução reteve texto, não executou uma ação tardia. Não há evidência de execução indevida nesta amostra.
- **Critério de resolução.** A autoria visível do turno acompanha sua requisição antes, durante e depois da troca. O próximo turno usa a nova persona. Testar também a troca de interface pedida por uma ferramenta. [Envio](../src/pages/ChatPage.jsx) · [Bolha](../src/components/MessageBubble.jsx) · [Plano](IMPLEMENTATION_PLAN.md)

## 3. Definições vazias desativam o contato local — alto, reproduzido

- **Evidência.** A configuração efetiva do Vite tem a site key vazia. A do servidor tem segredo v3 e chave privada EmailJS vazios. As três já apareciam preenchidas antes de serem redefinidas. Um POST simulado recebeu 503 antes da verificação ou do envio.
- **Alcance.** Formulário de contato neste checkout. Não há evidência de falha nas credenciais Canvas. Uma leitura Canvas em processo diagnóstico retornou `status: ok` e dez cursos, sem registrar dados acadêmicos individuais.
- **Critério de resolução.** Consolidar as três definições, recarregar e validar os dois envios com transporte simulado. A configuração publicada e a entrega final de e-mail continuam sem confirmação. [Diagnóstico sem valores de credenciais](PROJECT_AUDIT.md)

## 4. Conteúdo editorial fora do contexto da Astra — confirmado em código

- O renderer encontra 15 dossiês, mas só os oferece no tema Rick. O servidor conhece o catálogo base, independentemente dos cards, e pode buscar READMEs seletivos. Não há leitura sistemática das fichas pelo backend. A resposta correta sobre ROTA verifica uma pergunta específica.
- O resolvedor pendente `resolveProfile` está isolado. Se for conectado como escrito, descartará textos bilíngues já presentes nos 12 projetos sem chaves i18n. É um **risco de alteração futura**, sem perda atual de dados no catálogo.
- **Critério de resolução.** Fonte editorial compartilhada, títulos e descrições válidos para os 15 IDs e respostas sobre contribuições antes de abrir cards. Falta de fonte para contribuição ou resultado deve permanecer explícita. [Dossiês](../src/data/projectDossiers.js) · [Leitura no card](../src/components/ProjectCard.jsx)

## 5. Resolução de URLs públicas e SVG no harness de integração — resolvido

- **Resolvido em 26 de novembro de 2026.** O harness agora conserva as URLs CSS absolutas de arquivos existentes em `public/`. A fixture da Astra usa o `SVGElement` do próprio jsdom.
- Os quatro casos de integração e roteamento passaram no registro anterior; a suíte completa foi executada novamente após as correções e passou nos 120 testes. Não foi repetida a medição de duração da integração longa.

## 6. Montagem disputa tempo com as animações iniciais — impacto localizado, medido

- A desmontagem da abertura geral dispara a montagem do portfólio. No ensaio com cache limpo e reaproveitado, leituras da altura do cabeçalho e das caixas da galeria pagaram layout síncrono. Houve também quadros longos sem script longo atribuído. O maior valor da primeira execução headless não é uma estimativa de latência em aparelho físico.
- **Hipóteses abertas.** Decodificação, pintura de camadas, composição e aquecimento do navegador podem contribuir para a diferença perceptível no primeiro acesso. Atribuir a causa exclusivamente a imagens, Framer Motion ou CSS ultrapassa a medição.
- **Critério de resolução.** Comparação limitada à janela da abertura/primeiro reveal com a mesma interação, sem regressão em rolagem, foco ou preferência de movimento. [Medições e condições](PROJECT_AUDIT.md)

## 7. Dependências da expansão visual — confirmadas em código e inventário

| Dependência | Evidência e impacto | Condição para avançar |
| --- | --- | --- |
| Terceira dimensão | Bootstrap, passagem Garagem/Cidadela, variantes do portal, cenas, áudio e resolvedor de persona supõem dois destinos. | Definir destino e retorno em cada estado e testar restauração e interrupção. |
| Novos personagens | A aparência só sai do cliente para Rick. Caminhos, traduções, nomes no servidor e contornos do retrato estão ligados aos IDs existentes. | Perfil permitido, chaves PT/EN e retrato estático ou geometria de atuação por ID. |
| Fundo La Casa Dark | Nenhum asset de produção está identificado como o original aprovado. | Localizar e vincular o arquivo aprovado à sua origem antes da integração artística. |
| “For the Damaged Coda” e novas artes | A faixa é identificável no catálogo oficial. As mídias novas não constam no inventário de produção. | Definir reprodução autorizada e origem dos novos retratos e fundos. |
| Fotografia de Lucas | O endereço publicado indicado retornou 404. O código está acessível e o README declara MIT, sem LICENSE independente na revisão consultada. | Usar fotos próprias/autorizadas e preservar os avisos aplicáveis se houver cópia de código. |
| Nome e formato divergentes | `public/github.png` contém WebP lossless de 1024 × 512. O catálogo usa a URL histórica. | Ao reprocessar imagens, detectar formato pela assinatura e preservar referências. |

## Hipóteses ainda sem confirmação

O histórico inclui vozes antigas e a saudação mutável participa da âncora do resumo. Ambas são explicações plausíveis para interferência textual em conversas longas. A amostra curta com Gemini real respeitou a nova persona. Nenhum teste identificou resposta de conversa reaproveitada de um cache de personagem. A dimensão de ocorrência, frequência, provedor e duração devem ser anotados em uma futura reprodução natural. [Histórico, caches e testes](PROJECT_AUDIT.md)

## 8. Semântica do idioma e fechamento do menu mobile — corrigido

- A auditoria pontual da fase 14 identificou que o controle de idioma tinha `aria-label`, mas seu contêiner era um `<div>` genérico sem papel de grupo. O contêiner agora expõe `role="group"` e reutiliza a tradução existente para o nome acessível.
- No menu mobile, Escape não fechava o diálogo e o foco permanecia no botão interno de fechar. O menu agora trata Escape e `cancel`, fecha o `<dialog>` e devolve foco ao acionador; o foco visível foi conferido no navegador.
- A inspeção foi localizada aos fluxos e viewports exercitados. Não representa auditoria completa de WCAG nem substitui testes com tecnologia assistiva; veja [ACCESSIBILITY_PREPARATION_REPORT.md](ACCESSIBILITY_PREPARATION_REPORT.md).
