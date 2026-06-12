# Safari Can't Connect Fix

If a classmate sees `Safari Can't Connect to the Server`, it usually means the local game server did not finish starting yet.

## Correct way to open the game

Use one of these launchers from the project folder:

- `Fighter Arena.app`
- `Launch Fighter Arena.command`

Do not type `127.0.0.1:4174` by hand first. That address only works after the launcher has started the local server on that computer.

## What the launcher does now

The updated launcher will:

- check that `Python 3` exists
- make sure `server.py` is present
- wait until the server is actually ready
- use another local port if `4174` is busy
- open the correct browser address automatically
- prefer a desktop-style app window when Chrome or Edge is installed
- keep app-window save data in `.fighter-arena-profile/`
- show an error dialog if startup fails

## If it still does not open

1. Right-click `Fighter Arena.app` and choose `Open`
2. If macOS blocks it, allow it once in the warning dialog
3. If a log window opens, send the contents of `/tmp/fighter-arena-app.log`

## Important

`127.0.0.1` is only for the same computer that is running the game.

For another person on a different computer:

- they need their own local launcher, or
- they need to join through a shared host IP / public server setup
