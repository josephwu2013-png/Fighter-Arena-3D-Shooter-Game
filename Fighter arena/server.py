import http.server
import json
import math
import random
import socketserver
import sys
import threading
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional, Set
from urllib.parse import parse_qs, urlparse

HOST = "0.0.0.0"
DEFAULT_PORT = 4174
PLAYER_TTL_SECONDS = 15
PLAYER_MAX_HEALTH = 100.0
RESPAWN_DELAY_SECONDS = 2.2
SPAWN_SPREAD = 9.0
SPAWN_Y = 6.0
HEAL_POTION_AMOUNT = 45.0
HEAL_POTION_COOLDOWN_SECONDS = 60.0
WALL_BUILD_COOLDOWN_SECONDS = 10.0
WALL_OFFSET = 9.0
WALL_WIDTH = 12.0
WALL_THICKNESS = 1.2
WALL_HEIGHT = 9.5
WALL_MAX_ACTIVE = 40
ZOMBIE_MAX_ALIVE = 8
ZOMBIE_MAX_HEALTH = 110.0
ZOMBIE_WALK_SPEED = 7.2
ZOMBIE_CHASE_RANGE = 140.0
ZOMBIE_ATTACK_RANGE = 4.9
ZOMBIE_ATTACK_DAMAGE = 14.0
ZOMBIE_ATTACK_INTERVAL = 1.05
ZOMBIE_SPAWN_INTERVAL = 3.8
ZOMBIE_SPAWN_RADIUS_MIN = 46.0
ZOMBIE_SPAWN_RADIUS_MAX = 108.0
ZOMBIE_DESPAWN_RANGE = 190.0
ZOMBIE_BODY_RADIUS = 1.25
HOUSE_WIDTH = 18.0
HOUSE_DEPTH = 18.0
HOUSE_WALL_THICKNESS = 1.25
ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
ROOM_NAME_MAX_LENGTH = 36
ROOM_MIN_PLAYERS_MIN = 1
ROOM_MIN_PLAYERS_MAX = 8
CHAT_MAX_MESSAGES = 40
CHAT_MESSAGE_MAX_LENGTH = 220
VOICE_SIGNAL_MAX_PER_PLAYER = 48
PATH_SEARCH_ANGLES = (0.0, -math.pi / 2, math.pi / 2, -math.pi / 3, math.pi / 3, math.pi * 0.82, -math.pi * 0.82)
PATH_STEP_SCALES = (1.0, 0.66, 0.36)
STATIC_HOUSES = (
    {"id": "house-nw", "x": -54.0, "z": 42.0, "width": HOUSE_WIDTH, "depth": HOUSE_DEPTH},
    {"id": "house-ne", "x": 60.0, "z": 48.0, "width": HOUSE_WIDTH, "depth": HOUSE_DEPTH},
    {"id": "house-sw", "x": -68.0, "z": -58.0, "width": HOUSE_WIDTH, "depth": HOUSE_DEPTH},
    {"id": "house-se", "x": 74.0, "z": -44.0, "width": HOUSE_WIDTH, "depth": HOUSE_DEPTH},
)

BASE_DIR = Path(__file__).resolve().parent

MULTIPLAYER_VARIANTS = {
    "pvp": "pvp",
    "horde": "horde",
    "arcade": "arcade",
}

MINI_GAME_SPECS = {
    "sharpshooter": {"duration": 45.0, "zombies": False},
    "zombie-blitz": {"duration": 75.0, "zombies": True},
    "checkpoint-sprint": {"duration": 90.0, "zombies": False},
    "distance-dash": {"duration": 60.0, "zombies": False},
}
DEFAULT_MINI_GAME = "sharpshooter"


def _coerce_float(value: Any, fallback: float):
    try:
        return float(value)
    except (TypeError, ValueError):
        return float(fallback)



def _random_spawn_point():
    return (
        random.uniform(-SPAWN_SPREAD, SPAWN_SPREAD),
        SPAWN_Y,
        random.uniform(-SPAWN_SPREAD, SPAWN_SPREAD),
    )



def _rects_intersect(a: Dict[str, float], b: Dict[str, float], padding: float = 0.0):
    return not (
        a["max_x"] + padding <= b["min_x"]
        or a["min_x"] - padding >= b["max_x"]
        or a["max_z"] + padding <= b["min_z"]
        or a["min_z"] - padding >= b["max_z"]
    )



def _circle_hits_obstacle(x: float, z: float, radius: float, obstacle: Dict[str, float]):
    nearest_x = min(max(x, obstacle["min_x"]), obstacle["max_x"])
    nearest_z = min(max(z, obstacle["min_z"]), obstacle["max_z"])
    dx = x - nearest_x
    dz = z - nearest_z
    return dx * dx + dz * dz < radius * radius



def _build_static_obstacles():
    obstacles = []
    for house in STATIC_HOUSES:
        cx = float(house["x"])
        cz = float(house["z"])
        half_w = float(house["width"]) * 0.5
        half_d = float(house["depth"]) * 0.5
        obstacles.extend(
            (
                {
                    "id": house["id"] + "-north",
                    "min_x": cx - half_w,
                    "max_x": cx + half_w,
                    "min_z": cz - half_d,
                    "max_z": cz - half_d + HOUSE_WALL_THICKNESS,
                },
                {
                    "id": house["id"] + "-south",
                    "min_x": cx - half_w,
                    "max_x": cx + half_w,
                    "min_z": cz + half_d - HOUSE_WALL_THICKNESS,
                    "max_z": cz + half_d,
                },
                {
                    "id": house["id"] + "-west",
                    "min_x": cx - half_w,
                    "max_x": cx - half_w + HOUSE_WALL_THICKNESS,
                    "min_z": cz - half_d + HOUSE_WALL_THICKNESS,
                    "max_z": cz + half_d - HOUSE_WALL_THICKNESS,
                },
                {
                    "id": house["id"] + "-east",
                    "min_x": cx + half_w - HOUSE_WALL_THICKNESS,
                    "max_x": cx + half_w,
                    "min_z": cz - half_d + HOUSE_WALL_THICKNESS,
                    "max_z": cz + half_d - HOUSE_WALL_THICKNESS,
                },
            )
        )
    return tuple(obstacles)


STATIC_OBSTACLES = _build_static_obstacles()



def _wall_rect(wall: Dict[str, Any]):
    width = _coerce_float(wall.get("width"), WALL_WIDTH)
    thickness = _coerce_float(wall.get("thickness"), WALL_THICKNESS)
    half_x = (thickness if wall.get("axis") == "z" else width) * 0.5
    half_z = (width if wall.get("axis") == "z" else thickness) * 0.5
    x = _coerce_float(wall.get("x"), 0.0)
    z = _coerce_float(wall.get("z"), 0.0)
    return {
        "id": str(wall.get("id", "wall")),
        "min_x": x - half_x,
        "max_x": x + half_x,
        "min_z": z - half_z,
        "max_z": z + half_z,
    }



def _sanitize_variant(value: Any):
    key = str(value or MULTIPLAYER_VARIANTS["pvp"]).strip().lower()
    if key == MULTIPLAYER_VARIANTS["horde"]:
        return MULTIPLAYER_VARIANTS["horde"]
    if key == MULTIPLAYER_VARIANTS["arcade"]:
        return MULTIPLAYER_VARIANTS["arcade"]
    return MULTIPLAYER_VARIANTS["pvp"]


def _sanitize_mini_game(value: Any):
    key = str(value or DEFAULT_MINI_GAME).strip().lower()
    return key if key in MINI_GAME_SPECS else DEFAULT_MINI_GAME



def _sanitize_room_name(value: Any, variant: str):
    raw = str(value or "").strip()
    if raw:
        return raw[:ROOM_NAME_MAX_LENGTH]
    if variant == MULTIPLAYER_VARIANTS["horde"]:
        return "Horde Room"
    if variant == MULTIPLAYER_VARIANTS["arcade"]:
        return "Mini Games Room"
    return "PvP Room"



