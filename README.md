# كنز | Kanz — Family Game Platform

A bilingual (**Arabic first**, English one tap away) family game platform for ages 8–17 and adults.
No servers, no accounts, no external libraries: everything runs and is saved on the device.

## What's inside

| Game | What it does |
|---|---|
| 🗺️ **Treasure Adventure** | 6-stop treasure map (riddles, numbers, words, patterns, knowledge, health). Team or individual mode, per-player difficulty, hints, timer, streak bonuses, animated treasure reveal. |
| 📅 **Daily Challenge** | 6 new questions every day — the same for everyone on the same day — with a shareable 🟩🟨🟥 result grid and day streaks. |
| 🍔🥦 **Snack Attack** | 45-second arcade: eat nutritious foods to charge your super power ⚡ (bonus every 5). Treats still score points — no penalties. |
| 🥗 **My Food Diary** | Log what you ate today. Nutritious picks earn stars ⭐ toward a daily goal and bonus coins; treats are logged with friendly, neutral reactions. |
| 🏆 **Hall of Heroes** | XP levels, titles, 11 badges, coins, and an avatar shop. |

Spoken encouragement (always positive — never negative about food) uses the device's built-in speech (Web Speech API) in Arabic or English, with a speech bubble as a fallback when the device has no voice for that language. Sound effects are synthesized (Web Audio) — no audio files.

## Run it

Open `app/index.html` in a browser, or serve the folder:

```bash
npm start            # http://localhost:8080
```

## Publish it (free) with GitHub Pages

1. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `master`. The workflow in `.github/workflows/pages.yml` deploys the `app/` folder.
3. Your link will be `https://<user>.github.io/<repo>/` — share it anywhere.

Handy links: `?lang=en` opens in English; `?go=dailyPick`, `?go=snackPick`, `?go=food` open a game directly.

## Turn it into an app

**Option 1 — Install from the browser (PWA, no store needed).** The site has a manifest and an offline service worker.
Android/desktop Chrome shows an install prompt (📲 button on the home screen); on iPhone use Safari → Share → *Add to Home Screen*.

**Option 2 — App Store / Google Play (Capacitor).** The repo is pre-configured (`capacitor.config.json`, `webDir: app`):

```bash
npm install
npm run app:add-android      # or app:add-ios (needs a Mac + Xcode)
npm run app:sync
npm run app:android          # opens Android Studio → Build → Generate Signed Bundle
```

After changing the web files, run `npm run app:sync` again. When you publish a new web version, bump `VERSION` in `app/sw.js`.

## Project layout

```
app/
  index.html            shell
  css/app.css           styles (RTL + LTR)
  js/content.js         questions, foods, phrases, avatars, badges (Arabic + English)
  js/engine.js          seeded question engine + generators
  js/audio.js           sound effects + speech
  js/i18n.js            interface text
  js/app.js             screens, game logic, rewards, sharing, install
  manifest.webmanifest, sw.js, icons/
treasure-hunt.html      the original single-file Arabic treasure hunt
```

To add questions, edit `app/js/content.js` (`B(...)` for multiple choice, `P(...)` for patterns).
