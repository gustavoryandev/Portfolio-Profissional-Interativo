# Problemas conhecidos e limites de verificação

27 de novembro de 2026 · Os resultados da Fase 01 estão na [avaliação da Astra](ASTRA_EVALUATION.md) e na [matriz de regressão](ASTRA_REGRESSION_REPORT.md). Os demais itens mantêm o contexto da auditoria de 26 de novembro. “Reproduzido” indica comportamento observado, “confirmado em código” indica uma condição verificável nas fontes, e “hipótese” indica uma explicação que ainda precisa de teste.

## 1. API da Astra indisponível em processo novo — resolvido

- **Correção registrada.** `764e90e` remove a atribuição inválida a `GENERATION_CONFIG`; `e13942d` corrige as fixtures de integração e roteamento.
- **Verificação atual.** A importação normal de `api/chat.js` retornou um handler válido e a suíte completa passou nos 120 testes, sem injeção de variável global. Build e typecheck do portal também passaram. Não foi feita validação de produção.
- O diff local independente em `api/chat.js` foi preservado e não fez parte desta validação corretiva. [Código](../api/chat.js) · [Resultados](SESSION_HANDOFF.md)

## 2. Respostas antigas recebem o nome da nova persona — resolvido

- **Evidência.** No cliente real com NDJSON controlado, texto enviado para Meeseeks terminou sob o rótulo Squanchy, texto enviado para Squanchy terminou sob Sr. Bunda Cagada e o turno dessa última persona terminou sob Astra ao selecionar Escuro.
- **Causa e correção.** As bolhas concluídas consultavam o cenário atual. O commit `947060d` inclui o autor de origem na espera, no streaming, no histórico e na conclusão. A saudação acompanha o cenário e o próximo turno resolve sua própria identidade.
- **Validação.** As duas reproduções originais passaram. Também foram verificados troca antes do primeiro fragmento, mudança de superfície, fechamento, autoria da Astra padrão e abertura da completa por ferramenta. [Matriz e limitações](ASTRA_REGRESSION_REPORT.md)

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
| Terceira dimensão | A Fase 02 integra descoberta, navegação, cena, áudio local e conquista. | Aprovação da demonstração e liberação de mídia antes da distribuição. [Especificação](DIMENSION_SPEC.md) |
| Artes das personas | A Fase 03 usa Berlim e Professor com avatares locais e a mesma autoria por turno. | Comprovar os direitos de distribuição dos avatares. [Especificação](MONEY_HEIST_SPEC.md) |
| Mídias de La Casa de Papel | Os fundos diurno e noturno, a máscara e os avatares usados na demonstração permanecem como assets locais. O retrato mascarado definitivo já está integrado nas duas variantes. | Registrar a autorização de distribuição das demais artes antes de publicar. [PhotoReveal](HEIST_PORTRAIT_HANDOFF.md) |
| “For the Damaged Coda” e novas artes | O MP3 e as imagens V11.2 existem no checkout e ficaram fora dos commits da Fase 02. | Validar a documentação da gravação e a licença de uso, adaptação e distribuição das imagens ou substituir por mídia autorizada. |
| Referência de interação | O código de Lucas está acessível na revisão consultada. O README declara MIT e o caminho `LICENSE` retornou 404. | O PhotoReveal usa a implementação própria do portfólio e seus assets locais. [Referência consultada](HEIST_PORTRAIT_HANDOFF.md) |
| Nome e formato divergentes | `public/github.png` contém WebP lossless de 1024 × 512. O catálogo usa a URL histórica. | Ao reprocessar imagens, detectar formato pela assinatura e preservar referências. |

## Hipóteses ainda sem confirmação

O histórico inclui vozes antigas e a saudação mutável participa da âncora do resumo. Ambas são explicações plausíveis para interferência textual em conversas longas. A amostra curta com Gemini real respeitou a nova persona. Nenhum teste identificou resposta de conversa reaproveitada de um cache de personagem. A dimensão de ocorrência, frequência, provedor e duração devem ser anotados em uma futura reprodução natural. [Histórico, caches e testes](PROJECT_AUDIT.md)

## 8. Semântica do idioma e fechamento do menu mobile — corrigido

- A auditoria pontual da fase 14 identificou que o controle de idioma tinha `aria-label`, mas seu contêiner era um `<div>` genérico sem papel de grupo. O contêiner agora expõe `role="group"` e reutiliza a tradução existente para o nome acessível.
- No menu mobile, Escape não fechava o diálogo e o foco permanecia no botão interno de fechar. O menu agora trata Escape e `cancel`, fecha o `<dialog>` e devolve foco ao acionador; o foco visível foi conferido no navegador.
- A inspeção foi localizada aos fluxos e viewports exercitados. Não representa auditoria completa de WCAG nem substitui testes com tecnologia assistiva; veja [ACCESSIBILITY_PREPARATION_REPORT.md](ACCESSIBILITY_PREPARATION_REPORT.md).

## 9. Disponibilidade de Gemini e cobertura semântica

- Uma chamada real em JSON expirou no provedor e retornou HTTP 500. A repetição em NDJSON completou. A política de fallback atual continua cobrindo indisponibilidade e resposta incompleta dentro dos limites por modelo. A cobertura de cota, cancelamento e erro de transporte usa mocks.
- A política da saudação e do erro local foi corrigida. Fallbacks de provedor e respostas parciais canceladas continuam no idioma do turno. O ensaio semântico usou uma amostra curta. [Avaliação](ASTRA_EVALUATION.md) · [I18N](I18N_PENDING.md)
