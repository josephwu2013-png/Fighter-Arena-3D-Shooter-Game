# Fighter Arena

Fighter Arena is a browser-based 3D action prototype with procedural terrain, zombies, multiplayer rooms, a seven-slot loadout, and a shovel that can dig the map.

## Start Here

If you are new, open these in order:

- [Quick Start for Players](./docs/players/START_HERE.md)
- [How To Play](./docs/players/HOW_TO_PLAY.md)
- [Multiplayer Guide](./docs/players/MULTIPLAYER.md)
- [Troubleshooting](./docs/players/TROUBLESHOOTING.md)

If you are opening the repo to modify the game:

- [Docs Index](./docs/README.md)
- [Project Layout](./docs/dev/PROJECT_LAYOUT.md)

## Quick Launch

### Easiest on macOS

Double-click one of these files in the project folder:

- `Fighter Arena.app`
- `Launch Fighter Arena.command`

They start the local server and open the game in your browser.

### Terminal

```bash
cd "/path/to/Fighter arena"
python3 server.py 4174
```

Then open [http://127.0.0.1:4174/](http://127.0.0.1:4174/).

## Repo Guide

- `docs/players/`: guides for classmates and first-time players
- `docs/dev/`: guides for people editing or sharing the project
- `index.html`: main app shell
- `src/main.js`: gameplay, UI logic, multiplayer client, terrain tools, and audio
- `src/style.css`: UI styles
- `server.py`: local server and multiplayer API

## Beginner-Friendly Note

The game now includes an in-game Beginner Guide panel. On a fresh browser, it opens automatically once on the menu screen. After that, players can reopen it from the menu, the pause panel, or with `J`.
