# Matriz de regressão da Astra

## Fase 02 · 27 de novembro de 2026

- **128 testes principais e 16 isolados aprovados.** O endpoint foi importado em um processo Node comum. O typecheck do portal, o build temporário e a checagem do diff passaram.
- Os casos de mudança dimensional na Garagem agora esperam Pessoa-Pássaro, conforme a nova apresentação. Uma bolha histórica criada com `squanchy` mantém seu nome e avatar.
- A compacta na Garagem e a completa na Cidadela desbloqueiam a mansão sem solicitar Gemini. A autoria da resposta local fica no ponto de partida. Uma resposta de Evil Morty em andamento mantém nome e avatar depois da travessia e da tradução.
- A regressão inclui recarga, alias, reset, áudio indisponível, falha de imagem, Escape, movimento reduzido, duplicidade de conquista e validação de combinações cliente/servidor. Cancelamento, requisições tardias, retentativas, histórico e revisão do Laboratório continuam cobertos pelas suítes.
- O endpoint e o streaming foram exercitados com transporte e provedores controlados. A verificação da Fase 02 não mediu respostas abertas do Gemini real.

## Fase 01 · 27 de novembro de 2026

Validação em `codex/astra-phase-01`.

Os testes isolados originais foram executados na entrada da fase. Três passaram e dois falharam, com as respostas de Squanchy passando a exibir Mr. Poopybutthole e Astra no final. As asserções originais continuam na suíte isolada, que agora passou nos **11 casos**.

## Cenários verificados

| Cenário | Meio de verificação | Resultado |
| --- | --- | --- |
| Garagem → Cidadela e Rick → Escuro, durante streaming | NDJSON controlado nos dois casos originais | Rótulo inicial, prévia e final mantêm Squanchy. |
| Compacta → completa antes do primeiro fragmento, fechamento e reabertura | NDJSON controlado no cliente e navegação no navegador | A espera, o primeiro fragmento, a mensagem final e o histórico conservam Meeseeks. O turno seguinte usa Squanchy e recebe o texto anterior no histórico. |
| Troca depois de concluir e Astra padrão | Mock e navegador | A resposta anterior mantém a autoria. O avatar padrão se conserva ao mudar para Rick. |
| Idioma antes, durante e depois da resposta | Mock de tradução, verificações de UI e tradução do endpoint | O pedido mantém o idioma inicial. Texto, nomes e erro fixo acompanham a interface conforme o tipo de mensagem. Blocos de código, marcadores e URLs são preservados pelo contrato da tradução. |
| Parar, reenviar e receber JSON atrasado | Resposta atrasada controlada | O pedido anterior não aplica ações, não limpa a prévia nova e não entra como resposta válida no histórico do modelo. |
| Cancelar NDJSON em leitura, receber reset ou receber ações antes de done | Mocks no parser e endpoint | O leitor é cancelado, texto parcial é substituído em fallback e ações descartadas não chegam ao motor. |
| Abrir a completa por comando, repetir abertura com Arcade ativo | Browser e mocks de integração | A ação abre a completa quando aplicável. A resposta tardia conserva o Arcade já aberto. |
| Continuação do Laboratório após mudança de superfície | JSON de plano e NDJSON de continuação | O segundo pedido leva exemplo e código corretos e conserva superfície, persona e idioma de origem. A execução proposta aparece para revisão. |
| Leitura de editor modificado, parada de execução posterior, revisão, aprovação e duplicação | Motor de ações e worker simulados | O plano velho é descartado quando o editor ou a execução mudou. Aprovar duas vezes não dispara nova execução. Alterar o código após revisão invalida a proposta. |
| Código e saída do Laboratório | Navegador com workers reais e fixtures de edição | JavaScript e Python retornam `6`. A saída e o rascunho JavaScript sobrevivem à navegação. Propor/confirmar edição e distinguir código de saída têm cobertura automatizada. |
| Projeto sem card, formação, lacuna factual, referência anterior e programação simples | Contratos simulados e amostra Gemini real | Catálogo enviado, ROTA identificado, formação e objetivo respondidos, certificação indisponível sinalizada e exemplos/conversão apresentados. |
| Pedido ambíguo de código e projeto 2 do Laboratório | Gemini real e teste do contrato de ferramentas | Sem referência, pede esclarecimento. Com referência, seleciona e lê `cart`. O snapshot público permite explicação do código. |
| Indisponibilidade do Gemini | Mocks no endpoint e amostra real | Fallback cobre falhas e respostas incompletas. A amostra teve um timeout em JSON e completou a repetição em NDJSON. |
| GitHub, WakaTime, Canvas e Chess.com | Atualização de contexto real e cobertura de contratos | HTTP 200 e fontes `ok`. WakaTime informou também `processing`. |
| Arcade, Xadrez e análise de partidas | Suíte principal e demonstração | O lobby está na completa. A compacta encaminha à completa. O Xadrez abriu pelo chat. Replay e análise foram exercitados pela suíte. |

A amostra de troca de persona em dois turnos não evidenciou perda de fatos ou mistura de apresentação. Conversas longas representativas, dispositivos físicos, Wandbox e execução prolongada de jogos ficam fora da verificação desta fase. [Amostras e limites](ASTRA_EVALUATION.md)

## Validação obrigatória antes de alterar a Astra

Executar a suíte isolada e a principal. A primeira inclui as regressões de autoria e a pergunta de projeto sem card. A expansão do catálogo de personas deve passar nas duas.

```powershell
node --test tests/isolated/astra-streaming.test.mjs tests/isolated/project-question.test.mjs
node --test --test-reporter=dot tests/*.test.mjs
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.portal.json
node --input-type=module -e 'const {default: handler}=await import("./api/chat.js"); if(typeof handler!=="function") process.exitCode=1'
git diff --check
$astraBuild = Join-Path $env:TEMP ('portfolio-astra-build-' + [guid]::NewGuid().ToString('N'))
npm run build -- --outDir $astraBuild
```

**Resultado final.** 11 casos isolados e 125 na suíte principal, todos aprovados. Importação normal da API, typecheck do portal, `git diff --check` e build de produção aprovados. O Vite transformou 2.271 módulos e reportou o aviso conhecido de chunks maiores que 500 kB. A saída do build foi gravada em pasta temporária.
