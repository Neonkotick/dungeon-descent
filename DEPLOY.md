# Deployment — DUNGEON: DESCENT

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Production build

```bash
npm run build
```

Output: `dist/` (static HTML + JS).  
`tsc --noEmit` must pass before release.

## Deploy to Vercel (recommended for Telegram)

1. Push repo to GitHub (already done).
2. Go to https://vercel.com → Import project → select `dungeon-descent`.
3. Framework: Vite (auto-detected). Build: `npm run build`. Output: `dist`.
4. Deploy → get HTTPS URL, e.g. `https://dungeon-descent.vercel.app`

Or CLI:

```bash
npm i -g vercel
vercel --prod
```

## Deploy to Cloudflare Pages

1. Cloudflare Dashboard → Pages → Create → Connect GitHub.
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Deploy.

## Connect Telegram Mini App

1. Open @BotFather in Telegram.
2. `/newbot` (or use existing bot).
3. `/newapp` → select bot → set title, description, photo.
4. **Web App URL** = your HTTPS deploy URL (must be HTTPS).
5. Optional: set menu button via `/setmenubutton`.

Open the bot chat → tap the menu / web app button → game loads inside Telegram.

### Notes

- Outside Telegram the game uses a mock user and still works in any browser.
- `TelegramService` handles Back Button, haptics, theme, viewport.
- Client save is localStorage only; plan a backend for authoritative saves later.

## GitHub Pages (alternative)

```bash
npm run build
# push dist/ to gh-pages branch, or use actions
```

Set `base: './'` in vite.config (already set).