def _sanitize_min_players(value: Any, variant: str):
    if variant != MULTIPLAYER_VARIANTS["horde"]:
        return 1
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        parsed = 2
    return max(ROOM_MIN_PLAYERS_MIN, min(ROOM_MIN_PLAYERS_MAX, parsed))



def _generate_room_code():
    return "".join(random.choice(ROOM_CODE_ALPHABET) for _ in range(6))



def _choose_step(source_x: float, source_z: float, target_x: float, target_z: float, step_distance: float, radius: float, obstacles):
    dx = target_x - source_x
    dz = target_z - source_z
    distance = math.hypot(dx, dz)
    if distance <= 0.0001 or step_distance <= 0.0:
        return source_x, source_z, 0.0, False

    base_dx = dx / distance
    base_dz = dz / distance
    best = None

    for step_scale in PATH_STEP_SCALES:
        scaled_step = step_distance * step_scale
        for angle in PATH_SEARCH_ANGLES:
            cos_a = math.cos(angle)
            sin_a = math.sin(angle)
            dir_x = base_dx * cos_a - base_dz * sin_a
            dir_z = base_dx * sin_a + base_dz * cos_a
            next_x = source_x + dir_x * scaled_step
            next_z = source_z + dir_z * scaled_step
            if any(_circle_hits_obstacle(next_x, next_z, radius, obstacle) for obstacle in obstacles):
                continue
            score = math.hypot(target_x - next_x, target_z - next_z) + abs(angle) * 2.2 + (1.0 - step_scale) * 4.0
            if best is None or score < best[0]:
                best = (score, next_x, next_z, math.atan2(-dir_x, -dir_z), angle == 0.0)
        if best is not None:
            break

    if best is None:
        return source_x, source_z, math.atan2(-base_dx, -base_dz), False

    return best[1], best[2], best[3], True


