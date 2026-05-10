# Fighter Arena Prototype

This folder now contains a lightweight 3D prototype for the future shooting game.

## Current focus

- Smooth procedural terrain generation
- Chunk streaming around the player
- First-person exploration controls
- A simple atmospheric world foundation to build combat on later
- Beta multiplayer presence sync (join the same server and see other players)
- PvP beta: shoot other players with synced HP, kills/deaths, and respawn

## Run locally

Use the bundled server so static files and multiplayer APIs run together:

```bash
cd Fighter\ arena
python3 server.py 4174
```

Then open `http://127.0.0.1:4174/` in your browser.

## Publish online

For internet play, you can run the same server on a public machine:

```bash
python3 server.py 80
```

Then open `http://<your-server-ip>/`.
If you keep port `4174` instead, make sure TCP `4174` is allowed in your cloud
firewall or security group.
