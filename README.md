# Annoying Claude

Desktop Goose, mais avec le mascot Claude Code. Compagnon de bureau transparent
qui se balade sur ton écran et fout joyeusement la merde — parodie d'un AI agent
qui prend des libertés grotesques.

## Status

**Phase 1 done** — skeleton tourne. Claude (placeholder pixel art) erre sur
l'écran via une fenêtre transparente always-on-top. Tray icon, hotkeys, et
scheduler de bêtises sont en place.

## Run

```powershell
npm install
npm run dev
```

## Hotkeys (toujours actifs)

| Combo            | Action                                |
| ---------------- | ------------------------------------- |
| `Ctrl+Shift+Q`   | **PANIC** — kill l'app immédiatement  |
| `Ctrl+Shift+P`   | Pause / reprise du scheduler          |
| `Ctrl+Shift+C`   | Catch (à venir Phase 2)               |

L'icône system tray contient aussi Pause / Intensité / Quit et un sous-menu
"Force mischief (debug)" pour déclencher chaque bêtise à la demande.

## Build (Windows .exe)

```powershell
npm run package
```

## Plan complet

Voir `C:\Users\Imbu\.claude\plans\tu-vas-r-cup-rer-le-mighty-pretzel.md` pour
l'architecture, le catalogue de bêtises (Tier 1/2/3), et les phases restantes
(Phase 2 = sprite final + audio ; Phase 3-4 = mischief Tier 1-2 ; Phase 5 =
nut.js OS-level chaos).
