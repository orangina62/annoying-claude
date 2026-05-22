# Annoying Claude

> Desktop Goose, version mascotte **Claude Code**.

Un compagnon de bureau qui se balade sur ton écran dans une fenêtre transparente
*always-on-top*, et qui fout joyeusement le bordel — une parodie d'agent IA qui
prend des libertés grotesques : fausses *insights*, faux `CLAUDE.md`, onglets
arrachés, duels contre une oie, et autres hallucinations.

C'est un projet pour rire. Aucune donnée n'est touchée, aucun vrai fichier n'est
créé ou supprimé — tout est du théâtre à l'écran.

---

## Démarrage

```powershell
npm install
npm run dev
```

Claude apparaît au centre de l'écran et commence à vivre sa vie.

## Contrôles

### Raccourcis globaux (toujours actifs)

| Combo            | Action                                         |
| ---------------- | ---------------------------------------------- |
| `Ctrl+Shift+Q`   | **PANIC** — tue l'application immédiatement     |
| `Ctrl+Shift+P`   | Pause / reprise du *scheduler* de bêtises       |
| `Ctrl+Shift+C`   | Catch — attrape Claude                          |

### Icône system tray

Un clic droit sur l'icône de la barre des tâches donne accès à :

- **Pause / Reprise** du scheduler
- **Intensité** : `chill` · `normal` · `chaos`
- **Force mischief (debug)** : déclencher n'importe quelle bêtise à la demande
- **Quit**

## Comment ça marche

### Le scheduler de bêtises

Un *scheduler* tourne en continu et tire au sort des « bêtises » (*mischief*).
Chaque bêtise a un **tier** :

- **Tier 1 — visuel** : purement à l'écran, inoffensif
- **Tier 2 — interactif** : interagit avec le curseur / des fenêtres factices
- **Tier 3 — OS-level** : réservé aux interactions système (via nut.js)

L'**intensité** règle la fréquence et les tiers autorisés :

| Intensité | Tick   | Chance/tick | Tiers autorisés |
| --------- | ------ | ----------- | --------------- |
| `chill`   | 5 s    | 3 %         | 1               |
| `normal`  | 5 s    | 5 %         | 1 · 2 · 3       |
| `chaos`   | 3 s    | 12 %        | 1 · 2 · 3       |

### Le mood engine

Claude a une **humeur** (`bored`, `mischievous`, `angry`, `happy`, `tired`,
`curious`) qui dérive avec le temps et réagit à ce qui se passe (clics en rafale,
combats…). L'humeur pondère le choix des bêtises — un Claude qui s'ennuie ira
plutôt chercher la bagarre, un Claude fatigué se calmera.

### Catalogue des bêtises

| Bêtise                        | Tier | Description                                    |
| ----------------------------- | ---- | ---------------------------------------------- |
| Wander                        | 1    | Se balade tranquillement à l'écran             |
| Fake insight                  | 1    | Affiche une fausse « insight »                 |
| Fake thinking                 | 1    | Fait semblant de réfléchir                     |
| Fake TodoWrite                | 1    | Pond une fausse *todo list*                    |
| Fake CLAUDE.md icon           | 1    | Fait apparaître une fausse icône `CLAUDE.md`   |
| Sticky note                   | 1    | Colle un post-it                               |
| Battle the cursor ⚔           | 1    | Pourchasse et frappe le curseur                |
| Summon a goose ⚔🦢            | 1    | Invoque une oie et la combat en duel           |
| Open a tab                    | 2    | Ouvre un onglet factice                        |
| Drop a fake file              | 2    | Dépose un faux fichier                         |
| Tear off a browser tab        | 2    | Arrache un onglet de navigateur                |
| Steal something near cursor   | 2    | Vole un élément près du curseur                |
| Sherlock peek 🕵              | 2    | Claude enquête, déguisé en Sherlock            |

## Build (Windows)

```powershell
npm run package           # installateur .exe
npm run package:portable  # version portable
```

Autres scripts :

```powershell
npm run build       # build sans packaging
npm run start       # preview du build
npm run typecheck   # vérification TypeScript (main + renderer)
```

## Stack technique

- **Electron** + **electron-vite** — fenêtre overlay transparente, *always-on-top*
- **TypeScript** strict
- **nut.js** (`@nut-tree-fork/nut-js`) — contrôle du curseur au niveau OS
- Pixel-art procédural 16×16 rendu sur `<canvas>` (sprite mascotte + oie)
- Synthèse audio via la Web Audio API

## Structure du projet

```
src/
├─ main/        Processus principal Electron
│  ├─ mischief/      Catalogue des bêtises
│  ├─ behavior-scheduler.ts
│  ├─ mood-engine.ts
│  ├─ hotkeys.ts · tray.ts · window-manager.ts
│  └─ ...
├─ preload/     Ponts contextuels (IPC sécurisé)
├─ renderer/    Interfaces (canvas Claude, popups, welcome)
│  └─ claude/        Personnage, sprite, dialogue, effets, duel
└─ shared/      Types et données partagés main ↔ renderer
```

## Crédits

Projet original par **Dylan Flandrin**. Inspiré de
[Desktop Goose](https://samperson.itch.io/desktop-goose).
Parodie non officielle — sans aucun lien avec Anthropic.
