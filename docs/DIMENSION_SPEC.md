# Além da Curva Finita Central

Fase 02 do tema Rick and Morty. A dimensão `beyond-curve` usa o mesmo seletor, o mesmo `ThemeProvider` e os mesmos recursos profissionais da Garagem e da Cidadela.

| Dimensão | ID | Astra compacta | Astra completa |
| --- | --- | --- | --- |
| Garagem do Rick | `lab` | Sr. Meeseeks / Mr. Meeseeks | Pessoa-Pássaro / Birdperson |
| Cidadela dos Ricks | `corrupted` | Sr. Meeseeks / Mr. Meeseeks | Sr. Bunda Cagada / Mr. Poopybutthole |
| Além da Curva Finita Central | `beyond-curve` | Rick Maligno / Evil Rick | Morty Maligno / Evil Morty |

## Descoberta e retorno

- A Astra interpreta **Wubba Lubba Dub-Dub** e variantes normalizadas como mensagem integral nas duas superfícies. A comparação local remove acentos, pontuação e espaços. O comando funciona desde a primeira visita, independentemente da leitura das pistas.
- O portal amarelo aparece após o reconhecimento. O primeiro envio parte da Garagem ou da Cidadela. Depois da descoberta, a navegação pelo cabeçalho abre a dimensão diretamente. Dentro dela, os dois portais levam à Garagem e à Cidadela.
- `rick-morty-beyond-unlocked` guarda o desbloqueio. `rick-morty-dimension` guarda o destino e só restaura `beyond-curve` se a descoberta estiver registrada. O alias de tema `rick-morty-secret` continua resolvendo para a Cidadela. O seletor mantém 15 temas.
- A primeira chegada bem-sucedida concede **Viajante Interdimensional**, inclusive com o registro opcional desativado. A conquista usa a lista `found` do diário de exploração. A limpeza do diário remove a conquista e a descoberta e retorna à Garagem quando acionada da mansão.
- Recarregar ou abrir `/chat` diretamente conserva a dimensão válida. Ao retornar ao tema Rick depois de sair dele na mansão, a mansão volta. O comportamento de selecionar Rick a partir das duas dimensões históricas inicia na Garagem.

### Pistas opcionais

| Pista | Onde encontrar | Como ativar |
| --- | --- | --- |
| Pessoa-Pássaro | Garagem, link **Pessoa-Pássaro** no cabeçalho ou no menu de navegação móvel | Abra a Astra completa e pergunte sobre mistérios, segredos ou expressões de Rick. A sugestão **Rick tem alguma frase secreta?** também ativa a fala. |
| Sr. Meeseeks | Garagem e Cidadela, monitor da bancada ou terminal de atendimento, abaixo da apresentação | Selecione **Abrir conversa** e pergunte sobre os segredos ou as frases de Rick. A mesma sugestão aparece no chat compacto vazio. |
| Registro confidencial | Cidadela, painel da apresentação, logo abaixo do terminal de atendimento | Abra **Registro confidencial** para ler o sinal e o código com lacunas. |
| Frequência anômala | Garagem, painel da apresentação, logo abaixo do monitor da bancada | Abra **Frequência anômala**, identificada pela interferência dourada, para ler a assinatura de energia. |

As pistas têm textos PT/EN. O chat responde localmente e usa a persona da superfície atual. Os controles dos painéis abrem por toque, clique, Enter ou Espaço. Consultar uma pista não registra desbloqueio.

## Cena, áudio e interface

O relógio da sequência original de estreia é de 6,7 s. Uma câmera em Canvas 2D avança pelos anéis e pelas partículas projetados em perspectiva. Fendas luminosas acompanham a abertura da barreira. A luz do túnel muda à medida que o visitante se aproxima do portal, e uma íris revela a mansão. A rota curta de revisita tem um relógio de cerca de 1,18 s. **Rever travessia**, no canal da mansão, abre a sequência completa novamente. A ruptura e os marcos de áudio conservam seus tempos originais.

As travessias reutilizam o túnel em Canvas 2D. A saída da Garagem para a Cidadela usa verde. A saída da Cidadela para a Garagem usa ciano. O portal da Curva usa amarelo. As imagens finais da Garagem, da doca da Cidadela e da mansão usam 1,65 s de apresentação, tomando a duração original da doca como referência. Escape, o botão de pular, aba em segundo plano, perda do contexto do Canvas e ativação de movimento reduzido concluem a chegada. O diálogo devolve o foco ao controle de origem. Com movimento reduzido ou efeitos pausados, a troca é direta.

A mansão usa o WebP local de 1125 × 603 com enquadramento CSS para retrato. O degradê protege títulos e painéis. A paleta da dimensão combina `#09090D`, `#13131A`, `#1C1B23` e `#EAB308`. O portal do cabeçalho usa o PNG transparente compacto de 123 × 128 e tem alternativa CSS. Ele serve de referência para o amarelo vivo, os realces claros e o halo do portal atrás da fotografia. O SVG procedural conserva as correntes em contrarrotação, as partículas e o enquadramento. O retrato permanece estável em sua própria camada. A animação contínua cede fora da viewport, em aba oculta, quando pausada ou com preferência por movimento reduzido. Os avatares temáticos são estáticos com alternativa visual em caso de erro.

Nas superfícies opacas, o texto principal tem contraste de 15,36:1 e o secundário de 7,89:1 sobre os cards. O anel amarelo tem 13,36:1 sobre a superfície escura. Portfólio e Astra completa foram medidos nas seis larguras solicitadas, de 375 a 1920 px.

O arquivo local **For the Damaged Coda**, de Blonde Redhead, está no caminho `public/rick-assets/audio/evil-morty-30s.mp3`. O player sincroniza a tentativa inicial com o gesto do visitante no ambiente de desenvolvimento. O ganho relativo começa em 48%, sobe a 78% na ruptura e chega ao limite escolhido pelo visitante no túnel. Volume zero, pausa explícita e ausência de gesto podem deixar a travessia silenciosa. A faixa toca uma vez, usa os controles existentes e é interrompida ao sair da dimensão. A compilação de produção sinaliza a faixa como indisponível.

## Mídia e distribuição

As cinco imagens cinematográficas, o PNG de cabeçalho e os três avatares vêm da importação local V11.2. O MP3 VBR tem 44,1 kHz e cerca de 30,07 s. O SHA-256 conferido é `11610e293189cab5c6d9d8e060a2a09b65ed4a7fe85d76faac2b3f4e49542774`. A autorização musical foi informada. A documentação comprobatória da gravação e as permissões de uso, adaptação e distribuição das artes continuam pendentes. As mídias novas ficam no checkout local e fora dos commits. O Vite copia arquivos de `public/` para o build temporário, que foi usado somente para verificação local. A confirmação das permissões ou a substituição das mídias é condição para publicar esta fase.

[Inventário da importação](ASSET_IMPORT_V11_2_REPORT.md) · [Ícones do cabeçalho](HEADER_ASSETS_REPORT.md) · [Contrato de autoria](ASTRA_PERSONAS_HANDOFF.md)