class MultiplayerRoom:
    def __init__(self, room_id: str, room_name: str, variant: str, is_private: bool, min_players: int, code: str = "", mini_game: str = ""):
        self.room_id = room_id
        self.room_name = _sanitize_room_name(room_name, variant)
        self.variant = _sanitize_variant(variant)
        self.mini_game = _sanitize_mini_game(mini_game) if self.variant == MULTIPLAYER_VARIANTS["arcade"] else ""
        self._mini_game_spec = MINI_GAME_SPECS.get(self.mini_game, MINI_GAME_SPECS[DEFAULT_MINI_GAME]) if self.mini_game else None
        self.enable_zombies = self.variant == MULTIPLAYER_VARIANTS["horde"] or bool(self._mini_game_spec and self._mini_game_spec.get("zombies"))
        self.is_private = bool(is_private)
        self.code = str(code or "").upper()
        self.min_players = _sanitize_min_players(min_players, self.variant)
        self.started = self.variant != MULTIPLAYER_VARIANTS["horde"] or self.min_players <= 1
        self.created_at = time.time()
        self.mini_game_started_at = self.created_at if self.mini_game else 0.0
        self.mini_game_duration = float(self._mini_game_spec.get("duration", 0.0)) if self._mini_game_spec else 0.0
        self.mini_game_ends_at = self.mini_game_started_at + self.mini_game_duration if self.mini_game_duration > 0 else 0.0
        self._lock = threading.Lock()
        self._players: Dict[str, Dict[str, Any]] = {}
        self._zombies: Dict[str, Dict[str, Any]] = {}
        self._walls: Dict[str, Dict[str, Any]] = {}
        self._terrain_edits: Dict[str, float] = {}
        self._terrain_revision = 0
        self._next_zombie_id = 1
        self._next_wall_id = 1
        self._chat: List[Dict[str, Any]] = []
        self._direct_chat: List[Dict[str, Any]] = []
        self._friend_requests: List[Dict[str, Any]] = []
        self._friend_pairs: Set[str] = set()
        self._next_friend_request_id = 1
        self._voice_signal_queues: Dict[str, List[Dict[str, Any]]] = {}
        self._next_chat_id = 1
        self._last_zombie_step_at = self.created_at
        self._next_zombie_spawn_at = self.created_at + 1.0
        self.host_id = ""

    def join(self, name: str):
        safe_name = (name or "").strip()[:24] or "Player"
        player_id = f"{self.room_id}-{uuid.uuid4().hex[:12]}"
        now = time.time()
        spawn_x, spawn_y, spawn_z = _random_spawn_point()
        player = {
            "id": player_id,
            "roomId": self.room_id,
            "variant": self.variant,
            "name": safe_name,
            "x": spawn_x,
            "y": spawn_y,
            "z": spawn_z,
            "yaw": 0.0,
            "pitch": 0.0,
            "weapon": "M134 Minigun",
            "weaponType": "minigun",
            "health": PLAYER_MAX_HEALTH,
            "maxHealth": PLAYER_MAX_HEALTH,
            "isDead": False,
            "aiming": False,
            "firing": False,
            "sprinting": False,
            "sliding": False,
            "reloading": False,
            "reloadPhase": 0.0,
            "action": 0.0,
            "kills": 0,
            "deaths": 0,
            "zombieKills": 0,
            "respawnAt": 0.0,
            "potionReadyAt": 0.0,
            "wallReadyAt": 0.0,
            "updatedAt": now,
            "miniGameScore": 0.0,
            "miniGameProgress": "",
            "voiceEnabled": False,
            "voiceMuted": False,
        }
        with self._lock:
            self._refresh_locked(now)
            self._players[player_id] = player
            self._voice_signal_queues[player_id] = []
            self._append_system_chat_locked(f"{safe_name} joined the room.", now)
            if not self.host_id:
                self.host_id = player_id
            self._update_started_locked(now)
            return player.copy()

    def update(self, player_id: str, payload: Dict[str, Any]):
        now = time.time()
        with self._lock:
            self._refresh_locked(now)
            player = self._players.get(player_id)
            if not player:
                return None

            player_name = str(payload.get("name", "")).strip()
            if player_name:
                player["name"] = player_name[:24]
            if not player["isDead"]:
                player["x"] = _coerce_float(payload.get("x"), player["x"])
                player["y"] = _coerce_float(payload.get("y"), player["y"])
                player["z"] = _coerce_float(payload.get("z"), player["z"])
            player["yaw"] = _coerce_float(payload.get("yaw"), player["yaw"])
            player["pitch"] = _coerce_float(payload.get("pitch"), player["pitch"])
            weapon_name = payload.get("weapon")
            if isinstance(weapon_name, str) and weapon_name.strip():
                player["weapon"] = weapon_name.strip()[:48]
            weapon_type = payload.get("weaponType")
            if isinstance(weapon_type, str) and weapon_type.strip():
                player["weaponType"] = weapon_type.strip()[:24]
            player["aiming"] = bool(payload.get("aiming"))
            player["firing"] = bool(payload.get("firing"))
            player["sprinting"] = bool(payload.get("sprinting"))
            player["sliding"] = bool(payload.get("sliding"))
            player["reloading"] = bool(payload.get("reloading"))
            player["reloadPhase"] = max(0.0, min(1.0, _coerce_float(payload.get("reloadPhase"), player.get("reloadPhase", 0.0))))
            player["action"] = max(0.0, min(1.0, _coerce_float(payload.get("action"), player.get("action", 0.0))))
            if "voiceEnabled" in payload:
                player["voiceEnabled"] = bool(payload.get("voiceEnabled"))
            if "voiceMuted" in payload:
                player["voiceMuted"] = bool(payload.get("voiceMuted"))
            incoming_terrain = payload.get("terrainEdits")
            if isinstance(incoming_terrain, list):
                terrain_changed = False
                for entry in incoming_terrain[:768]:
                    if not isinstance(entry, dict):
                        continue
                    try:
                        grid_x = int(entry.get("gridX"))
                        grid_z = int(entry.get("gridZ"))
                    except (TypeError, ValueError):
                        continue
                    value = min(0.0, max(-128.0, _coerce_float(entry.get("value"), 0.0)))
                    key = f"{grid_x},{grid_z}"
                    current_value = self._terrain_edits.get(key)
                    if abs(value) < 0.001:
                        if key in self._terrain_edits:
                            self._terrain_edits.pop(key, None)
                            terrain_changed = True
                        continue
                    if current_value is None or abs(current_value - value) > 0.001:
                        self._terrain_edits[key] = value
                        terrain_changed = True
                if terrain_changed:
                    self._terrain_revision += 1

            if self.mini_game and self._mini_game_active_locked(now):
                incoming_score = payload.get("miniGameScore")
                if incoming_score is not None:
                    score_value = max(0.0, _coerce_float(incoming_score, player.get("miniGameScore", 0.0)))
                    player["miniGameScore"] = max(_coerce_float(player.get("miniGameScore"), 0.0), score_value)
                progress_value = payload.get("miniGameProgress")
                if isinstance(progress_value, str):
                    player["miniGameProgress"] = progress_value.strip()[:48]
            player["updatedAt"] = now
            self._update_started_locked(now)
            return player.copy()

    def build_wall(self, player_id: str, payload: Dict[str, Any]):
        now = time.time()
        with self._lock:
            self._refresh_locked(now)
            player = self._players.get(player_id)
            if not player:
                return {"ok": False, "error": "Player not found"}, 404
            if player["isDead"]:
                return {"ok": False, "error": "Player is down", "self": player.copy()}, 400

            player["x"] = _coerce_float(payload.get("x"), player["x"])
            player["y"] = _coerce_float(payload.get("y"), player["y"])
            player["z"] = _coerce_float(payload.get("z"), player["z"])
            player["yaw"] = _coerce_float(payload.get("yaw"), player["yaw"])
            player["updatedAt"] = now

            ready_at = _coerce_float(player.get("wallReadyAt", 0.0), 0.0)
            if now < ready_at:
                return {
                    "ok": False,
                    "error": "cooldown",
                    "cooldownRemaining": ready_at - now,
                    "self": player.copy(),
                }, 429

            forward_x = -math.sin(player["yaw"])
            forward_z = -math.cos(player["yaw"])
            if abs(forward_x) > abs(forward_z):
                axis = "z"
                center_x = player["x"] + math.copysign(WALL_OFFSET, forward_x if abs(forward_x) > 0.001 else 1.0)
                center_z = player["z"]
            else:
                axis = "x"
                center_x = player["x"]
                center_z = player["z"] + math.copysign(WALL_OFFSET, forward_z if abs(forward_z) > 0.001 else -1.0)

            wall = {
                "id": f"wall-{self._next_wall_id}",
                "x": center_x,
                "z": center_z,
                "axis": axis,
                "width": WALL_WIDTH,
                "thickness": WALL_THICKNESS,
                "height": WALL_HEIGHT,
                "createdAt": now,
            }
            wall_rect = _wall_rect(wall)
            for obstacle in self._iter_obstacles_locked(include_walls=False):
                if _rects_intersect(wall_rect, obstacle, padding=0.45):
                    return {"ok": False, "error": "blocked", "self": player.copy()}, 409
            for existing_wall in self._walls.values():
                if _rects_intersect(wall_rect, _wall_rect(existing_wall), padding=0.45):
                    return {"ok": False, "error": "blocked", "self": player.copy()}, 409
            for other in self._players.values():
                if other["id"] == player_id or other["isDead"]:
                    continue
                if _circle_hits_obstacle(float(other["x"]), float(other["z"]), 1.6, wall_rect):
                    return {"ok": False, "error": "blocked", "self": player.copy()}, 409

            self._next_wall_id += 1
            self._walls[wall["id"]] = wall
            while len(self._walls) > WALL_MAX_ACTIVE:
                oldest_wall_id = next(iter(self._walls))
                self._walls.pop(oldest_wall_id, None)
            player["wallReadyAt"] = now + WALL_BUILD_COOLDOWN_SECONDS
            player["updatedAt"] = now
            return {"ok": True, "wall": wall.copy(), "self": player.copy()}, 200

    def leave(self, player_id: str):
        with self._lock:
            player = self._players.pop(player_id, None)
            if player:
                self._append_system_chat_locked(f"{player.get('name', 'Player')} left the room.", time.time())
                self._voice_signal_queues.pop(player_id, None)
                self._remove_social_state_for_player_locked(player_id)
            if self.host_id == player_id:
                self.host_id = next(iter(self._players), "")
            if not self._players:
                self._zombies.clear()
                self._walls.clear()
                self._terrain_edits.clear()
                self._terrain_revision = 0
                self._next_zombie_spawn_at = time.time() + 1.0

    def _friend_pair_key(self, player_a: str, player_b: str):
        ordered = sorted([str(player_a or "").strip(), str(player_b or "").strip()])
        return ordered[0] + "::" + ordered[1]

    def _are_friends_locked(self, player_a: str, player_b: str):
        if not player_a or not player_b or player_a == player_b:
            return False
        return self._friend_pair_key(player_a, player_b) in self._friend_pairs

    def _remove_social_state_for_player_locked(self, player_id: str):
        player_key = str(player_id or "").strip()
        if not player_key:
            return
        self._friend_pairs = {
            pair_key
            for pair_key in self._friend_pairs
            if player_key not in pair_key.split("::")
        }
        self._friend_requests = [
            request
            for request in self._friend_requests
            if request.get("fromPlayerId") != player_key and request.get("toPlayerId") != player_key
        ]
        self._direct_chat = [
            entry
            for entry in self._direct_chat
            if entry.get("fromPlayerId") != player_key and entry.get("toPlayerId") != player_key
        ]

    def _social_snapshot_locked(self, viewer_id: Optional[str]):
        viewer_key = str(viewer_id or "").strip()
        if not viewer_key:
            return {
                "onlinePlayers": [],
                "friends": [],
                "incomingRequests": [],
                "outgoingRequests": [],
                "directChat": [],
            }

        online_players = []
        friends = []
        for player in self._players.values():
            player_id = str(player.get("id", ""))
            if not player_id or player_id == viewer_key:
                continue
            entry = {
                "id": player_id,
                "name": player.get("name", "Player"),
                "voiceEnabled": bool(player.get("voiceEnabled")),
                "voiceMuted": bool(player.get("voiceMuted")),
                "friend": self._are_friends_locked(viewer_key, player_id),
            }
            online_players.append(entry)
            if entry["friend"]:
                friends.append(entry.copy())

        incoming_requests = []
        outgoing_requests = []
        for request in self._friend_requests:
            from_player_id = str(request.get("fromPlayerId", ""))
            to_player_id = str(request.get("toPlayerId", ""))
            snapshot = {
                "id": int(request.get("id", 0)),
                "timestamp": float(request.get("timestamp", 0.0)),
                "playerId": from_player_id if to_player_id == viewer_key else to_player_id,
                "name": self._players.get(from_player_id if to_player_id == viewer_key else to_player_id, {}).get("name", "Player"),
            }
            if to_player_id == viewer_key:
                incoming_requests.append(snapshot)
            elif from_player_id == viewer_key:
                outgoing_requests.append(snapshot)

        direct_chat = [
            entry.copy()
            for entry in self._direct_chat[-CHAT_MAX_MESSAGES:]
            if entry.get("fromPlayerId") == viewer_key or entry.get("toPlayerId") == viewer_key
        ]

        online_players.sort(key=lambda item: str(item.get("name", "")).lower())
        friends.sort(key=lambda item: str(item.get("name", "")).lower())
        incoming_requests.sort(key=lambda item: float(item.get("timestamp", 0.0)), reverse=True)
        outgoing_requests.sort(key=lambda item: float(item.get("timestamp", 0.0)), reverse=True)

        return {
            "onlinePlayers": online_players,
            "friends": friends,
            "incomingRequests": incoming_requests,
            "outgoingRequests": outgoing_requests,
            "directChat": direct_chat,
        }

    def post_friend_request(self, player_id: str, target_id: str):
        now = time.time()
        with self._lock:
            self._refresh_locked(now)
            source = self._players.get(player_id)
            target = self._players.get(target_id)
            if not source or not target:
                return {"ok": False, "error": "Player not found"}, 404
            if player_id == target_id:
                return {"ok": False, "error": "Cannot add yourself"}, 400
            if self._are_friends_locked(player_id, target_id):
                return {"ok": False, "error": "Already friends"}, 409
            for request in self._friend_requests:
                if (
                    (request.get("fromPlayerId") == player_id and request.get("toPlayerId") == target_id)
                    or (request.get("fromPlayerId") == target_id and request.get("toPlayerId") == player_id)
                ):
                    return {"ok": False, "error": "Request already pending"}, 409

            self._friend_requests.append({
                "id": self._next_friend_request_id,
                "fromPlayerId": player_id,
                "toPlayerId": target_id,
                "timestamp": now,
            })
            self._next_friend_request_id += 1
            return {"ok": True, "room": self._room_info_locked(viewer_id=player_id, include_code=True)}, 200

    def respond_friend_request(self, player_id: str, from_player_id: str, accept: Any):
        now = time.time()
        with self._lock:
            self._refresh_locked(now)
            viewer = self._players.get(player_id)
            source = self._players.get(from_player_id)
            if not viewer or not source:
                return {"ok": False, "error": "Player not found"}, 404
            matched_index = None
            for index, request in enumerate(self._friend_requests):
                if request.get("fromPlayerId") == from_player_id and request.get("toPlayerId") == player_id:
                    matched_index = index
                    break
            if matched_index is None:
                return {"ok": False, "error": "Request not found"}, 404
            self._friend_requests.pop(matched_index)
            if bool(accept):
                self._friend_pairs.add(self._friend_pair_key(player_id, from_player_id))
            return {"ok": True, "accepted": bool(accept), "room": self._room_info_locked(viewer_id=player_id, include_code=True)}, 200

    def post_direct_chat(self, player_id: str, target_id: str, message: Any):
        now = time.time()
        with self._lock:
            self._refresh_locked(now)
            source = self._players.get(player_id)
            target = self._players.get(target_id)
            if not source or not target:
                return {"ok": False, "error": "Player not found"}, 404
            if not self._are_friends_locked(player_id, target_id):
                return {"ok": False, "error": "Friends only"}, 403
            content = str(message or "").strip()[:CHAT_MESSAGE_MAX_LENGTH]
            if not content:
                return {"ok": False, "error": "Message required"}, 400
            entry = {
                "id": self._next_chat_id,
                "fromPlayerId": player_id,
                "toPlayerId": target_id,
                "name": source.get("name", "Player"),
                "targetName": target.get("name", "Player"),
                "text": content,
                "timestamp": now,
            }
            self._next_chat_id += 1
            self._direct_chat.append(entry)
            if len(self._direct_chat) > CHAT_MAX_MESSAGES * 4:
                self._direct_chat = self._direct_chat[-(CHAT_MAX_MESSAGES * 4):]
            return {"ok": True, "message": entry, "room": self._room_info_locked(viewer_id=player_id, include_code=True)}, 200

    def snapshot_for(self, viewer_id: Optional[str] = None):
        now = time.time()
        with self._lock:
            self._refresh_locked(now)
            viewer = None
            if viewer_id:
                current = self._players.get(viewer_id)
                if current:
                    viewer = current.copy()
            players = [
                player.copy()
                for player in self._players.values()
                if not viewer_id or player["id"] != viewer_id
            ]
            zombies = [zombie.copy() for zombie in self._zombies.values()] if self.enable_zombies else []
            walls = [wall.copy() for wall in self._walls.values()]
            terrain = [
                {
                    "gridX": int(key.split(",", 1)[0]),
                    "gridZ": int(key.split(",", 1)[1]),
                    "value": value,
                }
                for key, value in self._terrain_edits.items()
            ]
            room = self._room_info_locked(viewer_id=viewer_id, include_code=bool(viewer_id))
            voice = self._voice_snapshot_locked(viewer_id)
            return viewer, players, zombies, walls, {"revision": self._terrain_revision, "edits": terrain}, room, voice

    def count(self):
        now = time.time()
        with self._lock:
            self._refresh_locked(now)
            return len(self._players)

    def zombie_count(self):
        now = time.time()
        with self._lock:
            self._refresh_locked(now)
            return len(self._zombies)

    def summary(self, include_code: bool = False):
        now = time.time()
        with self._lock:
            self._refresh_locked(now)
            return self._room_info_locked(include_code=include_code)

    def hit(self, attacker_id: str, target_id: str, damage: Any):
        now = time.time()
        with self._lock:
            self._refresh_locked(now)
            attacker = self._players.get(attacker_id)
            target = self._players.get(target_id)
            if not attacker or not target:
                return {"ok": False, "error": "Player not found"}, 404
            if attacker_id == target_id:
                return {"ok": False, "error": "Self-hit is not allowed"}, 400

            if target["isDead"]:
                return {
                    "ok": True,
                    "ignored": True,
                    "reason": "target-dead",
                    "self": attacker.copy(),
                    "target": target.copy(),
                }, 200

            applied_damage = max(1.0, min(400.0, _coerce_float(damage, 1.0)))
            target["health"] = max(0.0, target["health"] - applied_damage)
            target["updatedAt"] = now

            killed = False
            if target["health"] <= 0:
                killed = True
                target["isDead"] = True
                target["deaths"] += 1
                target["respawnAt"] = now + RESPAWN_DELAY_SECONDS
                attacker["kills"] += 1

            return {
                "ok": True,
                "killed": killed,
                "appliedDamage": applied_damage,
                "self": attacker.copy(),
                "target": target.copy(),
            }, 200

    def zombie_hit(self, player_id: str, zombie_id: str, damage: Any):
        if not self.enable_zombies:
            return {"ok": False, "error": "Zombie mode is unavailable in this room"}, 400
        if not self.started:
            return {"ok": False, "error": "Room has not started yet"}, 409

        now = time.time()
        zombie_key = str(zombie_id).strip()
        with self._lock:
            self._refresh_locked(now)
            player = self._players.get(player_id)
            zombie = self._zombies.get(zombie_key)
            if not player or not zombie:
                return {"ok": False, "error": "Target not found"}, 404
            if player["isDead"]:
                return {
                    "ok": True,
                    "ignored": True,
                    "reason": "player-dead",
                    "self": player.copy(),
                    "zombie": zombie.copy(),
                }, 200

            applied_damage = max(1.0, min(400.0, _coerce_float(damage, 1.0)))
            zombie["health"] = max(0.0, zombie["health"] - applied_damage)
            zombie["updatedAt"] = now

            killed = zombie["health"] <= 0
            response = {
                "ok": True,
                "killed": killed,
                "appliedDamage": applied_damage,
                "self": player.copy(),
            }
            if killed:
                player["zombieKills"] += 1
                if self.mini_game == "zombie-blitz":
                    player["miniGameScore"] = max(_coerce_float(player.get("miniGameScore"), 0.0), _coerce_float(player.get("zombieKills"), 0.0))
                self._zombies.pop(zombie_key, None)
                response["removedZombieId"] = zombie_key
                response["self"] = player.copy()
            else:
                response["zombie"] = zombie.copy()
            return response, 200

    def post_chat(self, player_id: str, message: Any):
        now = time.time()
        with self._lock:
            self._refresh_locked(now)
            player = self._players.get(player_id)
            if not player:
                return {"ok": False, "error": "Player not found"}, 404
            content = str(message or "").strip()[:CHAT_MESSAGE_MAX_LENGTH]
            if not content:
                return {"ok": False, "error": "Message required"}, 400
            entry = {
                "id": self._next_chat_id,
                "playerId": player_id,
                "name": player.get("name", "Player"),
                "text": content,
                "timestamp": now,
                "system": False,
            }
            self._next_chat_id += 1
            self._chat.append(entry)
            if len(self._chat) > CHAT_MAX_MESSAGES:
                self._chat = self._chat[-CHAT_MAX_MESSAGES:]
            return {"ok": True, "message": entry, "room": self._room_info_locked(include_code=True)}, 200

    def post_voice_signal(self, player_id: str, target_id: str, signal: Any):
        now = time.time()
        with self._lock:
            self._refresh_locked(now)
            source = self._players.get(player_id)
            target = self._players.get(target_id)
            if not source or not target:
                return {"ok": False, "error": "Player not found"}, 404
            if player_id == target_id:
                return {"ok": False, "error": "Self-signal is not allowed"}, 400
            if not isinstance(signal, dict):
                return {"ok": False, "error": "signal must be an object"}, 400

            queue = self._voice_signal_queues.setdefault(target_id, [])
            queue.append(
                {
                    "fromPlayerId": player_id,
                    "toPlayerId": target_id,
                    "signal": signal,
                    "timestamp": now,
                }
            )
            if len(queue) > VOICE_SIGNAL_MAX_PER_PLAYER:
                del queue[:-VOICE_SIGNAL_MAX_PER_PLAYER]
            return {"ok": True}, 200

    def heal(self, player_id: str):
        now = time.time()
        with self._lock:
            self._refresh_locked(now)
            player = self._players.get(player_id)
            if not player:
                return None, 404
            if player["isDead"]:
                return {
                    "ok": True,
                    "healed": False,
                    "reason": "player-dead",
                    "self": player.copy(),
                }, 200
            ready_at = _coerce_float(player.get("potionReadyAt", 0.0), 0.0)
            if now < ready_at:
                return {
                    "ok": True,
                    "healed": False,
                    "reason": "cooldown",
                    "cooldownRemaining": ready_at - now,
                    "self": player.copy(),
                }, 200
            max_health = max(1.0, _coerce_float(player.get("maxHealth"), PLAYER_MAX_HEALTH))
            current_health = _coerce_float(player.get("health"), max_health)
            if current_health >= max_health:
                return {
                    "ok": True,
                    "healed": False,
                    "reason": "full-health",
                    "self": player.copy(),
                }, 200
            next_health = min(max_health, current_health + HEAL_POTION_AMOUNT)
            applied_heal = next_health - current_health
            player["health"] = next_health
            player["potionReadyAt"] = now + HEAL_POTION_COOLDOWN_SECONDS
            player["updatedAt"] = now
            return {
                "ok": True,
                "healed": True,
                "amount": applied_heal,
                "self": player.copy(),
            }, 200

    def respawn(self, player_id: str):
        now = time.time()
        with self._lock:
            self._refresh_locked(now)
            player = self._players.get(player_id)
            if not player:
                return None
            self._revive_player_locked(player, now, force=True)
            return player.copy()

    def _scoreboard_value_locked(self, player: Dict[str, Any]):
        if self.variant == MULTIPLAYER_VARIANTS["arcade"]:
            return _coerce_float(player.get("miniGameScore"), 0.0)
        if self.variant == MULTIPLAYER_VARIANTS["horde"]:
            return _coerce_float(player.get("zombieKills"), 0.0) * 1000.0 + _coerce_float(player.get("kills"), 0.0) * 10.0 - _coerce_float(player.get("deaths"), 0.0)
        return _coerce_float(player.get("kills"), 0.0) * 1000.0 - _coerce_float(player.get("deaths"), 0.0)

    def _append_system_chat_locked(self, text: str, now: float):
        message = str(text or "").strip()[:CHAT_MESSAGE_MAX_LENGTH]
        if not message:
            return
        self._chat.append({
            "id": self._next_chat_id,
            "playerId": "system",
            "name": "System",
            "text": message,
            "timestamp": now,
            "system": True,
        })
        self._next_chat_id += 1
        if len(self._chat) > CHAT_MAX_MESSAGES:
            self._chat = self._chat[-CHAT_MAX_MESSAGES:]

    def _room_info_locked(self, viewer_id: Optional[str] = None, include_code: bool = False):
        host_name = self._players.get(self.host_id, {}).get("name", "") if self.host_id else ""
        player_count = len(self._players)
        now = time.time()
        ordered_players = sorted(
            self._players.values(),
            key=lambda item: (self._scoreboard_value_locked(item), -float(item.get("updatedAt", 0.0))),
            reverse=True,
        )
        roster = [
            {
                "id": player.get("id", ""),
                "name": player.get("name", "Player"),
                "health": _coerce_float(player.get("health"), PLAYER_MAX_HEALTH),
                "isDead": bool(player.get("isDead")),
                "kills": int(_coerce_float(player.get("kills"), 0.0)),
                "deaths": int(_coerce_float(player.get("deaths"), 0.0)),
                "zombieKills": int(_coerce_float(player.get("zombieKills"), 0.0)),
                "miniGameScore": _coerce_float(player.get("miniGameScore"), 0.0),
                "miniGameProgress": str(player.get("miniGameProgress", ""))[:48],
                "voiceEnabled": bool(player.get("voiceEnabled")),
                "voiceMuted": bool(player.get("voiceMuted")),
            }
            for player in ordered_players
        ]
        leaderboard = [
            {
                "id": player_info["id"],
                "name": player_info["name"],
                "score": player_info["miniGameScore"] if self.variant == MULTIPLAYER_VARIANTS["arcade"] else (player_info["zombieKills"] if self.variant == MULTIPLAYER_VARIANTS["horde"] else player_info["kills"]),
                "progress": player_info["miniGameProgress"],
            }
            for player_info in roster
        ]
        chat = [entry.copy() for entry in self._chat[-CHAT_MAX_MESSAGES:]]
        return {
            "id": self.room_id,
            "name": self.room_name,
            "variant": self.variant,
            "miniGame": self.mini_game,
            "private": self.is_private,
            "code": self.code if include_code and self.code else "",
            "minPlayers": self.min_players,
            "playerCount": player_count,
            "waitingForPlayers": max(0, self.min_players - player_count) if self.variant == MULTIPLAYER_VARIANTS["horde"] and not self.started else 0,
            "started": self.started,
            "hostName": host_name,
            "createdAt": self.created_at,
            "miniGameStartedAt": self.mini_game_started_at,
            "miniGameDuration": self.mini_game_duration,
            "miniGameEndsAt": self.mini_game_ends_at,
            "miniGameActive": bool(self.mini_game and self.mini_game_ends_at > now),
            "leaderboard": leaderboard,
            "roster": roster,
            "chat": chat,
            "social": self._social_snapshot_locked(viewer_id),
        }

    def _voice_snapshot_locked(self, viewer_id: Optional[str]):
        peers = [
            {
                "id": player.get("id", ""),
                "name": player.get("name", "Player"),
                "voiceEnabled": bool(player.get("voiceEnabled")),
                "voiceMuted": bool(player.get("voiceMuted")),
            }
            for player in self._players.values()
            if not viewer_id or player.get("id") != viewer_id
        ]
        signals = []
        if viewer_id:
            signals = [entry.copy() for entry in self._voice_signal_queues.get(viewer_id, [])]
            self._voice_signal_queues[viewer_id] = []
        return {"peers": peers, "signals": signals}

    def _mini_game_active_locked(self, now: float):
        return bool(self.mini_game and self.mini_game_ends_at > now)

    def _iter_obstacles_locked(self, include_walls: bool = True):
        for obstacle in STATIC_OBSTACLES:
            yield obstacle
        if include_walls:
            for wall in self._walls.values():
                yield _wall_rect(wall)

    def _refresh_locked(self, now: float):
        self._revive_dead_locked(now)
        self._prune_locked(now)
        self._update_started_locked(now)
        if self.enable_zombies and self.started:
            self._update_zombies_locked(now)
        elif self.enable_zombies and self._zombies:
            self._zombies.clear()

    def _update_started_locked(self, now: float):
        if self.variant != MULTIPLAYER_VARIANTS["horde"]:
            self.started = True
            return
        if not self.started and len(self._players) >= self.min_players:
            self.started = True
            self._next_zombie_spawn_at = now + 1.0
            self._last_zombie_step_at = now

    def _revive_dead_locked(self, now: float):
        for player in self._players.values():
            if player["isDead"] and now >= player.get("respawnAt", 0.0):
                self._revive_player_locked(player, now)

    def _revive_player_locked(self, player: Dict[str, Any], now: float, force: bool = False):
        if not force and not player["isDead"]:
            return
        spawn_x, spawn_y, spawn_z = _random_spawn_point()
        player["x"] = spawn_x
        player["y"] = spawn_y
        player["z"] = spawn_z
        player["health"] = player.get("maxHealth", PLAYER_MAX_HEALTH)
        player["isDead"] = False
        player["respawnAt"] = 0.0
        player["updatedAt"] = now

    def _update_zombies_locked(self, now: float):
        dt = max(0.0, min(now - self._last_zombie_step_at, 0.25))
        self._last_zombie_step_at = now

        alive_players = [player for player in self._players.values() if not player["isDead"]]
        if alive_players and len(self._zombies) < ZOMBIE_MAX_ALIVE:
            while now >= self._next_zombie_spawn_at and len(self._zombies) < ZOMBIE_MAX_ALIVE:
                self._spawn_zombie_locked(alive_players, now)
                self._next_zombie_spawn_at += ZOMBIE_SPAWN_INTERVAL
        elif not alive_players:
            self._next_zombie_spawn_at = now + 1.0

        obstacles = tuple(self._iter_obstacles_locked())
        expired_zombies = []
        for zombie_id, zombie in self._zombies.items():
            zombie["attackCooldown"] = max(0.0, zombie.get("attackCooldown", 0.0) - dt)
            zombie["attackPulse"] = max(0.0, zombie.get("attackPulse", 0.0) - dt * 2.8)
            zombie["moving"] = False
            if not alive_players:
                continue

            nearest_player = None
            nearest_distance_sq = None
            for player in alive_players:
                dx = float(player["x"]) - float(zombie["x"])
                dz = float(player["z"]) - float(zombie["z"])
                distance_sq = dx * dx + dz * dz
                if nearest_distance_sq is None or distance_sq < nearest_distance_sq:
                    nearest_distance_sq = distance_sq
                    nearest_player = player

            if nearest_player is None or nearest_distance_sq is None:
                continue

            nearest_distance = math.sqrt(max(0.0, nearest_distance_sq))
            if nearest_distance > ZOMBIE_DESPAWN_RANGE:
                expired_zombies.append(zombie_id)
                continue

            dx = float(nearest_player["x"]) - float(zombie["x"])
            dz = float(nearest_player["z"]) - float(zombie["z"])
            if nearest_distance > 0.0001:
                zombie["yaw"] = math.atan2(-dx / nearest_distance, -dz / nearest_distance)

            if nearest_distance < ZOMBIE_CHASE_RANGE and nearest_distance > ZOMBIE_ATTACK_RANGE and nearest_distance > 0.0001:
                step = min(nearest_distance - ZOMBIE_ATTACK_RANGE, ZOMBIE_WALK_SPEED * dt)
                next_x, next_z, next_yaw, moved = _choose_step(
                    float(zombie["x"]),
                    float(zombie["z"]),
                    float(nearest_player["x"]),
                    float(nearest_player["z"]),
                    step,
                    ZOMBIE_BODY_RADIUS,
                    obstacles,
                )
                zombie["yaw"] = next_yaw
                zombie["moving"] = moved
                zombie["x"] = next_x
                zombie["z"] = next_z
            elif nearest_distance <= ZOMBIE_ATTACK_RANGE and zombie["attackCooldown"] == 0:
                nearest_player["health"] = max(0.0, nearest_player["health"] - ZOMBIE_ATTACK_DAMAGE)
                nearest_player["updatedAt"] = now
                zombie["attackCooldown"] = ZOMBIE_ATTACK_INTERVAL
                zombie["attackPulse"] = 1.0
                if nearest_player["health"] <= 0 and not nearest_player["isDead"]:
                    nearest_player["isDead"] = True
                    nearest_player["deaths"] += 1
                    nearest_player["respawnAt"] = now + RESPAWN_DELAY_SECONDS

            zombie["updatedAt"] = now

        for zombie_id in expired_zombies:
            self._zombies.pop(zombie_id, None)

    def _spawn_zombie_locked(self, alive_players, now: float):
        anchor = random.choice(alive_players)
        obstacles = tuple(self._iter_obstacles_locked())
        for _ in range(14):
            angle = random.random() * math.tau
            radius = random.uniform(ZOMBIE_SPAWN_RADIUS_MIN, ZOMBIE_SPAWN_RADIUS_MAX)
            x = float(anchor["x"]) + math.cos(angle) * radius
            z = float(anchor["z"]) + math.sin(angle) * radius

            if any(_circle_hits_obstacle(x, z, ZOMBIE_BODY_RADIUS + 0.2, obstacle) for obstacle in obstacles):
                continue

            blocked = False
            for zombie in self._zombies.values():
                dx = float(zombie["x"]) - x
                dz = float(zombie["z"]) - z
                if dx * dx + dz * dz < 100.0:
                    blocked = True
                    break
            if blocked:
                continue

            zombie_id = str(self._next_zombie_id)
            self._next_zombie_id += 1
            self._zombies[zombie_id] = {
                "id": zombie_id,
                "x": x,
                "y": 0.0,
                "z": z,
                "yaw": 0.0,
                "health": ZOMBIE_MAX_HEALTH,
                "maxHealth": ZOMBIE_MAX_HEALTH,
                "attackCooldown": 0.35 + random.random() * 0.4,
                "attackPulse": 0.0,
                "moving": False,
                "updatedAt": now,
            }
            return

    def _prune_locked(self, now: float):
        expired_ids = [
            player_id
            for player_id, player in self._players.items()
            if now - float(player["updatedAt"]) > PLAYER_TTL_SECONDS
        ]
        for player_id in expired_ids:
            self._players.pop(player_id, None)
            self._voice_signal_queues.pop(player_id, None)
            self._remove_social_state_for_player_locked(player_id)
            if self.host_id == player_id:
                self.host_id = ""
        if not self.host_id and self._players:
            self.host_id = next(iter(self._players))

        if not self._players:
            self._zombies.clear()
            self._walls.clear()
            self._terrain_edits.clear()
            self._terrain_revision = 0
            self._next_zombie_spawn_at = now + 1.0


