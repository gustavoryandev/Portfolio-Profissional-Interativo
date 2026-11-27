# Componente independente de revelação fotográfica

Preparação para uma possível integração futura com La Casa de Papel. O componente não foi importado na interface principal e a imagem alternativa definitiva não existe no checkout verificado.

## Arquivos criados

- `src/components/PhotoReveal.jsx` — componente React autônomo.
- `tests/photo-reveal.jsx` — testes de interação isolados com JSDOM e imagens simuladas.
- `tests/photo-reveal.test.mjs` — runner Node que compila o teste JSX temporariamente com esbuild.

Arquivos documentais atualizados: `docs/SESSION_HANDOFF.md` e `scripts/export-ai-context.ps1`. Nenhum componente existente, fotografia, tema, dimensão, persona, configuração ou dependência foi alterado.

## API

```jsx
<PhotoReveal
  originalSrc="/perfil-foto.jpeg"
  alternativeSrc="/la-casa-de-papel/perfil-foto-reveal.webp"
  alt="Retrato de Gustavo"
  radius={126}
  softness={44}
  aspectRatio="572 / 777"
/>
```

| Propriedade | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `originalSrc` | `string` | — | Fonte da fotografia base, sempre apresentada como `<img>`. |
| `alternativeSrc` | `string` | — | Fonte alternativa. Pode ser omitida; também falha com segurança se não carregar. |
| `alt` | `string` | `""` | Texto alternativo da imagem base. Deve ser preenchido quando a imagem for informativa. |
| `radius` | `number` | `110` | Raio da revelação em pixels CSS; deve ser finito e não negativo. Zero oculta a alternativa. |
| `softness` | `number` | `38` | Largura aproximada da transição suave em pixels CSS; deve ser finita e não negativa. Zero usa um limite circular sem feather. |
| `aspectRatio` | `string` | `"572 / 777"` | Proporção reservada ao contêiner; pode ser substituída para outros enquadramentos. |
| `className` | `string` | `""` | Classe opcional do contêiner. |
| `style` | `object` | — | Estilos adicionais do contêiner, aplicados sobre a posição relativa, recorte e proporção padrão. |
| `onAlternativeError` | `function` | — | Callback opcional que recebe o evento `error` da imagem alternativa; o componente ainda preserva a foto original. |

`originalSrc` deve ser uma string não vazia; `radius` e `softness` devem ser números finitos não negativos. Valores inválidos lançam `TypeError`/`RangeError` em vez de serem silenciosamente normalizados. `alternativeSrc` pode ser omitida ou ser uma string.

## Decisões técnicas

- A fotografia original é um elemento `<img>` normal e permanece visível; o canvas é uma camada decorativa transparente por cima.
- A alternativa é desenhada em Canvas 2D com `object-fit: cover` equivalente: calcula escala uniforme e centraliza o recorte, sem esticar a imagem. As duas fotos devem ter composição e alinhamento compatíveis.
- Uma máscara radial revela a alternativa sob o cursor. O gradiente usa `radius` e `softness`; não há rastros persistentes, interpolação temporal ou ciclo de animação.
- Movimento do cursor atualiza apenas refs locais e agenda um único `requestAnimationFrame` pendente. Eventos sucessivos antes do frame são agrupados; após o desenho, nenhum novo frame é solicitado até outro movimento ou redimensionamento.
- O backing store considera `devicePixelRatio`, limitado a 2 para conter uso de memória e trabalho de pintura. A imagem continua sendo desenhada em coordenadas CSS.
- `ResizeObserver` recalcula dimensões; o listener de `window.resize` cobre também mudanças de viewport e serve de fallback quando `ResizeObserver` não existe.
- O cursor fora do contêiner cancela o frame pendente e limpa a camada imediatamente.
- O efeito só é ativado com `(hover: hover) and (pointer: fine)`, alternativa carregada e `prefers-reduced-motion: no-preference`. Dispositivos móveis/coarse e usuários que preferem movimento reduzido veem apenas a imagem original; a alternativa nem é solicitada nesses casos.
- Uma falha de carregamento da alternativa remove a camada e mantém a imagem original; `onAlternativeError` permite que o chamador registre ou sinalize a indisponibilidade. Se Canvas 2D ou `requestAnimationFrame` não estiver disponível, o comportamento também degrada para a foto base.
- O canvas e a imagem alternativa ficam fora da árvore acessível (`aria-hidden`/`alt=""`). O texto `alt` da foto original fornece a descrição sem depender do efeito.

