# Relatório de preparação de acessibilidade — fase 14

27 de novembro de 2026. Auditoria pontual, com alterações pequenas e verificadas. Este relatório não declara conformidade integral com WCAG 2.2 AA.

## Escopo e resultados

| Área | Constatação | Resultado |
| --- | --- | --- |
| Seletor de idioma do header | O nome acessível estava em um `<div>` genérico sem semântica de grupo. | Corrigido com `role="group"` e a chave localizada `navbar.idioma`; os botões PT/EN e o estado `aria-pressed` foram preservados. |
| Menu mobile | Escape não fechava o `<dialog>` e o foco permanecia no botão interno “Fechar menu”. | Corrigido. Escape e `cancel` fecham o diálogo e devolvem o foco ao botão “Menu”. A abertura continua focando o controle de fechar. |
| Seletor de temas | Navegação por teclado e retorno de foco ao acionador. | Verificado no navegador: item selecionado recebe foco, seta move o foco e Escape fecha e devolve foco ao acionador. |
| Foco visível | Botão de menu mobile após fechar com Escape. | `:focus-visible` ativo e contorno sólido de 2 px observados no navegador. |
| Responsividade | Viewports de 375, 390, 768, 1024, 1440 e 1920 px, em tema claro e escuro. | Sem overflow horizontal nos estados examinados. |

### Problemas corrigidos e arquivos

- [Navbar.jsx](../src/components/Navbar.jsx): atribuído papel de grupo ao seletor de idioma e reutilizado o rótulo traduzido existente. Isso fornece nome, papel e agrupamento sem atributos ARIA redundantes nos botões.
- [MobileNav.jsx](../src/components/MobileNav.jsx): acrescentado tratamento explícito de `Escape` e `cancel`; fechamento centralizado verifica se o diálogo está aberto e restaura o foco ao acionador. O fechamento por botão, backdrop, seleção e mudança de tema usa o mesmo fluxo.
- [navbar-accessibility.jsx](../tests/navbar-accessibility.jsx) e [navbar-accessibility.test.mjs](../tests/navbar-accessibility.test.mjs): teste direcionado para nome/papel do grupo em português e inglês e para os botões selecionados.

## Critérios relacionados

- **WCAG 2.2 — 2.1.1 Teclado:** Escape e navegação por setas foram exercitados no menu/seleção de tema.
- **WCAG 2.2 — 2.4.3 Ordem do foco:** foco inicial e retorno ao acionador do diálogo mobile foram conferidos.
- **WCAG 2.2 — 2.4.7 Foco visível:** contorno visível foi observado após fechamento por teclado; não foi feita medição exaustiva de contraste do indicador.
- **WCAG 2.2 — 4.1.2 Nome, função e valor:** grupo de idioma nomeado pela tradução existente; controles continuam expondo seleção.

## Validação

- `node --test tests/navbar-accessibility.test.mjs`: passou, 1 teste, 0 falhas.
- `node --test --test-reporter=dot tests/*.test.mjs`: suíte principal terminou com código de saída 0.
- Navegador local: menu mobile fechou com Escape e o foco retornou ao acionador; o seletor de temas moveu e devolveu foco conforme descrito.
- Em 6 larguras × 2 estados (claro/escuro), não foi observado overflow horizontal.
- `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.portal.json`: passou.
- Build de produção em diretório temporário: passou, 2.271 módulos; permaneceu o aviso de chunks acima de 500 kB.
- `git diff --check`: passou; Git reportou apenas avisos de conversão LF/CRLF em arquivos preexistentes.

## Reservas, limitações e recomendações

- A verificação manual foi limitada aos fluxos e estados descritos. Cards/dossiês, formulários, footer, tooltips, controles do Laboratório e Astra não receberam auditoria individual exaustiva nesta fase. Não foram feitos testes com leitor de tela, alto contraste do sistema, avaliação presencial de IHC ou medição completa de contraste de cada tema/controle.
- A suíte principal não inclui os testes isolados de autoria da Astra; suas falhas conhecidas permanecem reservadas ao Codex e não foram alteradas nesta fase.
- Não se alteraram a lógica conversacional da Astra, recaptcha, dossiês, animações ou componentes visuais além da semântica e do fechamento/retorno de foco do menu mobile.
- Fazer avaliação com teclado e leitor de tela nos menus e formulários; observar foco visível, ordem, fechamento/retorno e nomes acessíveis em temas claros/escuros. Repetir em navegador móvel real antes de declarar conformidade.
- A validação automatizada e esta revisão pontual não bastam para declarar conformidade global WCAG 2.2 AA.