class RoomManager:
    def __init__(self):
        self._lock = threading.Lock()
        self._rooms: Dict[str, MultiplayerRoom] = {}
        self._player_rooms: Dict[str, str] = {}

    def create_room(self, room_name: str, host_name: str, variant: str, is_private: bool, min_players: int, mini_game: str = ""):
        next_variant = _sanitize_variant(variant)
        room_id = uuid.uuid4().hex[:10]
        code = _generate_room_code() if is_private else ""
        room = MultiplayerRoom(room_id, room_name, next_variant, is_private, min_players, code=code, mini_game=mini_game)
        player = room.join(host_name)
        with self._lock:
            self._rooms[room_id] = room
            self._player_rooms[player["id"]] = room_id
        return room.summary(include_code=True), player

    def join_room(self, name: str, room_id: Optional[str] = None, code: Optional[str] = None):
        room = self._room_from_identifier(room_id=room_id, code=code)
        if room is None:
            return None, None
        player = room.join(name)
        with self._lock:
            self._player_rooms[player["id"]] = room.room_id
        return room.summary(include_code=room.is_private), player

    def quick_join(self, name: str, variant: str):
        next_variant = _sanitize_variant(variant)
        room = None
        with self._lock:
            for candidate in self._rooms.values():
                if candidate.variant == next_variant and not candidate.is_private:
                    room = candidate
                    break
        if room is None:
            room_info, player = self.create_room(
                room_name="Quick Match Horde" if next_variant == MULTIPLAYER_VARIANTS["horde"] else "Quick Match PvP" if next_variant == MULTIPLAYER_VARIANTS["pvp"] else "Quick Match Mini Games",
                host_name=name,
                variant=next_variant,
                is_private=False,
                min_players=2 if next_variant == MULTIPLAYER_VARIANTS["horde"] else 1,
                mini_game=DEFAULT_MINI_GAME if next_variant == MULTIPLAYER_VARIANTS["arcade"] else "",
            )
            return room_info, player
        player = room.join(name)
        with self._lock:
            self._player_rooms[player["id"]] = room.room_id
        return room.summary(include_code=False), player

    def room_for_player(self, player_id: Optional[str]):
        room_id = None
        with self._lock:
            room_id = self._player_rooms.get(str(player_id or "").strip())
            room = self._rooms.get(room_id) if room_id else None
        if room and room.count() > 0:
            return room
        if room_id:
            self._remove_room_if_empty(room_id)
        return None

    def leave_player(self, player_id: Optional[str]):
        player_key = str(player_id or "").strip()
        if not player_key:
            return
        with self._lock:
            room_id = self._player_rooms.pop(player_key, None)
            room = self._rooms.get(room_id) if room_id else None
        if room is None:
            return
        room.leave(player_key)
        self._remove_room_if_empty(room.room_id)

    def list_public_rooms(self):
        rooms: List[Dict[str, Any]] = []
        empty_room_ids: List[str] = []
        with self._lock:
            current_rooms = list(self._rooms.values())
        for room in current_rooms:
            summary = room.summary(include_code=False)
            if summary["playerCount"] <= 0:
                empty_room_ids.append(summary["id"])
                continue
            if not summary["private"]:
                rooms.append(summary)
        for room_id in empty_room_ids:
            self._remove_room_if_empty(room_id)
        rooms.sort(key=lambda item: (item["started"], item["playerCount"], item["createdAt"]), reverse=True)
        return rooms

    def total_players(self):
        total = 0
        with self._lock:
            current_rooms = list(self._rooms.values())
        for room in current_rooms:
            total += room.count()
        return total

    def total_zombies(self):
        total = 0
        with self._lock:
            current_rooms = list(self._rooms.values())
        for room in current_rooms:
            total += room.zombie_count()
        return total

    def total_rooms(self):
        with self._lock:
            return len(self._rooms)

    def _room_from_identifier(self, room_id: Optional[str] = None, code: Optional[str] = None):
        room_key = str(room_id or "").strip()
        code_key = str(code or "").strip().upper()
        with self._lock:
            if room_key:
                room = self._rooms.get(room_key)
                return room if room and room.count() > 0 else None
            if code_key:
                for room in self._rooms.values():
                    if room.code == code_key and room.count() >= 0:
                        return room
        return None

    def _remove_room_if_empty(self, room_id: str):
        with self._lock:
            room = self._rooms.get(room_id)
            if room is None:
                return
            if room.count() > 0:
                return
            self._rooms.pop(room_id, None)
            stale_player_ids = [
                player_id for player_id, mapped_room_id in self._player_rooms.items() if mapped_room_id == room_id
            ]
            for player_id in stale_player_ids:
                self._player_rooms.pop(player_id, None)