## Limitações

- `public/la-casa-de-papel/perfil-foto-reveal.webp` não estava disponível. Os testes usam apenas URLs simuladas e eventos de carga/erro; não foi criada nenhuma imagem substituta permanente.
- Não foi possível validar alinhamento real, cores, suavidade visual, contraste, carregamento de rede ou desempenho em aparelhos físicos. A segunda foto precisa manter enquadramento/alinhamento com a original aprovada.
- O recorte é centralizado e equivalente a `object-fit: cover`; não há `object-position` configurável. Se as fotografias finais exigirem focos diferentes, essa decisão deve ser confirmada antes da integração.
- O fallback móvel/reduced-motion é a fotografia original estática, não uma alternância de imagens. Isso conserva o comportamento previsível sem hover.
- A API pressupõe imagens carregáveis pelo navegador. Não exporta pixels nem lê o canvas; ainda assim, a integração deve preferir assets locais e aprovados.
- O componente segue independente. Nenhuma integração com `PortfolioPage`, portal dimensional ou tema foi feita nesta etapa.

## Testes e compilação

Comando executado:

```powershell
node --test tests/photo-reveal.test.mjs
```

Resultado: **1 teste Node passou, 0 falharam**. O runner compila `PhotoReveal.jsx` e o teste JSX com esbuild antes de executá-los. As asserções cobrem:

- renderização inicial e fotografia original;
- `alternativeSrc` ausente, ainda carregando e com evento `error`;
- movimento do cursor, coalescência de eventos, dimensões do gradiente e saída do cursor;
- redimensionamento via `ResizeObserver`, DPR limitado a 2 e proporção preservada no desenho;
- cancelamento de `requestAnimationFrame`, desconexão do observer e remoção de listeners ao desmontar;
- preferência `prefers-reduced-motion` e ponteiro coarse sem solicitação da imagem alternativa.

O build geral da aplicação não foi necessário: o componente não é importado na interface, e o esbuild do teste valida diretamente sua compilação sem tocar no build existente. Não foram instaladas dependências.

## Exemplo de integração futura

Depois que a segunda fotografia estiver aprovada e existir no caminho definitivo, a página poderá importar o componente e usá-lo no ponto visual decidido pelo Codex:

```jsx
import PhotoReveal from '../components/PhotoReveal.jsx';

<PhotoReveal
  originalSrc="/perfil-foto.jpeg"
  alternativeSrc="/la-casa-de-papel/perfil-foto-reveal.webp"
  alt="Retrato de Gustavo"
  radius={126}
  softness={44}
  aspectRatio="572 / 777"
/>
```

Este exemplo é apenas documental: não deve ser copiado para a interface antes da autorização da integração, da confirmação de direitos e da disponibilidade/alinhamento das duas imagens.

## Cuidados para a integração

- Manter o `alt` da foto original descritivo e deixar o canvas oculto para leitores de tela. Se a imagem alternativa trouxer informação própria, descrevê-la em texto acessível fora do efeito.
- Tratar o efeito como aprimoramento visual, não como requisito para compreender a página. O conteúdo original precisa continuar visível em mobile, teclado, movimento reduzido, erro de asset e ausência de Canvas.
- Carregar a imagem alternativa somente quando a consulta de mídia permitir interação. Evitar preload global ou download duplicado de variantes desktop/mobile.
- Manter a proporção e o alinhamento das imagens finais; revisar o crop em tamanhos estreitos e verificar contraste e leitura da composição.
- Não aumentar o DPR máximo nem solicitar frames continuamente sem medição em dispositivos reais. O desenho atual usa somente uma solicitação por lote de eventos e fica ocioso enquanto o cursor está parado.
