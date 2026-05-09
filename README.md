# Fighter-Arena-3D-Shooter-Game
About

Fighter Arena is a 3D shooter game prototype made with AI assistance. It includes terrain, weapons, zombie gameplay, multiplayer features, and mobile/desktop controls.
## How to Run Fighter Arena

Fighter Arena is a browser-based 3D shooter game. It uses HTML, CSS, and JavaScript for the game, and a small Python server to run the game locally.

### 1. Download the Game

First, download or clone this repository from GitHub.

If you are using Git, run:

```bash
git clone https://github.com/josephwu2013-png/Fighter-Arena-3D-Shooter-Game.git
Then go into the project folder:
cd Fighter-Arena-3D-Shooter-Game
Because the game files are inside the Fighter arena folder, go into that folder too:
cd "Fighter arena"
2. Make Sure Python Is Installed
This game needs Python to start the local server.
Check if Python is installed:
python3 --version
If that does not work, try:
python --version
If Python is not installed, download it from the official Python website.
3. Start the Game Server
Run this command inside the Fighter arena folder:
python3 server.py 4174
If your computer uses python instead of python3, run:
python server.py 4174
When the server starts, you should see a message like:
Serving Fighter Arena on http://0.0.0.0:4174
Health endpoint: /api/health
4. Open the Game
Open your browser and go to:
http://127.0.0.1:4174/
Now you should be able to play Fighter Arena.
Important Note
Do not open index.html directly by double-clicking it.
Please run the game using:
python3 server.py 4174
This is important because the game uses the Python server for multiplayer rooms, player updates, health, respawn, zombie mode, and other game features.
Controls
Basic desktop controls:
WASD — Move
Shift — Sprint
Space — Jump
Mouse — Look around
Left mouse button — Attack / shoot
Right mouse button — Aim
1-6 — Change weapons
R — Reload
H — Heal
Q — Drop current weapon
P — Pick up nearby gear
B — Open shop
V — Switch first-person / third-person view
Esc — Pause
Game Modes
Fighter Arena includes several modes:
Single Player
Zombie Mode
Multiplayer PvP
Multiplayer Horde
Playing With Friends
For local testing, open:
http://127.0.0.1:4174/
For internet play, the host needs to run the server on a public server or open the correct port on their network.
Example:
python3 server.py 80
Then other players can open:
http://YOUR-SERVER-IP/
If you use port 4174, make sure TCP port 4174 is open in your firewall or cloud server settings.
Troubleshooting
If the game does not open, check these things:
Make sure you are inside the Fighter arena folder.
Make sure Python is installed.
Make sure you started the server with:
python3 server.py 4174
Make sure you opened this address in your browser:
http://127.0.0.1:4174/
If port 4174 is already being used, try another port:
python3 server.py 5000
Then open:
http://127.0.0.1:5000/