ROOM_MANAGER = RoomManager()


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        super().end_headers()

    def do_OPTIONS(self):  # noqa: N802
        self.send_response(204)
        self.end_headers()

    def do_GET(self):  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            self._write_json(
                200,
                {
                    "ok": True,
                    "players": ROOM_MANAGER.total_players(),
                    "zombies": ROOM_MANAGER.total_zombies(),
                    "rooms": ROOM_MANAGER.total_rooms(),
                    "timestamp": time.time(),
                },
            )
            return

        if parsed.path == "/api/multiplayer/rooms":
            self._write_json(200, {"rooms": ROOM_MANAGER.list_public_rooms(), "timestamp": time.time()})
            return

        if parsed.path == "/api/multiplayer/state":
            params = parse_qs(parsed.query)
            player_id = (params.get("playerId") or [None])[0]
            room = ROOM_MANAGER.room_for_player(player_id)
            if room is None:
                self._write_json(404, {"error": "Player not found"})
                return
            viewer, players, zombies, walls, terrain, room_info, voice = room.snapshot_for(viewer_id=player_id)
            self._write_json(
                200,
                {
                    "self": viewer,
                    "players": players,
                    "zombies": zombies,
                    "walls": walls,
                    "terrain": terrain,
                    "room": room_info,
                    "voice": voice,
                    "timestamp": time.time(),
                },
            )
            return

        super().do_GET()

    def do_POST(self):  # noqa: N802
        parsed = urlparse(self.path)
        payload = self._read_json_body()

        if parsed.path == "/api/multiplayer/rooms":
            if not isinstance(payload, dict):
                self._write_json(400, {"error": "Invalid JSON body"})
                return
            room_info, player = ROOM_MANAGER.create_room(
                room_name=payload.get("roomName", ""),
                host_name=payload.get("hostName", ""),
                variant=payload.get("variant", MULTIPLAYER_VARIANTS["pvp"]),
                is_private=bool(payload.get("private")),
                min_players=payload.get("minPlayers", 1),
                mini_game=payload.get("miniGame", DEFAULT_MINI_GAME),
            )
            self._write_json(201, {"room": room_info, "player": player})
            return

        if parsed.path == "/api/multiplayer/rooms/join":
            if not isinstance(payload, dict):
                self._write_json(400, {"error": "Invalid JSON body"})
                return
            room_info, player = ROOM_MANAGER.join_room(
                name=payload.get("name", ""),
                room_id=payload.get("roomId"),
                code=payload.get("code"),
            )
            if room_info is None or player is None:
                self._write_json(404, {"error": "Room not found"})
                return
            self._write_json(200, {"room": room_info, "player": player})
            return

        if parsed.path == "/api/multiplayer/join":
            if not isinstance(payload, dict):
                self._write_json(400, {"error": "Invalid JSON body"})
                return
            room_info, player = ROOM_MANAGER.quick_join(
                name=payload.get("name", ""),
                variant=payload.get("variant", MULTIPLAYER_VARIANTS["pvp"]),
            )
            self._write_json(201, {"room": room_info, "player": player})
            return

        if parsed.path == "/api/multiplayer/update":
            if not isinstance(payload, dict):
                self._write_json(400, {"error": "Invalid JSON body"})
                return
            player_id = str(payload.get("playerId", "")).strip()
            if not player_id:
                self._write_json(400, {"error": "playerId is required"})
                return
            room = ROOM_MANAGER.room_for_player(player_id)
            if room is None:
                self._write_json(404, {"error": "Player not found"})
                return
            updated_player = room.update(player_id, payload)
            if not updated_player:
                self._write_json(404, {"error": "Player not found"})
                return
            self._write_json(200, {"ok": True, "self": updated_player, "room": room._room_info_locked(viewer_id=player_id, include_code=True)})
            return

        if parsed.path == "/api/multiplayer/build-wall":
            if not isinstance(payload, dict):
                self._write_json(400, {"error": "Invalid JSON body"})
                return
            player_id = str(payload.get("playerId", "")).strip()
            if not player_id:
                self._write_json(400, {"error": "playerId is required"})
                return
            room = ROOM_MANAGER.room_for_player(player_id)
            if room is None:
                self._write_json(404, {"error": "Player not found"})
                return
            result, status = room.build_wall(player_id, payload)
            self._write_json(status, result)
            return

        if parsed.path == "/api/multiplayer/leave":
            if isinstance(payload, dict):
                ROOM_MANAGER.leave_player(payload.get("playerId"))
            self._write_json(200, {"ok": True})
            return

        if parsed.path == "/api/multiplayer/hit":
            if not isinstance(payload, dict):
                self._write_json(400, {"error": "Invalid JSON body"})
                return
            attacker_id = str(payload.get("attackerId", "")).strip()
            target_id = str(payload.get("targetId", "")).strip()
            if not attacker_id or not target_id:
                self._write_json(400, {"error": "attackerId and targetId are required"})
                return
            room = ROOM_MANAGER.room_for_player(attacker_id)
            if room is None:
                self._write_json(404, {"error": "Player not found"})
                return
            result, status = room.hit(attacker_id, target_id, payload.get("damage", 1))
            self._write_json(status, result)
            return

        if parsed.path == "/api/multiplayer/zombie-hit":
            if not isinstance(payload, dict):
                self._write_json(400, {"error": "Invalid JSON body"})
                return
            player_id = str(payload.get("playerId", "")).strip()
            zombie_id = str(payload.get("zombieId", "")).strip()
            if not player_id or not zombie_id:
                self._write_json(400, {"error": "playerId and zombieId are required"})
                return
            room = ROOM_MANAGER.room_for_player(player_id)
            if room is None:
                self._write_json(404, {"error": "Player not found"})
                return
            result, status = room.zombie_hit(player_id, zombie_id, payload.get("damage", 1))
            self._write_json(status, result)
            return

        if parsed.path == "/api/multiplayer/chat":
            if not isinstance(payload, dict):
                self._write_json(400, {"error": "Invalid JSON body"})
                return
            player_id = str(payload.get("playerId", "")).strip()
            if not player_id:
                self._write_json(400, {"error": "playerId is required"})
                return
            room = ROOM_MANAGER.room_for_player(player_id)
            if room is None:
                self._write_json(404, {"error": "Player not found"})
                return
            result, status = room.post_chat(player_id, payload.get("message", ""))
            self._write_json(status, result)
            return

        if parsed.path == "/api/multiplayer/friend-request":
            if not isinstance(payload, dict):
                self._write_json(400, {"error": "Invalid JSON body"})
                return
            player_id = str(payload.get("playerId", "")).strip()
            target_id = str(payload.get("targetPlayerId", "")).strip()
            if not player_id or not target_id:
                self._write_json(400, {"error": "playerId and targetPlayerId are required"})
                return
            room = ROOM_MANAGER.room_for_player(player_id)
            if room is None:
                self._write_json(404, {"error": "Player not found"})
                return
            result, status = room.post_friend_request(player_id, target_id)
            self._write_json(status, result)
            return

        if parsed.path == "/api/multiplayer/friend-response":
            if not isinstance(payload, dict):
                self._write_json(400, {"error": "Invalid JSON body"})
                return
            player_id = str(payload.get("playerId", "")).strip()
            from_player_id = str(payload.get("fromPlayerId", "")).strip()
            if not player_id or not from_player_id:
                self._write_json(400, {"error": "playerId and fromPlayerId are required"})
                return
            room = ROOM_MANAGER.room_for_player(player_id)
            if room is None:
                self._write_json(404, {"error": "Player not found"})
                return
            result, status = room.respond_friend_request(player_id, from_player_id, payload.get("accept"))
            self._write_json(status, result)
            return

        if parsed.path == "/api/multiplayer/direct-chat":
            if not isinstance(payload, dict):
                self._write_json(400, {"error": "Invalid JSON body"})
                return
            player_id = str(payload.get("playerId", "")).strip()
            target_id = str(payload.get("targetPlayerId", "")).strip()
            if not player_id or not target_id:
                self._write_json(400, {"error": "playerId and targetPlayerId are required"})
                return
            room = ROOM_MANAGER.room_for_player(player_id)
            if room is None:
                self._write_json(404, {"error": "Player not found"})
                return
            result, status = room.post_direct_chat(player_id, target_id, payload.get("message", ""))
            self._write_json(status, result)
            return

        if parsed.path == "/api/multiplayer/voice-signal":
            if not isinstance(payload, dict):
                self._write_json(400, {"error": "Invalid JSON body"})
                return
            player_id = str(payload.get("playerId", "")).strip()
            target_id = str(payload.get("targetPlayerId", "")).strip()
            if not player_id or not target_id:
                self._write_json(400, {"error": "playerId and targetPlayerId are required"})
                return
            room = ROOM_MANAGER.room_for_player(player_id)
            if room is None:
                self._write_json(404, {"error": "Player not found"})
                return
            result, status = room.post_voice_signal(player_id, target_id, payload.get("signal"))
            self._write_json(status, result)
            return

        if parsed.path == "/api/multiplayer/heal":
            if not isinstance(payload, dict):
                self._write_json(400, {"error": "Invalid JSON body"})
                return
            player_id = str(payload.get("playerId", "")).strip()
            if not player_id:
                self._write_json(400, {"error": "playerId is required"})
                return
            room = ROOM_MANAGER.room_for_player(player_id)
            if room is None:
                self._write_json(404, {"error": "Player not found"})
                return
            result, status = room.heal(player_id)
            if result is None:
                self._write_json(404, {"error": "Player not found"})
                return
            self._write_json(status, result)
            return

        if parsed.path == "/api/multiplayer/respawn":
            if not isinstance(payload, dict):
                self._write_json(400, {"error": "Invalid JSON body"})
                return
            player_id = str(payload.get("playerId", "")).strip()
            if not player_id:
                self._write_json(400, {"error": "playerId is required"})
                return
            room = ROOM_MANAGER.room_for_player(player_id)
            if room is None:
                self._write_json(404, {"error": "Player not found"})
                return
            player = room.respawn(player_id)
            if not player:
                self._write_json(404, {"error": "Player not found"})
                return
            self._write_json(200, {"ok": True, "self": player})
            return

        self._write_json(404, {"error": "Not found"})

    def _read_json_body(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            return {}
        raw = self.rfile.read(length) if length > 0 else b"{}"
        if not raw:
            return {}
        try:
            parsed = json.loads(raw.decode("utf-8"))
            return parsed if isinstance(parsed, dict) else {}
        except json.JSONDecodeError:
            return {}

    def _write_json(self, status: int, payload: Dict[str, Any]):
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


class ThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
    with ThreadingTCPServer((HOST, port), NoCacheHandler) as httpd:
        print(f"Serving Fighter Arena on http://{HOST}:{port}")
        print("Health endpoint: /api/health")
        print(
            "Room endpoints: /api/multiplayer/rooms, /api/multiplayer/rooms/join, /api/multiplayer/state, /api/multiplayer/update, /api/multiplayer/build-wall, /api/multiplayer/hit, /api/multiplayer/zombie-hit, /api/multiplayer/heal, /api/multiplayer/respawn, /api/multiplayer/leave"
        )
        httpd.serve_forever()


if __name__ == "__main__":
    main()
