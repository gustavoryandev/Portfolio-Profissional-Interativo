# Relatório de assets do header — fase 14

27 de novembro de 2026. Os arquivos foram preparados para integração futura, mas nenhum foi conectado ao header, à navegação, a tema ou dimensão.

## Arquivos e medições

| Recurso | Caminho | Formato, dimensões | Bytes |
| --- | --- | --- | ---: |
| Máscara Dalí — fonte preservada | `references/header-assets/dali-mask-original.png` | PNG RGBA, 768 × 956 | 432.163 |
| Máscara Dalí — versão transparente | `public/la-casa-de-papel/dali-mask.png` | PNG RGBA, 587 × 701 | 347.381 |
| Máscara Dalí — variante compacta | `public/la-casa-de-papel/dali-mask-header.png` | PNG RGBA, 107 × 128 | 14.591 |
| Portal amarelo — fonte preservada | `references/header-assets/yellow-portal-icon-original.png` | PNG RGBA, 798 × 768 | 683.152 |
| Portal amarelo — versão transparente | `public/rick-assets/beyond-curve/yellow-portal-icon.png` | PNG RGBA, 678 × 708 | 723.386 |
| Portal amarelo — variante compacta | `public/rick-assets/beyond-curve/yellow-portal-icon-header.png` | PNG RGBA, 123 × 128 | 30.853 |

As fontes estavam codificadas em PNG, mas tinham alfa totalmente opaco e fundo preto. Foram mantidas byte a byte em `references/header-assets/`. O fundo foi removido pela região externa conectada às bordas, em vez de apagar toda a cor preta. O recorte preservou a proporção e removeu margens excedentes; as variantes compactas usam redução de alta qualidade com o lado maior em 128 px.

## Transparência e inspeção visual

- Os arquivos finais têm canal alfa com valores entre 0 e 255; os cantos externos estão transparentes.
- Na máscara, detalhes pretos do rosto, olhos/pupilas e interior do capuz foram preservados, assim como o preenchimento branco e o contorno vermelho.
- No portal, tons dourados e amarelos, pontos luminosos brancos e o contorno foram preservados; não há fundo preto opaco externo.
- As versões foram examinadas em 24, 32, 40, 48 e 64 px sobre fundos claros e escuros. Não foram observados resíduos ou serrilhado relevante nesses tamanhos. A revisão é visual; não substitui teste no header real nem prova de qualidade para todos os monitores.
- Os arquivos são PNGs RGBA. As variantes compactas são derivados intencionais para uso futuro, não duplicatas acidentais; os arquivos-fontes continuam preservados.
- As cenas existentes `yellow-portal-scene.webp` e `yellow-portal.webp` não foram modificadas nem substituídas.

## Integração futura

- Máscara: considerar `dali-mask-header.png` no header de La Casa Dark/Light somente após autorização. Usar versão maior apenas quando o contexto realmente exigir resolução superior.
- Portal: considerar `yellow-portal-icon-header.png` no header de Beyond the Curve; manter separados o ícone e as cenas completas do portal.
- Não integrar automaticamente nem antecipar carregamento. Testar alinhamento, tamanho visual, contraste sobre fundos claros/escuros e responsividade junto aos elementos temáticos existentes.
- Tratar o desenho como decorativo quando o nome acessível vier do controle que o contém; qualquer controle interativo deve manter rótulo textual localizado. Não acrescentar comportamento interativo apenas por inserir a imagem.

## Pendências

- Autor, origem e permissões de uso/adaptação/distribuição não foram verificados; receber os PNGs do proprietário não foi tratado como autorização jurídica.
- Confirmar os direitos antes de publicação e registrar origem/licença/hash quando disponíveis.
- Revisar a integração somente quando os temas correspondentes forem autorizados. Os ícones não foram integrados durante a fase 14.
- A verificação de acessibilidade geral está em [ACCESSIBILITY_PREPARATION_REPORT.md](ACCESSIBILITY_PREPARATION_REPORT.md); os caminhos e o estado do inventário estão em [ASSET_INVENTORY.md](ASSET_INVENTORY.md).
