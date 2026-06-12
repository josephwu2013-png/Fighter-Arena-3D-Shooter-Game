# Troubleshooting

## `Errno 2` or `No such file or directory`

The terminal cannot find the file or folder you typed.

Best fix:

1. Type `cd ` in Terminal.
2. Drag the `Fighter arena` folder into the Terminal window.
3. Press Enter.
4. Run `python3 server.py 4174`.

## `python3: command not found`

Python 3 is missing or not on the path. Install Python 3 first, then try again.

## The page opens but looks broken

Do a hard refresh:

- Mac: `Cmd + Shift + R`

## Friends cannot join

- On the same Wi-Fi, make sure they use your local IP, not `127.0.0.1`.
- On different networks, make sure the server has a public IP or correct port forwarding.

## No sound

Browsers often block autoplay audio until the page is clicked. Click once inside the page or unmute from Settings.
