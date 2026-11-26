# Problemas conhecidos e limites de verificação

## 5. Resolução de URLs públicas e SVG no harness de integração

- **Resolvido em 26 de novembro de 2026.** O harness agora conserva as URLs CSS absolutas de arquivos existentes em `public/`. A fixture da Astra usa o `SVGElement` do próprio jsdom.
- Os quatro casos de integração e roteamento passaram e o processo saiu normalmente. A integração longa da Astra levou cerca de 51 s. A suíte completa passou nos 120 testes.
