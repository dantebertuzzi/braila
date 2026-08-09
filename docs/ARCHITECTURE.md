# Arquitetura

## Módulos

O código é organizado por *feature*, não por tipo de arquivo:

- **`src/timer/`** — a única lógica de negócio real do app.
  - `TimerController.js` liga a UI (botões, sliders, display) ao Web Worker e
    ao `SoundPlayer`. Não tem estado de tempo próprio além do necessário para
    renderizar; a contagem em si vive no worker.
  - `timer.worker.js` roda a contagem regressiva num Web Worker dedicado, para
    que o `setInterval` de 1s não dispute a thread principal com o layout/paint
    das animações de fundo (o que causaria "soluços" visíveis no timer se
    estivesse tudo na mesma thread).
  - `timerConstants.js` centraliza `DEFAULT_STUDY_TIME_MIN`/`DEFAULT_BREAK_TIME_MIN`,
    compartilhado entre o controller e o worker — antes cada lado tinha seu
    próprio valor-padrão hardcoded, podendo divergir silenciosamente.

- **`src/audio/SoundPlayer.js`** — pré-carrega os efeitos sonoros uma única vez
  (em vez de instanciar `new Audio()` a cada ciclo) e trata a rejeição da
  Promise de `play()` (navegadores podem bloquear autoplay antes de qualquer
  interação do usuário).

- **`src/background/`** — decoração visual (estrelas, nuvens, constelações),
  sem lógica de negócio. Fica isolada para deixar claro que é puramente
  cosmética e pode ser removida/trocada sem afetar o timer.

## Por que o morcego virou sprite

A animação do morcego era um único `<div>` com ~8 keyframes de `box-shadow`,
cada um listando centenas de "pixels" (uma sombra por pixel). Isso gerava um
arquivo CSS de ~143 KB minificado e forçava o navegador a recalcular centenas
de `box-shadow` a cada troca de frame.

`scripts/build-bat-sprite.mjs` faz o parsing desses keyframes uma única vez e
rasteriza cada frame num sprite sheet PNG (`src/styles/bat-sprite.png`, 8
frames, ~11 KB), referenciado por `bat.css` com uma `url()` relativa para que
o Vite gerencie o hash/caminho final do arquivo (funciona em qualquer
subpath de deploy). O CSS final só precisa de uma animação de
`background-position` com `steps(8)` — resultado: CSS final caiu de 142,9 KB
para 4,23 KB.

Se algum dia o desenho do morcego mudar, edite os keyframes de origem (git
history do commit que introduziu o sprite tem a versão anterior em
`box-shadow`) e rode `node scripts/build-bat-sprite.mjs` de novo.

## Deploy e caminhos de asset

O site é publicado no GitHub Pages sob um subpath (`/braila/`), não na raiz do
domínio. Por isso:

- `vite.config.js` usa `base: './'` (caminhos relativos), para que o HTML/JS/CSS
  gerado funcione tanto em `usuario.github.io/braila/` quanto num domínio
  próprio na raiz, sem precisar hardcodar o nome do repositório.
- Assets referenciados de dentro de JS ou CSS (áudio do `SoundPlayer`, sprite
  do morcego) ficam dentro de `src/` e são importados como módulo
  (`import beepUrl from './sounds/beep.mp3'`, `url('./bat-sprite.png')`) em vez
  de morar em `public/` com caminho absoluto (`/audio/beep.mp3`). Caminhos
  absolutos começando com `/` só funcionam quando o site está na raiz do
  domínio; como módulo, o Vite resolve e reescreve o caminho final
  corretamente para qualquer subpath. `public/` fica reservado para arquivos
  que precisam existir com nome fixo e não são referenciados por import (ex.:
  `favicon.png`, referenciado via caminho relativo simples no `index.html`).
- O deploy é feito pelo workflow `.github/workflows/deploy.yml`: builda com
  `npm run build` e publica `dist/` via GitHub Actions (Pages configurado com
  source "GitHub Actions", não mais "Deploy from a branch"). Servir o
  `index.html` de código-fonte direto do branch `main` **não funciona** — ele
  depende de `import './styles/*.css'` dentro de JS, uma convenção que só o
  bundler entende; o navegador, sem build, tentaria carregar CSS como se
  fosse JavaScript e falharia.

## Decisões que ficaram de fora de propósito

- **`PixelSky` não tem testes automatizados.** É decoração gerada com
  `Math.random()`, sem regra de negócio a proteger — testar isso teria custo
  de manutenção sem retorno real.
- **`bell.mp3`** existe em `public/audio/` mas não é usado em lugar nenhum do
  código (já estava assim antes da refatoração). Não foi removido para não
  apagar um asset do usuário sem confirmação.
