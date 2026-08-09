# Brai.la — Productivity Timer

Timer de produtividade estilo Pomodoro, com ciclos configuráveis de estudo/pausa
e um fundo animado (céu noturno pixelado + morcego).

## Stack

- HTML/CSS/JavaScript puro (sem framework de UI), organizado em módulos ES.
- [Vite](https://vitejs.dev) para dev server e build de produção.
- [Vitest](https://vitest.dev) + jsdom para testes unitários.
- Web Worker dedicado para a contagem do timer, fora da thread principal.

## Rodando localmente

```bash
npm install
npm run dev       # dev server em http://localhost:5173
```

## Build de produção

```bash
npm run build      # gera ./dist
npm run preview    # serve o build para conferência local
```

## Testes

```bash
npm test           # roda a suíte de testes unitários (Vitest)
```

## Estrutura

```
public/            assets estáticos com caminho fixo, servidos como estão (favicon)
src/
  main.js          ponto de entrada: instancia PixelSky e TimerController
  timer/           regra de negócio do timer (controller, Web Worker, constantes)
  audio/           reprodução de som (pré-carregamento, tratamento de autoplay bloqueado)
  background/      fundo animado (estrelas, nuvens, constelações) — decorativo
  styles/          CSS dividido por responsabilidade (base, timer, pixel-sky, bat)
scripts/           scripts de build auxiliares (geração do sprite do morcego)
tests/unit/        testes unitários (Vitest)
```

Mais detalhes de arquitetura e decisões de design em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Deploy

Publicado no GitHub Pages a partir do build (`dist/`) via
`.github/workflows/deploy.yml`, disparado a cada push em `main`. **O site
nunca deve ser servido a partir do código-fonte bruto do repositório** — o
app depende do processamento do Vite (imports de CSS dentro de JS, resolução
de assets) para funcionar.
