# Привязка DUNGEON: DESCENT к Telegram-боту

Игра уже умеет работать как Telegram Mini App (`TelegramService` + SDK в `index.html`).
Нужно только создать бота и указать HTTPS-URL игры.

## URL игры (выбери один)

**Пока GitHub Pages не включён** (работает сейчас):
```
https://raw.githack.com/Neonkotick/dungeon-descent/gh-pages/index.html
```

**После включения Pages** (предпочтительно):
```
https://neonkotick.github.io/dungeon-descent/
```

Telegram принимает **только HTTPS**.

---

## Шаг 1 — Создать бота

1. Открой Telegram → найди **@BotFather**
2. Отправь: `/newbot`
3. Имя (display): `Dungeon Descent`
4. Username: например `DungeonDescentBot` (должен заканчиваться на `bot`)
5. BotFather пришлёт **token** — сохрани (не публикуй в репо)

---

## Шаг 2 — Создать Mini App

1. @BotFather: `/newapp`
2. Выбери своего бота
3. **Title:** `DUNGEON: DESCENT`
4. **Description:** `Pixel dungeon crawler. Descend deeper, loot, defeat bosses.`
5. **Photo:** квадрат 640×640 (можно скрин меню)
6. **GIF:** `/empty` если нет
7. **Web App URL:**
```
https://raw.githack.com/Neonkotick/dungeon-descent/gh-pages/index.html
```
8. **Short name:** `play`

Ссылка будет:
```
https://t.me/YourBotUsername/play
```

---

## Шаг 3 — Кнопка меню в чате

1. @BotFather → `/setmenubutton`
2. Выбери бота
3. URL — тот же URL игры
4. Текст кнопки: `Играть`

---

## Проверка

1. Открой бота → `/start`
2. Кнопка меню **Играть** слева внизу
3. Или `https://t.me/YourBotUsername/play`

---

## Смена URL позже

`/myapps` → выбери app → **Edit Web App URL**

После GitHub Pages:
```
https://neonkotick.github.io/dungeon-descent/
```
