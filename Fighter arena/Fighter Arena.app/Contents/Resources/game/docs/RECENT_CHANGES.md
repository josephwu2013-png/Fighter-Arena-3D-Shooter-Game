# Recent Changes

This file summarizes the main changes made during the recent Codex collaboration.

## Added

- More reliable local app launcher behavior for `Fighter Arena.app`
  - checks for `Python 3`
  - checks that `server.py` exists
  - waits for `/api/health` before opening the browser
  - retries with another local port if `4174` is busy
  - opens a startup log if launch fails
- Desktop-app style launch mode
  - prefers a standalone Chrome or Edge app window
  - stores that window's local data in `.fighter-arena-profile/`
- Background music unlock helper
  - resumes Web Audio contexts after user interaction
  - shows a small `Tap To Start Music` button if audio stays blocked
- Full-track local music system
  - adds four generated song files in `assets/music/`
  - adds a now-playing popup
  - adds music on/off, volume, auto-start, popup, and next-track controls
- More settings
  - adds a tips / popups toggle
  - hides rotate controls until phone-emulation mode is active
- New player help page:
  - `docs/players/CANT_CONNECT.md`
- Earlier in this chat, the project also received:
  - shovel / dirt digging support
  - multiplayer terrain syncing
  - background music
  - beginner guide UI
  - language / settings / UI updates
  - FOV and sensitivity expansion
  - multiplayer voice chat support
  - account/settings save behavior fixes

## Changed

- `Fighter Arena.app/Contents/MacOS/fighter-arena-launcher`
  - replaced fragile `sleep 1` startup flow with a real readiness check
  - now opens the correct browser address only after the server is actually ready
- `Launch Fighter Arena.command`
  - earlier in this chat, it was upgraded to the same safer startup flow
- `index.html`
  - expanded settings with music controls and a now-playing popup
- `src/main.js`
  - added a separate music player, persistence for music settings, and popup control
- `src/style.css`
  - added styling for the now-playing popup

## Removed

- No standalone files were deleted in this step.
- The old launcher behavior that opened the browser too early was replaced.

## Notes For GitHub

If players see `Safari Can't Connect to the Server`, tell them:

1. open `Fighter Arena.app` or `Launch Fighter Arena.command`
2. do not type `127.0.0.1:4174` manually first
3. if launch fails, check `/tmp/fighter-arena-app.log`
