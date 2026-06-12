# Multiplayer Guide

## Same Wi-Fi / same local network

1. The host runs:

```bash
python3 server.py 4174
```

2. The host finds their local IP.
3. Friends open:

```text
http://HOST_LOCAL_IP:4174/
```

Example:

```text
http://192.168.1.23:4174/
```

## Different networks / internet play

You need a machine that the public internet can reach.

Two common ways:

1. Run the server on a cloud machine and open the port there.
2. Run the server on a home computer that has port forwarding and firewall access configured.

Then players open:

```text
http://PUBLIC_IP:4174/
```

## In-game flow

1. Open **Multiplayer PvP** or **Multiplayer Horde**.
2. Enter a player name.
3. Create a public/private room or join with a code.
4. Start playing after everyone joins.

## Notes

- Terrain digging and wall placement sync in multiplayer.
- If a friend cannot connect, check firewall rules, port forwarding, and the address they typed.
