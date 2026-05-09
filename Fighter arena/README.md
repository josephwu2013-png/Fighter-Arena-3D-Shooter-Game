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
cd "/Users/josephwu/Desktop/Coded/What i coded/Fighter arena"
python3 server.py 4174
```

Then open `http://127.0.0.1:4174/` in your browser.

For internet play, you can run `python3 server.py 80` and use
`http://<your-server-ip>/`. If you keep `4174`, open TCP `4174` in your cloud
firewall/security group.
