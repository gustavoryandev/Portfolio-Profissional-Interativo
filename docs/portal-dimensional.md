# Portal dimensional

O portfólio usa o componente no retrato da Garagem e da Cidadela. A demonstração em `/portal.html` apresenta as duas variantes lado a lado, uma fotografia e controles de abertura, pausa, qualidade e brilho. Tanto o servidor de desenvolvimento quanto o build do Vite incluem essa página.

```tsx
import DimensionalPortal from './components/rick/portal/DimensionalPortal';

<DimensionalPortal isOpen variant="garage" />
<DimensionalPortal isOpen variant="citadel" size="100%" aspectRatio={5 / 6}>
  <img src="/perfil-foto.jpeg" alt="Gustavo Ryan" />
</DimensionalPortal>
```

| Prop | Padrão e comportamento |
| --- | --- |
| `isOpen` | Booleano obrigatório. A mudança de direção interrompe a transição em curso. O componente reserva o espaço enquanto fechado. |
| `variant` | `garage` ou `citadel`. O padrão é `garage`. A configuração define paleta, velocidade, deformação e mola. |
| `size` | 320 px. Aceita número em pixels ou valor simples em px, rem, em, vw, vh, vmin, vmax ou %. A largura renderizada fica entre 48 e 800 px, respeitando contêineres menores. |
| `aspectRatio` | Largura dividida pela altura. Padrão 1, intervalo de 0,65 a 1,6. |
| `glowIntensity` | Intensidade do halo externo entre 0 e 1. Padrão 0,65. |
| `effectsPaused` | Padrão falso. Congela a energia no quadro atual. A abertura e o fechamento continuam disponíveis. |
| `quality` | `auto`, `low` ou `high`. O modo automático usa a opção conservadora quando faltam dados do dispositivo e considera economia de dados, memória, processadores, densidade de pixels e tipo de ponteiro. |
| `children` | Opcional. O conteúdo ocupa uma abertura oval independente. Sem conteúdo, a espiral e o núcleo ficam expostos. |
| `className` | Classe opcional do contêiner. |
| `onOpenComplete`, `onCloseComplete` | Notificam a conclusão da transição correspondente. Uma transição interrompida descarta sua notificação. |

**Desenho e desempenho.** As duas variantes compartilham os caminhos gerados antes da renderização. O SVG combina massas escuras, línguas de fluido, filamentos, pontos de luz e respingos. A fotografia ocupa outra camada. O filtro de deslocamento atua em uma região local de 79 × 38 unidades do desenho e recebe um campo de ruído de semente fixa que se desloca continuamente. Cada instância tem seus próprios identificadores de filtro, máscara e gradientes.

O relógio de energia atualiza atributos SVG por referências. Ele é desmontado quando a instância fecha, sai da viewport, a aba fica oculta ou o movimento é pausado. A qualidade baixa usa quatro partículas e uma oitava de ruído. A alta usa oito partículas e duas oitavas. As cadências de atualização são limites do desenho, não medições de fluidez. Com a preferência de movimento reduzido, a abertura e o fechamento usam opacidade e a energia permanece estática.

[Componente e tipos](../src/components/rick/portal/DimensionalPortal.tsx) · [Paletas e limites](../src/components/rick/portal/portalConfig.ts) · [Exemplos interativos](../src/examples/portal/main.tsx)
