# Deployment — DUNGEON: DESCENT

## Вариант 1: GitHub Pages (рекомендуется, без Vercel)

Уже настроен workflow `.github/workflows/deploy-pages.yml`.

### Один раз в настройках репозитория

1. Открой: https://github.com/Neonkotick/dungeon-descent/settings/pages
2. **Source** → **GitHub Actions** (не "Deploy from a branch")
3. Сохрани

### Деплой

- Каждый push в `main` автоматически собирает и публикует игру
- Или: вкладка **Actions** → **Deploy to GitHub Pages** → **Run workflow**

### URL игры

```
https://neonkotick.github.io/dungeon-descent/
```

(точный URL появится в Settings → Pages и в логе Actions)

### Telegram Mini App

@BotFather → `/newapp` → **Web App URL** = этот HTTPS-адрес.

---

## Вариант 2: Cloudflare Pages (бесплатно)

1. https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → Connect to Git
2. Выбери репозиторий `dungeon-descent`
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Deploy

URL вида: `https://dungeon-descent.pages.dev`

---

## Вариант 3: Netlify (бесплатно)

1. https://app.netlify.com → **Add new site** → **Import an existing project**
2. GitHub → `dungeon-descent`
3. Build: `npm run build`, Publish: `dist`
4. Deploy

---

## Вариант 4: Surge.sh (CLI)

```bash
git clone https://github.com/Neonkotick/dungeon-descent.git
cd dungeon-descent
npm install && npm run build
npx surge dist/
```

---

## Локально + ngrok (тест Telegram)

```bash
npm run build && npx serve dist -p 3000
npx ngrok http 3000
```

HTTPS от ngrok можно временно вписать в BotFather.

## Production build

```bash
npm install && npm run build
```

Результат: `dist/`.

- `vite.config.ts` с `base: './'` — работает на GitHub Pages
- Вне Telegram — обычный браузер (mock user)
- Save — localStorage
