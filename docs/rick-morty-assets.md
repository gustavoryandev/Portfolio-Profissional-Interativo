# Imagens do tema Rick and Morty

Os personagens, avatares, portal, nave e cenas da Cidadela usam imagens encontradas na internet. A garagem ilustrada foi mantida conforme solicitado.

| Arquivo local | Fonte |
| --- | --- |
| `public/rick-assets/rick.webp` | [Fonte](https://www.pngaaa.com/detail/8867771) |
| `public/rick-assets/morty.webp` | [Fonte](https://www.pngkey.com/detail/u2q8a9a9e6i1t4u2_morty-smith-png/) |
| `public/rick-assets/pickle.webp` | [Fonte](https://www.pngaaa.com/detail/2436294) |
| `docs/assets/rick-reference/meeseeks.png` | [Fonte](https://www.pngaaa.com/detail/1765127) |
| `public/rick-assets/meeseeks-box.webp` | [Fonte](https://www.pngaaa.com/detail/1765153) |
| `public/rick-assets/spaceship.webp` | [Fonte](https://www.pngaaa.com/detail/1232300) |
| `public/rick-assets/portal.webp` | [Fonte](https://www.pngaaa.com/detail/209709) |
| `public/rick-assets/citadel.webp` | [Fonte](https://en.hocmarketing.org/the-ultimate-guide-to-rick-and-mortys-citadel-of-ricks-unravel-66754) |
| `public/rick-assets/citadel-plaza.webp` | [Fonte](https://wall.alphacoders.com/big.php?i=633250) |
| `public/rick-assets/avatar-meeseeks.webp` | [Fonte](https://www.pngaaa.com/detail/4870604) |
| `public/rick-assets/avatar-squanchy.webp` | [Fonte](https://mystickermania.com/t/Rick%20and%20Morty/?page=3) |
| `public/rick-assets/avatar-poopybutthole.webp` | [Fonte](https://www.pngaaa.com/detail/4732497) |
| `docs/assets/rick-reference/pickle-rat.png` | [Fonte](https://www.pngmart.com/image/754649) |

Os endereços de origem também estão em `public/rick-assets/sources.json`. As imagens usadas pela interface são WebPs locais. Os desenhos de referência ficam em `docs/assets/rick-reference` e o script de download usa `.cache/rick-reference`.

## Artes de atuação da Garagem

| Recurso | Origem e preparação |
| --- | --- |
| [Meeseeks articulado](../src/components/rick/MeeseeksRig.jsx) | Desenho vetorial preparado nesta etapa com a silhueta, a paleta e o sorriso de `meeseeks.png` como referência. Tronco, cabeça, braços e traços do rosto são formas independentes em um campo transparente de 112 × 128. A caixa conserva a arte original. |
| [Quadros de Pickle Rick](../src/components/rick/PickleFrames.jsx) | O corpo usa o recorte inteiro de `pickle.webp`. O arnês, as costelas, as garras e os membros foram desenhados para a pista com base em `pickle-rat.png`. Os cinco desenhos de montagem e os seis de corrida compartilham um campo transparente de 104 × 112. O próprio componente contém o desenho alternativo do pepino para falha de carga. |
| [Demonstração do Meeseeks](screenshots/garagem-meeseeks.webp) | Gravação da bancada na página do portfólio, capturada no Chrome e codificada em WebP animado. |

O ImageGen bloqueou a tentativa de gerar uma folha de oito poses baseada nos dois PNGs de Pickle Rick. Os quadros entregues são composições vetoriais locais com o corpo original.

## Garagem

Arquivos `public/rick-assets/garage.webp` e `garage-mobile.webp`. O cenário original foi gerado com imagegen a partir da referência fornecida, antes da decisão de manter esta imagem e usar imagens da internet nos personagens.

Prompt: original wide nighttime garage environment closely inspired by the attached reference: wooden beams, three green fluorescent lights, large teal pipe, shelving with gadgets and jars, messy workbench, purple crystals, wiring, CRT monitor and Meeseeks box; open garage door showing starry night; no characters or spaceship; dark left and center for readable portfolio text; flat hand-drawn adult sci-fi cartoon, 3:2 landscape.

## Efeitos da etapa 3

A nave e a Garagem reutilizam as imagens inventariados acima. O feixe do farol, a propulsão, a fumaça e a iluminação foram desenhados em CSS para esta cena. O contorno e as correntes da travessia são caminhos SVG preparados no componente `DimensionPortal`. A [gravação da abertura e da travessia](screenshots/garagem-e-portal.webp) foi capturada na página em execução.

## Artes de atuação da etapa 4

Os [retratos da Astra](../src/components/rick/AssistantPortrait.jsx) usam os recortes locais de Sr. Meeseeks, Squanchy e Sr. Bunda Cagada listados no inventário. As pálpebras foram desenhadas nas coordenadas de cada imagem. O atuador da caixa e as pupilas de Morty também são desenhos SVG locais sobre as artes originais. As gotas da antecipação foram acrescentadas aos [quadros de Pickle Rick](../src/components/rick/PickleFrames.jsx).

## Música

“Rick and Morty Theme”, Rick and Morty & Ryan Elder: [faixa oficial](https://music.apple.com/us/song/1570547237). A seleção do tema inicia a prévia oficial do CDN da Apple. O volume padrão é 22% e o ajuste é salvo no navegador. O cabeçalho oferece pausa direta e o painel **Som e movimento**. A prévia termina uma vez e pode ser repetida. Em segundo plano, só a execução anteriormente iniciada é retomada. Erros de rede, silêncio por volume zero e pausas manuais são tratados pelo mesmo player.
