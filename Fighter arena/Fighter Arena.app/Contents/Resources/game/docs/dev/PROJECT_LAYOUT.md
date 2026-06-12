# Project Layout

## Main files

- `index.html`: the top-level game shell and UI panels
- `src/main.js`: core gameplay, rendering, multiplayer client, terrain editing, and synthesized audio
- `src/style.css`: all main UI styling
- `server.py`: static file server plus multiplayer APIs

## Player-facing helpers

- `Fighter Arena.app`: macOS launcher app
- `Launch Fighter Arena.command`: shell launcher for macOS

## Documentation folders

- `docs/players/`: for classmates, friends, and beginners
- `docs/dev/`: for people editing or sharing the repo

## Where to edit what

- Change controls, weapons, terrain, zombies, music, or gameplay flow in `src/main.js`.
- Change menus, guide panels, and structure in `index.html`.
- Change visual layout and responsive behavior in `src/style.css`.
- Change room APIs or multiplayer server behavior in `server.py`.
