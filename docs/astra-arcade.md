# Astra Arcade

O Arcade funciona na Astra Completa, em `/chat?arcade=1`. O seletor **Visual do jogo**
alterna entre Clássico e Tema Astra e salva a escolha no navegador. As cores dos
elementos de jogo que precisam permanecer distinguíveis, como os fantasmas e
tetraminós, são preservadas.

## Pesquisa de implementações

| Candidato | Verificação | Decisão |
| --- | --- | --- |
| [bward2/pacman-js](https://github.com/bward2/pacman-js) | [MIT, © 2020 Brent Ward](https://github.com/bward2/pacman-js/blob/master/LICENSE) | O projeto traz sua própria aplicação e infraestrutura de build. O motor local já se encaixava no ciclo da Astra. Os quatro fantasmas, a casa e a apresentação foram implementados no motor local. |
| [Basic Frogger, de Straker](https://gist.github.com/straker/82a4368849cbd441b05bd6a044f2b2d3) | CC0 1.0 declarado pelo autor | Adaptados o espaçamento dos cinco destinos e os padrões de tráfego. A versão de origem oferece seu próprio loop de animação e não tem o ciclo completo de fases, vidas e tempo exigido pela Astra. |
| [varshney-himanshu/snake-game-js](https://github.com/varshney-himanshu/snake-game-js) | [MIT, © 2025 Himanshu Varshney](https://github.com/varshney-himanshu/snake-game-js/blob/main/LICENSE) | O motor local já trata colisões com paredes e toque. O candidato atravessa as bordas por padrão e duplicaria o ciclo de estado da Astra. |
| [simonlc/tetr.js](https://github.com/simonlc/tetr.js) | [MIT, © 2012 Simon M. Laroche](https://github.com/simonlc/tetr.js/blob/master/LICENSE) | Adaptadas as tabelas e a aplicação dos deslocamentos do SRS. As fontes e o código ligado ao DOM, controles e replay ficaram fora do bundle. |
| [dobkir/pong](https://github.com/dobkir/pong) | [O arquivo MIT atribui © 2018 a Othneil Drew](https://github.com/dobkir/pong/blob/master/LICENSE.txt). | O candidato acopla a partida à página, aos modais e a arquivos de imagem e som. Mantido o motor local, que já oferece três dificuldades, toque e mouse. |

Também foram avaliados [KamranBoroomand/PacMan](https://github.com/KamranBoroomand/PacMan)
e [jakesgordon/javascript-pong](https://github.com/jakesgordon/javascript-pong).
Ambos disponibilizam licença MIT para o código. Seus ciclos de jogo e interfaces
duplicariam componentes já integrados. O Pong de Jake Gordon também não inclui
suporte de toque pronto. O código selecionado não traz dependências de terceiros
em execução. Consulte os [avisos completos](../public/THIRD_PARTY_NOTICES.txt).

## Recordes e Supabase

O portfólio não possui cliente, credenciais nem sessão do Supabase Auth. O Arcade
usa o armazenamento do navegador e preserva os recordes existentes. A migração
em `supabase/migrations` prepara a tabela privada `arcade_sessions` para quando
o projeto tiver autenticação.

Para ativar a sincronização, conecte um projeto Supabase com Auth, aplique a
migração e ligue a persistência à sessão autenticada. Use a chave publicável e
o token do usuário no cliente. A chave primária `(user_id, id)` permite reenvio
idempotente com `on conflict do nothing`. A política de acesso limita leitura
e inserção ao titular. Pontuações enviadas pelo cliente servem a recordes
pessoais. A migração não foi aplicada a um banco remoto.

Para rodar localmente, use `npm run dev` e abra `/chat?arcade=1`. O modo local
não exige novas variáveis de ambiente.
