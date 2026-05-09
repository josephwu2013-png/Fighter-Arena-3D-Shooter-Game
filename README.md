# Fighter-Arena-3D-Shooter-Game
About

Fighter Arena is a 3D shooter game prototype made with AI assistance. It includes terrain, weapons, zombie gameplay, multiplayer features, and mobile/desktop controls.
How to Run Fighter Arena

Fighter Arena is a browser-based 3D shooter game. It uses HTML, CSS, and JavaScript for the game, and it also uses a small Python server to run the game correctly.
To play the game, first download this repository from GitHub. After downloading it, open the project folder on your computer. Inside the repository, you will see a folder called Fighter arena. Open that folder, because this is where the game files are stored.

Before running the game, make sure Python is installed on your computer. You can check this by opening Terminal or Command Prompt and typing python3 --version. If that does not work, try python --version instead. If Python is not installed, you will need to install Python first.

After Python is ready, open Terminal or Command Prompt inside the Fighter arena folder. Then run this command: python3 server.py 4174. If your computer uses python instead of python3, run python server.py 4174.

When the server starts, open your browser and go to http://127.0.0.1:4174/. The game should now open in your browser.

Please do not open index.html directly by double-clicking it. The game should be started with the Python server because multiplayer rooms, player updates, health, respawn, zombie mode, and other features need the server to work properly.

Controls

On desktop, use WASD to move, Shift to sprint, Space to jump, and the mouse to look around. Use the left mouse button to shoot or attack, and the right mouse button to aim. Press 1 to 6 to change weapons, R to reload, H to heal, Q to drop your current weapon, P to pick up nearby gear, B to open the shop, V to switch between first-person and third-person view, and Esc to pause the game.

Game Modes
Fighter Arena includes several game modes. You can play Single Player, Zombie Mode, Multiplayer PvP, or Multiplayer Horde. Single Player lets you explore and fight alone. Zombie Mode lets you fight against zombies. Multiplayer PvP lets you play against other players. Multiplayer Horde lets you survive zombie waves with other players.

Playing With Friends

For local play on your own computer, use http://127.0.0.1:4174/ after starting the server.
For internet play, the host needs to run the server on a public server or open the correct network port. For example, the host can run the game on port 80 by using python3 server.py 80. Other players can then open the host’s server address in their browser.

If you use port 4174, make sure TCP port 4174 is open in your firewall or cloud server settings.

Troubleshooting

If the game does not open, first make sure you are inside the Fighter arena folder when running the server. Also make sure Python is installed. Then check that you started the server with python3 server.py 4174 or python server.py 4174. Finally, make sure you opened http://127.0.0.1:4174/ in your browser.
If port 4174 is already being used, you can use another port, such as 5000. Start the server with python3 server.py 5000, then open http://127.0.0.1:5000/ in your browser.
