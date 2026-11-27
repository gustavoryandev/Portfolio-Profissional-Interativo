# PhotoReveal de La Casa de Papel

O Assalto preserva `public/perfil-foto.jpeg` (572 × 777) como fotografia profissional. A fotografia mascarada aprovada está em `public/la-casa-de-papel/perfil-foto-reveal.webp` (1076 × 1462). A conversão para WebP sem perdas preservou todos os pixels decodificados do PNG fornecido.

O quadro usa toda a largura interna do card e segue a proporção natural de 572:777. A fotografia profissional permanece inteira, com rosto, terno, gravata e mão visíveis. O card usa o mesmo espaçamento interno dos temas convencionais, com 18 px no layout padrão e 12 px em desktop de menor altura.

A imagem mascarada é opaca. O Canvas e a alternância estática exibem a imagem inteira, centralizada e com escala uniforme. A diferença de proporção entre as fontes fica abaixo de um pixel CSS nas larguras avaliadas. O botão de revelação completa oculta a camada da foto profissional.

`HeistPortrait.jsx` fornece os dois assets e a proporção do quadro. O Canvas 2D combina pincel radial, inércia, rastro que se dissipa em cerca de 660 ms e composição com a imagem alternativa. O processamento para quando o rastro termina, o retrato sai da viewport, a aba fica oculta ou o componente desmonta. O DPR máximo é 2. No toque, o retrato aceita uma passada ou um toque e libera a rolagem vertical. O botão alterna entre as imagens usando teclado e em movimento reduzido. Se a imagem alternativa falhar, o retrato original permanece disponível.

## Validação e mídia definitiva

O Chrome executou o teste de dimensões do card antes e depois de alternar o retrato em seis larguras. Também foram conferidos o rastro pelo mouse, a dissipação, o toque emulado, a troca via Enter, movimento reduzido e erros de imagem simulados. O teste automatizado verificou interrupção fora da viewport e em aba oculta. [Teste](../tests/heist.test.mjs)

A futura variante Light deve reutilizar `HeistPortrait` e o mesmo WebP aprovado.

O endereço publicado da referência estava inacessível na consulta. O experimento consultou o conceito de rastro no código de Lucas Dias Melo. O README declara MIT e o caminho `LICENSE` retornou 404 na revisão consultada. A aplicação estende seu próprio componente Canvas 2D com sua própria geometria e mídias locais. [Componente de referência](https://raw.githubusercontent.com/lucasdiasmz/lucas-portfolio/f0970bcfa9daf014806762fcff1d06a2c03ac328/src/components/HeroPortrait.jsx) · [README da revisão](https://raw.githubusercontent.com/lucasdiasmz/lucas-portfolio/f0970bcfa9daf014806762fcff1d06a2c03ac328/README.md)
