import * as THREE from "./vendor/three.module.js";

const setBootMessage =
  window.__fighterArenaSetBootMessage ||
  function fallbackSetBootMessage(message) {
    if (message) {
      console.error(message);
    }
  };

try {
  bootstrap();
} catch (error) {
  console.error(error);
  setBootMessage(
    "The world failed to start. Check the browser console for details."
  );
}

function bootstrap() {
  setBootMessage("");

  const WORLD = {
    chunkSize: 72,
    segments: 40,
    viewRadius: 2,
    maxBuildsPerFrame: 1,
    initialBuildBurst: 4,
    seaLevel: -4,
  };

  const PLAYER = {
    height: 5.8,
    walkSpeed: 24,
    sprintSpeed: 38,
    slideSpeed: 52,
    aimSpeedFactor: 0.62,
    reloadSpeedFactor: 0.78,
    jumpSpeed: 19,
    gravity: 42,
    lookSpeed: 0.0019,
    aimLookMultiplier: 0.58,
    baseFov: 75,
    scopeFov: 28,
    maxHealth: 100,
    damageCooldown: 0.62,
  };

  const CAMERA_VIEW = {
    thirdPersonDistance: 8.6,
    thirdPersonAimDistance: 4.8,
    thirdPersonShoulder: 2.2,
    thirdPersonAimShoulder: 1.2,
    thirdPersonHeight: 1.95,
    thirdPersonAimHeight: 1.15,
    thirdPersonAimFov: 52,
    slideDrop: 0.88,
    slideDropReturn: 10.5,
    slideDropEngage: 18,
  };

  const BLOCKS = {
    size: 4.5,
    minPerChunk: 4,
    maxPerChunk: 8,
  };

  const DEFENSE = {
    playerRadius: 1.18,
    zombieRadius: 1.25,
    wallWidth: 12,
    wallThickness: 1.2,
    wallHeight: 9.5,
    wallOffset: 9,
    buildCooldown: 10,
    houseWidth: 18,
    houseDepth: 18,
    houseWallThickness: 1.25,
    houseWallHeight: 3.6,
  };

  const STATIC_HOUSES = [
    { id: "house-nw", x: -54, z: 42, width: DEFENSE.houseWidth, depth: DEFENSE.houseDepth },
    { id: "house-ne", x: 60, z: 48, width: DEFENSE.houseWidth, depth: DEFENSE.houseDepth },
    { id: "house-sw", x: -68, z: -58, width: DEFENSE.houseWidth, depth: DEFENSE.houseDepth },
    { id: "house-se", x: 74, z: -44, width: DEFENSE.houseWidth, depth: DEFENSE.houseDepth },
  ];

  const BLOCK_PHYSICS = {
    gravity: 34,
    bounce: 0.22,
    settleSpeed: 1.4,
    supportRadius: BLOCKS.size * 0.72,
    debrisCount: 3,
  };

  const PICKUPS = {
    interactDistance: 6.5,
    throwSpeed: 12,
    hoverHeight: 1.15,
    gravity: 26,
  };

  const ECONOMY = {
    startingCredits: 320,
    zombieKillReward: 95,
    blockReward: 24,
  };

  const LOADOUT = [
    {
      id: "minigun",
      slot: "1",
      shortLabel: "Minigun",
      label: "M134 Minigun",
      type: "minigun",
      autoFire: true,
      supportsAim: true,
      hasScope: true,
      fireInterval: 0.082,
      effectiveRange: 82,
      price: 0,
      starter: true,
      damagePerShot: 18,
      bulletSpeed: 280,
      bulletRadius: 0.04,
      spreadHip: 0.018,
      spreadAim: 0.006,
      magazineSize: 80,
      reserveAmmoStart: 320,
      reloadTime: 2.4,
      heatPerShot: 0.045,
      coolRate: 0.34,
      recoilPerShot: 0.05,
      maxRecoil: 0.18,
      spinSpeed: 50,
      scopeZoomLabel: "x2.5",
      aimFov: 32,
      actionDuration: 0.18,
      description: "High fire rate, medium reach",
    },
    {
      id: "carbine",
      slot: "2",
      shortLabel: "Carbine",
      label: "Ranger Carbine",
      type: "carbine",
      autoFire: true,
      supportsAim: true,
      hasScope: true,
      fireInterval: 0.16,
      effectiveRange: 96,
      price: 260,
      starter: false,
      damagePerShot: 34,
      bulletSpeed: 340,
      bulletRadius: 0.035,
      spreadHip: 0.008,
      spreadAim: 0.0022,
      magazineSize: 24,
      reserveAmmoStart: 144,
      reloadTime: 1.7,
      heatPerShot: 0.024,
      coolRate: 0.46,
      recoilPerShot: 0.075,
      maxRecoil: 0.23,
      spinSpeed: 0,
      scopeZoomLabel: "x4",
      aimFov: 24,
      actionDuration: 0.14,
      description: "Accurate mid-range rifle",
    },
    {
      id: "shotgun",
      slot: "3",
      shortLabel: "Shotgun",
      label: "Bulldog Shotgun",
      type: "shotgun",
      autoFire: false,
      supportsAim: true,
      hasScope: false,
      fireInterval: 0.78,
      effectiveRange: 30,
      price: 340,
      starter: false,
      damagePerShot: 13,
      bulletSpeed: 220,
      bulletRadius: 0.05,
      spreadHip: 0.1,
      spreadAim: 0.055,
      pellets: 7,
      magazineSize: 8,
      reserveAmmoStart: 40,
      reloadTime: 2.1,
      heatPerShot: 0.07,
      coolRate: 0.42,
      recoilPerShot: 0.14,
      maxRecoil: 0.32,
      spinSpeed: 0,
      scopeZoomLabel: "Focus",
      aimFov: 50,
      actionDuration: 0.42,
      description: "Wide spread, short reach",
    },
    {
      id: "knife",
      slot: "4",
      shortLabel: "Knife",
      label: "Combat Knife",
      type: "knife",
      isMelee: true,
      autoFire: true,
      supportsAim: false,
      hasScope: false,
      fireInterval: 0.48,
      effectiveRange: 4.4,
      price: 0,
      starter: true,
      damagePerShot: 999,
      bulletSpeed: 0,
      bulletRadius: 0,
      spreadHip: 0,
      spreadAim: 0,
      magazineSize: 0,
      reserveAmmoStart: 0,
      reloadTime: 0,
      heatPerShot: 0,
      coolRate: 1,
      recoilPerShot: 0.03,
      maxRecoil: 0.08,
      spinSpeed: 0,
      scopeZoomLabel: "Blade",
      aimFov: PLAYER.baseFov,
      actionDuration: 0.28,
      meleeArc: 0.72,
      description: "Instant melee takedown up close",
    },
    {
      id: "flamethrower",
      slot: "5",
      shortLabel: "Flame",
      label: "Inferno Flamethrower",
      type: "flamethrower",
      autoFire: true,
      supportsAim: false,
      hasScope: false,
      fireInterval: 0.05,
      effectiveRange: 18,
      price: 520,
      starter: false,
      damagePerShot: 9,
      bulletSpeed: 0,
      bulletRadius: 0,
      spreadHip: 0.18,
      spreadAim: 0.18,
      magazineSize: 180,
      reserveAmmoStart: 420,
      reloadTime: 2.65,
      heatPerShot: 0.034,
      coolRate: 0.24,
      recoilPerShot: 0.018,
      maxRecoil: 0.09,
      spinSpeed: 0,
      scopeZoomLabel: "Flame",
      aimFov: PLAYER.baseFov,
      actionDuration: 0.08,
      flameParticles: 5,
      flameCone: 0.52,
      description: "Continuous fire stream at close range",
    },
    {
      id: "bomb",
      slot: "6",
      shortLabel: "Bomb",
      label: "HE Bomb",
      type: "bomb",
      autoFire: false,
      supportsAim: false,
      hasScope: false,
      fireInterval: 0.95,
      effectiveRange: 36,
      price: 430,
      starter: false,
      damagePerShot: 140,
      bulletSpeed: 0,
      bulletRadius: 0,
      spreadHip: 0,
      spreadAim: 0,
      magazineSize: 1,
      reserveAmmoStart: 5,
      reloadTime: 1.25,
      heatPerShot: 0.018,
      coolRate: 0.5,
      recoilPerShot: 0.025,
      maxRecoil: 0.08,
      spinSpeed: 0,
      scopeZoomLabel: "Fuse",
      aimFov: PLAYER.baseFov,
      actionDuration: 0.34,
      throwSpeed: 34,
      throwLift: 9.5,
      fuseTime: 1.9,
      blastRadius: 14,
      blockBlastRadius: 16,
      description: "Timed explosive with a heavy blast",
    },
  ];

  const VIEW_POSES = {
    minigun: {
      hipPosition: [0.68, -0.54, -1.1],
      aimPosition: [0.14, -0.21, -0.72],
      hipRotation: [-0.16, -0.34, 0.04],
      aimRotation: [-0.02, -0.08, 0.02],
      reloadPosition: [0.18, -0.16, 0.06],
      reloadRotation: [-0.38, 0.62, 0.28],
      actionPosition: [0.02, -0.02, 0.08],
      actionRotation: [-0.12, 0.04, 0.02],
    },
    carbine: {
      hipPosition: [0.56, -0.5, -0.92],
      aimPosition: [0.04, -0.16, -0.52],
      hipRotation: [-0.12, -0.18, 0.03],
      aimRotation: [-0.02, -0.03, 0.01],
      reloadPosition: [0.12, -0.12, 0.03],
      reloadRotation: [-0.28, 0.46, 0.14],
      actionPosition: [0, 0, 0.12],
      actionRotation: [-0.18, 0.06, 0.02],
    },
    shotgun: {
      hipPosition: [0.62, -0.48, -0.98],
      aimPosition: [0.18, -0.17, -0.64],
      hipRotation: [-0.14, -0.22, 0.04],
      aimRotation: [-0.04, -0.06, 0.02],
      reloadPosition: [0.14, -0.1, 0.04],
      reloadRotation: [-0.26, 0.28, 0.24],
      actionPosition: [0, 0.01, 0.16],
      actionRotation: [-0.22, 0.05, 0.03],
    },
    knife: {
      hipPosition: [0.54, -0.58, -0.82],
      aimPosition: [0.44, -0.52, -0.74],
      hipRotation: [0.42, -0.22, 0.48],
      aimRotation: [0.26, -0.12, 0.32],
      reloadPosition: [0, 0, 0],
      reloadRotation: [0, 0, 0],
      actionPosition: [-0.1, 0.12, 0.22],
      actionRotation: [-1.2, 0.2, -1.14],
    },
    flamethrower: {
      hipPosition: [0.62, -0.48, -0.98],
      aimPosition: [0.5, -0.42, -0.86],
      hipRotation: [-0.08, -0.18, 0.03],
      aimRotation: [-0.04, -0.1, 0.02],
      reloadPosition: [0.12, -0.08, 0.06],
      reloadRotation: [-0.2, 0.22, 0.12],
      actionPosition: [0.02, 0.02, 0.12],
      actionRotation: [-0.08, 0.04, 0.02],
    },
    bomb: {
      hipPosition: [0.5, -0.62, -0.7],
      aimPosition: [0.48, -0.58, -0.64],
      hipRotation: [0.3, -0.26, 0.44],
      aimRotation: [0.2, -0.14, 0.28],
      reloadPosition: [0.08, -0.04, 0.02],
      reloadRotation: [-0.3, 0.12, -0.08],
      actionPosition: [-0.06, 0.14, 0.28],
      actionRotation: [-0.92, 0.16, -0.58],
    },
  };

  const AVATAR_POSES = {
    minigun: {
      mountHip: [0.9, 3.26, -0.1],
      mountAim: [0.74, 3.08, -0.38],
      localHip: [0.18, -0.28, -0.62],
      localAim: [0.18, -0.38, -0.5],
      rotationHip: [-0.14, -0.06, 0.04],
      rotationAim: [-0.24, 0.06, 0.02],
      reloadMount: [0.14, -0.2, -0.08],
      reloadRotation: [-0.28, 0.2, 0.16],
    },
    carbine: {
      mountHip: [0.82, 3.2, -0.18],
      mountAim: [0.68, 3.04, -0.34],
      localHip: [0.1, -0.2, -0.34],
      localAim: [0.14, -0.3, -0.24],
      rotationHip: [-0.1, -0.08, 0.02],
      rotationAim: [-0.18, 0.08, 0],
      reloadMount: [0.08, -0.18, -0.06],
      reloadRotation: [-0.18, 0.14, 0.08],
    },
    shotgun: {
      mountHip: [0.86, 3.18, -0.16],
      mountAim: [0.76, 3.08, -0.32],
      localHip: [0.08, -0.22, -0.42],
      localAim: [0.12, -0.3, -0.32],
      rotationHip: [-0.1, -0.08, 0.03],
      rotationAim: [-0.18, 0.06, 0.01],
      reloadMount: [0.08, -0.18, -0.04],
      reloadRotation: [-0.16, 0.12, 0.12],
    },
    knife: {
      mountHip: [0.76, 3.18, -0.22],
      mountAim: [0.72, 3.14, -0.24],
      localHip: [0.06, -0.26, -0.16],
      localAim: [0.08, -0.28, -0.12],
      rotationHip: [0.26, -0.16, 0.34],
      rotationAim: [0.12, -0.08, 0.22],
      reloadMount: [0, 0, 0],
      reloadRotation: [0, 0, 0],
    },
    flamethrower: {
      mountHip: [0.88, 3.18, -0.18],
      mountAim: [0.8, 3.12, -0.22],
      localHip: [0.12, -0.24, -0.38],
      localAim: [0.16, -0.28, -0.3],
      rotationHip: [-0.08, -0.06, 0.04],
      rotationAim: [-0.14, 0.02, 0.02],
      reloadMount: [0.08, -0.14, -0.04],
      reloadRotation: [-0.12, 0.1, 0.08],
    },
    bomb: {
      mountHip: [0.78, 3.18, -0.18],
      mountAim: [0.76, 3.14, -0.2],
      localHip: [0.06, -0.2, -0.02],
      localAim: [0.08, -0.22, 0.02],
      rotationHip: [0.24, -0.18, 0.28],
      rotationAim: [0.18, -0.12, 0.2],
      reloadMount: [0.04, -0.08, 0.02],
      reloadRotation: [-0.1, 0.06, -0.04],
    },
  };

  const MODES = {
    sandbox: "sandbox",
    zombie: "zombie",
    multiplayer: "multiplayer",
  };

  const ZOMBIES = {
    maxAlive: 8,
    maxHealth: 110,
    walkSpeed: 7.2,
    chaseRange: 140,
    attackRange: 4.9,
    attackDamage: 14,
    attackInterval: 1.05,
    spawnInterval: 3.8,
    spawnBurst: 4,
    spawnRadiusMin: 46,
    spawnRadiusMax: 108,
    despawnRange: 190,
  };

  const MULTIPLAYER = {
    syncInterval: 0.1,
    pollInterval: 0.16,
    staleAfter: 8,
    maxHealth: 100,
    respawnGrace: 2.2,
  };

  const HEALING = {
    amount: 45,
    cooldown: 60,
  };

  const MOBILITY = {
    sprintDoubleTapWindow: 0.28,
    slideCooldown: 3,
    slideDuration: 0.58,
    sprintMax: 100,
    sprintDrainPerSecond: 28,
    sprintRecoverPerSecond: 22,
    slideCost: 24,
  };

  const MULTIPLAYER_VARIANTS = {
    pvp: "pvp",
    horde: "horde",
  };

  const CONTROL_SCHEMES = {
    desktop: "desktop",
    pad: "pad",
  };

  const LANGUAGES = {
    en: "en",
    zh: "zh",
  };

  const DEFENSE_PATH_ANGLES = [0, -Math.PI / 2, Math.PI / 2, -Math.PI / 3, Math.PI / 3, Math.PI * 0.82, -Math.PI * 0.82];
  const DEFENSE_PATH_STEP_SCALES = [1, 0.66, 0.36];

  const TRANSLATIONS = {
    en: {
      "common.player": "Player",
      "common.english": "English",
      "common.chinese": "中文",
      "common.desktop": "Desktop",
      "common.pad": "Mobile",
      "common.screenFit": "Screen Fit",
      "menu.eyebrow": "Prototype Build",
      "menu.summary": "Smooth world generation is live. Choose your mode, your controls, and your language before dropping into the arena.",
      "settings.language": "Language",
      "settings.controls": "Controls",
      "settings.sensitivity": "Sensitivity",
      "settings.screenFit": "Screen Fit",
      "screenFit.open": "Adjust Frame",
      "screenFit.title": "Shape your play frame",
      "screenFit.summary": "Drag the box to move it. Pull edges or corners to widen, narrow, raise, or lower the gameplay frame for this control mode.",
      "screenFit.reset": "Reset",
      "screenFit.done": "Done",
      "screenFit.frame.desktop": "Desktop Frame",
      "screenFit.frame.mobile": "Mobile Frame",
      "common.controlFit": "UI Fit",
      "settings.controlFit": "UI",
      "controlFit.open": "Adjust UI",
      "controlFit.title": "Tune your controls and HUD",
      "controlFit.summary": "Tap any button, joystick, status strip, ammo HUD, sprint bar, coordinates, or loadout bar to select it. Drag it anywhere, then use Smaller or Larger until the whole layout fits your phone.",
      "controlFit.reset": "Reset",
      "controlFit.done": "Done",
      "controlFit.smaller": "Smaller",
      "controlFit.larger": "Larger",
      "controlFit.selected": "Selected: {target}",
      "controlFit.target.joystick": "Joystick",
      "controlFit.target.status": "Status HUD",
      "controlFit.target.sprintMeter": "Sprint Bar",
      "controlFit.target.coords": "Coordinates",
      "controlFit.target.loadout": "Loadout Bar",
      "controlFit.target.screenFitButton": "Screen Fit Button",
      "controlFit.target.controlFitButton": "UI Fit Button",
      "modes.single.tag": "Available",
      "modes.single.title": "Single Player",
      "modes.single.description": "Explore the terrain, swap across a full six-slot loadout, and tear through destructible block targets across the world.",
      "modes.zombie.tag": "Hot Zone",
      "modes.zombie.title": "Zombie Mode",
      "modes.zombie.description": "Fight off spawned zombies, track your health, and rotate between rifles, flame streams, bombs, and knife kills before they reach you.",
      "modes.pvp.tag": "Classic",
      "modes.pvp.title": "Multiplayer PvP",
      "modes.pvp.description": "Keep the original online arena with shared players, live movement, and direct player-vs-player fights.",
      "modes.horde.tag": "New",
      "modes.horde.title": "Multiplayer Horde",
      "modes.horde.description": "Join friends in the same arena, survive shared zombie waves, and still watch for rival players in real time.",
      "brand.single.eyebrow": "Single Player",
      "brand.single.summary": "Smooth terrain, reload management, a six-slot loadout, and streamed targets across the world.",
      "brand.zombie.eyebrow": "Zombie Mode",
      "brand.zombie.summary": "Survive incoming zombies with a six-slot loadout: rifles, shotgun, knife, flame stream, and a timed bomb blast.",
      "brand.pvp.eyebrow": "Multiplayer PvP",
      "brand.pvp.summary": "The original online arena is live. Move with friends, duel in real time, and keep the field clear of zombie waves.",
      "brand.horde.eyebrow": "Multiplayer Horde",
      "brand.horde.summary": "Team up in a live room, fight shared zombie waves, and still watch for rival players in the same arena.",
      "panel.desktop.line1": "<kbd>WASD</kbd> move, double-tap <kbd>W</kbd> to sprint, <kbd>Shift</kbd> to slide, <kbd>Space</kbd> jump, mouse to look.",
      "panel.desktop.line2": "<kbd>Mouse 1</kbd> attacks, <kbd>Mouse 2</kbd> aims, <kbd>1-6</kbd> swaps gear, <kbd>R</kbd> reloads guns, <kbd>H</kbd> uses a heal potion, <kbd>Q</kbd> drops your current weapon, <kbd>P</kbd> picks up nearby gear, <kbd>G</kbd> deploys an indestructible wall every 10 seconds, <kbd>B</kbd> opens the shop, and <kbd>V</kbd> swaps first and third person. Press <kbd>Esc</kbd> to pause.",
      "panel.pad.line1": "Use the left joystick to move and the right look zone to aim. Hold Sprint to run, tap Slide to slide, and use the mobile buttons to fire, aim, jump, reload, heal, pick up gear, place walls, and swap view.",
      "panel.pad.line2": "The bottom weapon bar still works in Mobile mode, and the top button will pause or resume your run whenever you need a break.",
      "buttons.resume": "Resume Mission",
      "buttons.respawn": "Respawn",
      "shop.eyebrow": "Field Shop",
      "shop.title": "Weapon Shop",
      "shop.summary": "Buy new guns, then equip them from your loadout once they are in your inventory.",
      "shop.credits": "Credits: {credits}",
      "touch.fire": "Fire",
      "touch.aim": "Aim",
      "touch.jump": "Jump",
      "touch.sprint": "Sprint",
      "touch.slide": "Slide",
      "touch.reload": "Reload",
      "touch.heal": "Heal",
      "touch.view": "View",
      "touch.wall": "Wall",
      "touch.pickup": "Pick Up",
      "boot.controlFitPadOnly": "Switch to Mobile controls to adjust the full touch UI and HUD.",
      "boot.multiplayerNotReady": "Multiplayer session is not ready yet.",
      "boot.sessionExpired": "Multiplayer session expired. Rejoin from menu.",
      "boot.unavailable": "Multiplayer unavailable. Confirm /api endpoints are running.",
      "boot.roomNotFound": "Room not found. Refresh the list or check the private code.",
      "boot.roomWaiting": "Room waiting for players: {current}/{needed}.",
      "boot.roomStarted": "Room is live. Zombie waves are starting.",
      "boot.privateRoomCode": "Private room code: {code}",
      "boot.wallPlaced": "Defense wall deployed.",
      "boot.wallCooldown": "Wall ready in {seconds}s.",
      "boot.wallBlocked": "Need a little more open space to place that wall.",
      "prompt.multiplayerName": "Multiplayer name",
      "prompt.shareCode": "Share this room code",
      "roomBrowser.eyebrow": "Rooms",
      "roomBrowser.title": "Multiplayer Rooms",
      "roomBrowser.summary": "Browse public rooms, create a new match, or join a private room with a code.",
      "roomBrowser.close": "Close",
      "roomBrowser.playerName": "Player Name",
      "roomBrowser.create": "Create Room",
      "roomBrowser.roomName": "Room Name",
      "roomBrowser.roomNamePlaceholder": "Room name",
      "roomBrowser.mode": "Mode",
      "roomBrowser.modePvp": "PvP",
      "roomBrowser.modeHorde": "Zombie Horde",
      "roomBrowser.privacy": "Privacy",
      "roomBrowser.privacyPublic": "Public",
      "roomBrowser.privacyPrivate": "Private",
      "roomBrowser.minPlayers": "Horde Start Players",
      "roomBrowser.createAction": "Create And Join",
      "roomBrowser.privateJoin": "Join Private Room",
      "roomBrowser.codePlaceholder": "ABC123",
      "roomBrowser.joinCode": "Join Code",
      "roomBrowser.publicList": "Public Rooms",
      "roomBrowser.refresh": "Refresh",
      "roomBrowser.empty": "No public rooms yet.",
      "roomBrowser.join": "Join",
      "roomBrowser.privateCode": "Private Code: {code}",
      "roomBrowser.hostedBy": "Host {host}",
      "roomBrowser.players": "{players} players",
      "roomBrowser.waiting": "Waiting {players}/{needed}",
      "roomBrowser.started": "Live",
      "loadout.scope": "Scope {zoom}",
      "loadout.dropped": "Dropped",
      "loadout.melee": "Melee",
      "status.modeMenu": "Mode: Menu",
      "status.modePrefix.single": "Single Player ",
      "status.modePrefix.zombie": "Zombie Mode ",
      "status.modePrefix.pvp": "Multiplayer PvP ",
      "status.modePrefix.horde": "Multiplayer Horde ",
      "status.downed": "Downed",
      "status.reloading": "Reloading",
      "status.aiming": "Aiming",
      "status.scoped": "Scoped",
      "status.focused": "Focused",
      "status.paused": "Paused",
      "status.potionReady": "Potion Ready",
      "status.potionCooldown": "Potion {seconds}s",
      "status.health": "Health: {health} / {max} • {potion}",
      "status.sprint": "Sprint",
      "status.sprintExhausted": "Exhausted",
      "status.playersOnly": "Players: {players} online",
      "status.playersZombies": "Players: {players} online • Zombies: {zombies}",
      "status.zombies": "Zombies: {alive} alive • {down} down",
      "status.zombiesOffline": "Zombies: Offline",
      "status.weapon": "Weapon: {weapon}",
      "status.ammoBlade": "Ammo: Blade Ready",
      "status.ammoRefilling": "Ammo: Refilling {mag} / {reserve}",
      "status.ammo": "Ammo: {mag} / {reserve}",
      "status.respawn": "Respawn in {seconds}s",
      "status.sync": "Sync {hz}Hz",
      "status.waiting": "Waiting",
      "status.roomWaiting": "Room: {players}/{needed} • Waiting",
      "status.pvp": "PvP: {kills} K / {deaths} D • {tail}",
      "status.coop": "Co-op: {zombieKills} zombie kills • PvP {kills} K / {deaths} D • {tail}",
      "status.score": "Score: {kills} kills / {shots} shots",
      "status.hits": "Hits: {hits} / Shots {shots}",
      "status.coords": "X: {x}  Y: {y}  Z: {z}",
      "labels.zombie": "Zombie {id}",
    },
    zh: {
      "common.player": "玩家",
      "common.english": "English",
      "common.chinese": "中文",
      "common.desktop": "电脑",
      "common.pad": "手机模式",
      "common.screenFit": "屏幕适配",
      "menu.eyebrow": "原型版本",
      "menu.summary": "地形生成已经可用了。现在你可以先选模式、设备操作方式和语言，再进入战场。",
      "settings.language": "语言",
      "settings.controls": "操作",
      "settings.sensitivity": "灵敏度",
      "settings.screenFit": "屏幕适配",
      "screenFit.open": "调整画面",
      "screenFit.title": "调整你的游戏画面",
      "screenFit.summary": "拖动画面框可以整体移动。拉边和拉角可以把画面拉宽、压窄、抬高或放低，做出最适合这个操作模式的视角区域。",
      "screenFit.reset": "重置",
      "screenFit.done": "完成",
      "screenFit.frame.desktop": "电脑画面",
      "screenFit.frame.mobile": "手机画面",
      "common.controlFit": "界面调试",
      "settings.controlFit": "界面",
      "controlFit.open": "调整界面",
      "controlFit.title": "调整你的按键和 HUD",
      "controlFit.summary": "按钮、摇杆、状态条、弹药、体力条、坐标、物品栏现在都能调。先点你要改的那一块，再拖到想放的位置，最后用缩小和放大调到最顺手。",
      "controlFit.reset": "重置",
      "controlFit.done": "完成",
      "controlFit.smaller": "缩小",
      "controlFit.larger": "放大",
      "controlFit.selected": "当前：{target}",
      "controlFit.target.joystick": "摇杆",
      "controlFit.target.status": "状态 HUD",
      "controlFit.target.sprintMeter": "体力条",
      "controlFit.target.coords": "坐标",
      "controlFit.target.loadout": "物品栏",
      "controlFit.target.screenFitButton": "屏幕适配按钮",
      "controlFit.target.controlFitButton": "界面调试按钮",
      "modes.single.tag": "可用",
      "modes.single.title": "单人模式",
      "modes.single.description": "探索地形，切换六个武器栏位，并在整个世界里破坏方块目标。",
      "modes.zombie.tag": "高危区",
      "modes.zombie.title": "僵尸模式",
      "modes.zombie.description": "对抗刷新的僵尸，管理生命值，并在步枪、喷火器、炸弹和小刀之间切换。",
      "modes.pvp.tag": "经典",
      "modes.pvp.title": "多人 PvP",
      "modes.pvp.description": "保留原来的联机竞技场，继续和其他玩家实时移动、互相对战。",
      "modes.horde.tag": "新增",
      "modes.horde.title": "多人尸潮",
      "modes.horde.description": "和朋友进入同一个房间，一起打共享僵尸，同时还能提防其他玩家。",
      "brand.single.eyebrow": "单人模式",
      "brand.single.summary": "平滑地形、换弹管理、六栏武器组，以及持续加载的战场目标。",
      "brand.zombie.eyebrow": "僵尸模式",
      "brand.zombie.summary": "用六栏武器组撑过僵尸进攻：步枪、霰弹枪、小刀、喷火器和定时炸弹。",
      "brand.pvp.eyebrow": "多人 PvP",
      "brand.pvp.summary": "经典联机竞技场仍然保留。你可以和朋友实时移动、互相射击，不会刷共享僵尸。",
      "brand.horde.eyebrow": "多人尸潮",
      "brand.horde.summary": "进入实时房间，一起打共享僵尸潮，同时也要注意其他玩家的威胁。",
      "panel.desktop.line1": "<kbd>WASD</kbd> 移动，双击 <kbd>W</kbd> 加速，<kbd>Shift</kbd> 滑铲，<kbd>Space</kbd> 跳跃，鼠标控制视角。",
      "panel.desktop.line2": "<kbd>Mouse 1</kbd> 攻击，<kbd>Mouse 2</kbd> 瞄准，<kbd>1-6</kbd> 切换武器，<kbd>R</kbd> 换弹，<kbd>H</kbd> 使用回血药水，<kbd>Q</kbd> 丢下当前武器，<kbd>P</kbd> 拾取附近武器，<kbd>G</kbd> 每 10 秒搭一个打不坏的墙，<kbd>B</kbd> 打开商店，<kbd>V</kbd> 切换第一/第三人称。按 <kbd>Esc</kbd> 暂停。",
      "panel.pad.line1": "左边摇杆移动，右边触控区域转视角。按住冲刺按钮可以加速，点滑铲按钮可以滑铲，其他手机按钮可以开火、瞄准、跳跃、换弹、回血、拾取地上武器、搭墙和切换视角。",
      "panel.pad.line2": "手机模式下底部武器栏也能直接点，顶部按钮可以随时暂停或继续。",
      "buttons.resume": "继续任务",
      "buttons.respawn": "复活",
      "shop.eyebrow": "战地商店",
      "shop.title": "武器商店",
      "shop.summary": "购买新武器后，就可以从你的武器栏里直接装备。",
      "shop.credits": "点数：{credits}",
      "touch.fire": "开火",
      "touch.aim": "瞄准",
      "touch.jump": "跳跃",
      "touch.sprint": "冲刺",
      "touch.slide": "滑铲",
      "touch.reload": "换弹",
      "touch.heal": "回血",
      "touch.view": "视角",
      "touch.wall": "墙",
      "touch.pickup": "拾取",
      "boot.multiplayerNotReady": "多人会话还没准备好。",
      "boot.sessionExpired": "多人会话已过期，请回到菜单重新进入。",
      "boot.unavailable": "多人不可用，请确认 /api 服务正在运行。",
      "boot.roomNotFound": "没找到这个房间。请刷新列表，或者检查一下房间码。",
      "boot.roomWaiting": "房间还在等人：{current}/{needed}。",
      "boot.roomStarted": "房间开局了，僵尸开始刷新。",
      "boot.privateRoomCode": "私人房码：{code}",
      "boot.wallPlaced": "防御墙已放下。",
      "boot.wallCooldown": "墙还要 {seconds}s 才能再放。",
      "boot.wallBlocked": "这里空间不够，放不了这堵墙。",
      "prompt.multiplayerName": "多人名字",
      "prompt.shareCode": "复制这个房间码",
      "roomBrowser.eyebrow": "房间",
      "roomBrowser.title": "多人房间",
      "roomBrowser.summary": "可以浏览公开房间、创建新房间，或者用房间码加入私人房。",
      "roomBrowser.close": "关闭",
      "roomBrowser.playerName": "玩家名字",
      "roomBrowser.create": "创建房间",
      "roomBrowser.roomName": "房间名",
      "roomBrowser.roomNamePlaceholder": "房间名字",
      "roomBrowser.mode": "模式",
      "roomBrowser.modePvp": "PvP",
      "roomBrowser.modeHorde": "僵尸模式",
      "roomBrowser.privacy": "可见性",
      "roomBrowser.privacyPublic": "公开",
      "roomBrowser.privacyPrivate": "私人",
      "roomBrowser.minPlayers": "尸潮开局人数",
      "roomBrowser.createAction": "创建并加入",
      "roomBrowser.privateJoin": "加入私人房",
      "roomBrowser.codePlaceholder": "ABC123",
      "roomBrowser.joinCode": "房间码加入",
      "roomBrowser.publicList": "公开房间",
      "roomBrowser.refresh": "刷新",
      "roomBrowser.empty": "现在还没有公开房间。",
      "roomBrowser.join": "加入",
      "roomBrowser.privateCode": "私人房码：{code}",
      "roomBrowser.hostedBy": "房主 {host}",
      "roomBrowser.players": "{players} 人",
      "roomBrowser.waiting": "等待 {players}/{needed}",
      "roomBrowser.started": "进行中",
      "loadout.scope": "镜 {zoom}",
      "loadout.dropped": "已丢下",
      "loadout.melee": "近战",
      "status.modeMenu": "模式：菜单",
      "status.modePrefix.single": "单人 ",
      "status.modePrefix.zombie": "僵尸模式 ",
      "status.modePrefix.pvp": "多人 PvP ",
      "status.modePrefix.horde": "多人尸潮 ",
      "status.downed": "倒地",
      "status.reloading": "换弹中",
      "status.aiming": "瞄准中",
      "status.scoped": "开镜中",
      "status.focused": "聚焦中",
      "status.paused": "已暂停",
      "status.potionReady": "药水可用",
      "status.potionCooldown": "药水 {seconds}s",
      "status.health": "生命：{health} / {max} • {potion}",
      "status.sprint": "体力",
      "status.sprintExhausted": "力竭",
      "status.playersOnly": "玩家：{players} 在线",
      "status.playersZombies": "玩家：{players} 在线 • 僵尸：{zombies}",
      "status.zombies": "僵尸：{alive} 存活 • {down} 击杀",
      "status.zombiesOffline": "僵尸：关闭",
      "status.weapon": "武器：{weapon}",
      "status.ammoBlade": "弹药：刀已就绪",
      "status.ammoRefilling": "弹药：装填中 {mag} / {reserve}",
      "status.ammo": "弹药：{mag} / {reserve}",
      "status.respawn": "{seconds}s 后复活",
      "status.sync": "同步 {hz}Hz",
      "status.waiting": "等待中",
      "status.roomWaiting": "房间：{players}/{needed} • 等待中",
      "status.pvp": "PvP：{kills} 杀 / {deaths} 死 • {tail}",
      "status.coop": "合作：{zombieKills} 僵尸击杀 • PvP {kills} 杀 / {deaths} 死 • {tail}",
      "status.score": "分数：{kills} 击杀 / {shots} 发子弹",
      "status.hits": "命中：{hits} / 子弹 {shots}",
      "status.coords": "X: {x}  Y: {y}  Z: {z}",
      "labels.zombie": "僵尸 {id}",
    },
  };

  const menuScreen = document.getElementById("menuScreen");
  const menuEyebrow = document.getElementById("menuEyebrow");
  const menuSummary = document.getElementById("menuSummary");
  const languageLabel = document.getElementById("languageLabel");
  const controlLabel = document.getElementById("controlLabel");
  const sensitivityLabel = document.getElementById("sensitivityLabel");
  const sensitivityValue = document.getElementById("sensitivityValue");
  const screenFitLabel = document.getElementById("screenFitLabel");
  const controlFitLabel = document.getElementById("controlFitLabel");
  const languageEnButton = document.getElementById("languageEnButton");
  const languageZhButton = document.getElementById("languageZhButton");
  const controlDesktopButton = document.getElementById("controlDesktopButton");
  const controlPadButton = document.getElementById("controlPadButton");
  const sensitivityDownButton = document.getElementById("sensitivityDownButton");
  const sensitivityUpButton = document.getElementById("sensitivityUpButton");
  const screenFitOpenButton = document.getElementById("screenFitOpenButton");
  const controlFitOpenButton = document.getElementById("controlFitOpenButton");
  const singlePlayerButton = document.getElementById("singlePlayerButton");
  const zombieModeButton = document.getElementById("zombieModeButton");
  const multiplayerPvpButton = document.getElementById("multiplayerPvpButton");
  const multiplayerHordeButton = document.getElementById("multiplayerHordeButton");
  const singlePlayerTag = document.getElementById("singlePlayerTag");
  const singlePlayerTitle = document.getElementById("singlePlayerTitle");
  const singlePlayerDescription = document.getElementById("singlePlayerDescription");
  const zombieModeTag = document.getElementById("zombieModeTag");
  const zombieModeTitle = document.getElementById("zombieModeTitle");
  const zombieModeDescription = document.getElementById("zombieModeDescription");
  const multiplayerPvpTag = document.getElementById("multiplayerPvpTag");
  const multiplayerPvpTitle = document.getElementById("multiplayerPvpTitle");
  const multiplayerPvpDescription = document.getElementById("multiplayerPvpDescription");
  const multiplayerHordeTag = document.getElementById("multiplayerHordeTag");
  const multiplayerHordeTitle = document.getElementById("multiplayerHordeTitle");
  const multiplayerHordeDescription = document.getElementById("multiplayerHordeDescription");
  const roomBrowser = document.getElementById("roomBrowser");
  const roomBrowserEyebrow = document.getElementById("roomBrowserEyebrow");
  const roomBrowserTitle = document.getElementById("roomBrowserTitle");
  const roomBrowserSummary = document.getElementById("roomBrowserSummary");
  const roomBrowserCloseButton = document.getElementById("roomBrowserCloseButton");
  const roomPlayerNameLabel = document.getElementById("roomPlayerNameLabel");
  const roomPlayerNameInput = document.getElementById("roomPlayerNameInput");
  const roomCreateLabel = document.getElementById("roomCreateLabel");
  const roomCreatedCodeReadout = document.getElementById("roomCreatedCodeReadout");
  const roomNameInput = document.getElementById("roomNameInput");
  const roomModeLabel = document.getElementById("roomModeLabel");
  const roomModeSelect = document.getElementById("roomModeSelect");
  const roomPrivacyLabel = document.getElementById("roomPrivacyLabel");
  const roomPrivacySelect = document.getElementById("roomPrivacySelect");
  const roomMinPlayersLabel = document.getElementById("roomMinPlayersLabel");
  const roomMinPlayersInput = document.getElementById("roomMinPlayersInput");
  const roomCreateButton = document.getElementById("roomCreateButton");
  const roomPrivateJoinLabel = document.getElementById("roomPrivateJoinLabel");
  const roomCodeInput = document.getElementById("roomCodeInput");
  const roomJoinCodeButton = document.getElementById("roomJoinCodeButton");
  const roomPublicListLabel = document.getElementById("roomPublicListLabel");
  const roomRefreshButton = document.getElementById("roomRefreshButton");
  const roomList = document.getElementById("roomList");
  const roomListEmpty = document.getElementById("roomListEmpty");
  const panel = document.getElementById("panel");
  const statusHud = document.getElementById("statusHud");
  const instructionLine1 = document.getElementById("instructionLine1");
  const instructionLine2 = document.getElementById("instructionLine2");
  const shopPanel = document.getElementById("shopPanel");
  const shopGrid = document.getElementById("shopGrid");
  const shopCredits = document.getElementById("shopCredits");
  const shopEyebrow = document.getElementById("shopEyebrow");
  const shopTitle = document.getElementById("shopTitle");
  const shopSummary = document.getElementById("shopSummary");
  const startButton = document.getElementById("startButton");
  const screenFitPauseButton = document.getElementById("screenFitPauseButton");
  const controlFitPauseButton = document.getElementById("controlFitPauseButton");
  const brandEyebrow = document.getElementById("brandEyebrow");
  const brandSummary = document.getElementById("brandSummary");
  const modeReadout = document.getElementById("modeReadout");
  const healthReadout = document.getElementById("healthReadout");
  const zombieReadout = document.getElementById("zombieReadout");
  const weaponReadout = document.getElementById("weaponReadout");
  const ammoReadout = document.getElementById("ammoReadout");
  const hitsReadout = document.getElementById("hitsReadout");
  const sprintMeter = document.getElementById("sprintMeter");
  const sprintMeterLabel = document.getElementById("sprintMeterLabel");
  const sprintMeterValue = document.getElementById("sprintMeterValue");
  const sprintMeterFill = document.getElementById("sprintMeterFill");
  const coordsReadout = document.getElementById("coordsReadout");
  const loadoutBar = document.getElementById("loadoutBar");
  const touchUi = document.getElementById("touchUi");
  const touchLookArea = document.getElementById("touchLookArea");
  const touchJoystick = document.getElementById("touchJoystick");
  const touchJoystickBase = touchJoystick.querySelector(".touch-joystick__base");
  const touchJoystickStick = document.getElementById("touchJoystickStick");
  const touchFireButton = document.getElementById("touchFireButton");
  const touchAimButton = document.getElementById("touchAimButton");
  const touchJumpButton = document.getElementById("touchJumpButton");
  const touchSprintButton = document.getElementById("touchSprintButton");
  const touchSlideButton = document.getElementById("touchSlideButton");
  const touchReloadButton = document.getElementById("touchReloadButton");
  const touchHealButton = document.getElementById("touchHealButton");
  const touchViewButton = document.getElementById("touchViewButton");
  const touchWallButton = document.getElementById("touchWallButton");
  const touchPickupButton = document.getElementById("touchPickupButton");
  const screenFitHudButton = document.getElementById("screenFitHudButton");
  const controlFitHudButton = document.getElementById("controlFitHudButton");
  const screenFitEditor = document.getElementById("screenFitEditor");
  const screenFitEyebrow = document.getElementById("screenFitEyebrow");
  const screenFitTitle = document.getElementById("screenFitTitle");
  const screenFitSummary = document.getElementById("screenFitSummary");
  const screenFitResetButton = document.getElementById("screenFitResetButton");
  const screenFitDoneButton = document.getElementById("screenFitDoneButton");
  const screenFitStage = document.getElementById("screenFitStage");
  const screenFitFrame = document.getElementById("screenFitFrame");
  const screenFitFrameLabel = document.getElementById("screenFitFrameLabel");
  const screenFitHandles = Array.from(screenFitFrame.querySelectorAll("[data-handle]"));
  const controlFitEditor = document.getElementById("controlFitEditor");
  const controlFitEyebrow = document.getElementById("controlFitEyebrow");
  const controlFitTitle = document.getElementById("controlFitTitle");
  const controlFitSummary = document.getElementById("controlFitSummary");
  const controlFitSelectedLabel = document.getElementById("controlFitSelectedLabel");
  const controlFitSmallerButton = document.getElementById("controlFitSmallerButton");
  const controlFitLargerButton = document.getElementById("controlFitLargerButton");
  const controlFitResetButton = document.getElementById("controlFitResetButton");
  const controlFitDoneButton = document.getElementById("controlFitDoneButton");
  const scopeOverlay = document.getElementById("scopeOverlay");
  const scopeLabel = scopeOverlay.querySelector(".scope-overlay__label");
  const sound = createSoundEngine();

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);
  renderer.domElement.className = "game-canvas";

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc7e7ff);
  scene.fog = new THREE.Fog(0xc7e7ff, 130, 370);

  const camera = new THREE.PerspectiveCamera(
    PLAYER.baseFov,
    window.innerWidth / window.innerHeight,
    0.1,
    800
  );
  camera.rotation.order = "YXZ";
  scene.add(camera);

  const hemiLight = new THREE.HemisphereLight(0xf1fbff, 0x4f694a, 1.7);
  hemiLight.position.set(0, 120, 0);
  scene.add(hemiLight);

  const sun = new THREE.DirectionalLight(0xfff2d6, 2.8);
  sun.position.set(-120, 180, 70);
  scene.add(sun);

  const skyGlow = new THREE.Mesh(
    new THREE.SphereGeometry(420, 28, 18),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.13,
      side: THREE.BackSide,
    })
  );
  scene.add(skyGlow);

  const water = new THREE.Mesh(
    new THREE.CircleGeometry(680, 96),
    new THREE.MeshPhongMaterial({
      color: 0x4da3d9,
      transparent: true,
      opacity: 0.34,
      shininess: 70,
    })
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = WORLD.seaLevel;
  scene.add(water);

  const terrainMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.94,
    metalness: 0.02,
  });

  const blockGeometry = new THREE.BoxGeometry(
    BLOCKS.size,
    BLOCKS.size,
    BLOCKS.size
  );
  const blockMaterials = [
    new THREE.MeshStandardMaterial({
      color: 0x7ec95b,
      roughness: 0.86,
      metalness: 0.04,
    }),
    new THREE.MeshStandardMaterial({
      color: 0x55b2ff,
      roughness: 0.74,
      metalness: 0.08,
    }),
    new THREE.MeshStandardMaterial({
      color: 0xffb655,
      roughness: 0.78,
      metalness: 0.05,
    }),
  ];
  const blockSoundProfiles = ["moss", "glass", "crate"];

  const bulletGeometry = new THREE.CylinderGeometry(0.045, 0.045, 0.9, 6);
  bulletGeometry.rotateX(Math.PI / 2);
  const bulletMaterial = new THREE.MeshBasicMaterial({
    color: 0xffdf88,
  });
  const blockDebrisGeometry = new THREE.BoxGeometry(
    BLOCKS.size * 0.48,
    BLOCKS.size * 0.48,
    BLOCKS.size * 0.48
  );
  const flameGeometry = new THREE.SphereGeometry(0.18, 6, 6);
  const flameMaterialTemplate = new THREE.MeshBasicMaterial({
    color: 0xff8a2a,
    transparent: true,
    opacity: 0.85,
  });
  const explosionGeometry = new THREE.SphereGeometry(1, 16, 12);

  const terrainRoot = new THREE.Group();
  const blockRoot = new THREE.Group();
  const solidRoot = new THREE.Group();
  const debrisRoot = new THREE.Group();
  const bulletRoot = new THREE.Group();
  const flameRoot = new THREE.Group();
  const bombRoot = new THREE.Group();
  const explosionRoot = new THREE.Group();
  const pickupRoot = new THREE.Group();
  const zombieRoot = new THREE.Group();
  const remotePlayerRoot = new THREE.Group();
  scene.add(terrainRoot);
  scene.add(blockRoot);
  scene.add(solidRoot);
  scene.add(debrisRoot);
  scene.add(bulletRoot);
  scene.add(flameRoot);
  scene.add(bombRoot);
  scene.add(explosionRoot);
  scene.add(pickupRoot);
  scene.add(zombieRoot);
  scene.add(remotePlayerRoot);

  const viewWeapons = LOADOUT.map(function (weaponConfig) {
    const model = createWeaponModel(weaponConfig.type, false);
    model.group.visible = false;
    camera.add(model.group);
    return model;
  });
  const playerAvatar = createPlayerAvatar();
  const avatarWeapons = LOADOUT.map(function (weaponConfig) {
    const model = createWeaponModel(weaponConfig.type, true);
    model.group.visible = false;
    playerAvatar.weaponMount.add(model.group);
    return model;
  });
  scene.add(playerAvatar.group);

  let weapon = viewWeapons[0];
  let avatarWeapon = avatarWeapons[0];

  const noise = createNoise(20260414);
  const raycaster = new THREE.Raycaster();
  const activeChunks = new Map();
  const pooledChunks = [];
  const buildQueue = [];
  const queuedKeys = new Set();
  const activeBlockMeshes = [];
  const destroyedBlocks = new Set();
  const dynamicBlocks = [];
  const debrisPieces = [];
  const pooledDebris = [];
  const bullets = [];
  const pooledBullets = [];
  const flames = [];
  const pooledFlames = [];
  const bombs = [];
  const pooledBombs = [];
  const explosions = [];
  const pooledExplosions = [];
  const droppedWeapons = [];
  const activeZombies = [];
  const zombieHitMeshes = [];
  const remotePlayers = new Map();
  const remotePlayerHitMeshes = [];
  const solidObstacles = [];
  const solidObstacleMap = new Map();
  const solidObstacleMeshes = [];
  const localDefenseWalls = new Map();
  const multiplayerWalls = new Map();
  const defenseDecorMeshes = [];

  const moveInput = new THREE.Vector3();
  const moveForward = new THREE.Vector3();
  const moveRight = new THREE.Vector3();
  const shotDirection = new THREE.Vector3();
  const shotRight = new THREE.Vector3();
  const shotUp = new THREE.Vector3();
  const bulletSpawnPosition = new THREE.Vector3();
  const bulletForwardAxis = new THREE.Vector3(0, 0, 1);
  const weaponTargetPosition = new THREE.Vector3();
  const weaponTargetRotation = new THREE.Euler();
  const cameraAimPoint = new THREE.Vector3();
  const cameraDesiredPosition = new THREE.Vector3();
  const cameraDirection = new THREE.Vector3();
  const cameraRight = new THREE.Vector3();
  const cameraEuler = new THREE.Euler(0, 0, 0, "YXZ");
  const avatarTargetPosition = new THREE.Vector3();
  const shotTargetPoint = new THREE.Vector3();
  const meleeOrigin = new THREE.Vector3();
  const meleeTarget = new THREE.Vector3();
  const meleeToTarget = new THREE.Vector3();
  const flameOrigin = new THREE.Vector3();
  const flameDirection = new THREE.Vector3();
  const flameDrift = new THREE.Vector3();
  const effectOffset = new THREE.Vector3();
  const supportProbe = new THREE.Vector3();
  const physicsImpulse = new THREE.Vector3();
  const dropDirection = new THREE.Vector3();
  const pickupProbe = new THREE.Vector3();
  const impactCenter = new THREE.Vector3();
  const impactVector = new THREE.Vector3();
  const blastCenter = new THREE.Vector3();
  const blastVector = new THREE.Vector3();
  const zombieToPlayer = new THREE.Vector3();
  const zombieSpawnPosition = new THREE.Vector3();
  const buildDirection = new THREE.Vector3();
  const slideDirection = new THREE.Vector3();
  const touchMoveVector = new THREE.Vector2();

  const controls = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jumpQueued: false,
    shooting: false,
    aiming: false,
  };

  const player = {
    position: new THREE.Vector3(0, sampleHeight(0, 0) + PLAYER.height, 0),
    velocity: new THREE.Vector3(),
    yaw: 0,
    pitch: -0.12,
    grounded: false,
  };

  let lastChunkX = Number.NaN;
  let lastChunkZ = Number.NaN;
  let pointerLocked = false;
  let singlePlayerStarted = false;
  let lastTime = performance.now();
  let selectedWeaponIndex = 0;
  const ownedWeapons = LOADOUT.map(function () {
    return true;
  });
  const weaponStates = LOADOUT.map(function (weaponConfig) {
    return {
      ammoInMag: weaponConfig.magazineSize,
      reserveAmmo: weaponConfig.reserveAmmoStart,
      heat: 0,
    };
  });
  let weaponCooldown = 0;
  let weaponHeat = 0;
  let reloadTimer = 0;
  let isReloading = false;
  let ammoInMag = weaponStates[0].ammoInMag;
  let reserveAmmo = weaponStates[0].reserveAmmo;
  let totalHits = 0;
  let totalShots = 0;
  let muzzleFlashLife = 0;
  let barrelSpin = 0;
  let recoilKick = 0;
  let weaponAction = 0;
  let aimWeight = 0;
  let bobTime = 0;
  let cameraFov = PLAYER.baseFov;
  let cameraSlideOffset = 0;
  let emptySoundCooldown = 0;
  let stepTimer = 0;
  let movementSpeed = 0;
  let thirdPersonEnabled = false;
  let currentMode = MODES.sandbox;
  let playerHealth = PLAYER.maxHealth;
  let playerDamageCooldown = 0;
  let playerIsDead = false;
  let zombieSpawnTimer = ZOMBIES.spawnInterval;
  let zombieId = 0;
  let zombieKills = 0;
  let multiplayerPlayerId = "";
  let multiplayerPlayerName = "";
  let multiplayerVariant = MULTIPLAYER_VARIANTS.pvp;
  let multiplayerSyncTimer = 0;
  let multiplayerPollTimer = 0;
  let multiplayerSyncInFlight = false;
  let multiplayerPollInFlight = false;
  let multiplayerRespawnInFlight = false;
  let multiplayerHealInFlight = false;
  let multiplayerBuildWallInFlight = false;
  let multiplayerKills = 0;
  let multiplayerDeaths = 0;
  let multiplayerRespawnAt = 0;
  let multiplayerRoomId = "";
  let multiplayerRoomName = "";
  let multiplayerRoomCode = "";
  let multiplayerRoomPrivate = false;
  let multiplayerRoomStarted = true;
  let multiplayerRoomMinPlayers = 1;
  let multiplayerRoomPlayerCount = 0;
  let multiplayerRoomWaitingForPlayers = 0;
  let roomBrowserOpen = false;
  let roomBrowserRooms = [];
  let roomBrowserPreferredVariant = MULTIPLAYER_VARIANTS.pvp;
  let healingPotionReadyAt = 0;
  let wallBuildReadyAt = 0;
  let defenseWallSerial = 0;
  let lastForwardTapAt = -10;
  let slideCooldownReadyAt = 0;
  let slideActiveUntil = 0;
  let sprintEnergy = MOBILITY.sprintMax;
  let sprintExhausted = false;
  const LOOK_SENSITIVITY_STORAGE_KEY = "fighterArena.lookSensitivity.v1";
  const LOOK_SENSITIVITY_MIN = 0.45;
  const LOOK_SENSITIVITY_MAX = 1.9;
  const LOOK_SENSITIVITY_STEP = 0.1;
  const prefersMobileControls =
    (navigator.maxTouchPoints || 0) > 0 &&
    Math.min(window.innerWidth, window.innerHeight) <= 980;
  let selectedControlScheme = prefersMobileControls
    ? CONTROL_SCHEMES.pad
    : CONTROL_SCHEMES.desktop;
  let selectedLanguage =
    navigator.language && navigator.language.toLowerCase().startsWith("zh")
      ? LANGUAGES.zh
      : LANGUAGES.en;
  let lookSensitivity = loadLookSensitivity();
  const loadoutButtons = [];
  const touchMoveState = {
    active: false,
    pointerId: null,
    centerX: 0,
    centerY: 0,
    radius: 44,
  };
  const touchLookState = {
    active: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
  };
  const SCREEN_FIT_STORAGE_KEY = "fighterArena.screenFit.v1";
  const SCREEN_FIT_LIMITS = {
    minWidth: 280,
    minHeight: 220,
  };
  const SCREEN_FIT_DEFAULTS = {
    desktop: { left: 0, right: 0, top: 0, bottom: 0 },
    pad: { left: 0, right: 0, top: 0, bottom: 0 },
  };
  let screenFitProfiles = loadScreenFitProfiles();
  let screenFitEditorOpen = false;
  let screenFitDragState = null;
  let screenFitShouldResume = false;
  const CONTROL_LAYOUT_STORAGE_KEY = "fighterArena.controlLayout.v1";
  const CONTROL_LAYOUT_DEFAULTS = {
    pad: {
      joystick: { x: 0.12, y: 0.76, size: 1 },
      fire: { x: 0.84, y: 0.14, size: 1 },
      aim: { x: 0.94, y: 0.14, size: 1 },
      jump: { x: 0.84, y: 0.27, size: 1 },
      reload: { x: 0.94, y: 0.27, size: 1 },
      heal: { x: 0.84, y: 0.4, size: 1 },
      view: { x: 0.94, y: 0.4, size: 1 },
      wall: { x: 0.84, y: 0.53, size: 1 },
      pickup: { x: 0.94, y: 0.53, size: 1 },
      sprint: { x: 0.84, y: 0.66, size: 1 },
      slide: { x: 0.94, y: 0.66, size: 1 },
      screenFitButton: { x: 0.78, y: 0.12, size: 1 },
      controlFitButton: { x: 0.9, y: 0.12, size: 1 },
      status: { x: 0.32, y: 0.1, size: 1 },
      sprintMeter: { x: 0.26, y: 0.2, size: 1 },
      coords: { x: 0.14, y: 0.84, size: 1 },
      loadout: { x: 0.5, y: 0.91, size: 1 },
    },
  };
  const CONTROL_LAYOUT_CONFIG = {
    joystick: {
      element: touchJoystick,
      type: "joystick",
      baseWidth: 110,
      baseHeight: 110,
      minScale: 0.72,
      maxScale: 1.85,
      labelKey: "controlFit.target.joystick",
    },
    fire: { element: touchFireButton, type: "button", baseWidth: 82, baseHeight: 50, minScale: 0.72, maxScale: 1.7, labelKey: "touch.fire" },
    aim: { element: touchAimButton, type: "button", baseWidth: 82, baseHeight: 50, minScale: 0.72, maxScale: 1.7, labelKey: "touch.aim" },
    jump: { element: touchJumpButton, type: "button", baseWidth: 82, baseHeight: 50, minScale: 0.72, maxScale: 1.7, labelKey: "touch.jump" },
    reload: { element: touchReloadButton, type: "button", baseWidth: 82, baseHeight: 50, minScale: 0.72, maxScale: 1.7, labelKey: "touch.reload" },
    heal: { element: touchHealButton, type: "button", baseWidth: 82, baseHeight: 50, minScale: 0.72, maxScale: 1.7, labelKey: "touch.heal" },
    view: { element: touchViewButton, type: "button", baseWidth: 82, baseHeight: 50, minScale: 0.72, maxScale: 1.7, labelKey: "touch.view" },
    wall: { element: touchWallButton, type: "button", baseWidth: 82, baseHeight: 50, minScale: 0.72, maxScale: 1.7, labelKey: "touch.wall" },
    pickup: { element: touchPickupButton, type: "button", baseWidth: 82, baseHeight: 50, minScale: 0.72, maxScale: 1.7, labelKey: "touch.pickup" },
    sprint: { element: touchSprintButton, type: "button", baseWidth: 82, baseHeight: 50, minScale: 0.72, maxScale: 1.7, labelKey: "touch.sprint" },
    slide: { element: touchSlideButton, type: "button", baseWidth: 82, baseHeight: 50, minScale: 0.72, maxScale: 1.7, labelKey: "touch.slide" },
    screenFitButton: { element: screenFitHudButton, type: "button", baseWidth: 92, baseHeight: 34, minScale: 0.74, maxScale: 1.8, labelKey: "controlFit.target.screenFitButton" },
    controlFitButton: { element: controlFitHudButton, type: "button", baseWidth: 84, baseHeight: 34, minScale: 0.74, maxScale: 1.8, labelKey: "controlFit.target.controlFitButton" },
    status: { element: statusHud, type: "hud", baseWidth: 620, baseHeight: 96, minScale: 0.58, maxScale: 1.6, labelKey: "controlFit.target.status", widthFraction: 0.9, maxWidth: 860 },
    sprintMeter: { element: sprintMeter, type: "hud", baseWidth: 320, baseHeight: 64, minScale: 0.58, maxScale: 1.7, labelKey: "controlFit.target.sprintMeter", widthFraction: 0.62, maxWidth: 420 },
    coords: { element: coordsReadout, type: "hud", baseWidth: 176, baseHeight: 42, minScale: 0.6, maxScale: 1.8, labelKey: "controlFit.target.coords" },
    loadout: { element: loadoutBar, type: "hud", baseWidth: 760, baseHeight: 122, minScale: 0.52, maxScale: 1.4, labelKey: "controlFit.target.loadout", widthFraction: 0.96, maxWidth: 1100 },
  };
  let controlLayoutProfiles = loadControlLayoutProfiles();
  let controlFitEditorOpen = false;
  let controlFitSelectedKey = "joystick";
  let controlFitDragState = null;
  let controlFitShouldResume = false;

  function formatText(template, values) {
    return String(template || "").replace(/\{(.*?)\}/g, function (_match, key) {
      return Object.prototype.hasOwnProperty.call(values || {}, key)
        ? String(values[key])
        : "";
    });
  }

  function t(key, values) {
    const table = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
    const fallback = TRANSLATIONS.en[key] || key;
    const template = table[key] || fallback;
    return values ? formatText(template, values) : template;
  }

  function getZombieLabel(id) {
    return t("labels.zombie", { id: id });
  }

  function getCurrentMultiplayerVariant() {
    return multiplayerVariant === MULTIPLAYER_VARIANTS.horde
      ? MULTIPLAYER_VARIANTS.horde
      : MULTIPLAYER_VARIANTS.pvp;
  }

  function sanitizeLookSensitivity(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return 1;
    }
    return THREE.MathUtils.clamp(Math.round(numeric * 100) / 100, LOOK_SENSITIVITY_MIN, LOOK_SENSITIVITY_MAX);
  }

  function loadLookSensitivity() {
    try {
      return sanitizeLookSensitivity(localStorage.getItem(LOOK_SENSITIVITY_STORAGE_KEY));
    } catch (_error) {
      return 1;
    }
  }

  function saveLookSensitivity() {
    try {
      localStorage.setItem(LOOK_SENSITIVITY_STORAGE_KEY, String(lookSensitivity));
    } catch (_error) {
      // Ignore storage failures in locked-down browsers.
    }
  }

  function getLookSensitivityPercent() {
    return Math.round(lookSensitivity * 100) + "%";
  }

  function updateSensitivityUi() {
    sensitivityLabel.textContent = t("settings.sensitivity");
    sensitivityDownButton.textContent = "-";
    sensitivityUpButton.textContent = "+";
    sensitivityValue.textContent = getLookSensitivityPercent();
  }

  function adjustLookSensitivity(delta) {
    const next = sanitizeLookSensitivity(lookSensitivity + delta);
    if (Math.abs(next - lookSensitivity) < 0.001) {
      return;
    }
    lookSensitivity = next;
    saveLookSensitivity();
    updateSensitivityUi();
  }

  function cloneScreenFitProfile(profile) {
    return {
      left: Number(profile && profile.left) || 0,
      right: Number(profile && profile.right) || 0,
      top: Number(profile && profile.top) || 0,
      bottom: Number(profile && profile.bottom) || 0,
    };
  }

  function getScreenFitProfileKey() {
    return selectedControlScheme === CONTROL_SCHEMES.pad ? "pad" : "desktop";
  }

  function getDefaultScreenFitProfile(key) {
    return cloneScreenFitProfile(
      SCREEN_FIT_DEFAULTS[key === "pad" ? "pad" : "desktop"]
    );
  }

  function getScreenFitMinRatios() {
    return {
      width: Math.min(0.76, SCREEN_FIT_LIMITS.minWidth / Math.max(window.innerWidth, 1)),
      height: Math.min(0.8, SCREEN_FIT_LIMITS.minHeight / Math.max(window.innerHeight, 1)),
    };
  }

  function sanitizeScreenFitProfile(profile) {
    const next = cloneScreenFitProfile(profile);
    next.left = THREE.MathUtils.clamp(next.left, 0, 0.76);
    next.right = THREE.MathUtils.clamp(next.right, 0, 0.76);
    next.top = THREE.MathUtils.clamp(next.top, 0, 0.76);
    next.bottom = THREE.MathUtils.clamp(next.bottom, 0, 0.76);

    const minRatios = getScreenFitMinRatios();
    const maxHorizontalInset = Math.max(0, 1 - minRatios.width);
    const maxVerticalInset = Math.max(0, 1 - minRatios.height);
    const horizontalTotal = next.left + next.right;
    const verticalTotal = next.top + next.bottom;

    if (horizontalTotal > maxHorizontalInset && horizontalTotal > 0) {
      const scale = maxHorizontalInset / horizontalTotal;
      next.left *= scale;
      next.right *= scale;
    }

    if (verticalTotal > maxVerticalInset && verticalTotal > 0) {
      const scale = maxVerticalInset / verticalTotal;
      next.top *= scale;
      next.bottom *= scale;
    }

    return next;
  }

  function loadScreenFitProfiles() {
    let parsed = null;

    try {
      parsed = JSON.parse(localStorage.getItem(SCREEN_FIT_STORAGE_KEY) || "null");
    } catch (_error) {
      parsed = null;
    }

    return {
      desktop: sanitizeScreenFitProfile(
        parsed && parsed.desktop ? parsed.desktop : SCREEN_FIT_DEFAULTS.desktop
      ),
      pad: sanitizeScreenFitProfile(
        parsed && parsed.pad ? parsed.pad : SCREEN_FIT_DEFAULTS.pad
      ),
    };
  }

  function saveScreenFitProfiles() {
    try {
      localStorage.setItem(SCREEN_FIT_STORAGE_KEY, JSON.stringify(screenFitProfiles));
    } catch (_error) {
      // Ignore storage failures in locked-down browsers.
    }
  }

  function getCurrentScreenFitProfile() {
    const key = getScreenFitProfileKey();
    return screenFitProfiles[key] || getDefaultScreenFitProfile(key);
  }

  function computeScreenFitFrame(profile) {
    const safeProfile = sanitizeScreenFitProfile(profile || getCurrentScreenFitProfile());
    const viewportWidth = Math.max(window.innerWidth, 1);
    const viewportHeight = Math.max(window.innerHeight, 1);
    const left = Math.round(safeProfile.left * viewportWidth);
    const right = Math.round(safeProfile.right * viewportWidth);
    const top = Math.round(safeProfile.top * viewportHeight);
    const bottom = Math.round(safeProfile.bottom * viewportHeight);
    const width = Math.max(1, viewportWidth - left - right);
    const height = Math.max(1, viewportHeight - top - bottom);

    return {
      profile: safeProfile,
      left: left,
      right: right,
      top: top,
      bottom: bottom,
      width: width,
      height: height,
      radius: safeProfile.left + safeProfile.right + safeProfile.top + safeProfile.bottom > 0.02
        ? 22
        : 0,
    };
  }

  function applyScreenFitFrameElement(frame) {
    screenFitFrame.style.left = frame.left + "px";
    screenFitFrame.style.top = frame.top + "px";
    screenFitFrame.style.width = frame.width + "px";
    screenFitFrame.style.height = frame.height + "px";
  }

  function applyScreenFitLayout() {
    const frame = computeScreenFitFrame(getCurrentScreenFitProfile());
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--play-left", frame.left + "px");
    rootStyle.setProperty("--play-right", frame.right + "px");
    rootStyle.setProperty("--play-top", frame.top + "px");
    rootStyle.setProperty("--play-bottom", frame.bottom + "px");
    rootStyle.setProperty("--play-width", frame.width + "px");
    rootStyle.setProperty("--play-height", frame.height + "px");
    rootStyle.setProperty("--play-radius", frame.radius + "px");
    renderer.setSize(frame.width, frame.height, false);
    renderer.domElement.style.left = frame.left + "px";
    renderer.domElement.style.top = frame.top + "px";
    renderer.domElement.style.width = frame.width + "px";
    renderer.domElement.style.height = frame.height + "px";
    renderer.domElement.style.borderRadius = frame.radius + "px";
    camera.aspect = frame.width / frame.height;
    camera.updateProjectionMatrix();

    if (screenFitEditorOpen) {
      applyScreenFitFrameElement(frame);
    }

    applyControlLayout();
  }

  function updateScreenFitCopy() {
    screenFitLabel.textContent = t("settings.screenFit");
    screenFitOpenButton.textContent = t("screenFit.open");
    screenFitPauseButton.textContent = t("common.screenFit");
    screenFitHudButton.textContent = t("common.screenFit");
    screenFitEyebrow.textContent = t("settings.screenFit");
    screenFitTitle.textContent = t("screenFit.title");
    screenFitSummary.textContent = t("screenFit.summary");
    screenFitResetButton.textContent = t("screenFit.reset");
    screenFitDoneButton.textContent = t("screenFit.done");
    screenFitFrameLabel.textContent = selectedControlScheme === CONTROL_SCHEMES.pad
      ? t("screenFit.frame.mobile")
      : t("screenFit.frame.desktop");
  }

  function cloneControlLayoutProfile(profile) {
    const next = {};
    Object.keys(CONTROL_LAYOUT_CONFIG).forEach(function (key) {
      const defaults = CONTROL_LAYOUT_DEFAULTS.pad[key];
      const source = profile && profile[key] ? profile[key] : defaults;
      next[key] = {
        x: Number(source && source.x),
        y: Number(source && source.y),
        size: Number(source && source.size),
      };
      if (!Number.isFinite(next[key].x)) {
        next[key].x = defaults.x;
      }
      if (!Number.isFinite(next[key].y)) {
        next[key].y = defaults.y;
      }
      if (!Number.isFinite(next[key].size)) {
        next[key].size = defaults.size;
      }
    });
    return next;
  }

  function sanitizeControlLayoutProfile(profile) {
    const next = cloneControlLayoutProfile(profile);
    Object.keys(CONTROL_LAYOUT_CONFIG).forEach(function (key) {
      const config = CONTROL_LAYOUT_CONFIG[key];
      next[key].x = THREE.MathUtils.clamp(next[key].x, 0.04, 0.96);
      next[key].y = THREE.MathUtils.clamp(next[key].y, 0.04, 0.96);
      next[key].size = THREE.MathUtils.clamp(next[key].size, config.minScale, config.maxScale);
    });
    return next;
  }

  function loadControlLayoutProfiles() {
    let parsed = null;

    try {
      parsed = JSON.parse(localStorage.getItem(CONTROL_LAYOUT_STORAGE_KEY) || "null");
    } catch (_error) {
      parsed = null;
    }

    return {
      pad: sanitizeControlLayoutProfile(parsed && parsed.pad ? parsed.pad : CONTROL_LAYOUT_DEFAULTS.pad),
    };
  }

  function saveControlLayoutProfiles() {
    try {
      localStorage.setItem(CONTROL_LAYOUT_STORAGE_KEY, JSON.stringify(controlLayoutProfiles));
    } catch (_error) {
      // Ignore storage failures in locked-down browsers.
    }
  }

  function getCurrentControlLayoutProfile() {
    return controlLayoutProfiles.pad || sanitizeControlLayoutProfile(CONTROL_LAYOUT_DEFAULTS.pad);
  }

  function getControlFitTargetName(key) {
    const config = CONTROL_LAYOUT_CONFIG[key];
    return config ? t(config.labelKey) : t("controlFit.target.joystick");
  }

  function updateControlFitSelectionState() {
    Object.keys(CONTROL_LAYOUT_CONFIG).forEach(function (key) {
      CONTROL_LAYOUT_CONFIG[key].element.classList.toggle(
        "is-control-fit-selected",
        controlFitEditorOpen && key === controlFitSelectedKey
      );
    });
    controlFitSelectedLabel.textContent = "";
  }

  function updateControlFitCopy() {
    controlFitLabel.textContent = t("settings.controlFit");
    controlFitOpenButton.textContent = t("controlFit.open");
    controlFitPauseButton.textContent = t("common.controlFit");
    controlFitHudButton.textContent = t("common.controlFit");
    controlFitEyebrow.textContent = "";
    controlFitTitle.textContent = "";
    controlFitSummary.textContent = "";
    controlFitSmallerButton.textContent = t("controlFit.smaller");
    controlFitLargerButton.textContent = t("controlFit.larger");
    controlFitResetButton.textContent = t("controlFit.reset");
    controlFitDoneButton.textContent = t("controlFit.done");
    updateControlFitSelectionState();
  }

  function getControlLayoutBaseWidth(config, frame) {
    const widthFraction = Number(config.widthFraction);
    if (Number.isFinite(widthFraction) && widthFraction > 0) {
      const maxWidth = Number.isFinite(Number(config.maxWidth)) ? Number(config.maxWidth) : frame.width * widthFraction;
      return Math.min(frame.width * widthFraction, maxWidth);
    }
    return config.baseWidth;
  }

  function getControlLayoutBaseHeight(config) {
    return config.baseHeight;
  }

  function getControlLayoutBounds(key, frame, profile) {
    const config = CONTROL_LAYOUT_CONFIG[key];
    const layout = profile[key] || CONTROL_LAYOUT_DEFAULTS.pad[key];
    const size = THREE.MathUtils.clamp(layout.size, config.minScale, config.maxScale);
    const baseWidth = getControlLayoutBaseWidth(config, frame);
    const baseHeight = getControlLayoutBaseHeight(config, frame);
    const width = baseWidth * size;
    const height = baseHeight * size;
    const centerX = THREE.MathUtils.clamp(layout.x * frame.width, width * 0.5, Math.max(width * 0.5, frame.width - width * 0.5));
    const centerY = THREE.MathUtils.clamp(layout.y * frame.height, height * 0.5, Math.max(height * 0.5, frame.height - height * 0.5));

    return {
      size: size,
      width: width,
      height: height,
      baseWidth: baseWidth,
      baseHeight: baseHeight,
      left: frame.left + centerX - width * 0.5,
      top: frame.top + centerY - height * 0.5,
    };
  }

  function applyControlLayout() {
    const frame = computeScreenFitFrame(getCurrentScreenFitProfile());
    const profile = getCurrentControlLayoutProfile();

    Object.keys(CONTROL_LAYOUT_CONFIG).forEach(function (key) {
      const config = CONTROL_LAYOUT_CONFIG[key];
      const bounds = getControlLayoutBounds(key, frame, profile);
      const element = config.element;
      element.style.left = bounds.left + "px";
      element.style.top = bounds.top + "px";
      element.style.right = "auto";
      element.style.bottom = "auto";

      if (config.type === "button" || config.type === "joystick") {
        element.style.position = "absolute";
        element.style.width = bounds.width + "px";
        element.style.height = bounds.height + "px";
        element.style.transform = "";
        element.style.transformOrigin = "";
      } else {
        element.style.position = "fixed";
        element.style.width = bounds.baseWidth + "px";
        element.style.transform = "scale(" + bounds.size + ")";
        element.style.transformOrigin = "top left";
        if (key === "status") {
          element.style.maxWidth = bounds.baseWidth + "px";
        }
        if (key === "loadout") {
          element.style.maxWidth = bounds.baseWidth + "px";
        }
      }

      if (config.type === "button") {
        element.style.minHeight = bounds.height + "px";
        element.style.fontSize = (0.78 * bounds.size).toFixed(3) + "rem";
        element.style.borderRadius = Math.round(18 * bounds.size) + "px";
      }
    });

    const joystickBounds = getControlLayoutBounds("joystick", frame, profile);
    touchJoystickBase.style.width = joystickBounds.width + "px";
    touchJoystickBase.style.height = joystickBounds.height + "px";
    touchJoystickStick.style.width = Math.round(joystickBounds.width * 0.51) + "px";
    touchJoystickStick.style.height = Math.round(joystickBounds.height * 0.51) + "px";
    touchMoveState.radius = Math.max(32, joystickBounds.width * 0.34);

    if (!touchMoveState.active) {
      touchJoystickStick.style.transform = "translate(-50%, -50%)";
    }

    updateControlFitSelectionState();
  }

  function updateCurrentControlLayoutProfile(profile, persist) {
    controlLayoutProfiles.pad = sanitizeControlLayoutProfile(profile);
    if (persist !== false) {
      saveControlLayoutProfiles();
    }
    applyControlLayout();
  }

  function selectControlFitTarget(key) {
    if (!CONTROL_LAYOUT_CONFIG[key]) {
      return;
    }
    controlFitSelectedKey = key;
    updateControlFitSelectionState();
  }

  function openControlFitEditor() {
    if (selectedControlScheme !== CONTROL_SCHEMES.pad) {
      setBootMessage(t("boot.controlFitPadOnly"));
      return;
    }
    if (controlFitEditorOpen) {
      return;
    }
    if (screenFitEditorOpen) {
      closeScreenFitEditor({ resume: false });
    }

    controlFitShouldResume = Boolean(singlePlayerStarted && pointerLocked);
    controlFitEditorOpen = true;
    controlFitEditor.hidden = false;
    controlFitDragState = null;
    selectControlFitTarget(controlFitSelectedKey);

    if (document.pointerLockElement === renderer.domElement) {
      document.exitPointerLock();
    }

    if (pointerLocked) {
      setPlayingState(false);
    } else {
      refreshSessionChrome();
    }

    updateControlFitCopy();
    applyControlLayout();
  }

  function closeControlFitEditor(options) {
    const shouldResume = !options || options.resume !== false;

    if (!controlFitEditorOpen) {
      return;
    }

    controlFitEditorOpen = false;
    controlFitEditor.hidden = true;
    controlFitDragState = null;
    refreshSessionChrome();
    updateControlFitSelectionState();

    if (shouldResume && controlFitShouldResume && singlePlayerStarted && selectedControlScheme === CONTROL_SCHEMES.pad) {
      setPlayingState(true);
    }

    controlFitShouldResume = false;
  }

  function beginControlFitDrag(key, event) {
    if (!controlFitEditorOpen || !CONTROL_LAYOUT_CONFIG[key]) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    selectControlFitTarget(key);

    controlFitDragState = {
      key: key,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startProfile: cloneControlLayoutProfile(getCurrentControlLayoutProfile()),
      frame: computeScreenFitFrame(getCurrentScreenFitProfile()),
      element: CONTROL_LAYOUT_CONFIG[key].element,
    };

    if (controlFitDragState.element.setPointerCapture) {
      controlFitDragState.element.setPointerCapture(event.pointerId);
    }
  }

  function updateControlFitDrag(event) {
    if (!controlFitDragState || event.pointerId !== controlFitDragState.pointerId) {
      return;
    }

    event.preventDefault();
    const next = cloneControlLayoutProfile(controlFitDragState.startProfile);
    const entry = next[controlFitDragState.key];
    entry.x += (event.clientX - controlFitDragState.startX) / Math.max(controlFitDragState.frame.width, 1);
    entry.y += (event.clientY - controlFitDragState.startY) / Math.max(controlFitDragState.frame.height, 1);
    updateCurrentControlLayoutProfile(next, false);
  }

  function endControlFitDrag(event) {
    if (!controlFitDragState || event.pointerId !== controlFitDragState.pointerId) {
      return;
    }

    const element = controlFitDragState.element;
    if (element && element.hasPointerCapture && element.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }

    controlFitDragState = null;
    saveControlLayoutProfiles();
  }

  function adjustSelectedControlFitSize(delta) {
    const config = CONTROL_LAYOUT_CONFIG[controlFitSelectedKey];
    if (!config) {
      return;
    }

    const next = cloneControlLayoutProfile(getCurrentControlLayoutProfile());
    next[controlFitSelectedKey].size = THREE.MathUtils.clamp(
      next[controlFitSelectedKey].size + delta,
      config.minScale,
      config.maxScale
    );
    updateCurrentControlLayoutProfile(next);
  }

  function updateCurrentScreenFitProfile(profile, persist) {
    const key = getScreenFitProfileKey();
    screenFitProfiles[key] = sanitizeScreenFitProfile(profile);
    if (persist !== false) {
      saveScreenFitProfiles();
    }
    applyScreenFitLayout();
  }

  function openScreenFitEditor() {
    if (screenFitEditorOpen) {
      return;
    }

    screenFitShouldResume = Boolean(
      singlePlayerStarted && pointerLocked && selectedControlScheme === CONTROL_SCHEMES.pad
    );
    screenFitEditorOpen = true;
    screenFitEditor.hidden = false;
    screenFitDragState = null;

    if (document.pointerLockElement === renderer.domElement) {
      document.exitPointerLock();
    }

    if (pointerLocked) {
      setPlayingState(false);
    } else {
      refreshSessionChrome();
    }

    updateScreenFitCopy();
    applyScreenFitLayout();
  }

  function closeScreenFitEditor(options) {
    const shouldResume = !options || options.resume !== false;

    if (!screenFitEditorOpen) {
      return;
    }

    screenFitEditorOpen = false;
    screenFitEditor.hidden = true;
    screenFitDragState = null;
    refreshSessionChrome();

    if (
      shouldResume &&
      screenFitShouldResume &&
      singlePlayerStarted &&
      selectedControlScheme === CONTROL_SCHEMES.pad
    ) {
      setPlayingState(true);
    }

    screenFitShouldResume = false;
  }

  function beginScreenFitDrag(handle, event) {
    if (!screenFitEditorOpen) {
      return;
    }

    event.preventDefault();
    screenFitDragState = {
      handle: handle,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startProfile: cloneScreenFitProfile(getCurrentScreenFitProfile()),
    };

    screenFitStage.setPointerCapture(event.pointerId);
  }

  function updateScreenFitDrag(event) {
    if (!screenFitDragState || event.pointerId !== screenFitDragState.pointerId) {
      return;
    }

    event.preventDefault();
    const deltaX = (event.clientX - screenFitDragState.startX) / Math.max(window.innerWidth, 1);
    const deltaY = (event.clientY - screenFitDragState.startY) / Math.max(window.innerHeight, 1);
    const next = cloneScreenFitProfile(screenFitDragState.startProfile);

    if (screenFitDragState.handle === "move") {
      const widthRatio = 1 - next.left - next.right;
      const heightRatio = 1 - next.top - next.bottom;
      const maxLeft = Math.max(0, 1 - widthRatio);
      const maxTop = Math.max(0, 1 - heightRatio);
      next.left = THREE.MathUtils.clamp(next.left + deltaX, 0, maxLeft);
      next.right = Math.max(0, 1 - widthRatio - next.left);
      next.top = THREE.MathUtils.clamp(next.top + deltaY, 0, maxTop);
      next.bottom = Math.max(0, 1 - heightRatio - next.top);
    } else {
      if (screenFitDragState.handle.includes("n")) {
        next.top += deltaY;
      }
      if (screenFitDragState.handle.includes("s")) {
        next.bottom -= deltaY;
      }
      if (screenFitDragState.handle.includes("w")) {
        next.left += deltaX;
      }
      if (screenFitDragState.handle.includes("e")) {
        next.right -= deltaX;
      }
    }

    updateCurrentScreenFitProfile(next, false);
  }

  function endScreenFitDrag(event) {
    if (!screenFitDragState || event.pointerId !== screenFitDragState.pointerId) {
      return;
    }

    if (screenFitStage.hasPointerCapture(event.pointerId)) {
      screenFitStage.releasePointerCapture(event.pointerId);
    }

    screenFitDragState = null;
    saveScreenFitProfiles();
  }

  function refreshSessionChrome() {
    document.body.classList.toggle("is-playing", pointerLocked);
    document.body.classList.toggle("is-screen-fit-editing", screenFitEditorOpen);
    document.body.classList.toggle("is-control-fit-editing", controlFitEditorOpen);
    panel.classList.toggle("is-hidden", pointerLocked || !singlePlayerStarted || screenFitEditorOpen || controlFitEditorOpen);
    const padScheme = selectedControlScheme === CONTROL_SCHEMES.pad;
    const padVisible = singlePlayerStarted && padScheme;
    const controlEditorActive = controlFitEditorOpen && padScheme;
    const mobileControlsActive = padVisible && !screenFitEditorOpen && !controlFitEditorOpen;
    const showTouchUi = mobileControlsActive || controlEditorActive;
    touchUi.hidden = !showTouchUi;
    touchUi.classList.toggle("is-active", showTouchUi);
    document.body.classList.toggle("is-mobile-controls", showTouchUi);
    const fitButtonsVisible = singlePlayerStarted && padScheme && !screenFitEditorOpen;
    screenFitHudButton.classList.toggle("is-hidden", !fitButtonsVisible);
    controlFitHudButton.classList.toggle("is-hidden", !fitButtonsVisible);
  }

  function setPlayingState(active) {
    pointerLocked = Boolean(active);
    refreshSessionChrome();
    if (!pointerLocked) {
      resetControls();
    }
  }

  function updateMenuSelectionUi() {
    languageEnButton.classList.toggle("is-selected", selectedLanguage === LANGUAGES.en);
    languageZhButton.classList.toggle("is-selected", selectedLanguage === LANGUAGES.zh);
    controlDesktopButton.classList.toggle(
      "is-selected",
      selectedControlScheme === CONTROL_SCHEMES.desktop
    );
    controlPadButton.classList.toggle(
      "is-selected",
      selectedControlScheme === CONTROL_SCHEMES.pad
    );
  }

  function updateInstructionCopy() {
    const usePadCopy = selectedControlScheme === CONTROL_SCHEMES.pad;
    instructionLine1.innerHTML = usePadCopy
      ? t("panel.pad.line1")
      : t("panel.desktop.line1");
    instructionLine2.innerHTML = usePadCopy
      ? t("panel.pad.line2")
      : t("panel.desktop.line2");
  }

  function resetMultiplayerRoomInfo() {
    multiplayerRoomId = "";
    multiplayerRoomName = "";
    multiplayerRoomCode = "";
    multiplayerRoomPrivate = false;
    multiplayerRoomStarted = true;
    multiplayerRoomMinPlayers = 1;
    multiplayerRoomPlayerCount = 0;
    multiplayerRoomWaitingForPlayers = 0;
  }

  function applyMultiplayerRoomInfo(roomInfo, options) {
    if (!roomInfo || typeof roomInfo !== "object") {
      return;
    }
    const settings = options || {};
    const wasStarted = multiplayerRoomStarted;
    multiplayerRoomId = String(roomInfo.id || multiplayerRoomId || "");
    multiplayerRoomName = String(roomInfo.name || multiplayerRoomName || "");
    multiplayerRoomCode = String(roomInfo.code || multiplayerRoomCode || "");
    multiplayerRoomPrivate = Boolean(roomInfo.private);
    multiplayerRoomMinPlayers = Math.max(
      1,
      Number.isFinite(Number(roomInfo.minPlayers)) ? Number(roomInfo.minPlayers) : multiplayerRoomMinPlayers || 1
    );
    multiplayerRoomPlayerCount = Math.max(
      0,
      Number.isFinite(Number(roomInfo.playerCount)) ? Number(roomInfo.playerCount) : multiplayerRoomPlayerCount
    );
    multiplayerRoomStarted = Boolean(roomInfo.started);
    multiplayerRoomWaitingForPlayers = Math.max(
      0,
      Number.isFinite(Number(roomInfo.waitingForPlayers))
        ? Number(roomInfo.waitingForPlayers)
        : Math.max(0, multiplayerRoomMinPlayers - multiplayerRoomPlayerCount)
    );

    if (settings.announceTransition && !wasStarted && multiplayerRoomStarted && multiplayerVariant === MULTIPLAYER_VARIANTS.horde) {
      setBootMessage(t("boot.roomStarted"));
    }
  }

  function setRoomBrowserOpen(active) {
    roomBrowserOpen = Boolean(active);
    roomBrowser.classList.toggle("is-hidden", !roomBrowserOpen);
  }

  function updateRoomModeFieldState() {
    const hordeMode = roomModeSelect.value === MULTIPLAYER_VARIANTS.horde;
    roomMinPlayersInput.disabled = !hordeMode;
    if (!hordeMode) {
      roomMinPlayersInput.value = "1";
    } else if (Number(roomMinPlayersInput.value || 0) < 2) {
      roomMinPlayersInput.value = "2";
    }
  }

  function renderRoomBrowserRooms() {
    roomList.replaceChildren();
    if (!roomBrowserRooms.length) {
      roomListEmpty.hidden = false;
      return;
    }
    roomListEmpty.hidden = true;

    roomBrowserRooms.forEach(function (room) {
      const card = document.createElement("div");
      card.className = "room-card";

      const head = document.createElement("div");
      head.className = "room-card__head";

      const name = document.createElement("h3");
      name.className = "room-card__name";
      name.textContent = String(room.name || "Room");

      const tag = document.createElement("span");
      tag.className = "room-card__tag";
      tag.textContent =
        room.variant === MULTIPLAYER_VARIANTS.horde
          ? t("roomBrowser.modeHorde")
          : t("roomBrowser.modePvp");

      head.append(name, tag);

      const meta = document.createElement("div");
      meta.className = "room-card__meta";

      const left = document.createElement("span");
      left.textContent = t("roomBrowser.hostedBy", {
        host: String(room.hostName || t("common.player")),
      });

      const right = document.createElement("span");
      if (room.variant === MULTIPLAYER_VARIANTS.horde && !room.started) {
        right.textContent = t("roomBrowser.waiting", {
          players: Number(room.playerCount || 0),
          needed: Number(room.minPlayers || 1),
        });
      } else {
        right.textContent =
          t("roomBrowser.players", { players: Number(room.playerCount || 0) }) +
          " • " +
          t("roomBrowser.started");
      }

      meta.append(left, right);

      const joinButton = document.createElement("button");
      joinButton.type = "button";
      joinButton.className = "menu-toggle room-card__join";
      joinButton.textContent = t("roomBrowser.join");
      joinButton.addEventListener("click", function () {
        joinRoomById(String(room.id || ""));
      });

      card.append(head, meta, joinButton);
      roomList.append(card);
    });
  }

  async function refreshRoomBrowserRooms() {
    roomRefreshButton.disabled = true;
    try {
      const response = await fetch("/api/multiplayer/rooms", { method: "GET" });
      if (!response.ok) {
        throw new Error("room list failed with status " + response.status);
      }
      const payload = await response.json();
      roomBrowserRooms = Array.isArray(payload.rooms) ? payload.rooms : [];
      renderRoomBrowserRooms();
    } catch (error) {
      console.warn("Room list refresh failed", error);
      roomBrowserRooms = [];
      renderRoomBrowserRooms();
      setBootMessage(t("boot.unavailable"));
    } finally {
      roomRefreshButton.disabled = false;
    }
  }

  function openRoomBrowser(variant) {
    roomBrowserPreferredVariant =
      variant === MULTIPLAYER_VARIANTS.horde ? MULTIPLAYER_VARIANTS.horde : MULTIPLAYER_VARIANTS.pvp;
    roomModeSelect.value = roomBrowserPreferredVariant;
    updateRoomModeFieldState();
    roomCreatedCodeReadout.hidden = true;
    roomCreatedCodeReadout.textContent = "";
    roomCodeInput.value = "";
    if (!roomPlayerNameInput.value.trim()) {
      roomPlayerNameInput.value = multiplayerPlayerName || "";
    }
    setRoomBrowserOpen(true);
    refreshRoomBrowserRooms();
  }

  function closeRoomBrowser() {
    setRoomBrowserOpen(false);
  }

  function getMultiplayerNameFromInput() {
    const typed = String(roomPlayerNameInput.value || "").trim();
    if (typed) {
      return typed;
    }
    const fallbackName = t("common.player") + "-" + Math.floor(Math.random() * 900 + 100);
    roomPlayerNameInput.value = fallbackName;
    return fallbackName;
  }

  async function finalizeRoomJoin(payload, options) {
    const settings = options || {};
    const roomInfo = payload && payload.room ? payload.room : null;
    const playerInfo = payload && payload.player ? payload.player : payload;
    if (!playerInfo || !playerInfo.id) {
      setBootMessage(t("boot.unavailable"));
      return false;
    }

    if (multiplayerPlayerId) {
      leaveMultiplayerSession(false);
      clearRemotePlayers();
    }

    multiplayerPlayerId = String(playerInfo.id || "");
    multiplayerPlayerName = String(playerInfo.name || getMultiplayerNameFromInput());
    multiplayerVariant = String((roomInfo && roomInfo.variant) || playerInfo.variant || MULTIPLAYER_VARIANTS.pvp);
    multiplayerSyncTimer = 0;
    multiplayerPollTimer = 0;
    multiplayerKills = Number.isFinite(Number(playerInfo.kills)) ? Number(playerInfo.kills) : 0;
    multiplayerDeaths = Number.isFinite(Number(playerInfo.deaths)) ? Number(playerInfo.deaths) : 0;
    applyMultiplayerRoomInfo(roomInfo || {}, { announceTransition: false });
    applyMultiplayerSelfState(playerInfo, { forceTransform: true });
    closeRoomBrowser();

    if (multiplayerRoomPrivate && multiplayerRoomCode) {
      roomCreatedCodeReadout.hidden = false;
      roomCreatedCodeReadout.textContent = t("roomBrowser.privateCode", { code: multiplayerRoomCode });
      setBootMessage(t("boot.privateRoomCode", { code: multiplayerRoomCode }));
      if (settings.promptForCode) {
        window.prompt(t("prompt.shareCode"), multiplayerRoomCode);
      }
    } else if (multiplayerVariant === MULTIPLAYER_VARIANTS.horde && !multiplayerRoomStarted) {
      setBootMessage(
        t("boot.roomWaiting", {
          current: multiplayerRoomPlayerCount,
          needed: multiplayerRoomMinPlayers,
        })
      );
    } else {
      setBootMessage("");
    }

    startMode(MODES.multiplayer);
    return true;
  }

  async function createRoomFromBrowser() {
    roomCreateButton.disabled = true;
    try {
      const response = await fetch("/api/multiplayer/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostName: getMultiplayerNameFromInput(),
          roomName: String(roomNameInput.value || "").trim(),
          variant: roomModeSelect.value,
          private: roomPrivacySelect.value === "private",
          minPlayers: Number(roomMinPlayersInput.value || 1),
        }),
      });
      if (!response.ok) {
        throw new Error("room create failed with status " + response.status);
      }
      const payload = await response.json();
      await finalizeRoomJoin(payload, { promptForCode: Boolean(payload.room && payload.room.private) });
    } catch (error) {
      console.error("Room create failed", error);
      setBootMessage(t("boot.unavailable"));
    } finally {
      roomCreateButton.disabled = false;
    }
  }

  async function joinRoomById(roomId) {
    if (!roomId) {
      return;
    }
    try {
      const response = await fetch("/api/multiplayer/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: getMultiplayerNameFromInput(),
          roomId: roomId,
        }),
      });
      if (response.status === 404) {
        setBootMessage(t("boot.roomNotFound"));
        return;
      }
      if (!response.ok) {
        throw new Error("room join failed with status " + response.status);
      }
      const payload = await response.json();
      await finalizeRoomJoin(payload);
    } catch (error) {
      console.error("Room join failed", error);
      setBootMessage(t("boot.unavailable"));
    }
  }

  async function joinRoomByCode() {
    const code = String(roomCodeInput.value || "").trim().toUpperCase();
    if (!code) {
      return;
    }
    try {
      const response = await fetch("/api/multiplayer/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: getMultiplayerNameFromInput(),
          code: code,
        }),
      });
      if (response.status === 404) {
        setBootMessage(t("boot.roomNotFound"));
        return;
      }
      if (!response.ok) {
        throw new Error("private room join failed with status " + response.status);
      }
      const payload = await response.json();
      await finalizeRoomJoin(payload);
    } catch (error) {
      console.error("Private room join failed", error);
      setBootMessage(t("boot.unavailable"));
    }
  }

  function applyLocalizedUi() {
    document.documentElement.lang = selectedLanguage;
    menuEyebrow.textContent = t("menu.eyebrow");
    menuSummary.textContent = t("menu.summary");
    languageLabel.textContent = t("settings.language");
    controlLabel.textContent = t("settings.controls");
    updateSensitivityUi();
    updateScreenFitCopy();
    updateControlFitCopy();
    languageEnButton.textContent = t("common.english");
    languageZhButton.textContent = t("common.chinese");
    controlDesktopButton.textContent = t("common.desktop");
    controlPadButton.textContent = t("common.pad");
    roomBrowserEyebrow.textContent = t("roomBrowser.eyebrow");
    roomBrowserTitle.textContent = t("roomBrowser.title");
    roomBrowserSummary.textContent = t("roomBrowser.summary");
    roomBrowserCloseButton.textContent = t("roomBrowser.close");
    roomPlayerNameLabel.textContent = t("roomBrowser.playerName");
    roomPlayerNameInput.placeholder = t("common.player");
    roomCreateLabel.textContent = t("roomBrowser.create");
    roomNameInput.placeholder = t("roomBrowser.roomNamePlaceholder");
    roomModeLabel.textContent = t("roomBrowser.mode");
    roomModeSelect.options[0].textContent = t("roomBrowser.modePvp");
    roomModeSelect.options[1].textContent = t("roomBrowser.modeHorde");
    roomPrivacyLabel.textContent = t("roomBrowser.privacy");
    roomPrivacySelect.options[0].textContent = t("roomBrowser.privacyPublic");
    roomPrivacySelect.options[1].textContent = t("roomBrowser.privacyPrivate");
    roomMinPlayersLabel.textContent = t("roomBrowser.minPlayers");
    roomCreateButton.textContent = t("roomBrowser.createAction");
    roomPrivateJoinLabel.textContent = t("roomBrowser.privateJoin");
    roomCodeInput.placeholder = t("roomBrowser.codePlaceholder");
    roomJoinCodeButton.textContent = t("roomBrowser.joinCode");
    roomPublicListLabel.textContent = t("roomBrowser.publicList");
    roomRefreshButton.textContent = t("roomBrowser.refresh");
    roomListEmpty.textContent = t("roomBrowser.empty");

    singlePlayerTag.textContent = t("modes.single.tag");
    singlePlayerTitle.textContent = t("modes.single.title");
    singlePlayerDescription.textContent = t("modes.single.description");
    zombieModeTag.textContent = t("modes.zombie.tag");
    zombieModeTitle.textContent = t("modes.zombie.title");
    zombieModeDescription.textContent = t("modes.zombie.description");
    multiplayerPvpTag.textContent = t("modes.pvp.tag");
    multiplayerPvpTitle.textContent = t("modes.pvp.title");
    multiplayerPvpDescription.textContent = t("modes.pvp.description");
    multiplayerHordeTag.textContent = t("modes.horde.tag");
    multiplayerHordeTitle.textContent = t("modes.horde.title");
    multiplayerHordeDescription.textContent = t("modes.horde.description");

    shopEyebrow.textContent = t("shop.eyebrow");
    shopTitle.textContent = t("shop.title");
    shopSummary.textContent = t("shop.summary");
    shopCredits.textContent = t("shop.credits", { credits: 0 });

    touchFireButton.textContent = t("touch.fire");
    touchAimButton.textContent = t("touch.aim");
    touchJumpButton.textContent = t("touch.jump");
    touchSprintButton.textContent = t("touch.sprint");
    touchSlideButton.textContent = t("touch.slide");
    touchReloadButton.textContent = t("touch.reload");
    touchHealButton.textContent = t("touch.heal");
    touchViewButton.textContent = t("touch.view");
    touchPickupButton.textContent = t("touch.pickup");
    touchWallButton.textContent = t("touch.wall");
    sprintMeterLabel.textContent = t("status.sprint");
    startButton.textContent = playerIsDead ? t("buttons.respawn") : t("buttons.resume");

    updateInstructionCopy();
    configureModeUi();
    updateScopeLabel();
    updateLoadoutBar();
    renderRoomBrowserRooms();
  }

  function setLanguage(language) {
    selectedLanguage = language === LANGUAGES.zh ? LANGUAGES.zh : LANGUAGES.en;
    updateMenuSelectionUi();
    applyLocalizedUi();
  }

  function setControlScheme(scheme) {
    selectedControlScheme =
      scheme === CONTROL_SCHEMES.pad ? CONTROL_SCHEMES.pad : CONTROL_SCHEMES.desktop;
    if (selectedControlScheme !== CONTROL_SCHEMES.pad && controlFitEditorOpen) {
      closeControlFitEditor({ resume: false });
    }
    updateMenuSelectionUi();
    updateInstructionCopy();
    applyScreenFitLayout();
    applyControlLayout();
    updateScreenFitCopy();
    updateControlFitCopy();
    if (
      selectedControlScheme === CONTROL_SCHEMES.desktop &&
      document.pointerLockElement !== renderer.domElement
    ) {
      setPlayingState(false);
      return;
    }
    refreshSessionChrome();
  }

  function resetTouchJoystick() {
    touchMoveVector.set(0, 0);
    touchMoveState.active = false;
    touchMoveState.pointerId = null;
    touchJoystickStick.style.transform = "translate(-50%, -50%)";
  }

  function updateTouchJoystick(clientX, clientY) {
    const dx = clientX - touchMoveState.centerX;
    const dy = clientY - touchMoveState.centerY;
    const distance = Math.hypot(dx, dy);
    const clampedDistance = Math.min(distance, touchMoveState.radius);
    const angle = Math.atan2(dy, dx);
    const moveX = Math.cos(angle) * clampedDistance;
    const moveY = Math.sin(angle) * clampedDistance;
    touchJoystickStick.style.transform =
      "translate(calc(-50% + " + moveX + "px), calc(-50% + " + moveY + "px))";
    touchMoveVector.set(moveX / touchMoveState.radius, -moveY / touchMoveState.radius);
  }

  function bindTouchHold(button, onPress, onRelease) {
    button.addEventListener("pointerdown", function (event) {
      if (selectedControlScheme !== CONTROL_SCHEMES.pad || controlFitEditorOpen) {
        return;
      }
      event.preventDefault();
      button.classList.add("is-active");
      onPress();
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (eventName) {
      button.addEventListener(eventName, function () {
        button.classList.remove("is-active");
        onRelease();
      });
    });
  }

  function bindTouchTap(button, onTap) {
    button.addEventListener("pointerdown", function (event) {
      if (selectedControlScheme !== CONTROL_SCHEMES.pad || controlFitEditorOpen) {
        return;
      }
      event.preventDefault();
      button.classList.add("is-active");
      onTap();
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (eventName) {
      button.addEventListener(eventName, function () {
        button.classList.remove("is-active");
      });
    });
  }

  function setupTouchControls() {
    touchJoystick.addEventListener("pointerdown", function (event) {
      if (selectedControlScheme !== CONTROL_SCHEMES.pad || controlFitEditorOpen) {
        return;
      }
      event.preventDefault();
      const rect = touchJoystick.getBoundingClientRect();
      touchMoveState.active = true;
      touchMoveState.pointerId = event.pointerId;
      touchMoveState.centerX = rect.left + rect.width / 2;
      touchMoveState.centerY = rect.top + rect.height / 2;
      touchMoveState.radius = Math.max(32, rect.width * 0.34);
      touchJoystick.setPointerCapture(event.pointerId);
      updateTouchJoystick(event.clientX, event.clientY);
      if (singlePlayerStarted && !pointerLocked) {
        requestWorldPointerLock();
      }
    });

    touchJoystick.addEventListener("pointermove", function (event) {
      if (!touchMoveState.active || event.pointerId !== touchMoveState.pointerId) {
        return;
      }
      event.preventDefault();
      updateTouchJoystick(event.clientX, event.clientY);
    });

    ["pointerup", "pointercancel"].forEach(function (eventName) {
      touchJoystick.addEventListener(eventName, function (event) {
        if (event.pointerId !== touchMoveState.pointerId) {
          return;
        }
        resetTouchJoystick();
      });
    });

    touchLookArea.addEventListener("pointerdown", function (event) {
      if (selectedControlScheme !== CONTROL_SCHEMES.pad || controlFitEditorOpen) {
        return;
      }
      event.preventDefault();
      touchLookState.active = true;
      touchLookState.pointerId = event.pointerId;
      touchLookState.lastX = event.clientX;
      touchLookState.lastY = event.clientY;
      touchLookArea.setPointerCapture(event.pointerId);
      if (singlePlayerStarted && !pointerLocked) {
        requestWorldPointerLock();
      }
    });

    touchLookArea.addEventListener("pointermove", function (event) {
      if (!touchLookState.active || event.pointerId !== touchLookState.pointerId) {
        return;
      }
      event.preventDefault();
      const dx = event.clientX - touchLookState.lastX;
      const dy = event.clientY - touchLookState.lastY;
      touchLookState.lastX = event.clientX;
      touchLookState.lastY = event.clientY;
      const sensitivity = (controls.aiming && !isReloading ? 0.0015 : 0.0023) * lookSensitivity;
      player.yaw -= dx * sensitivity;
      player.pitch -= dy * sensitivity;
      player.pitch = THREE.MathUtils.clamp(
        player.pitch,
        -Math.PI / 2 + 0.08,
        Math.PI / 2 - 0.08
      );
    });

    ["pointerup", "pointercancel"].forEach(function (eventName) {
      touchLookArea.addEventListener(eventName, function (event) {
        if (event.pointerId !== touchLookState.pointerId) {
          return;
        }
        touchLookState.active = false;
        touchLookState.pointerId = null;
      });
    });

    bindTouchHold(touchFireButton, function () {
      controls.shooting = true;
    }, function () {
      controls.shooting = false;
    });
    bindTouchHold(touchAimButton, function () {
      const currentWeapon = getSelectedWeapon();
      if (currentWeapon.supportsAim) {
        controls.aiming = true;
        if (currentWeapon.hasScope) {
          sound.scope(true);
        }
      }
    }, function () {
      if (controls.aiming && getSelectedWeapon().hasScope) {
        sound.scope(false);
      }
      controls.aiming = false;
    });

    bindTouchTap(touchJumpButton, function () {
      controls.jumpQueued = true;
    });
    bindTouchHold(touchSprintButton, function () {
      controls.sprint = true;
    }, function () {
      controls.sprint = false;
    });
    bindTouchTap(touchSlideButton, function () {
      attemptSlide();
    });
    bindTouchTap(touchReloadButton, function () {
      startReload(true);
    });
    bindTouchTap(touchHealButton, function () {
      useHealingPotion();
    });
    bindTouchTap(touchViewButton, function () {
      toggleCameraMode();
    });
    bindTouchTap(touchPickupButton, function () {
      pickUpNearbyWeapon();
    });
    bindTouchTap(touchWallButton, function () {
      attemptBuildDefenseWall();
    });
  }

  function setupControlFitHandles() {
    Object.keys(CONTROL_LAYOUT_CONFIG).forEach(function (key) {
      const element = CONTROL_LAYOUT_CONFIG[key].element;
      element.dataset.controlFitKey = key;
      element.addEventListener("pointerdown", function (event) {
        if (!controlFitEditorOpen) {
          return;
        }
        beginControlFitDrag(key, event);
      });
    });

    ["pointermove", "pointerup", "pointercancel"].forEach(function (eventName) {
      document.addEventListener(eventName, function (event) {
        if (eventName === "pointermove") {
          updateControlFitDrag(event);
          return;
        }
        endControlFitDrag(event);
      });
    });
  }

  function createSolidObstacle(spec) {
    const geometry = new THREE.BoxGeometry(spec.width, spec.height, spec.depth);
    const material = new THREE.MeshStandardMaterial({
      color: spec.color || 0x5c6576,
      roughness: 0.88,
      metalness: spec.kind === "build-wall" || spec.kind === "network-wall" ? 0.12 : 0.04,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(spec.x, spec.y, spec.z);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    mesh.userData.indestructible = true;
    mesh.userData.solidObstacleId = spec.id;
    solidRoot.add(mesh);
    solidObstacleMeshes.push(mesh);

    const obstacle = {
      id: spec.id,
      kind: spec.kind,
      mesh: mesh,
      minX: spec.x - spec.width * 0.5,
      maxX: spec.x + spec.width * 0.5,
      minY: spec.y - spec.height * 0.5,
      maxY: spec.y + spec.height * 0.5,
      minZ: spec.z - spec.depth * 0.5,
      maxZ: spec.z + spec.depth * 0.5,
      width: spec.width,
      height: spec.height,
      depth: spec.depth,
      axis: spec.axis || "x",
    };
    solidObstacleMap.set(spec.id, obstacle);
    solidObstacles.push(obstacle);
    return obstacle;
  }

  function removeSolidObstacle(id) {
    const obstacle = solidObstacleMap.get(id);
    if (!obstacle) {
      return;
    }
    solidObstacleMap.delete(id);
    const listIndex = solidObstacles.indexOf(obstacle);
    if (listIndex !== -1) {
      solidObstacles.splice(listIndex, 1);
    }
    const meshIndex = solidObstacleMeshes.indexOf(obstacle.mesh);
    if (meshIndex !== -1) {
      solidObstacleMeshes.splice(meshIndex, 1);
    }
    solidRoot.remove(obstacle.mesh);
    obstacle.mesh.geometry.dispose();
    obstacle.mesh.material.dispose();
  }

  function upsertSolidObstacle(spec) {
    removeSolidObstacle(spec.id);
    return createSolidObstacle(spec);
  }

  function buildWallSpec(id, x, z, yaw, options) {
    const settings = options || {};
    const forwardX = -Math.sin(yaw);
    const forwardZ = -Math.cos(yaw);
    let centerX = x;
    let centerZ = z;
    let width = DEFENSE.wallWidth;
    let depth = DEFENSE.wallThickness;
    let axis = "x";

    if (Math.abs(forwardX) > Math.abs(forwardZ)) {
      axis = "z";
      centerX += Math.sign(forwardX || 1) * DEFENSE.wallOffset;
      width = DEFENSE.wallThickness;
      depth = DEFENSE.wallWidth;
    } else {
      centerZ += Math.sign(forwardZ || -1) * DEFENSE.wallOffset;
    }

    const height = Number.isFinite(settings.height) ? settings.height : DEFENSE.wallHeight;
    const groundY = sampleHeight(centerX, centerZ);
    return {
      id: id,
      kind: settings.kind || "build-wall",
      x: centerX,
      y: groundY + height * 0.5,
      z: centerZ,
      width: width,
      height: height,
      depth: depth,
      axis: axis,
      color: settings.color || 0x5b6675,
    };
  }

  function overlapsObstacleHeight(feetY, topY, obstacle) {
    return topY > obstacle.minY + 0.02 && feetY < obstacle.maxY - 0.02;
  }

  function collidesWithSolidAt(x, z, feetY, topY, radius, ignoreId) {
    for (let i = 0; i < solidObstacles.length; i += 1) {
      const obstacle = solidObstacles[i];
      if (ignoreId && obstacle.id === ignoreId) {
        continue;
      }
      if (!overlapsObstacleHeight(feetY, topY, obstacle)) {
        continue;
      }
      const nearestX = THREE.MathUtils.clamp(x, obstacle.minX, obstacle.maxX);
      const nearestZ = THREE.MathUtils.clamp(z, obstacle.minZ, obstacle.maxZ);
      const dx = x - nearestX;
      const dz = z - nearestZ;
      if (dx * dx + dz * dz < radius * radius) {
        return true;
      }
    }
    return false;
  }

  function resolveSolidCollisions(position, radius, feetY, topY) {
    let collided = false;
    for (let pass = 0; pass < 4; pass += 1) {
      let pushed = false;
      for (let i = 0; i < solidObstacles.length; i += 1) {
        const obstacle = solidObstacles[i];
        if (!overlapsObstacleHeight(feetY, topY, obstacle)) {
          continue;
        }
        const nearestX = THREE.MathUtils.clamp(position.x, obstacle.minX, obstacle.maxX);
        const nearestZ = THREE.MathUtils.clamp(position.z, obstacle.minZ, obstacle.maxZ);
        const dx = position.x - nearestX;
        const dz = position.z - nearestZ;
        const distanceSq = dx * dx + dz * dz;
        if (distanceSq > 0.000001) {
          const distance = Math.sqrt(distanceSq);
          if (distance >= radius) {
            continue;
          }
          const push = radius - distance + 0.001;
          position.x += (dx / distance) * push;
          position.z += (dz / distance) * push;
          pushed = true;
          collided = true;
          continue;
        }

        const leftGap = Math.abs(position.x - obstacle.minX);
        const rightGap = Math.abs(obstacle.maxX - position.x);
        const frontGap = Math.abs(position.z - obstacle.minZ);
        const backGap = Math.abs(obstacle.maxZ - position.z);
        const smallest = Math.min(leftGap, rightGap, frontGap, backGap);
        if (smallest === leftGap) {
          position.x = obstacle.minX - radius - 0.001;
        } else if (smallest === rightGap) {
          position.x = obstacle.maxX + radius + 0.001;
        } else if (smallest === frontGap) {
          position.z = obstacle.minZ - radius - 0.001;
        } else {
          position.z = obstacle.maxZ + radius + 0.001;
        }
        pushed = true;
        collided = true;
      }
      if (!pushed) {
        break;
      }
    }
    return collided;
  }

  function chooseSteeringStep(currentX, currentZ, targetX, targetZ, stepDistance, radius, feetY, topY) {
    const dx = targetX - currentX;
    const dz = targetZ - currentZ;
    const distance = Math.hypot(dx, dz);
    if (distance <= 0.0001 || stepDistance <= 0) {
      return null;
    }

    const baseX = dx / distance;
    const baseZ = dz / distance;
    let best = null;

    for (let scaleIndex = 0; scaleIndex < DEFENSE_PATH_STEP_SCALES.length; scaleIndex += 1) {
      const scaledStep = stepDistance * DEFENSE_PATH_STEP_SCALES[scaleIndex];
      for (let angleIndex = 0; angleIndex < DEFENSE_PATH_ANGLES.length; angleIndex += 1) {
        const angle = DEFENSE_PATH_ANGLES[angleIndex];
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const dirX = baseX * cosA - baseZ * sinA;
        const dirZ = baseX * sinA + baseZ * cosA;
        const nextX = currentX + dirX * scaledStep;
        const nextZ = currentZ + dirZ * scaledStep;
        if (collidesWithSolidAt(nextX, nextZ, feetY, topY, radius)) {
          continue;
        }
        const score = Math.hypot(targetX - nextX, targetZ - nextZ) + Math.abs(angle) * 2.2 + scaleIndex * 3.5;
        if (!best || score < best.score) {
          best = { score: score, dirX: dirX, dirZ: dirZ, yaw: Math.atan2(-dirX, -dirZ) };
        }
      }
      if (best) {
        break;
      }
    }

    return best;
  }

  function createHouseFloor(config, baseY) {
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(config.width - 2.2, 0.35, config.depth - 2.2),
      new THREE.MeshStandardMaterial({
        color: 0xcbb98f,
        roughness: 0.96,
        metalness: 0.02,
      })
    );
    floor.position.set(config.x, baseY + 0.18, config.z);
    floor.receiveShadow = true;
    solidRoot.add(floor);
    defenseDecorMeshes.push(floor);
  }

  function createStaticStructures() {
    for (let i = 0; i < STATIC_HOUSES.length; i += 1) {
      const house = STATIC_HOUSES[i];
      const baseY = sampleHeight(house.x, house.z);
      const halfW = house.width * 0.5;
      const halfD = house.depth * 0.5;
      const wallHeight = DEFENSE.houseWallHeight;
      const wallY = baseY + wallHeight * 0.5;
      const t = DEFENSE.houseWallThickness;
      createHouseFloor(house, baseY);
      upsertSolidObstacle({
        id: house.id + "-north",
        kind: "house",
        x: house.x,
        y: wallY,
        z: house.z - halfD + t * 0.5,
        width: house.width,
        height: wallHeight,
        depth: t,
        color: 0x8a6844,
      });
      upsertSolidObstacle({
        id: house.id + "-south",
        kind: "house",
        x: house.x,
        y: wallY,
        z: house.z + halfD - t * 0.5,
        width: house.width,
        height: wallHeight,
        depth: t,
        color: 0x8a6844,
      });
      upsertSolidObstacle({
        id: house.id + "-west",
        kind: "house",
        x: house.x - halfW + t * 0.5,
        y: wallY,
        z: house.z,
        width: t,
        height: wallHeight,
        depth: house.depth - t * 2,
        color: 0x79583b,
      });
      upsertSolidObstacle({
        id: house.id + "-east",
        kind: "house",
        x: house.x + halfW - t * 0.5,
        y: wallY,
        z: house.z,
        width: t,
        height: wallHeight,
        depth: house.depth - t * 2,
        color: 0x79583b,
      });
    }
  }

  function clearLocalDefenseWalls() {
    localDefenseWalls.forEach(function (obstacleId) {
      removeSolidObstacle(obstacleId);
    });
    localDefenseWalls.clear();
    wallBuildReadyAt = 0;
  }

  function clearMultiplayerWalls() {
    multiplayerWalls.forEach(function (obstacleId) {
      removeSolidObstacle(obstacleId);
    });
    multiplayerWalls.clear();
  }

  function showWallBuildMessage(key, replacements) {
    setBootMessage(t(key, replacements || {}));
  }

  function canPlaceWallSpec(spec) {
    const tempObstacle = {
      minX: spec.x - spec.width * 0.5,
      maxX: spec.x + spec.width * 0.5,
      minY: spec.y - spec.height * 0.5,
      maxY: spec.y + spec.height * 0.5,
      minZ: spec.z - spec.depth * 0.5,
      maxZ: spec.z + spec.depth * 0.5,
    };

    for (let i = 0; i < solidObstacles.length; i += 1) {
      const obstacle = solidObstacles[i];
      if (
        tempObstacle.maxX + 0.45 <= obstacle.minX ||
        tempObstacle.minX - 0.45 >= obstacle.maxX ||
        tempObstacle.maxZ + 0.45 <= obstacle.minZ ||
        tempObstacle.minZ - 0.45 >= obstacle.maxZ ||
        tempObstacle.maxY <= obstacle.minY ||
        tempObstacle.minY >= obstacle.maxY
      ) {
        continue;
      }
      return false;
    }

    const feetY = player.position.y - PLAYER.height;
    const topY = player.position.y;
    if (collidesWithSolidAt(spec.x, spec.z, feetY, topY, DEFENSE.playerRadius + 0.9)) {
      return false;
    }

    return true;
  }

  function upsertMultiplayerWall(wallInfo) {
    const wallId = String(wallInfo && wallInfo.id ? wallInfo.id : "");
    if (!wallId) {
      return;
    }
    const axis = wallInfo.axis === "z" ? "z" : "x";
    const width = Number.isFinite(Number(wallInfo.width)) ? Number(wallInfo.width) : DEFENSE.wallWidth;
    const thickness = Number.isFinite(Number(wallInfo.thickness)) ? Number(wallInfo.thickness) : DEFENSE.wallThickness;
    const height = Number.isFinite(Number(wallInfo.height)) ? Number(wallInfo.height) : DEFENSE.wallHeight;
    const x = Number.isFinite(Number(wallInfo.x)) ? Number(wallInfo.x) : 0;
    const z = Number.isFinite(Number(wallInfo.z)) ? Number(wallInfo.z) : 0;
    const spec = {
      id: "network-wall:" + wallId,
      kind: "network-wall",
      x: x,
      y: sampleHeight(x, z) + height * 0.5,
      z: z,
      width: axis === "z" ? thickness : width,
      height: height,
      depth: axis === "z" ? width : thickness,
      axis: axis,
      color: 0x56616f,
    };
    upsertSolidObstacle(spec);
    multiplayerWalls.set(wallId, spec.id);
  }

  function syncMultiplayerWalls(walls) {
    const seen = new Set();
    walls.forEach(function (wallInfo) {
      const wallId = String(wallInfo && wallInfo.id ? wallInfo.id : "");
      if (!wallId) {
        return;
      }
      seen.add(wallId);
      upsertMultiplayerWall(wallInfo);
    });
    multiplayerWalls.forEach(function (obstacleId, wallId) {
      if (!seen.has(wallId)) {
        removeSolidObstacle(obstacleId);
        multiplayerWalls.delete(wallId);
      }
    });
  }

  async function requestMultiplayerBuildWall() {
    if (!multiplayerPlayerId || multiplayerBuildWallInFlight || playerIsDead) {
      return;
    }
    const cooldownRemaining = Math.max(0, wallBuildReadyAt - Date.now() / 1000);
    if (cooldownRemaining > 0) {
      showWallBuildMessage("boot.wallCooldown", { seconds: Math.ceil(cooldownRemaining) });
      return;
    }

    multiplayerBuildWallInFlight = true;
    try {
      const response = await fetch("/api/multiplayer/build-wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: multiplayerPlayerId,
          x: player.position.x,
          y: player.position.y,
          z: player.position.z,
          yaw: player.yaw,
        }),
      });
      const payload = await response.json().catch(function () {
        return {};
      });
      if (payload.self) {
        applyMultiplayerSelfState(payload.self);
      }
      if (!response.ok || payload.ok === false) {
        if (payload.error === "cooldown") {
          showWallBuildMessage("boot.wallCooldown", {
            seconds: Math.ceil(Number(payload.cooldownRemaining) || 1),
          });
        } else {
          showWallBuildMessage("boot.wallBlocked");
        }
        return;
      }
      if (payload.wall) {
        upsertMultiplayerWall(payload.wall);
      }
      showWallBuildMessage("boot.wallPlaced");
    } catch (error) {
      console.warn("Multiplayer build wall failed", error);
      showWallBuildMessage("boot.wallBlocked");
    } finally {
      multiplayerBuildWallInFlight = false;
    }
  }

  function attemptBuildDefenseWall() {
    if (!singlePlayerStarted || playerIsDead) {
      return;
    }

    if (currentMode === MODES.multiplayer) {
      requestMultiplayerBuildWall();
      return;
    }

    const nowSeconds = Date.now() / 1000;
    const cooldownRemaining = Math.max(0, wallBuildReadyAt - nowSeconds);
    if (cooldownRemaining > 0) {
      showWallBuildMessage("boot.wallCooldown", { seconds: Math.ceil(cooldownRemaining) });
      return;
    }

    const wallId = "local-wall:" + ++defenseWallSerial;
    const spec = buildWallSpec(wallId, player.position.x, player.position.z, player.yaw, {
      kind: "build-wall",
      color: 0x637182,
    });
    if (!canPlaceWallSpec(spec)) {
      showWallBuildMessage("boot.wallBlocked");
      return;
    }
    upsertSolidObstacle(spec);
    localDefenseWalls.set(wallId, wallId);
    wallBuildReadyAt = nowSeconds + DEFENSE.buildCooldown;
    showWallBuildMessage("boot.wallPlaced");
  }

  async function startMultiplayerVariant(variant) {
    openRoomBrowser(
      variant === MULTIPLAYER_VARIANTS.horde
        ? MULTIPLAYER_VARIANTS.horde
        : MULTIPLAYER_VARIANTS.pvp
    );
  }

  createStaticStructures();
  buildLoadoutBar();
  syncEquippedWeaponModel();
  updateLoadoutBar();
  updateRoomModeFieldState();
  setupTouchControls();
  setupControlFitHandles();
  setLanguage(selectedLanguage);
  setControlScheme(selectedControlScheme);
  applyScreenFitLayout();
  applyControlLayout();
  refreshSessionChrome();

  singlePlayerButton.addEventListener("click", function () {
    startMode(MODES.sandbox);
  });
  zombieModeButton.addEventListener("click", function () {
    startMode(MODES.zombie);
  });
  multiplayerPvpButton.addEventListener("click", function () {
    startMultiplayerVariant(MULTIPLAYER_VARIANTS.pvp);
  });
  multiplayerHordeButton.addEventListener("click", function () {
    startMultiplayerVariant(MULTIPLAYER_VARIANTS.horde);
  });
  roomBrowserCloseButton.addEventListener("click", closeRoomBrowser);
  roomBrowser.addEventListener("click", function (event) {
    if (event.target === roomBrowser) {
      closeRoomBrowser();
    }
  });
  roomRefreshButton.addEventListener("click", refreshRoomBrowserRooms);
  roomCreateButton.addEventListener("click", createRoomFromBrowser);
  roomJoinCodeButton.addEventListener("click", joinRoomByCode);
  roomModeSelect.addEventListener("change", updateRoomModeFieldState);
  roomCodeInput.addEventListener("input", function () {
    roomCodeInput.value = String(roomCodeInput.value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  });
  languageEnButton.addEventListener("click", function () {
    setLanguage(LANGUAGES.en);
  });
  languageZhButton.addEventListener("click", function () {
    setLanguage(LANGUAGES.zh);
  });
  controlDesktopButton.addEventListener("click", function () {
    setControlScheme(CONTROL_SCHEMES.desktop);
  });
  controlPadButton.addEventListener("click", function () {
    setControlScheme(CONTROL_SCHEMES.pad);
  });
  sensitivityDownButton.addEventListener("click", function () {
    adjustLookSensitivity(-LOOK_SENSITIVITY_STEP);
  });
  sensitivityUpButton.addEventListener("click", function () {
    adjustLookSensitivity(LOOK_SENSITIVITY_STEP);
  });
  screenFitOpenButton.addEventListener("click", openScreenFitEditor);
  screenFitPauseButton.addEventListener("click", openScreenFitEditor);
  screenFitHudButton.addEventListener("click", function (event) {
    if (controlFitEditorOpen) {
      event.preventDefault();
      return;
    }
    openScreenFitEditor();
  });
  controlFitOpenButton.addEventListener("click", openControlFitEditor);
  controlFitPauseButton.addEventListener("click", openControlFitEditor);
  controlFitHudButton.addEventListener("click", function (event) {
    if (controlFitEditorOpen) {
      event.preventDefault();
      return;
    }
    openControlFitEditor();
  });
  screenFitResetButton.addEventListener("click", function () {
    updateCurrentScreenFitProfile(getDefaultScreenFitProfile(getScreenFitProfileKey()));
    updateScreenFitCopy();
  });
  screenFitDoneButton.addEventListener("click", function () {
    closeScreenFitEditor();
  });
  controlFitSmallerButton.addEventListener("click", function () {
    adjustSelectedControlFitSize(-0.08);
  });
  controlFitLargerButton.addEventListener("click", function () {
    adjustSelectedControlFitSize(0.08);
  });
  controlFitResetButton.addEventListener("click", function () {
    updateCurrentControlLayoutProfile(CONTROL_LAYOUT_DEFAULTS.pad);
    updateControlFitCopy();
  });
  controlFitDoneButton.addEventListener("click", function () {
    closeControlFitEditor();
  });
  screenFitFrame.addEventListener("pointerdown", function (event) {
    if (event.target !== screenFitFrame) {
      return;
    }
    beginScreenFitDrag("move", event);
  });
  screenFitHandles.forEach(function (handle) {
    handle.addEventListener("pointerdown", function (event) {
      beginScreenFitDrag(handle.dataset.handle || "move", event);
    });
  });
  ["pointermove", "pointerup", "pointercancel"].forEach(function (eventName) {
    screenFitStage.addEventListener(eventName, function (event) {
      if (eventName === "pointermove") {
        updateScreenFitDrag(event);
        return;
      }
      endScreenFitDrag(event);
    });
  });
  window.addEventListener("beforeunload", function () {
    leaveMultiplayerSession(true);
  });
  startButton.addEventListener("click", requestWorldPointerLock);

  renderer.domElement.addEventListener("click", function () {
    if (selectedControlScheme === CONTROL_SCHEMES.desktop && singlePlayerStarted && !pointerLocked) {
      requestWorldPointerLock();
    }
  });

  document.addEventListener("pointerlockchange", function () {
    if (selectedControlScheme !== CONTROL_SCHEMES.desktop) {
      return;
    }
    setPlayingState(document.pointerLockElement === renderer.domElement);
  });

  document.addEventListener("mousemove", function (event) {
    if (!pointerLocked || selectedControlScheme === CONTROL_SCHEMES.pad) {
      return;
    }

    const sensitivity =
      (controls.aiming && !isReloading
        ? PLAYER.lookSpeed * PLAYER.aimLookMultiplier
        : PLAYER.lookSpeed) * lookSensitivity;

    player.yaw -= event.movementX * sensitivity;
    player.pitch -= event.movementY * sensitivity;
    player.pitch = THREE.MathUtils.clamp(
      player.pitch,
      -Math.PI / 2 + 0.08,
      Math.PI / 2 - 0.08
    );
  });

  window.addEventListener("mousedown", function (event) {
    if (!singlePlayerStarted || selectedControlScheme === CONTROL_SCHEMES.pad) {
      return;
    }

    sound.resume();

    if (!pointerLocked) {
      requestWorldPointerLock();
      return;
    }

    if (event.button === 0) {
      controls.shooting = true;
      event.preventDefault();
    }

    if (event.button === 2) {
      const currentWeapon = getSelectedWeapon();
      if (currentWeapon.supportsAim) {
        controls.aiming = true;

        if (currentWeapon.hasScope) {
          sound.scope(true);
        }
      }
      event.preventDefault();
    }
  });

  window.addEventListener("mouseup", function (event) {
    if (event.button === 0) {
      controls.shooting = false;
    }

    if (event.button === 2) {
      if (controls.aiming && getSelectedWeapon().hasScope) {
        sound.scope(false);
      }
      controls.aiming = false;
    }
  });

  window.addEventListener("contextmenu", function (event) {
    if (singlePlayerStarted) {
      event.preventDefault();
    }
  });

  window.addEventListener("keydown", function (event) {
    if (screenFitEditorOpen) {
      if (event.code === "Escape" || event.code === "KeyU") {
        closeScreenFitEditor();
        event.preventDefault();
      }
      return;
    }

    if (controlFitEditorOpen) {
      if (event.code === "Escape" || event.code === "KeyI") {
        closeControlFitEditor();
        event.preventDefault();
      }
      return;
    }

    sound.resume();

    switch (event.code) {
      case "KeyW": {
        const nowSeconds = performance.now() / 1000;
        if (!controls.forward && nowSeconds - lastForwardTapAt <= MOBILITY.sprintDoubleTapWindow) {
          controls.sprint = true;
        }
        lastForwardTapAt = nowSeconds;
        controls.forward = true;
        event.preventDefault();
        break;
      }
      case "KeyS":
        controls.backward = true;
        event.preventDefault();
        break;
      case "KeyA":
        controls.left = true;
        event.preventDefault();
        break;
      case "KeyD":
        controls.right = true;
        event.preventDefault();
        break;
      case "ShiftLeft":
      case "ShiftRight":
        if (!event.repeat) {
          attemptSlide();
        }
        event.preventDefault();
        break;
      case "Space":
        controls.jumpQueued = true;
        event.preventDefault();
        break;
      case "KeyR":
        startReload(true);
        event.preventDefault();
        break;
      case "KeyQ":
        dropSelectedWeapon();
        event.preventDefault();
        break;
      case "KeyP":
        pickUpNearbyWeapon();
        event.preventDefault();
        break;
      case "KeyH":
        useHealingPotion();
        event.preventDefault();
        break;
      case "KeyG":
        attemptBuildDefenseWall();
        event.preventDefault();
        break;
      case "KeyU":
        openScreenFitEditor();
        event.preventDefault();
        break;
      case "KeyI":
        openControlFitEditor();
        event.preventDefault();
        break;
      case "Digit1":
      case "Digit2":
      case "Digit3":
      case "Digit4":
      case "Digit5":
      case "Digit6":
        selectWeapon(Number(event.code.slice(-1)) - 1);
        event.preventDefault();
        break;
      case "KeyV":
        toggleCameraMode();
        event.preventDefault();
        break;
      default:
        break;
    }
  });

  window.addEventListener("keyup", function (event) {
    switch (event.code) {
      case "KeyW":
        controls.forward = false;
        controls.sprint = false;
        break;
      case "KeyS":
        controls.backward = false;
        break;
      case "KeyA":
        controls.left = false;
        break;
      case "KeyD":
        controls.right = false;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        break;
      default:
        break;
    }
  });

  window.addEventListener("blur", resetControls);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      resetControls();
    }
  });

  window.addEventListener("resize", function () {
    applyScreenFitLayout();
    updateScreenFitCopy();
    updateControlFitCopy();
  });

  scheduleChunksAroundPlayer(true);
  animate();

  function getSelectedWeapon() {
    return LOADOUT[selectedWeaponIndex];
  }

  function storeWeaponState() {
    const state = weaponStates[selectedWeaponIndex];
    state.ammoInMag = ammoInMag;
    state.reserveAmmo = reserveAmmo;
    state.heat = weaponHeat;
  }

  function loadWeaponState() {
    const state = weaponStates[selectedWeaponIndex];
    ammoInMag = state.ammoInMag;
    reserveAmmo = state.reserveAmmo;
    weaponHeat = state.heat;
  }

  function resetWeaponStates() {
    for (let i = 0; i < LOADOUT.length; i += 1) {
      ownedWeapons[i] = true;
      weaponStates[i].ammoInMag = LOADOUT[i].magazineSize;
      weaponStates[i].reserveAmmo = LOADOUT[i].reserveAmmoStart;
      weaponStates[i].heat = 0;
    }
  }

  function countOwnedWeapons() {
    let count = 0;

    for (let i = 0; i < ownedWeapons.length; i += 1) {
      if (ownedWeapons[i]) {
        count += 1;
      }
    }

    return count;
  }

  function findNextOwnedWeapon(startIndex) {
    for (let offset = 1; offset <= ownedWeapons.length; offset += 1) {
      const candidate = (startIndex + offset) % ownedWeapons.length;
      if (ownedWeapons[candidate]) {
        return candidate;
      }
    }

    return startIndex;
  }

  function updateScopeLabel() {
    const currentWeapon = getSelectedWeapon();
    scopeLabel.textContent = currentWeapon.hasScope
      ? t("loadout.scope", { zoom: currentWeapon.scopeZoomLabel })
      : currentWeapon.shortLabel;
  }

  function buildLoadoutBar() {
    loadoutBar.replaceChildren();

    for (let i = 0; i < LOADOUT.length; i += 1) {
      const weaponConfig = LOADOUT[i];
      const button = document.createElement("button");
      const index = document.createElement("span");
      const name = document.createElement("span");
      const meta = document.createElement("span");

      button.type = "button";
      button.className = "loadout-slot";
      button.dataset.weaponId = weaponConfig.id;

      index.className = "loadout-slot__index";
      index.textContent = weaponConfig.slot;
      name.className = "loadout-slot__name";
      name.textContent = weaponConfig.shortLabel;
      meta.className = "loadout-slot__meta";

      button.append(index, name, meta);
      button.addEventListener("pointerdown", function (event) {
        if (controlFitEditorOpen) {
          return;
        }
        if (event.pointerType !== "touch" && event.pointerType !== "pen") {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        sound.resume();
        selectWeapon(i);
      });
      button.addEventListener("pointerup", function (event) {
        if (event.pointerType !== "touch" && event.pointerType !== "pen") {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
      });
      button.addEventListener("click", function (event) {
        if (controlFitEditorOpen) {
          return;
        }
        event.stopPropagation();
        sound.resume();
        selectWeapon(i);
      });

      loadoutButtons.push({ button: button, meta: meta });
      loadoutBar.append(button);
    }
  }

  function updateLoadoutBar() {
    for (let i = 0; i < loadoutButtons.length; i += 1) {
      const entry = loadoutButtons[i];
      const weaponConfig = LOADOUT[i];
      const state = weaponStates[i];
      const hasWeapon = ownedWeapons[i];

      entry.button.classList.toggle("is-active", hasWeapon && i === selectedWeaponIndex);
      entry.button.classList.toggle(
        "is-empty",
        !hasWeapon ||
          (!weaponConfig.isMelee &&
            state.ammoInMag === 0 &&
            state.reserveAmmo === 0)
      );
      entry.button.disabled = !hasWeapon;
      entry.meta.textContent = !hasWeapon
        ? t("loadout.dropped")
        : weaponConfig.isMelee
          ? t("loadout.melee")
          : state.ammoInMag + " / " + state.reserveAmmo;
    }
  }

  function syncEquippedWeaponModel() {
    weapon = viewWeapons[selectedWeaponIndex];
    avatarWeapon = avatarWeapons[selectedWeaponIndex];

    for (let i = 0; i < viewWeapons.length; i += 1) {
      viewWeapons[i].group.visible = i === selectedWeaponIndex && !thirdPersonEnabled;
      avatarWeapons[i].group.visible = i === selectedWeaponIndex;
    }

    updateScopeLabel();
    updateLoadoutBar();
  }

  function selectWeapon(index) {
    if (index < 0 || index >= LOADOUT.length || !ownedWeapons[index]) {
      return false;
    }

    if (index === selectedWeaponIndex) {
      updateLoadoutBar();
      return true;
    }

    const previousWeapon = getSelectedWeapon();
    if (controls.aiming && previousWeapon.hasScope) {
      sound.scope(false);
    }

    storeWeaponState();
    selectedWeaponIndex = index;
    loadWeaponState();

    isReloading = false;
    reloadTimer = 0;
    muzzleFlashLife = 0;
    weaponAction = 0;
    barrelSpin = 0;
    recoilKick = 0;
    weaponCooldown = Math.max(weaponCooldown, 0.12);
    controls.aiming = controls.aiming && getSelectedWeapon().supportsAim;
    document.body.classList.remove("is-aiming");

    syncEquippedWeaponModel();
    return true;
  }

  function spawnDroppedWeapon(slotIndex) {
    const weaponConfig = LOADOUT[slotIndex];
    const state = weaponStates[slotIndex];
    const model = createWeaponModel(weaponConfig.type, true);
    const group = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.05, 10, 24),
      new THREE.MeshBasicMaterial({
        color: 0x8df4c8,
        transparent: true,
        opacity: 0.28,
      })
    );

    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.46;
    group.add(ring);
    group.add(model.group);

    model.group.rotation.set(0.26, Math.PI * 0.18, 0.08);
    if (model.flash) {
      model.flash.visible = false;
    }

    group.position.copy(player.position);
    group.position.y -= PLAYER.height - PICKUPS.hoverHeight;

    camera.getWorldDirection(dropDirection);
    dropDirection.y = 0;
    if (dropDirection.lengthSq() === 0) {
      dropDirection.set(0, 0, -1);
    } else {
      dropDirection.normalize();
    }

    group.position.addScaledVector(dropDirection, 3.2);
    group.position.y = Math.max(
      group.position.y,
      sampleHeight(group.position.x, group.position.z) + PICKUPS.hoverHeight + 0.35
    );
    pickupRoot.add(group);

    droppedWeapons.push({
      slotIndex: slotIndex,
      group: group,
      model: model,
      ring: ring,
      velocity: dropDirection.clone().multiplyScalar(PICKUPS.throwSpeed).add(
        new THREE.Vector3(0, 7.5, 0)
      ),
      settled: false,
      hoverTime: Math.random() * Math.PI * 2,
      ammoInMag: state.ammoInMag,
      reserveAmmo: state.reserveAmmo,
      heat: state.heat,
    });
  }

  function updateDroppedWeapons(delta) {
    for (let i = 0; i < droppedWeapons.length; i += 1) {
      const pickup = droppedWeapons[i];
      const groundY =
        sampleHeight(pickup.group.position.x, pickup.group.position.z) +
        PICKUPS.hoverHeight;

      if (!pickup.settled) {
        pickup.velocity.y -= PICKUPS.gravity * delta;
        pickup.group.position.addScaledVector(pickup.velocity, delta);
        pickup.group.rotation.x += delta * 2.8;
        pickup.group.rotation.y += delta * 3.4;

        if (pickup.group.position.y <= groundY) {
          pickup.group.position.y = groundY;

          if (Math.abs(pickup.velocity.y) > 2.2) {
            pickup.velocity.y = Math.abs(pickup.velocity.y) * 0.2;
            pickup.velocity.x *= 0.42;
            pickup.velocity.z *= 0.42;
            sound.dropWeapon();
          } else {
            pickup.velocity.set(0, 0, 0);
            pickup.settled = true;
          }
        }
      } else {
        pickup.hoverTime += delta * 2.4;
        pickup.group.position.y =
          groundY + Math.sin(pickup.hoverTime) * 0.12;
        pickup.group.rotation.y += delta * 1.4;
        pickup.group.rotation.x = THREE.MathUtils.damp(
          pickup.group.rotation.x,
          0.06,
          7,
          delta
        );
        pickup.group.rotation.z = THREE.MathUtils.damp(
          pickup.group.rotation.z,
          0,
          7,
          delta
        );
      }

      if (pickup.model.barrels) {
        pickup.model.barrels.rotation.z += delta * 3;
      }
      if (pickup.model.drum) {
        pickup.model.drum.rotation.x += delta * 1.6;
      }
      if (pickup.ring) {
        pickup.ring.material.opacity = 0.22 + Math.sin(pickup.hoverTime * 2) * 0.06;
      }
    }
  }

  function clearDroppedWeapons() {
    while (droppedWeapons.length > 0) {
      pickupRoot.remove(droppedWeapons[droppedWeapons.length - 1].group);
      droppedWeapons.pop();
    }
  }

  function dropSelectedWeapon() {
    if (!singlePlayerStarted || playerIsDead) {
      return false;
    }

    if (countOwnedWeapons() <= 1) {
      if (emptySoundCooldown === 0) {
        sound.empty();
        emptySoundCooldown = 0.22;
      }
      return false;
    }

    const currentWeapon = getSelectedWeapon();
    if (controls.aiming && currentWeapon.hasScope) {
      sound.scope(false);
    }

    storeWeaponState();
    spawnDroppedWeapon(selectedWeaponIndex);
    ownedWeapons[selectedWeaponIndex] = false;
    controls.aiming = false;
    controls.shooting = false;
    isReloading = false;
    reloadTimer = 0;
    muzzleFlashLife = 0;
    document.body.classList.remove("is-aiming");

    selectedWeaponIndex = findNextOwnedWeapon(selectedWeaponIndex);
    loadWeaponState();
    weaponCooldown = Math.max(weaponCooldown, 0.2);
    syncEquippedWeaponModel();
    sound.dropWeapon();
    return true;
  }

  function pickUpNearbyWeapon() {
    if (!singlePlayerStarted) {
      return false;
    }

    let nearestIndex = -1;
    let bestDistanceSq = PICKUPS.interactDistance * PICKUPS.interactDistance;

    pickupProbe.copy(player.position);
    pickupProbe.y -= PLAYER.height - PICKUPS.hoverHeight;

    for (let i = 0; i < droppedWeapons.length; i += 1) {
      const pickup = droppedWeapons[i];
      const distanceSq =
        pickup.group.position.distanceToSquared(pickupProbe);

      if (distanceSq < bestDistanceSq) {
        nearestIndex = i;
        bestDistanceSq = distanceSq;
      }
    }

    if (nearestIndex === -1) {
      if (emptySoundCooldown === 0) {
        sound.empty();
        emptySoundCooldown = 0.22;
      }
      return false;
    }

    const pickup = droppedWeapons[nearestIndex];
    ownedWeapons[pickup.slotIndex] = true;
    weaponStates[pickup.slotIndex].ammoInMag = pickup.ammoInMag;
    weaponStates[pickup.slotIndex].reserveAmmo = pickup.reserveAmmo;
    weaponStates[pickup.slotIndex].heat = pickup.heat;
    pickupRoot.remove(pickup.group);
    droppedWeapons.splice(nearestIndex, 1);
    updateLoadoutBar();
    sound.pickupWeapon();
    return true;
  }

  function startMode(mode) {
    const multiplayerMode = mode === MODES.multiplayer;
    if (multiplayerMode && !multiplayerPlayerId) {
      setBootMessage(t("boot.multiplayerNotReady"));
      return;
    }

    if (!multiplayerMode) {
      leaveMultiplayerSession(false);
      clearRemotePlayers();
    }

    currentMode = mode;
    sound.resume();

    if (!singlePlayerStarted) {
      singlePlayerStarted = true;
      document.body.classList.add("is-ingame");
      menuScreen.classList.add("is-hidden");
    }

    configureModeUi();
    resetRunState(
      mode === MODES.zombie ||
        (mode === MODES.multiplayer && multiplayerVariant === MULTIPLAYER_VARIANTS.horde)
    );
    if (multiplayerMode) {
      multiplayerSyncTimer = 0;
      multiplayerPollTimer = 0;
    }
    requestWorldPointerLock();
  }

  function configureModeUi() {
    const multiplayerMode = currentMode === MODES.multiplayer;
    const hordeMode = multiplayerMode && multiplayerVariant === MULTIPLAYER_VARIANTS.horde;
    const zombieMode = currentMode === MODES.zombie || hordeMode;
    const pvpMode = multiplayerMode && !hordeMode;
    brandEyebrow.textContent = pvpMode
      ? t("brand.pvp.eyebrow")
      : hordeMode
        ? t("brand.horde.eyebrow")
        : zombieMode
          ? t("brand.zombie.eyebrow")
          : t("brand.single.eyebrow");
    brandSummary.textContent = pvpMode
      ? t("brand.pvp.summary")
      : hordeMode
        ? t("brand.horde.summary")
        : zombieMode
          ? t("brand.zombie.summary")
          : t("brand.single.summary");
    document.body.classList.toggle("is-zombie-mode", zombieMode);
  }

  function resetRunState(resetZombies) {
    player.position.set(0, sampleHeight(0, 0) + PLAYER.height, 0);
    player.velocity.set(0, 0, 0);
    player.grounded = false;
    player.yaw = 0;
    player.pitch = -0.12;
    playerHealth = PLAYER.maxHealth;
    playerDamageCooldown = 1.1;
    playerIsDead = false;
    healingPotionReadyAt = 0;
    wallBuildReadyAt = 0;
    slideActiveUntil = 0;
    slideCooldownReadyAt = 0;
    lastForwardTapAt = -10;
    sprintEnergy = MOBILITY.sprintMax;
    sprintExhausted = false;
    resetWeaponStates();
    selectedWeaponIndex = 0;
    loadWeaponState();
    weaponCooldown = 0;
    weaponHeat = 0;
    reloadTimer = 0;
    isReloading = false;
    muzzleFlashLife = 0;
    recoilKick = 0;
    weaponAction = 0;
    aimWeight = 0;
    bobTime = 0;
    cameraSlideOffset = 0;
    totalHits = 0;
    totalShots = 0;
    stepTimer = 0;
    movementSpeed = 0;
    cameraFov = PLAYER.baseFov;
    controls.aiming = false;
    controls.shooting = false;
    controls.jumpQueued = false;
    startButton.textContent = t("buttons.resume");
    clearDroppedWeapons();
    clearBullets();
    clearLocalDefenseWalls();
    clearMultiplayerWalls();
    clearDynamicBlocks();
    clearDebris();
    clearFlames();
    clearBombs();
    clearExplosions();
    syncEquippedWeaponModel();

    if (resetZombies) {
      clearZombies();
      zombieKills = 0;
      if (currentMode === MODES.zombie) {
        zombieSpawnTimer = 0.8;
        for (let i = 0; i < ZOMBIES.spawnBurst; i += 1) {
          spawnZombieAroundPlayer();
        }
      } else {
        zombieSpawnTimer = ZOMBIES.spawnInterval;
      }
    } else {
      clearZombies();
      zombieSpawnTimer = ZOMBIES.spawnInterval;
    }

    refreshSessionChrome();
  }

  function requestWorldPointerLock() {
    if (!singlePlayerStarted) {
      return;
    }

    sound.resume();

    if (currentMode === MODES.multiplayer && !multiplayerPlayerId) {
      setBootMessage(t("boot.sessionExpired"));
      return;
    }

    if (playerIsDead) {
      if (currentMode === MODES.multiplayer) {
        requestMultiplayerRespawn();
      } else {
        respawnPlayer();
      }
    }

    if (selectedControlScheme === CONTROL_SCHEMES.pad) {
      setPlayingState(true);
      return;
    }

    renderer.domElement.requestPointerLock();
  }

  function toggleCameraMode() {
    thirdPersonEnabled = !thirdPersonEnabled;
    document.body.classList.toggle("is-third-person", thirdPersonEnabled);
  }

  function resetControls() {
    controls.forward = false;
    controls.backward = false;
    controls.left = false;
    controls.right = false;
    controls.sprint = false;
    controls.jumpQueued = false;
    controls.shooting = false;
    controls.aiming = false;
    touchMoveVector.set(0, 0);
    touchLookState.active = false;
    touchLookState.pointerId = null;
    slideActiveUntil = 0;
    resetTouchJoystick();
    document.body.classList.remove("is-aiming");
  }

  function attemptSlide() {
    const nowSeconds = performance.now() / 1000;
    if (!singlePlayerStarted || playerIsDead || !player.grounded || nowSeconds < slideCooldownReadyAt) {
      return;
    }

    if (sprintEnergy < MOBILITY.slideCost) {
      return;
    }

    camera.getWorldDirection(moveForward);
    moveForward.y = 0;
    if (moveForward.lengthSq() === 0) {
      moveForward.set(0, 0, -1);
    } else {
      moveForward.normalize();
    }
    moveRight.crossVectors(moveForward, camera.up).normalize();

    const forwardAmount = Number(controls.forward) - Number(controls.backward) + touchMoveVector.y;
    const strafeAmount = Number(controls.right) - Number(controls.left) + touchMoveVector.x;
    slideDirection.set(0, 0, 0);
    if (forwardAmount !== 0 || strafeAmount !== 0) {
      slideDirection
        .addScaledVector(moveForward, forwardAmount)
        .addScaledVector(moveRight, strafeAmount);
    }
    if (slideDirection.lengthSq() === 0) {
      slideDirection.copy(moveForward);
    } else {
      slideDirection.normalize();
    }

    slideActiveUntil = nowSeconds + MOBILITY.slideDuration;
    slideCooldownReadyAt = nowSeconds + MOBILITY.slideCooldown;
    sprintEnergy = Math.max(0, sprintEnergy - MOBILITY.slideCost);
    if (sprintEnergy === 0) {
      sprintExhausted = true;
    }
    controls.sprint = false;
    player.velocity.x = slideDirection.x * PLAYER.slideSpeed;
    player.velocity.z = slideDirection.z * PLAYER.slideSpeed;
  }

  function respawnPlayer() {
    player.position.set(0, sampleHeight(0, 0) + PLAYER.height, 0);
    player.velocity.set(0, 0, 0);
    player.grounded = false;
    playerHealth = PLAYER.maxHealth;
    playerDamageCooldown = 1.1;
    playerIsDead = false;
    slideActiveUntil = 0;
    slideCooldownReadyAt = 0;
    lastForwardTapAt = -10;
    sprintEnergy = MOBILITY.sprintMax;
    sprintExhausted = false;
    resetWeaponStates();
    loadWeaponState();
    weaponCooldown = 0.1;
    weaponHeat = 0;
    reloadTimer = 0;
    isReloading = false;
    muzzleFlashLife = 0;
    weaponAction = 0;
    recoilKick = 0;
    controls.shooting = false;
    controls.aiming = false;
    startButton.textContent = t("buttons.resume");
    clearDroppedWeapons();
    clearBullets();
    clearDynamicBlocks();
    clearDebris();
    clearFlames();
    clearBombs();
    clearExplosions();
    syncEquippedWeaponModel();

    if (currentMode === MODES.zombie) {
      clearZombies();
      zombieSpawnTimer = 0.75;
      for (let i = 0; i < ZOMBIES.spawnBurst; i += 1) {
        spawnZombieAroundPlayer();
      }
    }
  }

  function chooseMultiplayerColor(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    const hue = hash % 360;
    const color = new THREE.Color();
    color.setHSL(hue / 360, 0.62, 0.58);
    return color;
  }

  function createNameTag(name) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 84;
    const ctx = canvas.getContext("2d");
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(6.6, 1.95, 1);
    sprite.userData.canvas = canvas;
    sprite.userData.ctx = ctx;
    sprite.userData.texture = texture;
    updateNameTag(sprite, name, MULTIPLAYER.maxHealth, MULTIPLAYER.maxHealth, false);
    return sprite;
  }

  function updateNameTag(sprite, name, health, maxHealth, isDead) {
    if (!sprite || !sprite.userData || !sprite.userData.ctx) {
      return;
    }

    const canvas = sprite.userData.canvas;
    const ctx = sprite.userData.ctx;
    const texture = sprite.userData.texture;
    const safeName = String(name || "Player").slice(0, 16);
    const hpMax = Math.max(
      1,
      Math.round(Number.isFinite(maxHealth) ? maxHealth : MULTIPLAYER.maxHealth)
    );
    const hpValue = Math.max(
      0,
      Math.min(hpMax, Math.round(Number.isFinite(health) ? health : hpMax))
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = isDead ? "rgba(56, 7, 14, 0.82)" : "rgba(4, 16, 26, 0.76)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);

    ctx.fillStyle = "#e7f8ff";
    ctx.font = "700 24px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(safeName, canvas.width / 2, 28);

    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(24, 49, canvas.width - 48, 14);
    const hpWidth = (canvas.width - 48) * (hpValue / hpMax);
    ctx.fillStyle = isDead ? "#ff6c72" : "#89ff72";
    ctx.fillRect(24, 49, hpWidth, 14);

    ctx.fillStyle = "#f2fbff";
    ctx.font = "700 14px Trebuchet MS";
    ctx.fillText(
      isDead ? "DOWNED" : hpValue + " / " + hpMax + " HP",
      canvas.width / 2,
      70
    );

    texture.needsUpdate = true;
  }

  function createRemotePlayerAvatar(playerInfo) {
    const group = new THREE.Group();
    const color = chooseMultiplayerColor(playerInfo.id || playerInfo.name || "player");
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.42,
      metalness: 0.08,
    });
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.72, 2.8, 6, 10),
      bodyMaterial
    );
    body.position.y = PLAYER.height * 0.5 - 0.5;
    group.add(body);

    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.42, 0.24),
      new THREE.MeshStandardMaterial({
        color: 0xd8ecff,
        roughness: 0.25,
        metalness: 0.3,
      })
    );
    visor.position.set(0, PLAYER.height - 0.95, -0.76);
    group.add(visor);

    const facing = new THREE.Mesh(
      new THREE.ConeGeometry(0.34, 0.95, 8),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.02,
      })
    );
    facing.rotation.x = Math.PI / 2;
    facing.position.set(0, PLAYER.height - 1.4, -1.3);
    group.add(facing);

    const nameTag = createNameTag(playerInfo.name || "Player");
    nameTag.position.set(0, PLAYER.height + 0.75, 0);
    group.add(nameTag);

    const hitbox = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.92, 3.6, 6, 10),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
    );
    hitbox.position.y = PLAYER.height * 0.5 - 0.22;
    hitbox.userData.remotePlayerId = playerInfo.id;
    group.add(hitbox);
    remotePlayerHitMeshes.push(hitbox);

    remotePlayerRoot.add(group);
    const health = Number.isFinite(playerInfo.health)
      ? playerInfo.health
      : MULTIPLAYER.maxHealth;
    const maxHealth = Number.isFinite(playerInfo.maxHealth)
      ? playerInfo.maxHealth
      : MULTIPLAYER.maxHealth;
    const isDead = Boolean(playerInfo.isDead);
    updateNameTag(nameTag, playerInfo.name || "Player", health, maxHealth, isDead);

    return {
      id: playerInfo.id,
      name: playerInfo.name,
      group,
      body,
      bodyMaterial,
      visor,
      facing,
      nameTag,
      hitbox,
      health,
      maxHealth,
      isDead,
      targetPosition: new THREE.Vector3(playerInfo.x, playerInfo.y, playerInfo.z),
      targetYaw: playerInfo.yaw,
      lastSeenAt: performance.now(),
    };
  }

  function clearRemotePlayers() {
    remotePlayers.forEach(function (_entry, playerId) {
      removeRemotePlayer(playerId);
    });
  }

  function removeRemotePlayer(playerId) {
    const existing = remotePlayers.get(playerId);
    if (!existing) {
      return;
    }
    const hitboxIndex = remotePlayerHitMeshes.indexOf(existing.hitbox);
    if (hitboxIndex !== -1) {
      remotePlayerHitMeshes.splice(hitboxIndex, 1);
    }
    remotePlayerRoot.remove(existing.group);
    remotePlayers.delete(playerId);
  }

  function setRemotePlayerVisualState(remote) {
    const alpha = remote.isDead ? 0.32 : 1;
    remote.bodyMaterial.transparent = alpha < 1;
    remote.bodyMaterial.opacity = alpha;
    remote.visor.material.transparent = alpha < 1;
    remote.visor.material.opacity = alpha;
    remote.facing.material.transparent = alpha < 1;
    remote.facing.material.opacity = alpha;
    updateNameTag(
      remote.nameTag,
      remote.name,
      remote.health,
      remote.maxHealth,
      remote.isDead
    );
  }

  function upsertRemotePlayer(playerInfo) {
    const playerId = String(playerInfo.id || "");
    if (!playerId || playerId === multiplayerPlayerId) {
      return;
    }

    const now = performance.now();
    const x = Number(playerInfo.x);
    const y = Number(playerInfo.y);
    const z = Number(playerInfo.z);
    const yaw = Number(playerInfo.yaw);
    const clampedX = Number.isFinite(x) ? x : 0;
    const clampedY = Number.isFinite(y) ? y : sampleHeight(clampedX, Number.isFinite(z) ? z : 0) + PLAYER.height;
    const clampedZ = Number.isFinite(z) ? z : 0;
    const clampedYaw = Number.isFinite(yaw) ? yaw : 0;
    const playerName = String(playerInfo.name || "Player");
    const health = Number.isFinite(Number(playerInfo.health))
      ? Number(playerInfo.health)
      : MULTIPLAYER.maxHealth;
    const maxHealth = Number.isFinite(Number(playerInfo.maxHealth))
      ? Number(playerInfo.maxHealth)
      : MULTIPLAYER.maxHealth;
    const isDead = Boolean(playerInfo.isDead);

    let remote = remotePlayers.get(playerId);
    if (!remote) {
      remote = createRemotePlayerAvatar({
        id: playerId,
        name: playerName,
        x: clampedX,
        y: clampedY,
        z: clampedZ,
        yaw: clampedYaw,
        health,
        maxHealth,
        isDead,
      });
      remote.group.position.copy(remote.targetPosition);
      remote.group.rotation.y = remote.targetYaw;
      setRemotePlayerVisualState(remote);
      remotePlayers.set(playerId, remote);
      return;
    }

    remote.name = playerName;
    remote.health = health;
    remote.maxHealth = Math.max(1, maxHealth);
    remote.isDead = isDead;
    remote.hitbox.userData.remotePlayerId = playerId;
    remote.targetPosition.set(clampedX, clampedY, clampedZ);
    remote.targetYaw = clampedYaw;
    remote.lastSeenAt = now;
    setRemotePlayerVisualState(remote);
  }

  function updateRemotePlayers(delta) {
    if (currentMode !== MODES.multiplayer) {
      return;
    }

    const now = performance.now();
    const smoothing = 1 - Math.exp(-10 * Math.max(delta, 0.0001));
    remotePlayers.forEach(function (entry, playerId) {
      if (now - entry.lastSeenAt > MULTIPLAYER.staleAfter * 1000) {
        removeRemotePlayer(playerId);
        return;
      }
      entry.group.position.lerp(entry.targetPosition, entry.isDead ? smoothing * 0.55 : smoothing);
      const yawDelta = Math.atan2(
        Math.sin(entry.targetYaw - entry.group.rotation.y),
        Math.cos(entry.targetYaw - entry.group.rotation.y)
      );
      entry.group.rotation.y += yawDelta * (entry.isDead ? smoothing * 0.35 : smoothing);
    });
  }

  function applyMultiplayerSelfState(selfState, options) {
    if (!selfState) {
      return;
    }
    const settings = options || {};
    const forceTransform = Boolean(settings.forceTransform);

    const nextHealth = Number.isFinite(Number(selfState.health))
      ? Number(selfState.health)
      : playerHealth;
    const nextMaxHealth = Number.isFinite(Number(selfState.maxHealth))
      ? Number(selfState.maxHealth)
      : MULTIPLAYER.maxHealth;
    const nextIsDead = Boolean(selfState.isDead);
    const nextX = Number(selfState.x);
    const nextY = Number(selfState.y);
    const nextZ = Number(selfState.z);
    const nextYaw = Number(selfState.yaw);
    const nextPitch = Number(selfState.pitch);
    const nextRespawnAt = Number(selfState.respawnAt);
    const nextPotionReadyAt = Number(selfState.potionReadyAt);

    multiplayerKills = Number.isFinite(Number(selfState.kills))
      ? Number(selfState.kills)
      : multiplayerKills;
    multiplayerDeaths = Number.isFinite(Number(selfState.deaths))
      ? Number(selfState.deaths)
      : multiplayerDeaths;
    zombieKills = Number.isFinite(Number(selfState.zombieKills))
      ? Number(selfState.zombieKills)
      : zombieKills;
    multiplayerRespawnAt = Number.isFinite(nextRespawnAt)
      ? nextRespawnAt
      : multiplayerRespawnAt;
    healingPotionReadyAt = Number.isFinite(nextPotionReadyAt)
      ? nextPotionReadyAt
      : healingPotionReadyAt;
    wallBuildReadyAt = Number.isFinite(Number(selfState.wallReadyAt))
      ? Number(selfState.wallReadyAt)
      : wallBuildReadyAt;

    playerHealth = THREE.MathUtils.clamp(nextHealth, 0, Math.max(1, nextMaxHealth));

    if (nextIsDead) {
      if (!playerIsDead) {
        playerIsDead = true;
        controls.shooting = false;
        controls.aiming = false;
        startButton.textContent = t("buttons.respawn");
        if (
          document.pointerLockElement === renderer.domElement &&
          typeof document.exitPointerLock === "function"
        ) {
          document.exitPointerLock();
        } else {
          setPlayingState(false);
        }
      }
      return;
    }

    multiplayerRespawnAt = 0;

    if (playerIsDead) {
      playerIsDead = false;
      playerDamageCooldown = PLAYER.damageCooldown;
      controls.shooting = false;
      controls.aiming = false;
      startButton.textContent = t("buttons.resume");
    }

    if (forceTransform) {
      if (Number.isFinite(nextX) && Number.isFinite(nextY) && Number.isFinite(nextZ)) {
        player.position.set(nextX, nextY, nextZ);
      }
      if (Number.isFinite(nextYaw)) {
        player.yaw = nextYaw;
      }
      if (Number.isFinite(nextPitch)) {
        player.pitch = THREE.MathUtils.clamp(nextPitch, -Math.PI / 2 + 0.08, Math.PI / 2 - 0.08);
      }
    }
  }

  async function joinMultiplayerSession(preferredName, variant) {
    const fallbackName = t("common.player") + "-" + Math.floor(Math.random() * 900 + 100);
    const nextName = preferredName || fallbackName;
    const nextVariant =
      variant === MULTIPLAYER_VARIANTS.horde
        ? MULTIPLAYER_VARIANTS.horde
        : MULTIPLAYER_VARIANTS.pvp;

    try {
      const response = await fetch("/api/multiplayer/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName, variant: nextVariant }),
      });
      if (!response.ok) {
        throw new Error("join failed with status " + response.status);
      }
      const payload = await response.json();
      return finalizeRoomJoin(payload);
    } catch (error) {
      console.error("Failed to join multiplayer session", error);
      setBootMessage(t("boot.unavailable"));
      return false;
    }
  }

  function leaveMultiplayerSession(useBeacon) {
    if (!multiplayerPlayerId) {
      resetMultiplayerRoomInfo();
      return;
    }

    const payload = JSON.stringify({ playerId: multiplayerPlayerId });
    if (useBeacon && navigator.sendBeacon) {
      try {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/multiplayer/leave", blob);
      } catch (error) {
        console.warn("Beacon leave failed", error);
      }
    } else {
      fetch("/api/multiplayer/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      }).catch(function (error) {
        console.warn("Leave multiplayer failed", error);
      });
    }

    multiplayerPlayerId = "";
    multiplayerPlayerName = "";
    multiplayerVariant = MULTIPLAYER_VARIANTS.pvp;
    multiplayerSyncInFlight = false;
    multiplayerPollInFlight = false;
    multiplayerRespawnInFlight = false;
    multiplayerHealInFlight = false;
    multiplayerBuildWallInFlight = false;
    multiplayerKills = 0;
    multiplayerDeaths = 0;
    multiplayerRespawnAt = 0;
    healingPotionReadyAt = 0;
    wallBuildReadyAt = 0;
    zombieKills = 0;
    resetMultiplayerRoomInfo();
    clearZombies();
    clearMultiplayerWalls();
  }

  function getHealingPotionCooldownRemaining() {
    return Math.max(0, healingPotionReadyAt - Date.now() / 1000);
  }

  function useHealingPotion() {
    if (!singlePlayerStarted || playerIsDead) {
      return;
    }

    const cooldownRemaining = getHealingPotionCooldownRemaining();
    if (cooldownRemaining > 0 || playerHealth >= PLAYER.maxHealth) {
      return;
    }

    if (currentMode === MODES.multiplayer) {
      requestMultiplayerHeal();
      return;
    }

    playerHealth = Math.min(PLAYER.maxHealth, playerHealth + HEALING.amount);
    healingPotionReadyAt = Date.now() / 1000 + HEALING.cooldown;
  }

  async function requestMultiplayerHeal() {
    if (!multiplayerPlayerId || multiplayerHealInFlight || playerIsDead) {
      return;
    }

    multiplayerHealInFlight = true;
    try {
      const response = await fetch("/api/multiplayer/heal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: multiplayerPlayerId }),
      });
      if (!response.ok) {
        throw new Error("heal failed with status " + response.status);
      }
      const payload = await response.json();
      if (payload.self) {
        applyMultiplayerSelfState(payload.self);
      }
    } catch (error) {
      console.warn("Multiplayer heal failed", error);
    } finally {
      multiplayerHealInFlight = false;
    }
  }

  async function requestMultiplayerRespawn() {
    if (!multiplayerPlayerId || multiplayerRespawnInFlight) {
      return;
    }

    multiplayerRespawnInFlight = true;
    try {
      const response = await fetch("/api/multiplayer/respawn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: multiplayerPlayerId }),
      });
      if (!response.ok) {
        throw new Error("respawn failed with status " + response.status);
      }
      const payload = await response.json();
      if (payload.self) {
        applyMultiplayerSelfState(payload.self, { forceTransform: true });
      }
    } catch (error) {
      console.warn("Multiplayer respawn failed", error);
    } finally {
      multiplayerRespawnInFlight = false;
    }
  }

  async function reportMultiplayerHit(targetId, damage) {
    if (!multiplayerPlayerId || !targetId || targetId === multiplayerPlayerId) {
      return;
    }

    try {
      const response = await fetch("/api/multiplayer/hit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attackerId: multiplayerPlayerId,
          targetId: targetId,
          damage: damage,
        }),
      });
      if (!response.ok) {
        return;
      }
      const payload = await response.json();
      if (payload.self) {
        applyMultiplayerSelfState(payload.self);
      }
      if (payload.target) {
        upsertRemotePlayer(payload.target);
      }
      if (payload.ok && !payload.ignored) {
        totalHits += 1;
        sound.hit();
      }
    } catch (error) {
      console.warn("Multiplayer hit sync failed", error);
    }
  }

  async function requestMultiplayerZombieHit(zombieId, damage, options) {
    if (!multiplayerPlayerId || !zombieId) {
      return;
    }

    const settings = options || {};
    try {
      const response = await fetch("/api/multiplayer/zombie-hit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: multiplayerPlayerId,
          zombieId: zombieId,
          damage: damage,
        }),
      });
      if (!response.ok) {
        return;
      }
      const payload = await response.json();
      if (payload.self) {
        applyMultiplayerSelfState(payload.self);
      }
      if (payload.zombie) {
        upsertMultiplayerZombie(payload.zombie);
      }
      if (payload.removedZombieId) {
        const removedZombie = findMultiplayerZombieById(payload.removedZombieId);
        if (removedZombie) {
          removeZombie(removedZombie);
        }
      }
      if (payload.ok && !payload.ignored) {
        totalHits += 1;
        if (!settings.silent) {
          sound.hit();
        }
      }
    } catch (error) {
      console.warn("Multiplayer zombie hit sync failed", error);
    }
  }

  function updateMultiplayer(delta) {
    if (currentMode !== MODES.multiplayer || !multiplayerPlayerId) {
      return;
    }

    if (
      playerIsDead &&
      multiplayerRespawnAt > 0 &&
      Date.now() / 1000 >= multiplayerRespawnAt
    ) {
      requestMultiplayerRespawn();
    }

    multiplayerSyncTimer -= delta;
    if (multiplayerSyncTimer <= 0 && !multiplayerSyncInFlight) {
      multiplayerSyncTimer = MULTIPLAYER.syncInterval;
      pushMultiplayerState();
    }

    multiplayerPollTimer -= delta;
    if (multiplayerPollTimer <= 0 && !multiplayerPollInFlight) {
      multiplayerPollTimer = MULTIPLAYER.pollInterval;
      pullMultiplayerState();
    }
  }

  async function pushMultiplayerState() {
    if (!multiplayerPlayerId) {
      return;
    }

    multiplayerSyncInFlight = true;
    try {
      const currentWeapon = getSelectedWeapon();
      const response = await fetch("/api/multiplayer/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: multiplayerPlayerId,
          name: multiplayerPlayerName,
          x: player.position.x,
          y: player.position.y,
          z: player.position.z,
          yaw: player.yaw,
          pitch: player.pitch,
          weapon: currentWeapon.label,
        }),
      });

      if (response.status === 404) {
        multiplayerPlayerId = "";
        clearRemotePlayers();
        clearZombies();
        setBootMessage(t("boot.sessionExpired"));
        return;
      }

      if (response.ok) {
        const payload = await response.json();
        if (payload.self) {
          applyMultiplayerSelfState(payload.self);
        }
        if (payload.room) {
          applyMultiplayerRoomInfo(payload.room);
        }
      }
    } catch (error) {
      console.warn("Multiplayer update failed", error);
    } finally {
      multiplayerSyncInFlight = false;
    }
  }

  async function pullMultiplayerState() {
    if (!multiplayerPlayerId) {
      return;
    }

    multiplayerPollInFlight = true;
    try {
      const response = await fetch(
        "/api/multiplayer/state?playerId=" + encodeURIComponent(multiplayerPlayerId),
        { method: "GET" }
      );
      if (!response.ok) {
        throw new Error("state failed with status " + response.status);
      }
      const payload = await response.json();
      if (!payload.self) {
        multiplayerPlayerId = "";
        clearRemotePlayers();
        clearZombies();
        setBootMessage(t("boot.sessionExpired"));
        return;
      }
      applyMultiplayerSelfState(payload.self);
      if (payload.room) {
        applyMultiplayerRoomInfo(payload.room, { announceTransition: true });
      }
      syncMultiplayerZombies(Array.isArray(payload.zombies) ? payload.zombies : []);
      syncMultiplayerWalls(Array.isArray(payload.walls) ? payload.walls : []);
      const seen = new Set();
      const players = Array.isArray(payload.players) ? payload.players : [];
      players.forEach(function (remoteInfo) {
        const playerId = String(remoteInfo.id || "");
        if (!playerId) {
          return;
        }
        seen.add(playerId);
        upsertRemotePlayer(remoteInfo);
      });

      remotePlayers.forEach(function (_entry, playerId) {
        if (!seen.has(playerId)) {
          removeRemotePlayer(playerId);
        }
      });
    } catch (error) {
      console.warn("Multiplayer poll failed", error);
    } finally {
      multiplayerPollInFlight = false;
    }
  }

  function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    updateCameraTransform(delta);
    updatePlayer(delta);
    updateMultiplayer(delta);
    updateCameraTransform(delta);
    scheduleChunksAroundPlayer(false);
    processBuildQueue();
    updateZombies(delta);
    updateDroppedWeapons(delta);
    updateDynamicBlocks(delta);
    updateDebris(delta);
    updateBullets(delta);
    updateFlames(delta);
    updateBombs(delta);
    updateExplosions(delta);
    updateWeapon(delta);
    updatePlayerAvatar(delta);
    updateRemotePlayers(delta);
    sound.update(
      singlePlayerStarted && pointerLocked,
      movementSpeed,
      controls.aiming && !isReloading && getSelectedWeapon().supportsAim
    );
    updateCameraTransform(delta);
    animateWater(now * 0.0015);
    updateReadouts(delta);

    renderer.render(scene, camera);
  }

  function updatePlayer(delta) {
    const wasGrounded = player.grounded;
    moveInput.set(0, 0, 0);
    playerDamageCooldown = Math.max(0, playerDamageCooldown - delta);

    const nowSeconds = performance.now() / 1000;
    const slideActive = nowSeconds < slideActiveUntil;
    const forwardAmount = THREE.MathUtils.clamp(
      Number(controls.forward) - Number(controls.backward) + touchMoveVector.y,
      -1,
      1
    );
    const strafeAmount = THREE.MathUtils.clamp(
      Number(controls.right) - Number(controls.left) + touchMoveVector.x,
      -1,
      1
    );
    const sprintIntent = selectedControlScheme === CONTROL_SCHEMES.pad
      ? controls.sprint && touchMoveVector.length() > 0.2
      : controls.sprint && controls.forward;
    if (sprintExhausted && sprintEnergy >= MOBILITY.sprintMax) {
      sprintExhausted = false;
    }
    const sprinting = !slideActive && sprintIntent && !sprintExhausted && sprintEnergy > 0;
    let speed = playerIsDead
      ? 0
      : slideActive
        ? PLAYER.slideSpeed
        : sprinting
          ? PLAYER.sprintSpeed
          : PLAYER.walkSpeed;

    if (
      controls.aiming &&
      pointerLocked &&
      !isReloading &&
      getSelectedWeapon().supportsAim
    ) {
      speed *= PLAYER.aimSpeedFactor;
    }

    if (isReloading) {
      speed *= PLAYER.reloadSpeedFactor;
    }

    if (slideActive) {
      moveInput.copy(slideDirection).multiplyScalar(speed);
    } else if (forwardAmount !== 0 || strafeAmount !== 0) {
      camera.getWorldDirection(moveForward);
      moveForward.y = 0;

      if (moveForward.lengthSq() === 0) {
        moveForward.set(0, 0, -1);
      } else {
        moveForward.normalize();
      }

      moveRight.crossVectors(moveForward, camera.up).normalize();

      moveInput
        .addScaledVector(moveForward, forwardAmount)
        .addScaledVector(moveRight, strafeAmount)
        .normalize()
        .multiplyScalar(speed);
    }

    const easing = slideActive ? 22 : player.grounded ? 14 : 5;
    player.velocity.x = THREE.MathUtils.damp(
      player.velocity.x,
      moveInput.x,
      easing,
      delta
    );
    player.velocity.z = THREE.MathUtils.damp(
      player.velocity.z,
      moveInput.z,
      easing,
      delta
    );

    player.velocity.y -= PLAYER.gravity * delta;
    player.position.addScaledVector(player.velocity, delta);

    const playerFeetY = player.position.y - PLAYER.height;
    resolveSolidCollisions(player.position, DEFENSE.playerRadius, playerFeetY, player.position.y);

    const terrainHeight =
      sampleHeight(player.position.x, player.position.z) + PLAYER.height;

    if (player.position.y <= terrainHeight) {
      const impactSpeed = Math.abs(player.velocity.y);
      player.position.y = terrainHeight;
      player.velocity.y = 0;
      player.grounded = true;

      if (!wasGrounded && impactSpeed > 8) {
        sound.land(impactSpeed);
      }
    } else {
      player.grounded = false;
    }

    if (!playerIsDead && controls.jumpQueued && player.grounded && !slideActive) {
      player.velocity.y = PLAYER.jumpSpeed;
      player.grounded = false;
      sound.jump();
    }

    movementSpeed = Math.hypot(player.velocity.x, player.velocity.z);

    if (sprinting && movementSpeed > PLAYER.walkSpeed * 0.65) {
      sprintEnergy = Math.max(0, sprintEnergy - MOBILITY.sprintDrainPerSecond * delta);
      if (sprintEnergy === 0) {
        sprintExhausted = true;
        controls.sprint = false;
      }
    } else {
      sprintEnergy = Math.min(MOBILITY.sprintMax, sprintEnergy + MOBILITY.sprintRecoverPerSecond * delta);
    }

    if (
      singlePlayerStarted &&
      pointerLocked &&
      player.grounded &&
      movementSpeed > 4 &&
      !playerIsDead &&
      !isReloading
    ) {
      stepTimer = Math.max(0, stepTimer - delta);

      if (stepTimer === 0) {
        sound.step(sprinting || slideActive ? 1 : controls.aiming ? 0.72 : 0.84);
        stepTimer = sprinting || slideActive ? 0.2 : controls.aiming ? 0.34 : 0.28;
      }
    } else {
      stepTimer = Math.min(stepTimer, 0.05);
    }

    controls.jumpQueued = false;
  }

  function updateWeapon(delta) {
    const currentWeapon = getSelectedWeapon();
    const pose = VIEW_POSES[currentWeapon.type];
    const nowSeconds = performance.now() / 1000;
    const slideActive = nowSeconds < slideActiveUntil;
    const sprintIntent = selectedControlScheme === CONTROL_SCHEMES.pad
      ? controls.sprint && touchMoveVector.length() > 0.2
      : controls.sprint && controls.forward;
    const sprinting = !slideActive && sprintIntent && !sprintExhausted && sprintEnergy > 0;
    const aimingNow =
      singlePlayerStarted &&
      pointerLocked &&
      controls.aiming &&
      currentWeapon.supportsAim &&
      !isReloading &&
      !playerIsDead;
    const firingNow =
      singlePlayerStarted &&
      pointerLocked &&
      controls.shooting &&
      !isReloading &&
      !playerIsDead;
    const scopedView = aimingNow && currentWeapon.hasScope && !thirdPersonEnabled;

    document.body.classList.toggle("is-aiming", scopedView);
    weapon.group.visible = !thirdPersonEnabled;

    weaponCooldown = Math.max(0, weaponCooldown - delta);
    weaponHeat = Math.max(0, weaponHeat - delta * currentWeapon.coolRate);
    emptySoundCooldown = Math.max(0, emptySoundCooldown - delta);
    weaponAction = Math.max(
      0,
      weaponAction -
        delta / Math.max(currentWeapon.actionDuration || 0.18, 0.001)
    );
    recoilKick = THREE.MathUtils.damp(recoilKick, 0, 12, delta);
    aimWeight = THREE.MathUtils.damp(aimWeight, aimingNow ? 1 : 0, 10, delta);

    if (isReloading) {
      reloadTimer = Math.max(0, reloadTimer - delta);
      if (reloadTimer === 0) {
        finishReload();
      }
    }

    if (!isReloading && firingNow) {
      let safety = 0;

      while (weaponCooldown <= 0 && safety < 4) {
        if (!currentWeapon.isMelee && ammoInMag <= 0) {
          if (reserveAmmo <= 0 && emptySoundCooldown === 0) {
            sound.empty();
            emptySoundCooldown = 0.22;
          }
          startReload(false);
          break;
        }

        fireWeapon();
        weaponCooldown += currentWeapon.fireInterval;
        safety += 1;

        if (!currentWeapon.autoFire) {
          break;
        }
      }
    }

    barrelSpin = THREE.MathUtils.damp(
      barrelSpin,
      firingNow && currentWeapon.type === "minigun" ? currentWeapon.spinSpeed : 0,
      8,
      delta
    );
    if (weapon.barrels) {
      weapon.barrels.rotation.z += barrelSpin * delta;
    }

    if (movementSpeed > 1 && player.grounded) {
      bobTime += delta * ((sprinting || slideActive) ? 11 : 7.5);
    }

    const bobStrength =
      Math.min(movementSpeed / PLAYER.sprintSpeed, 1) * (1 - aimWeight * 0.7);
    const bobX = Math.sin(bobTime) * 0.018 * bobStrength;
    const bobY = Math.abs(Math.cos(bobTime * 2)) * 0.012 * bobStrength;
    const reloadPhase =
      isReloading && currentWeapon.reloadTime > 0
        ? 1 - reloadTimer / currentWeapon.reloadTime
        : 0;
    const reloadArc = Math.sin(reloadPhase * Math.PI);
    const actionProgress = 1 - weaponAction;
    const actionArc =
      weaponAction > 0
        ? Math.sin(THREE.MathUtils.clamp(actionProgress, 0, 1) * Math.PI)
        : 0;

    weaponTargetPosition.set(
      THREE.MathUtils.lerp(pose.hipPosition[0], pose.aimPosition[0], aimWeight) +
        bobX +
        reloadArc * pose.reloadPosition[0] +
        actionArc * pose.actionPosition[0],
      THREE.MathUtils.lerp(pose.hipPosition[1], pose.aimPosition[1], aimWeight) -
        bobY -
        reloadArc * pose.reloadPosition[1] +
        actionArc * pose.actionPosition[1],
      THREE.MathUtils.lerp(pose.hipPosition[2], pose.aimPosition[2], aimWeight) +
        recoilKick * 0.2 +
        reloadArc * pose.reloadPosition[2] +
        actionArc * pose.actionPosition[2]
    );

    weaponTargetRotation.set(
      THREE.MathUtils.lerp(pose.hipRotation[0], pose.aimRotation[0], aimWeight) -
        recoilKick * 0.24 -
        reloadArc * pose.reloadRotation[0] -
        actionArc * pose.actionRotation[0],
      THREE.MathUtils.lerp(pose.hipRotation[1], pose.aimRotation[1], aimWeight) +
        reloadArc * pose.reloadRotation[1] +
        actionArc * pose.actionRotation[1],
      THREE.MathUtils.lerp(pose.hipRotation[2], pose.aimRotation[2], aimWeight) +
        bobX * 0.8 +
        reloadArc * pose.reloadRotation[2] +
        actionArc * pose.actionRotation[2]
    );

    if (currentWeapon.isMelee) {
      weaponTargetPosition.z += weaponAction * 0.18;
      weaponTargetRotation.x += weaponAction * 0.7;
      weaponTargetRotation.y += actionArc * 0.22;
      weaponTargetRotation.z -= weaponAction * 0.94;
    }

    weapon.group.position.lerp(weaponTargetPosition, 1 - Math.exp(-9 * delta));
    weapon.group.rotation.x = THREE.MathUtils.damp(
      weapon.group.rotation.x,
      weaponTargetRotation.x,
      9,
      delta
    );
    weapon.group.rotation.y = THREE.MathUtils.damp(
      weapon.group.rotation.y,
      weaponTargetRotation.y,
      9,
      delta
    );
    weapon.group.rotation.z = THREE.MathUtils.damp(
      weapon.group.rotation.z,
      weaponTargetRotation.z,
      9,
      delta
    );

    if (weapon.drum) {
      weapon.drum.rotation.x += delta * (firingNow ? 10 : 2);
    }

    if (weapon.bolt) {
      weapon.bolt.position.z = THREE.MathUtils.damp(
        weapon.bolt.position.z,
        weaponAction > 0 ? -0.12 : -0.02,
        16,
        delta
      );
    }

    if (weapon.pump) {
      weapon.pump.position.z = THREE.MathUtils.damp(
        weapon.pump.position.z,
        -0.42 - actionArc * 0.22,
        12,
        delta
      );
    }

    if (weapon.scopeGlass) {
      weapon.scopeGlass.material.emissiveIntensity = THREE.MathUtils.damp(
        weapon.scopeGlass.material.emissiveIntensity || 0.35,
        aimingNow ? 1 : 0.35,
        8,
        delta
      );
    }

    if (weapon.pilotLight) {
      weapon.pilotLight.material.emissiveIntensity = THREE.MathUtils.damp(
        weapon.pilotLight.material.emissiveIntensity || 0.45,
        currentWeapon.type === "flamethrower"
          ? firingNow
            ? 1.4
            : 0.55
          : 0.2,
        10,
        delta
      );
    }

    muzzleFlashLife = Math.max(0, muzzleFlashLife - delta);
    weapon.flash.visible =
      muzzleFlashLife > 0 && !thirdPersonEnabled && !currentWeapon.isMelee;
    weapon.flash.material.opacity = Math.min(1, muzzleFlashLife / 0.05);

    const targetFov = aimingNow
      ? thirdPersonEnabled
        ? CAMERA_VIEW.thirdPersonAimFov
        : currentWeapon.aimFov
      : PLAYER.baseFov + recoilKick * 9;
    cameraFov = THREE.MathUtils.damp(cameraFov, targetFov, 8, delta);

    if (Math.abs(camera.fov - cameraFov) > 0.02) {
      camera.fov = cameraFov;
      camera.updateProjectionMatrix();
    }

    if (
      !currentWeapon.isMelee &&
      !isReloading &&
      ammoInMag === 0 &&
      reserveAmmo > 0 &&
      !firingNow
    ) {
      startReload(false);
    }

    storeWeaponState();
    updateLoadoutBar();
  }

  function getWeaponMuzzlePosition(target) {
    if (thirdPersonEnabled) {
      updatePlayerAvatar(0);
      avatarWeapon.muzzle.getWorldPosition(target);
      return target;
    }

    weapon.muzzle.getWorldPosition(target);
    return target;
  }

  function fireWeapon() {
    const currentWeapon = getSelectedWeapon();

    totalShots += 1;
    weaponAction = 1;
    recoilKick = Math.min(
      currentWeapon.maxRecoil,
      recoilKick + currentWeapon.recoilPerShot
    );

    if (currentWeapon.isMelee) {
      performMeleeAttack(currentWeapon);
      storeWeaponState();
      updateLoadoutBar();
      return;
    }

    if (currentWeapon.type === "bomb") {
      ammoInMag -= 1;
      weaponHeat = Math.min(1, weaponHeat + currentWeapon.heatPerShot);
      getWeaponMuzzlePosition(bulletSpawnPosition);
      throwBomb(currentWeapon, bulletSpawnPosition);
      storeWeaponState();
      updateLoadoutBar();
      return;
    }

    if (currentWeapon.type === "flamethrower") {
      ammoInMag -= 1;
      weaponHeat = Math.min(1, weaponHeat + currentWeapon.heatPerShot);
      muzzleFlashLife = 0.08;
      sound.fire(weaponHeat, controls.aiming, currentWeapon.type);
      getWeaponMuzzlePosition(flameOrigin);
      applyFlameDamage(currentWeapon, flameOrigin);
      spawnFlameBurst(currentWeapon, flameOrigin);
      storeWeaponState();
      updateLoadoutBar();
      return;
    }

    const spread =
      controls.aiming && currentWeapon.supportsAim
        ? currentWeapon.spreadAim
        : currentWeapon.spreadHip;

    ammoInMag -= 1;
    weaponHeat = Math.min(1, weaponHeat + currentWeapon.heatPerShot);
    muzzleFlashLife = 0.05;
    sound.fire(weaponHeat, controls.aiming, currentWeapon.type);

    getWeaponMuzzlePosition(bulletSpawnPosition);

    camera.getWorldDirection(shotDirection);
    shotTargetPoint
      .copy(camera.position)
      .addScaledVector(shotDirection, currentWeapon.effectiveRange);
    shotDirection.copy(shotTargetPoint).sub(bulletSpawnPosition);

    if (shotDirection.lengthSq() === 0) {
      shotDirection.set(0, 0, -1);
    } else {
      shotDirection.normalize();
    }

    shotRight.crossVectors(shotDirection, camera.up);
    if (shotRight.lengthSq() === 0) {
      shotRight.set(1, 0, 0);
    } else {
      shotRight.normalize();
    }

    shotUp.crossVectors(shotRight, shotDirection).normalize();

    const pellets = currentWeapon.pellets || 1;
    for (let pellet = 0; pellet < pellets; pellet += 1) {
      const pelletDirection = shotDirection
        .clone()
        .addScaledVector(shotRight, (Math.random() - 0.5) * spread)
        .addScaledVector(shotUp, (Math.random() - 0.5) * spread)
        .normalize();

      spawnBullet(bulletSpawnPosition, pelletDirection, currentWeapon);
    }

    storeWeaponState();
    updateLoadoutBar();
  }

  function performMeleeAttack(currentWeapon) {
    camera.getWorldDirection(shotDirection);
    meleeOrigin.copy(camera.position);

    let bestZombie = null;
    let bestRemoteId = "";
    let bestDistance = currentWeapon.effectiveRange + 1;

    for (let i = activeZombies.length - 1; i >= 0; i -= 1) {
      const zombie = activeZombies[i];
      meleeTarget.copy(zombie.group.position);
      meleeTarget.y += 2.4;
      meleeToTarget.copy(meleeTarget).sub(meleeOrigin);

      const distance = meleeToTarget.length();
      if (distance > currentWeapon.effectiveRange) {
        continue;
      }

      meleeToTarget.normalize();
      if (meleeToTarget.dot(shotDirection) < currentWeapon.meleeArc) {
        continue;
      }

      if (distance < bestDistance) {
        bestDistance = distance;
        bestZombie = zombie;
      }
    }

    if (bestZombie) {
      sound.melee(true);
      damageZombie(bestZombie, currentWeapon.damagePerShot);
      return;
    }

    if (currentMode === MODES.multiplayer) {
      remotePlayers.forEach(function (remote, remotePlayerId) {
        if (remote.isDead) {
          return;
        }
        meleeTarget.copy(remote.group.position);
        meleeTarget.y += 2.4;
        meleeToTarget.copy(meleeTarget).sub(meleeOrigin);

        const distance = meleeToTarget.length();
        if (distance > currentWeapon.effectiveRange) {
          return;
        }

        meleeToTarget.normalize();
        if (meleeToTarget.dot(shotDirection) < currentWeapon.meleeArc) {
          return;
        }

        if (distance < bestDistance) {
          bestDistance = distance;
          bestRemoteId = remotePlayerId;
        }
      });
    }

    if (bestRemoteId) {
      sound.melee(true);
      reportMultiplayerHit(bestRemoteId, currentWeapon.damagePerShot);
      return;
    }

    raycaster.set(meleeOrigin, shotDirection);
    raycaster.far = currentWeapon.effectiveRange;
    const blockHit = raycaster.intersectObjects(activeBlockMeshes, false)[0];
    const solidHit = raycaster.intersectObjects(solidObstacleMeshes, false)[0];
    const nearestHit = [blockHit, solidHit].filter(Boolean).sort(function (a, b) {
      return a.distance - b.distance;
    })[0];

    if (nearestHit) {
      sound.melee(true);
      if (!nearestHit.object.userData.indestructible) {
        destroyBlock(nearestHit.object);
      }
      return;
    }

    sound.melee(false);
  }

  function applyFlameDamage(currentWeapon, origin) {
    camera.getWorldDirection(flameDirection);

    for (let i = activeZombies.length - 1; i >= 0; i -= 1) {
      const zombie = activeZombies[i];
      blastCenter.copy(zombie.group.position);
      blastCenter.y += 2.2;
      blastVector.copy(blastCenter).sub(origin);

      const distance = blastVector.length();
      if (distance > currentWeapon.effectiveRange) {
        continue;
      }

      blastVector.normalize();
      if (blastVector.dot(flameDirection) < currentWeapon.flameCone) {
        continue;
      }

      zombie.attackPulse = Math.max(zombie.attackPulse, 0.18);
      damageZombie(
        zombie,
        currentWeapon.damagePerShot *
          THREE.MathUtils.lerp(1, 0.42, distance / currentWeapon.effectiveRange),
        { silent: true }
      );
    }

    if (currentMode === MODES.multiplayer) {
      remotePlayers.forEach(function (remote, remotePlayerId) {
        if (remote.isDead) {
          return;
        }
        blastCenter.copy(remote.group.position);
        blastCenter.y += 2.2;
        blastVector.copy(blastCenter).sub(origin);

        const distance = blastVector.length();
        if (distance > currentWeapon.effectiveRange) {
          return;
        }

        blastVector.normalize();
        if (blastVector.dot(flameDirection) < currentWeapon.flameCone) {
          return;
        }

        reportMultiplayerHit(
          remotePlayerId,
          currentWeapon.damagePerShot *
            THREE.MathUtils.lerp(1, 0.42, distance / currentWeapon.effectiveRange)
        );
      });
    }

    let bestBlock = null;
    let bestDistance = currentWeapon.effectiveRange + 1;
    for (let i = 0; i < activeBlockMeshes.length; i += 1) {
      const block = activeBlockMeshes[i];
      blastVector.copy(block.position).sub(origin);
      const distance = blastVector.length();
      if (distance > currentWeapon.effectiveRange * 0.82) {
        continue;
      }

      blastVector.normalize();
      if (blastVector.dot(flameDirection) < currentWeapon.flameCone + 0.08) {
        continue;
      }

      if (distance < bestDistance) {
        bestDistance = distance;
        bestBlock = block;
      }
    }

    if (bestBlock) {
      destroyBlock(bestBlock, { silent: true });
    }
  }

  function spawnBullet(origin, direction, currentWeapon) {
    const mesh =
      pooledBullets.pop() || new THREE.Mesh(bulletGeometry, bulletMaterial);
    mesh.position.copy(origin);
    mesh.quaternion.setFromUnitVectors(bulletForwardAxis, direction);
    mesh.visible = true;
    bulletRoot.add(mesh);

    bullets.push({
      mesh: mesh,
      direction: direction.clone(),
      previousPosition: origin.clone(),
      distance: 0,
      damage: currentWeapon.damagePerShot,
      maxDistance: currentWeapon.effectiveRange,
      speed: currentWeapon.bulletSpeed,
    });
  }

  function updateBullets(delta) {
    for (let i = bullets.length - 1; i >= 0; i -= 1) {
      const bullet = bullets[i];
      const stepDistance = bullet.speed * delta;

      bullet.previousPosition.copy(bullet.mesh.position);
      bullet.mesh.position.addScaledVector(bullet.direction, stepDistance);
      bullet.distance += stepDistance;

      raycaster.set(bullet.previousPosition, bullet.direction);
      raycaster.far = stepDistance;

      const zombieHits = raycaster.intersectObjects(zombieHitMeshes, false);
      const blockHits = raycaster.intersectObjects(activeBlockMeshes, false);
      const solidHits = raycaster.intersectObjects(solidObstacleMeshes, false);
      const remoteHits =
        currentMode === MODES.multiplayer
          ? raycaster.intersectObjects(remotePlayerHitMeshes, false)
          : [];
      const zombieHit = zombieHits[0];
      const blockHit = blockHits[0];
      const solidHit = solidHits[0];
      const remoteHit = remoteHits[0];
      const nearestHitCandidates = [zombieHit, blockHit, solidHit, remoteHit].filter(Boolean);
      let nearestHit = null;
      for (let hitIndex = 0; hitIndex < nearestHitCandidates.length; hitIndex += 1) {
        const candidate = nearestHitCandidates[hitIndex];
        if (!nearestHit || candidate.distance < nearestHit.distance) {
          nearestHit = candidate;
        }
      }

      if (
        nearestHit &&
        bullet.distance - stepDistance + nearestHit.distance <= bullet.maxDistance
      ) {
        if (nearestHit.object.userData.zombie) {
          damageZombie(nearestHit.object.userData.zombie, bullet.damage);
        } else if (nearestHit.object.userData.remotePlayerId) {
          reportMultiplayerHit(nearestHit.object.userData.remotePlayerId, bullet.damage);
        } else if (!nearestHit.object.userData.indestructible) {
          destroyBlock(nearestHit.object);
        }
        recycleBullet(i);
        continue;
      }

      if (
        bullet.mesh.position.y <=
          sampleHeight(bullet.mesh.position.x, bullet.mesh.position.z) + 0.2 &&
        bullet.distance > 6
      ) {
        recycleBullet(i);
        continue;
      }

      if (bullet.distance >= bullet.maxDistance) {
        recycleBullet(i);
      }
    }
  }

  function recycleBullet(index) {
    const bullet = bullets[index];
    bulletRoot.remove(bullet.mesh);
    bullet.mesh.visible = false;
    pooledBullets.push(bullet.mesh);
    bullets.splice(index, 1);
  }

  function clearBullets() {
    for (let i = bullets.length - 1; i >= 0; i -= 1) {
      recycleBullet(i);
    }
  }

  function createFlameParticle() {
    const mesh = new THREE.Mesh(
      flameGeometry,
      flameMaterialTemplate.clone()
    );
    mesh.material.depthWrite = false;
    return mesh;
  }

  function spawnFlameBurst(currentWeapon, origin) {
    camera.getWorldDirection(flameDirection);
    shotRight.crossVectors(flameDirection, camera.up);
    if (shotRight.lengthSq() === 0) {
      shotRight.set(1, 0, 0);
    } else {
      shotRight.normalize();
    }

    for (let i = 0; i < currentWeapon.flameParticles; i += 1) {
      const mesh = pooledFlames.pop() || createFlameParticle();
      effectOffset
        .copy(flameDirection)
        .multiplyScalar(0.45 + Math.random() * 0.4);
      mesh.position.copy(origin).add(effectOffset);
      mesh.visible = true;
      mesh.scale.setScalar(0.24 + Math.random() * 0.18);
      mesh.material.opacity = 0.85;
      mesh.material.color.setHex(
        Math.random() > 0.45 ? 0xff8a2a : 0xffd36b
      );
      flameRoot.add(mesh);

      flameDrift
        .copy(flameDirection)
        .addScaledVector(shotRight, (Math.random() - 0.5) * 0.3)
        .addScaledVector(camera.up, (Math.random() - 0.2) * 0.26)
        .normalize()
        .multiplyScalar(11 + Math.random() * 9);

      flames.push({
        mesh: mesh,
        velocity: flameDrift.clone(),
        life: 0.16 + Math.random() * 0.16,
        maxLife: 0.16 + Math.random() * 0.16,
      });
    }
  }

  function updateFlames(delta) {
    for (let i = flames.length - 1; i >= 0; i -= 1) {
      const flame = flames[i];
      flame.life -= delta;
      flame.velocity.y += 4.8 * delta;
      flame.mesh.position.addScaledVector(flame.velocity, delta);
      flame.mesh.scale.multiplyScalar(1 + delta * 2.6);
      flame.mesh.material.opacity = Math.max(0, flame.life / flame.maxLife);

      if (
        flame.life <= 0 ||
        flame.mesh.position.y <=
          sampleHeight(flame.mesh.position.x, flame.mesh.position.z) + 0.1
      ) {
        recycleFlame(i);
      }
    }
  }

  function recycleFlame(index) {
    const flame = flames[index];
    flameRoot.remove(flame.mesh);
    flame.mesh.visible = false;
    pooledFlames.push(flame.mesh);
    flames.splice(index, 1);
  }

  function clearFlames() {
    for (let i = flames.length - 1; i >= 0; i -= 1) {
      recycleFlame(i);
    }
  }

  function createBombProjectile() {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 12, 10),
      new THREE.MeshStandardMaterial({
        color: 0x48505d,
        metalness: 0.72,
        roughness: 0.38,
      })
    );
    group.add(body);

    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.03, 8, 14),
      new THREE.MeshStandardMaterial({
        color: 0x2a313b,
        metalness: 0.78,
        roughness: 0.3,
      })
    );
    band.rotation.x = Math.PI / 2;
    group.add(band);

    const fuseLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xff7447,
        emissive: 0xff5b29,
        emissiveIntensity: 0.9,
        roughness: 0.3,
        metalness: 0.04,
      })
    );
    fuseLight.position.set(0, 0.22, 0);
    group.add(fuseLight);

    return {
      group: group,
      fuseLight: fuseLight,
    };
  }

  function throwBomb(currentWeapon, origin) {
    const bomb = pooledBombs.pop() || createBombProjectile();
    camera.getWorldDirection(flameDirection);
    bomb.group.position.copy(origin);
    bomb.group.rotation.set(Math.random(), Math.random(), Math.random());
    bomb.group.visible = true;
    bomb.fuseLight.material.emissiveIntensity = 1;
    bombRoot.add(bomb.group);

    const velocity = flameDirection
      .clone()
      .multiplyScalar(currentWeapon.throwSpeed)
      .add(new THREE.Vector3(0, currentWeapon.throwLift, 0))
      .addScaledVector(player.velocity, 0.28);

    bombs.push({
      model: bomb,
      velocity: velocity,
      life: currentWeapon.fuseTime,
      config: currentWeapon,
    });
    sound.throwBomb();
  }

  function updateBombs(delta) {
    for (let i = bombs.length - 1; i >= 0; i -= 1) {
      const bomb = bombs[i];
      bomb.life -= delta;
      bomb.velocity.y -= 25 * delta;
      bomb.model.group.position.addScaledVector(bomb.velocity, delta);
      bomb.model.group.rotation.x += delta * 8;
      bomb.model.group.rotation.z += delta * 5.5;

      const groundY =
        sampleHeight(
          bomb.model.group.position.x,
          bomb.model.group.position.z
        ) + 0.3;

      if (bomb.model.group.position.y <= groundY) {
        bomb.model.group.position.y = groundY;

        if (Math.abs(bomb.velocity.y) > 2.2) {
          bomb.velocity.y = Math.abs(bomb.velocity.y) * 0.42;
          bomb.velocity.x *= 0.72;
          bomb.velocity.z *= 0.72;
        } else {
          bomb.velocity.y = 0;
          bomb.velocity.x = THREE.MathUtils.damp(bomb.velocity.x, 0, 7, delta);
          bomb.velocity.z = THREE.MathUtils.damp(bomb.velocity.z, 0, 7, delta);
        }
      }

      bomb.model.fuseLight.material.emissiveIntensity =
        0.5 + Math.abs(Math.sin(bomb.life * 12)) * 1.3;

      if (bomb.life <= 0) {
        explodeBomb(i);
      }
    }
  }

  function explodeBomb(index) {
    const bomb = bombs[index];
    const position = bomb.model.group.position.clone();
    const config = bomb.config;

    bombRoot.remove(bomb.model.group);
    bomb.model.group.visible = false;
    pooledBombs.push(bomb.model);
    bombs.splice(index, 1);

    createExplosionVisual(position, config);
    sound.explosion();

    for (let i = activeZombies.length - 1; i >= 0; i -= 1) {
      const zombie = activeZombies[i];
      blastCenter.copy(zombie.group.position);
      blastCenter.y += 2.2;
      blastVector.copy(blastCenter).sub(position);
      const distance = blastVector.length();

      if (distance > config.blastRadius) {
        continue;
      }

      damageZombie(
        zombie,
        config.damagePerShot *
          THREE.MathUtils.lerp(1, 0.2, distance / config.blastRadius),
        { silent: true }
      );
    }

    for (let i = activeBlockMeshes.length - 1; i >= 0; i -= 1) {
      const block = activeBlockMeshes[i];
      if (block.position.distanceTo(position) <= config.blockBlastRadius) {
        destroyBlock(block, { silent: true });
      }
    }

    impactCenter.copy(player.position);
    impactCenter.y -= PLAYER.height - 1.6;
    const playerDistance = impactCenter.distanceTo(position);
    if (playerDistance <= config.blastRadius) {
      damagePlayer(
        Math.max(
          18,
          config.damagePerShot *
            THREE.MathUtils.lerp(1, 0.18, playerDistance / config.blastRadius)
        ),
        true
      );
    }
  }

  function createExplosionVisual(position, config) {
    const mesh =
      pooledExplosions.pop() ||
      new THREE.Mesh(
        explosionGeometry,
        new THREE.MeshBasicMaterial({
          color: 0xffb15b,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
        })
      );
    mesh.position.copy(position);
    mesh.visible = true;
    mesh.scale.setScalar(0.8);
    mesh.material.opacity = 0.82;
    mesh.material.color.setHex(0xffb15b);
    explosionRoot.add(mesh);

    explosions.push({
      mesh: mesh,
      life: 0.38,
      maxLife: 0.38,
      maxScale: config.blastRadius * 0.44,
    });
  }

  function updateExplosions(delta) {
    for (let i = explosions.length - 1; i >= 0; i -= 1) {
      const explosion = explosions[i];
      explosion.life -= delta;
      const progress = 1 - explosion.life / explosion.maxLife;
      const scale = THREE.MathUtils.lerp(0.8, explosion.maxScale, progress);
      explosion.mesh.scale.setScalar(scale);
      explosion.mesh.material.opacity = Math.max(0, 0.82 * (1 - progress));

      if (explosion.life <= 0) {
        recycleExplosion(i);
      }
    }
  }

  function recycleExplosion(index) {
    const explosion = explosions[index];
    explosionRoot.remove(explosion.mesh);
    explosion.mesh.visible = false;
    pooledExplosions.push(explosion.mesh);
    explosions.splice(index, 1);
  }

  function clearExplosions() {
    for (let i = explosions.length - 1; i >= 0; i -= 1) {
      recycleExplosion(i);
    }
  }

  function clearBombs() {
    while (bombs.length > 0) {
      const bomb = bombs.pop();
      bombRoot.remove(bomb.model.group);
      bomb.model.group.visible = false;
      pooledBombs.push(bomb.model);
    }
  }

  function startReload(manual) {
    const currentWeapon = getSelectedWeapon();

    if (isReloading) {
      return false;
    }

    if (
      currentWeapon.isMelee ||
      ammoInMag >= currentWeapon.magazineSize ||
      reserveAmmo <= 0
    ) {
      if (manual && emptySoundCooldown === 0) {
        sound.empty();
        emptySoundCooldown = 0.22;
      }
      return false;
    }

    isReloading = true;
    reloadTimer = currentWeapon.reloadTime;
    controls.shooting = false;
    controls.aiming = false;
    sound.reloadStart();

    if (manual) {
      weaponCooldown = Math.max(weaponCooldown, 0.06);
    }

    return true;
  }

  function finishReload() {
    const currentWeapon = getSelectedWeapon();
    const needed = currentWeapon.magazineSize - ammoInMag;
    const loaded = Math.min(needed, reserveAmmo);

    ammoInMag += loaded;
    reserveAmmo -= loaded;
    isReloading = false;
    sound.reloadEnd();
    storeWeaponState();
    updateLoadoutBar();
  }

  function createDebrisPiece(materialIndex) {
    return new THREE.Mesh(blockDebrisGeometry, blockMaterials[materialIndex]);
  }

  function spawnBlockDebris(mesh) {
    const materialIndex = mesh.userData.materialIndex || 0;

    for (let i = 0; i < BLOCK_PHYSICS.debrisCount; i += 1) {
      const piece = pooledDebris.pop() || createDebrisPiece(materialIndex);
      piece.material = blockMaterials[materialIndex];
      piece.visible = true;
      piece.scale.setScalar(0.62 + Math.random() * 0.24);
      piece.position.copy(mesh.position);
      piece.position.x += (Math.random() - 0.5) * BLOCKS.size * 0.38;
      piece.position.y += (Math.random() - 0.5) * BLOCKS.size * 0.2;
      piece.position.z += (Math.random() - 0.5) * BLOCKS.size * 0.38;
      piece.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      debrisRoot.add(piece);

      debrisPieces.push({
        mesh: piece,
        materialIndex: materialIndex,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          5 + Math.random() * 6,
          (Math.random() - 0.5) * 8
        ),
        angularVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 7,
          (Math.random() - 0.5) * 7,
          (Math.random() - 0.5) * 7
        ),
        life: 1.5 + Math.random() * 0.7,
        impactCooldown: 0,
      });
    }
  }

  function recycleDebris(index) {
    const debris = debrisPieces[index];
    debrisRoot.remove(debris.mesh);
    debris.mesh.visible = false;
    pooledDebris.push(debris.mesh);
    debrisPieces.splice(index, 1);
  }

  function updateDebris(delta) {
    for (let i = debrisPieces.length - 1; i >= 0; i -= 1) {
      const debris = debrisPieces[i];
      debris.life -= delta;
      debris.impactCooldown = Math.max(0, debris.impactCooldown - delta);
      debris.velocity.y -= BLOCK_PHYSICS.gravity * delta;
      debris.mesh.position.addScaledVector(debris.velocity, delta);
      debris.mesh.rotation.x += debris.angularVelocity.x * delta;
      debris.mesh.rotation.y += debris.angularVelocity.y * delta;
      debris.mesh.rotation.z += debris.angularVelocity.z * delta;
      debris.angularVelocity.multiplyScalar(Math.exp(-1.8 * delta));

      const groundY =
        sampleHeight(debris.mesh.position.x, debris.mesh.position.z) +
        debris.mesh.scale.y * BLOCKS.size * 0.24;

      if (debris.mesh.position.y <= groundY) {
        debris.mesh.position.y = groundY;

        const impact = Math.abs(debris.velocity.y);
        if (impact > 1.8) {
          debris.velocity.y = Math.abs(debris.velocity.y) * 0.18;
          debris.velocity.x *= 0.65;
          debris.velocity.z *= 0.65;
          if (debris.impactCooldown === 0) {
            sound.block(
              blockSoundProfiles[debris.materialIndex],
              Math.min(1, impact / 12),
              "land"
            );
            debris.impactCooldown = 0.1;
          }
        } else {
          debris.velocity.set(0, 0, 0);
        }
      }

      if (debris.life <= 0) {
        recycleDebris(i);
      }
    }
  }

  function clearDebris() {
    for (let i = debrisPieces.length - 1; i >= 0; i -= 1) {
      recycleDebris(i);
    }
  }

  function computeBlockSupportHeight(mesh) {
    let support = sampleHeight(mesh.position.x, mesh.position.z);

    for (let i = 0; i < activeBlockMeshes.length; i += 1) {
      const other = activeBlockMeshes[i];
      if (other === mesh || destroyedBlocks.has(other.userData.blockId)) {
        continue;
      }

      if (
        Math.abs(other.position.x - mesh.position.x) > BLOCK_PHYSICS.supportRadius ||
        Math.abs(other.position.z - mesh.position.z) > BLOCK_PHYSICS.supportRadius
      ) {
        continue;
      }

      const otherTop = other.position.y + BLOCKS.size * 0.5;
      if (otherTop <= mesh.position.y - BLOCKS.size * 0.2 && otherTop > support) {
        support = otherTop;
      }
    }

    return support;
  }

  function removeDynamicBlock(mesh) {
    for (let i = dynamicBlocks.length - 1; i >= 0; i -= 1) {
      if (dynamicBlocks[i].mesh === mesh) {
        dynamicBlocks.splice(i, 1);
      }
    }

    mesh.userData.dynamic = false;
  }

  function makeBlockDynamic(mesh, initialVelocity) {
    if (!mesh || mesh.userData.dynamic || destroyedBlocks.has(mesh.userData.blockId)) {
      return;
    }

    mesh.userData.dynamic = true;
    dynamicBlocks.push({
      mesh: mesh,
      velocity:
        initialVelocity ||
        new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          4 + Math.random() * 2,
          (Math.random() - 0.5) * 3
        ),
      angularVelocity: new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      ),
      impactCooldown: 0,
      settledTime: 0,
    });
  }

  function releaseStackAbove(mesh) {
    const chunk = activeChunks.get(mesh.userData.chunkKey);
    if (!chunk) {
      return;
    }

    for (let i = 0; i < chunk.blocks.length; i += 1) {
      const candidate = chunk.blocks[i];
      if (
        candidate === mesh ||
        candidate.userData.stackSlot !== mesh.userData.stackSlot ||
        candidate.userData.stackLevel <= mesh.userData.stackLevel
      ) {
        continue;
      }

      physicsImpulse.set(
        (Math.random() - 0.5) * 4.5,
        5 + (candidate.userData.stackLevel - mesh.userData.stackLevel) * 1.8,
        (Math.random() - 0.5) * 4.5
      );
      makeBlockDynamic(candidate, physicsImpulse.clone());
    }
  }

  function updateDynamicBlocks(delta) {
    for (let i = dynamicBlocks.length - 1; i >= 0; i -= 1) {
      const block = dynamicBlocks[i];
      if (!block.mesh.parent) {
        dynamicBlocks.splice(i, 1);
        continue;
      }

      block.impactCooldown = Math.max(0, block.impactCooldown - delta);
      block.velocity.y -= BLOCK_PHYSICS.gravity * delta;
      block.mesh.position.addScaledVector(block.velocity, delta);
      block.mesh.rotation.x += block.angularVelocity.x * delta;
      block.mesh.rotation.y += block.angularVelocity.y * delta;
      block.mesh.rotation.z += block.angularVelocity.z * delta;
      block.angularVelocity.multiplyScalar(Math.exp(-1.3 * delta));

      const supportY = computeBlockSupportHeight(block.mesh) + BLOCKS.size * 0.5;

      if (block.mesh.position.y <= supportY) {
        block.mesh.position.y = supportY;
        const impact =
          Math.abs(block.velocity.y) + Math.hypot(block.velocity.x, block.velocity.z) * 0.35;

        if (impact > 2.4) {
          block.velocity.y = Math.abs(block.velocity.y) * BLOCK_PHYSICS.bounce;
          block.velocity.x *= 0.76;
          block.velocity.z *= 0.76;
          if (block.impactCooldown === 0) {
            sound.block(
              blockSoundProfiles[block.mesh.userData.materialIndex || 0],
              Math.min(1, impact / 14),
              "land"
            );
            block.impactCooldown = 0.1;
          }
          block.settledTime = 0;
        } else {
          block.velocity.y = 0;
          block.velocity.x = THREE.MathUtils.damp(block.velocity.x, 0, 8, delta);
          block.velocity.z = THREE.MathUtils.damp(block.velocity.z, 0, 8, delta);
          block.angularVelocity.multiplyScalar(Math.exp(-7 * delta));
          block.settledTime += delta;

          if (
            block.settledTime > 0.2 &&
            Math.abs(block.velocity.x) < 0.08 &&
            Math.abs(block.velocity.z) < 0.08
          ) {
            block.mesh.userData.dynamic = false;
            dynamicBlocks.splice(i, 1);
          }
        }
      } else {
        block.settledTime = 0;
      }
    }
  }

  function clearDynamicBlocks() {
    for (let i = dynamicBlocks.length - 1; i >= 0; i -= 1) {
      const mesh = dynamicBlocks[i].mesh;
      mesh.position.y = computeBlockSupportHeight(mesh) + BLOCKS.size * 0.5;
      mesh.userData.dynamic = false;
    }
    dynamicBlocks.length = 0;
  }

  function destroyBlock(mesh, options) {
    if (!mesh || destroyedBlocks.has(mesh.userData.blockId)) {
      return;
    }

    const settings = options || {};

    destroyedBlocks.add(mesh.userData.blockId);
    totalHits += 1;
    if (!settings.silent) {
      sound.block(blockSoundProfiles[mesh.userData.materialIndex || 0], 0.92, "break");
    }
    spawnBlockDebris(mesh);
    releaseStackAbove(mesh);
    removeBlockMesh(mesh);

    const chunk = activeChunks.get(mesh.userData.chunkKey);
    if (!chunk) {
      return;
    }

    const index = chunk.blocks.indexOf(mesh);
    if (index !== -1) {
      chunk.blocks.splice(index, 1);
    }
  }

  function updateZombies(delta) {
    if (currentMode === MODES.multiplayer) {
      if (multiplayerVariant !== MULTIPLAYER_VARIANTS.horde) {
        if (activeZombies.length > 0) {
          clearZombies();
        }
        return;
      }
      const smoothing = 1 - Math.exp(-10 * Math.max(delta, 0.0001));
      const now = performance.now();
      for (let i = activeZombies.length - 1; i >= 0; i -= 1) {
        const zombie = activeZombies[i];
        if (!zombie.isRemoteSync) {
          continue;
        }

        if (now - (zombie.lastSeenAt || 0) > MULTIPLAYER.staleAfter * 1000) {
          removeZombie(zombie);
          continue;
        }

        zombie.attackPulse = Math.max(0, (zombie.attackPulse || 0) - delta * 2.8);
        zombie.stepTime += delta * (zombie.moving ? 7.4 : 2.8);
        zombie.group.position.lerp(zombie.targetPosition, smoothing);
        zombie.group.position.y = sampleHeight(zombie.group.position.x, zombie.group.position.z);
        const yawDelta = Math.atan2(
          Math.sin(zombie.targetYaw - zombie.group.rotation.y),
          Math.cos(zombie.targetYaw - zombie.group.rotation.y)
        );
        zombie.group.rotation.y += yawDelta * smoothing;
        animateZombie(zombie, delta);
      }
      return;
    }

    if (currentMode !== MODES.zombie) {
      return;
    }

    if (!playerIsDead) {
      zombieSpawnTimer = Math.max(0, zombieSpawnTimer - delta);
      while (zombieSpawnTimer === 0 && activeZombies.length < ZOMBIES.maxAlive) {
        if (!spawnZombieAroundPlayer()) {
          zombieSpawnTimer = 1.2;
          break;
        }
        zombieSpawnTimer += ZOMBIES.spawnInterval;
      }
    }

    for (let i = activeZombies.length - 1; i >= 0; i -= 1) {
      const zombie = activeZombies[i];

      zombie.attackCooldown = Math.max(0, zombie.attackCooldown - delta);
      zombie.attackPulse = Math.max(0, zombie.attackPulse - delta * 2.8);
      zombie.stepTime += delta * (zombie.moving ? 7.4 : 2.8);

      zombieToPlayer.set(
        player.position.x - zombie.group.position.x,
        0,
        player.position.z - zombie.group.position.z
      );
      const distance = zombieToPlayer.length();

      if (distance > ZOMBIES.despawnRange) {
        removeZombie(zombie);
        continue;
      }

      let targetSpeed = 0;
      zombie.moving = false;

      if (!playerIsDead && distance < ZOMBIES.chaseRange) {
        zombieToPlayer.normalize();
        zombie.group.rotation.y = Math.atan2(-zombieToPlayer.x, -zombieToPlayer.z);

        if (distance > ZOMBIES.attackRange) {
          targetSpeed = ZOMBIES.walkSpeed;
          const steering = chooseSteeringStep(
            zombie.group.position.x,
            zombie.group.position.z,
            player.position.x,
            player.position.z,
            Math.min(distance - ZOMBIES.attackRange, targetSpeed * delta),
            DEFENSE.zombieRadius,
            zombie.group.position.y,
            zombie.group.position.y + 5.2
          );
          if (steering) {
            zombie.moving = true;
            zombie.group.rotation.y = steering.yaw;
            zombie.velocity.x = THREE.MathUtils.damp(
              zombie.velocity.x,
              steering.dirX * targetSpeed,
              6,
              delta
            );
            zombie.velocity.z = THREE.MathUtils.damp(
              zombie.velocity.z,
              steering.dirZ * targetSpeed,
              6,
              delta
            );
          } else {
            zombie.velocity.x = THREE.MathUtils.damp(zombie.velocity.x, 0, 8, delta);
            zombie.velocity.z = THREE.MathUtils.damp(zombie.velocity.z, 0, 8, delta);
          }
        } else if (zombie.attackCooldown === 0) {
          damagePlayer(ZOMBIES.attackDamage);
          zombie.attackCooldown = ZOMBIES.attackInterval;
          zombie.attackPulse = 1;
          zombie.velocity.x = THREE.MathUtils.damp(zombie.velocity.x, 0, 8, delta);
          zombie.velocity.z = THREE.MathUtils.damp(zombie.velocity.z, 0, 8, delta);
        }
      } else {
        zombie.velocity.x = THREE.MathUtils.damp(zombie.velocity.x, 0, 6, delta);
        zombie.velocity.z = THREE.MathUtils.damp(zombie.velocity.z, 0, 6, delta);
      }

      zombie.group.position.x += zombie.velocity.x * delta;
      zombie.group.position.z += zombie.velocity.z * delta;
      resolveSolidCollisions(
        zombie.group.position,
        DEFENSE.zombieRadius,
        zombie.group.position.y,
        zombie.group.position.y + 5.2
      );
      zombie.group.position.y = sampleHeight(
        zombie.group.position.x,
        zombie.group.position.z
      );

      animateZombie(zombie, delta);
    }
  }

  function animateZombie(zombie, delta) {
    const strideStrength = Math.min(
      Math.hypot(zombie.velocity.x, zombie.velocity.z) / ZOMBIES.walkSpeed,
      1
    );
    const attackKick = Math.sin(zombie.attackPulse * Math.PI);

    zombie.rightLeg.rotation.x =
      Math.sin(zombie.stepTime) * 0.9 * strideStrength - attackKick * 0.16;
    zombie.leftLeg.rotation.x =
      -Math.sin(zombie.stepTime) * 0.9 * strideStrength - attackKick * 0.16;
    zombie.rightArm.rotation.x =
      -0.22 - Math.sin(zombie.stepTime) * 0.78 * strideStrength - attackKick * 1.05;
    zombie.leftArm.rotation.x =
      -0.22 + Math.sin(zombie.stepTime) * 0.78 * strideStrength - attackKick * 1.05;
    zombie.rightArm.rotation.z = 0.22 + attackKick * 0.18;
    zombie.leftArm.rotation.z = -0.22 - attackKick * 0.18;
    zombie.torso.rotation.z = Math.sin(zombie.stepTime * 0.5) * 0.05 * strideStrength;
    zombie.head.rotation.x = attackKick * 0.08;
    zombie.head.rotation.y = Math.sin(zombie.stepTime * 0.35) * 0.08;
    zombie.badge.sprite.position.y = THREE.MathUtils.damp(
      zombie.badge.sprite.position.y,
      6.15 + Math.sin(zombie.stepTime * 0.9) * 0.08,
      7,
      delta
    );
  }

  function spawnZombieAroundPlayer() {
    for (let attempt = 0; attempt < 14; attempt += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = THREE.MathUtils.lerp(
        ZOMBIES.spawnRadiusMin,
        ZOMBIES.spawnRadiusMax,
        Math.random()
      );
      zombieSpawnPosition.set(
        player.position.x + Math.cos(angle) * radius,
        0,
        player.position.z + Math.sin(angle) * radius
      );
      zombieSpawnPosition.y = sampleHeight(
        zombieSpawnPosition.x,
        zombieSpawnPosition.z
      );

      if (
        zombieSpawnPosition.y < WORLD.seaLevel + 1 ||
        zombieSpawnPosition.y > 42
      ) {
        continue;
      }

      let blocked = false;
      for (let i = 0; i < activeZombies.length; i += 1) {
        if (
          activeZombies[i].group.position.distanceToSquared(zombieSpawnPosition) <
          100
        ) {
          blocked = true;
          break;
        }
      }

      if (
        blocked ||
        collidesWithSolidAt(
          zombieSpawnPosition.x,
          zombieSpawnPosition.z,
          zombieSpawnPosition.y,
          zombieSpawnPosition.y + 5.2,
          DEFENSE.zombieRadius
        )
      ) {
        continue;
      }

      const zombie = createZombie(++zombieId);
      zombie.group.position.copy(zombieSpawnPosition);
      zombieRoot.add(zombie.group);
      activeZombies.push(zombie);
      zombieHitMeshes.push(zombie.hitbox);
      return true;
    }

    return false;
  }

  function clearZombies() {
    while (activeZombies.length > 0) {
      removeZombie(activeZombies[activeZombies.length - 1]);
    }
  }

  function findMultiplayerZombieById(zombieId) {
    const matchId = String(zombieId || "");
    for (let i = 0; i < activeZombies.length; i += 1) {
      if (String(activeZombies[i].serverZombieId || activeZombies[i].id) === matchId) {
        return activeZombies[i];
      }
    }
    return null;
  }

  function upsertMultiplayerZombie(zombieInfo) {
    const zombieId = String(zombieInfo && zombieInfo.id ? zombieInfo.id : "");
    if (!zombieId) {
      return;
    }

    const x = Number(zombieInfo.x);
    const z = Number(zombieInfo.z);
    const yaw = Number(zombieInfo.yaw);
    const nextHealth = Number.isFinite(Number(zombieInfo.health))
      ? Number(zombieInfo.health)
      : ZOMBIES.maxHealth;
    const nextMaxHealth = Number.isFinite(Number(zombieInfo.maxHealth))
      ? Number(zombieInfo.maxHealth)
      : ZOMBIES.maxHealth;
    const targetX = Number.isFinite(x) ? x : 0;
    const targetZ = Number.isFinite(z) ? z : 0;
    const targetY = sampleHeight(targetX, targetZ);

    let zombie = findMultiplayerZombieById(zombieId);
    if (!zombie) {
      zombie = createZombie(zombieId);
      zombie.serverZombieId = zombieId;
      zombie.isRemoteSync = true;
      zombie.targetPosition = new THREE.Vector3(targetX, targetY, targetZ);
      zombie.targetYaw = Number.isFinite(yaw) ? yaw : 0;
      zombie.lastSeenAt = performance.now();
      zombie.group.position.copy(zombie.targetPosition);
      zombie.group.rotation.y = zombie.targetYaw;
      zombie.health = nextHealth;
      zombie.maxHealth = Math.max(1, nextMaxHealth);
      zombieRoot.add(zombie.group);
      activeZombies.push(zombie);
      zombieHitMeshes.push(zombie.hitbox);
    } else {
      zombie.targetPosition.set(targetX, targetY, targetZ);
      zombie.targetYaw = Number.isFinite(yaw) ? yaw : zombie.targetYaw;
      zombie.lastSeenAt = performance.now();
      zombie.health = nextHealth;
      zombie.maxHealth = Math.max(1, nextMaxHealth);
    }

    zombie.attackPulse = Math.max(
      zombie.attackPulse || 0,
      Number.isFinite(Number(zombieInfo.attackPulse)) ? Number(zombieInfo.attackPulse) : 0
    );
    zombie.moving = Boolean(zombieInfo.moving);
    updateHealthBadge(
      zombie.badge,
      getZombieLabel(zombie.serverZombieId),
      zombie.health,
      zombie.maxHealth,
      "#89ff72",
      "#d64040"
    );
  }

  function syncMultiplayerZombies(zombies) {
    const seen = new Set();
    zombies.forEach(function (zombieInfo) {
      const zombieId = String(zombieInfo && zombieInfo.id ? zombieInfo.id : "");
      if (!zombieId) {
        return;
      }
      seen.add(zombieId);
      upsertMultiplayerZombie(zombieInfo);
    });

    for (let i = activeZombies.length - 1; i >= 0; i -= 1) {
      const zombie = activeZombies[i];
      if (zombie.isRemoteSync && !seen.has(String(zombie.serverZombieId || zombie.id))) {
        removeZombie(zombie);
      }
    }
  }

  function removeZombie(zombie) {
    const zombieIndex = activeZombies.indexOf(zombie);
    if (zombieIndex !== -1) {
      activeZombies.splice(zombieIndex, 1);
    }

    const hitboxIndex = zombieHitMeshes.indexOf(zombie.hitbox);
    if (hitboxIndex !== -1) {
      zombieHitMeshes.splice(hitboxIndex, 1);
    }

    zombieRoot.remove(zombie.group);
    zombie.badge.sprite.material.map.dispose();
    zombie.badge.sprite.material.dispose();
  }

  function damageZombie(zombie, amount, options) {
    if (!zombie) {
      return;
    }

    const settings = options || {};

    if (
      currentMode === MODES.multiplayer &&
      multiplayerVariant === MULTIPLAYER_VARIANTS.horde &&
      zombie.isRemoteSync &&
      multiplayerPlayerId
    ) {
      requestMultiplayerZombieHit(zombie.serverZombieId || zombie.id, amount, settings);
      return;
    }

    zombie.health = Math.max(0, zombie.health - amount);
    totalHits += 1;
    updateHealthBadge(
      zombie.badge,
      getZombieLabel(zombie.id),
      zombie.health,
      ZOMBIES.maxHealth,
      "#89ff72",
      "#d64040"
    );
    if (!settings.silent) {
      sound.hit();
    }

    if (zombie.health === 0) {
      zombieKills += 1;
      removeZombie(zombie);
    }
  }

  function damagePlayer(amount, bypassCooldown) {
    if ((!bypassCooldown && playerDamageCooldown > 0) || playerIsDead) {
      return;
    }

    playerHealth = Math.max(0, playerHealth - amount);
    playerDamageCooldown = PLAYER.damageCooldown;

    if (playerHealth === 0) {
      playerIsDead = true;
      controls.shooting = false;
      controls.aiming = false;
      startButton.textContent = t("buttons.respawn");
      if (
        document.pointerLockElement === renderer.domElement &&
        typeof document.exitPointerLock === "function"
      ) {
        document.exitPointerLock();
      } else {
        setPlayingState(false);
      }
    }
  }

  function updatePlayerAvatar(delta) {
    const currentWeapon = getSelectedWeapon();
    const pose = AVATAR_POSES[currentWeapon.type];
    const visible = singlePlayerStarted && thirdPersonEnabled;
    playerAvatar.group.visible = visible;

    if (!visible) {
      avatarWeapon.flash.visible = false;
      return;
    }

    const aimingNow =
      pointerLocked &&
      controls.aiming &&
      currentWeapon.supportsAim &&
      !isReloading;
    const firingNow = pointerLocked && controls.shooting && !isReloading;
    const slideActive = performance.now() / 1000 < slideActiveUntil;
    const sprintIntent = selectedControlScheme === CONTROL_SCHEMES.pad
      ? controls.sprint && touchMoveVector.length() > 0.2
      : controls.sprint && controls.forward;
    const sprinting = slideActive || (sprintIntent && !sprintExhausted && sprintEnergy > 0);
    const movementWeight = Math.min(movementSpeed / PLAYER.sprintSpeed, 1);
    const strideStrength = player.grounded ? movementWeight * (1 - aimWeight * 0.55) : 0.18;
    const stride = bobTime * (sprinting ? 1.05 : 0.82);
    const reloadPhase =
      isReloading && currentWeapon.reloadTime > 0
        ? 1 - reloadTimer / currentWeapon.reloadTime
        : 0;
    const reloadArc = Math.sin(reloadPhase * Math.PI);
    const actionProgress = 1 - weaponAction;
    const actionArc =
      weaponAction > 0
        ? Math.sin(THREE.MathUtils.clamp(actionProgress, 0, 1) * Math.PI)
        : 0;
    const bodyBob = Math.abs(Math.cos(bobTime * 2)) * 0.16 * strideStrength;
    const followAlpha = delta > 0 ? 1 - Math.exp(-10 * delta) : 1;

    avatarTargetPosition.copy(player.position);
    avatarTargetPosition.y -= PLAYER.height - 0.18 - bodyBob;
    playerAvatar.group.position.lerp(avatarTargetPosition, followAlpha);
    playerAvatar.group.rotation.y = player.yaw;

    playerAvatar.head.rotation.x = THREE.MathUtils.clamp(player.pitch * 0.35, -0.45, 0.45);
    playerAvatar.torso.rotation.x = THREE.MathUtils.lerp(0, player.pitch * 0.08, aimWeight);
    playerAvatar.torso.rotation.z = Math.sin(bobTime) * 0.04 * strideStrength;

    playerAvatar.rightLeg.rotation.x = Math.sin(stride) * 0.88 * strideStrength;
    playerAvatar.leftLeg.rotation.x = -Math.sin(stride) * 0.88 * strideStrength;
    playerAvatar.rightLeg.rotation.z = 0.04;
    playerAvatar.leftLeg.rotation.z = -0.04;

    playerAvatar.rightArm.rotation.x =
      THREE.MathUtils.lerp(-0.42, -1.1, aimWeight) -
      Math.sin(stride) * 0.42 * strideStrength -
      reloadArc * 0.4 -
      actionArc * (currentWeapon.isMelee ? 0.52 : 0.18);
    playerAvatar.leftArm.rotation.x =
      THREE.MathUtils.lerp(-0.18, -0.92, aimWeight) +
      Math.sin(stride) * 0.36 * strideStrength -
      reloadArc * 0.22 +
      actionArc * (currentWeapon.isMelee ? 0.18 : 0.08);
    playerAvatar.rightArm.rotation.z =
      THREE.MathUtils.lerp(0.2, 0.08, aimWeight) +
      reloadArc * 0.1 +
      actionArc * (currentWeapon.isMelee ? 0.36 : 0.08);
    playerAvatar.leftArm.rotation.z =
      THREE.MathUtils.lerp(-0.28, -0.12, aimWeight) -
      reloadArc * 0.28 -
      actionArc * (currentWeapon.isMelee ? 0.16 : 0.04);

    playerAvatar.weaponMount.position.set(
      THREE.MathUtils.lerp(pose.mountHip[0], pose.mountAim[0], aimWeight) +
        reloadArc * pose.reloadMount[0],
      THREE.MathUtils.lerp(pose.mountHip[1], pose.mountAim[1], aimWeight) -
        reloadArc * pose.reloadMount[1],
      THREE.MathUtils.lerp(pose.mountHip[2], pose.mountAim[2], aimWeight) -
        reloadArc * pose.reloadMount[2]
    );
    avatarWeapon.group.rotation.set(
      THREE.MathUtils.lerp(pose.rotationHip[0], pose.rotationAim[0], aimWeight) -
        reloadArc * pose.reloadRotation[0] -
        actionArc * (currentWeapon.isMelee ? 0.82 : 0.12),
      THREE.MathUtils.lerp(pose.rotationHip[1], pose.rotationAim[1], aimWeight) +
        reloadArc * pose.reloadRotation[1] +
        actionArc * (currentWeapon.isMelee ? 0.24 : 0.06),
      THREE.MathUtils.lerp(pose.rotationHip[2], pose.rotationAim[2], aimWeight) +
        reloadArc * pose.reloadRotation[2] -
        actionArc * (currentWeapon.isMelee ? 0.64 : 0.04)
    );
    avatarWeapon.group.position.set(
      THREE.MathUtils.lerp(pose.localHip[0], pose.localAim[0], aimWeight),
      THREE.MathUtils.lerp(pose.localHip[1], pose.localAim[1], aimWeight) -
        reloadArc * 0.06 +
        actionArc * (currentWeapon.isMelee ? 0.08 : 0),
      THREE.MathUtils.lerp(pose.localHip[2], pose.localAim[2], aimWeight) +
        actionArc * (currentWeapon.isMelee ? 0.08 : 0)
    );

    if (avatarWeapon.barrels) {
      avatarWeapon.barrels.rotation.z += barrelSpin * delta;
    }
    if (avatarWeapon.drum) {
      avatarWeapon.drum.rotation.x += delta * (firingNow ? 10 : 2);
    }
    if (avatarWeapon.bolt) {
      avatarWeapon.bolt.position.z = THREE.MathUtils.damp(
        avatarWeapon.bolt.position.z,
        weaponAction > 0 ? -0.12 : -0.02,
        16,
        delta
      );
    }
    if (avatarWeapon.pump) {
      avatarWeapon.pump.position.z = THREE.MathUtils.damp(
        avatarWeapon.pump.position.z,
        -0.42 - actionArc * 0.22,
        12,
        delta
      );
    }
    if (avatarWeapon.scopeGlass) {
      avatarWeapon.scopeGlass.material.emissiveIntensity = THREE.MathUtils.damp(
        avatarWeapon.scopeGlass.material.emissiveIntensity || 0.3,
        aimingNow ? 0.85 : 0.3,
        8,
        delta
      );
    }
    if (avatarWeapon.pilotLight) {
      avatarWeapon.pilotLight.material.emissiveIntensity = THREE.MathUtils.damp(
        avatarWeapon.pilotLight.material.emissiveIntensity || 0.45,
        currentWeapon.type === "flamethrower"
          ? firingNow
            ? 1.35
            : 0.55
          : 0.2,
        10,
        delta
      );
    }
    avatarWeapon.flash.visible = muzzleFlashLife > 0 && !currentWeapon.isMelee;
    avatarWeapon.flash.material.opacity = Math.min(1, muzzleFlashLife / 0.05);
  }

  function updateCameraTransform(delta) {
    const aimingNow = controls.aiming && getSelectedWeapon().supportsAim;
    const pitch = player.pitch + recoilKick * (aimingNow ? 0.05 : 0.09);
    const slideActive = performance.now() / 1000 < slideActiveUntil;
    const slideOffsetTarget = slideActive ? CAMERA_VIEW.slideDrop : 0;
    const slideOffsetDamping = slideActive
      ? CAMERA_VIEW.slideDropEngage
      : CAMERA_VIEW.slideDropReturn;
    cameraSlideOffset = THREE.MathUtils.damp(
      cameraSlideOffset,
      slideOffsetTarget,
      slideOffsetDamping,
      Math.max(delta, 0.0001)
    );

    if (!thirdPersonEnabled) {
      camera.position.copy(player.position);
      camera.position.y -= cameraSlideOffset;
      camera.rotation.y = player.yaw;
      camera.rotation.x = pitch;
      return;
    }

    cameraEuler.set(pitch, player.yaw, 0, "YXZ");
    camera.quaternion.setFromEuler(cameraEuler);
    camera.getWorldDirection(cameraDirection);
    cameraRight.crossVectors(cameraDirection, camera.up).normalize();

    cameraAimPoint.copy(player.position);
    cameraAimPoint.y -= 0.65 + cameraSlideOffset * 0.26;
    cameraAimPoint.addScaledVector(cameraDirection, 42);

    cameraDesiredPosition.copy(player.position);
    cameraDesiredPosition.y += aimingNow
      ? CAMERA_VIEW.thirdPersonAimHeight
      : CAMERA_VIEW.thirdPersonHeight;
    cameraDesiredPosition.y -= cameraSlideOffset * 0.54;
    cameraDesiredPosition.addScaledVector(
      cameraRight,
      aimingNow
        ? CAMERA_VIEW.thirdPersonAimShoulder
        : CAMERA_VIEW.thirdPersonShoulder
    );
    cameraDesiredPosition.addScaledVector(
      cameraDirection,
      aimingNow
        ? -CAMERA_VIEW.thirdPersonAimDistance
        : -CAMERA_VIEW.thirdPersonDistance
    );

    cameraDesiredPosition.y = Math.max(
      cameraDesiredPosition.y,
      sampleHeight(cameraDesiredPosition.x, cameraDesiredPosition.z) + 1.4
    );

    camera.position.lerp(
      cameraDesiredPosition,
      1 - Math.exp(-10 * Math.max(delta, 0.0001))
    );
    camera.lookAt(cameraAimPoint);
  }

  function updateReadouts(delta) {
    const currentWeapon = getSelectedWeapon();
    const inPvpLobby =
      currentMode === MODES.multiplayer &&
      multiplayerVariant === MULTIPLAYER_VARIANTS.pvp;
    const inHordeLobby =
      currentMode === MODES.multiplayer &&
      multiplayerVariant === MULTIPLAYER_VARIANTS.horde;

    let modeText = t("status.modeMenu");
    if (singlePlayerStarted) {
      const lead = selectedLanguage === LANGUAGES.zh ? "模式：" : "Mode: ";
      const viewLabel =
        selectedLanguage === LANGUAGES.zh
          ? thirdPersonEnabled
            ? "第三人称"
            : "第一人称"
          : thirdPersonEnabled
            ? "Third Person"
            : "First Person";
      const modeLabel = inHordeLobby
        ? t("status.modePrefix.horde")
        : inPvpLobby
          ? t("status.modePrefix.pvp")
          : currentMode === MODES.zombie
            ? t("status.modePrefix.zombie")
            : t("status.modePrefix.single");
      const tail = pointerLocked
        ? playerIsDead
          ? t("status.downed")
          : isReloading
            ? t("status.reloading")
            : controls.aiming && currentWeapon.supportsAim
              ? thirdPersonEnabled
                ? t("status.aiming")
                : currentWeapon.hasScope
                  ? t("status.scoped")
                  : t("status.focused")
              : ""
        : playerIsDead
          ? t("status.downed")
          : t("status.paused");
      modeText = lead + modeLabel + viewLabel + (tail ? " " + tail : "");
    }

    const potionCooldownRemaining = getHealingPotionCooldownRemaining();
    const potionStatus = playerIsDead
      ? t("status.downed")
      : potionCooldownRemaining > 0
        ? t("status.potionCooldown", { seconds: Math.ceil(potionCooldownRemaining) })
        : t("status.potionReady");

    const sprintPercent = Math.round((sprintEnergy / MOBILITY.sprintMax) * 100);
    sprintMeter.hidden = !singlePlayerStarted && !controlFitEditorOpen;
    sprintMeterValue.textContent = sprintExhausted
      ? t("status.sprintExhausted")
      : sprintPercent + "%";
    sprintMeterFill.style.width = sprintPercent + "%";
    sprintMeter.classList.toggle("is-exhausted", sprintExhausted);

    modeReadout.textContent = modeText;
    healthReadout.textContent = t("status.health", {
      health: playerIsDead ? 0 : Math.ceil(playerHealth),
      max: PLAYER.maxHealth,
      potion: potionStatus,
    });
    zombieReadout.textContent = inHordeLobby
      ? !multiplayerRoomStarted
        ? t("status.roomWaiting", {
            players: multiplayerRoomPlayerCount,
            needed: multiplayerRoomMinPlayers,
          })
        : t("status.playersZombies", {
            players: remotePlayers.size + (multiplayerPlayerId ? 1 : 0),
            zombies: activeZombies.length,
          })
      : inPvpLobby
        ? t("status.playersOnly", {
            players: remotePlayers.size + (multiplayerPlayerId ? 1 : 0),
          })
        : currentMode === MODES.zombie
          ? t("status.zombies", {
              alive: activeZombies.length,
              down: zombieKills,
            })
          : t("status.zombiesOffline");
    weaponReadout.textContent = t("status.weapon", { weapon: currentWeapon.label });
    ammoReadout.textContent = currentWeapon.isMelee
      ? t("status.ammoBlade")
      : isReloading
        ? t("status.ammoRefilling", { mag: ammoInMag, reserve: reserveAmmo })
        : t("status.ammo", { mag: ammoInMag, reserve: reserveAmmo });
    const respawnRemaining = Math.max(0, multiplayerRespawnAt - Date.now() / 1000);
    const tailText = playerIsDead
      ? t("status.respawn", { seconds: respawnRemaining.toFixed(1) })
      : inHordeLobby && !multiplayerRoomStarted
        ? t("status.waiting")
      : t("status.sync", { hz: Math.round(1 / MULTIPLAYER.pollInterval) });
    hitsReadout.textContent = inHordeLobby
      ? t("status.coop", {
          zombieKills: zombieKills,
          kills: multiplayerKills,
          deaths: multiplayerDeaths,
          tail: tailText,
        })
      : inPvpLobby
        ? t("status.pvp", {
            kills: multiplayerKills,
            deaths: multiplayerDeaths,
            tail: tailText,
          })
        : currentMode === MODES.zombie
          ? t("status.score", { kills: zombieKills, shots: totalShots })
          : t("status.hits", { hits: totalHits, shots: totalShots });

    coordsReadout.textContent = t("status.coords", {
      x: Math.round(player.position.x),
      y: Math.round(player.position.y),
      z: Math.round(player.position.z),
    });
  }

  function scheduleChunksAroundPlayer(force) {
    const currentChunkX = Math.floor(player.position.x / WORLD.chunkSize);
    const currentChunkZ = Math.floor(player.position.z / WORLD.chunkSize);

    if (!force && currentChunkX === lastChunkX && currentChunkZ === lastChunkZ) {
      return;
    }

    lastChunkX = currentChunkX;
    lastChunkZ = currentChunkZ;

    const needed = new Set();

    for (let dz = -WORLD.viewRadius; dz <= WORLD.viewRadius; dz += 1) {
      for (let dx = -WORLD.viewRadius; dx <= WORLD.viewRadius; dx += 1) {
        const chunkX = currentChunkX + dx;
        const chunkZ = currentChunkZ + dz;
        const key = chunkKey(chunkX, chunkZ);
        needed.add(key);

        if (!activeChunks.has(key) && !queuedKeys.has(key)) {
          queuedKeys.add(key);
          buildQueue.push({ x: chunkX, z: chunkZ, priority: dx * dx + dz * dz });
        }
      }
    }

    buildQueue.sort(function (a, b) {
      return a.priority - b.priority;
    });

    for (let i = buildQueue.length - 1; i >= 0; i -= 1) {
      const task = buildQueue[i];
      const key = chunkKey(task.x, task.z);

      if (needed.has(key)) {
        continue;
      }

      buildQueue.splice(i, 1);
      queuedKeys.delete(key);
    }

    for (const [key, chunk] of activeChunks) {
      if (needed.has(key)) {
        continue;
      }

      terrainRoot.remove(chunk.mesh);
      chunk.mesh.geometry.dispose();
      chunk.mesh.position.set(0, 0, 0);
      pooledChunks.push(chunk.mesh);

      for (let i = 0; i < chunk.blocks.length; i += 1) {
        removeBlockMesh(chunk.blocks[i]);
      }

      activeChunks.delete(key);
    }
  }

  function processBuildQueue() {
    let buildsLeft =
      activeChunks.size < 9 ? WORLD.initialBuildBurst : WORLD.maxBuildsPerFrame;

    while (buildsLeft > 0 && buildQueue.length > 0) {
      const task = buildQueue.shift();
      const key = chunkKey(task.x, task.z);
      queuedKeys.delete(key);

      if (activeChunks.has(key)) {
        continue;
      }

      const mesh = pooledChunks.pop() || new THREE.Mesh(undefined, terrainMaterial);
      mesh.geometry = buildChunkGeometry(task.x, task.z);
      mesh.position.set(task.x * WORLD.chunkSize, 0, task.z * WORLD.chunkSize);
      mesh.frustumCulled = true;
      terrainRoot.add(mesh);

      activeChunks.set(key, {
        mesh: mesh,
        blocks: buildChunkBlocks(task.x, task.z),
      });

      buildsLeft -= 1;
    }
  }

  function buildChunkBlocks(chunkX, chunkZ) {
    const blocks = [];
    const count =
      BLOCKS.minPerChunk +
      Math.floor(
        hash01(chunkX, chunkZ, 13) *
          (BLOCKS.maxPerChunk - BLOCKS.minPerChunk + 1)
      );

    for (let slot = 0; slot < count; slot += 1) {
      const localX =
        (hash01(chunkX, chunkZ, slot * 2 + 1) - 0.5) * (WORLD.chunkSize - 16);
      const localZ =
        (hash01(chunkX, chunkZ, slot * 2 + 2) - 0.5) * (WORLD.chunkSize - 16);
      const worldX = localX + chunkX * WORLD.chunkSize;
      const worldZ = localZ + chunkZ * WORLD.chunkSize;
      const groundY = sampleHeight(worldX, worldZ);

      if (groundY < WORLD.seaLevel + 1 || groundY > 46) {
        continue;
      }

      const stackHeight = 1 + Math.floor(hash01(chunkX, chunkZ, slot + 51) * 3);

      for (let level = 0; level < stackHeight; level += 1) {
        const blockId = blockIdFor(chunkX, chunkZ, slot, level);
        if (destroyedBlocks.has(blockId)) {
          continue;
        }

        const materialIndex = (slot + level) % blockMaterials.length;

        const mesh = new THREE.Mesh(
          blockGeometry,
          blockMaterials[materialIndex]
        );
        mesh.position.set(
          worldX,
          groundY + BLOCKS.size * 0.5 + level * BLOCKS.size,
          worldZ
        );
        mesh.rotation.y = hash01(chunkX, chunkZ, slot + 90) * (Math.PI * 0.25);
        mesh.userData.blockId = blockId;
        mesh.userData.chunkKey = chunkKey(chunkX, chunkZ);
        mesh.userData.stackSlot = slot;
        mesh.userData.stackLevel = level;
        mesh.userData.materialIndex = materialIndex;
        mesh.userData.dynamic = false;
        blockRoot.add(mesh);
        activeBlockMeshes.push(mesh);
        blocks.push(mesh);
      }
    }

    return blocks;
  }

  function removeBlockMesh(mesh) {
    blockRoot.remove(mesh);
    removeDynamicBlock(mesh);

    const index = activeBlockMeshes.indexOf(mesh);
    if (index !== -1) {
      activeBlockMeshes.splice(index, 1);
    }
  }

  function buildChunkGeometry(chunkX, chunkZ) {
    const geometry = new THREE.PlaneGeometry(
      WORLD.chunkSize,
      WORLD.chunkSize,
      WORLD.segments,
      WORLD.segments
    );
    geometry.rotateX(-Math.PI / 2);

    const position = geometry.attributes.position;
    const colors = new Float32Array(position.count * 3);

    for (let i = 0; i < position.count; i += 1) {
      const localX = position.getX(i);
      const localZ = position.getZ(i);
      const worldX = localX + chunkX * WORLD.chunkSize;
      const worldZ = localZ + chunkZ * WORLD.chunkSize;
      const y = sampleHeight(worldX, worldZ);

      position.setY(i, y);

      const color = sampleColor(y, worldX, worldZ);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    return geometry;
  }

  function animateWater(time) {
    water.position.x = player.position.x;
    water.position.z = player.position.z;
    water.material.opacity = 0.28 + Math.sin(time * 1.7) * 0.03;
    water.rotation.z = Math.sin(time * 0.15) * 0.012;
  }

  function sampleHeight(x, z) {
    const continents = fbm(x * 0.0014, z * 0.0014, 4, 0.52, 2.05);
    const ridges = 1 - Math.abs(noise(x * 0.0034, z * 0.0034));
    const hills = fbm(x * 0.0075, z * 0.0075, 5, 0.5, 2.2);
    const detail = fbm(x * 0.018, z * 0.018, 3, 0.45, 2.4);
    const basin = Math.max(0, continents - 0.18);

    return (
      basin * 46 +
      hills * 15 +
      Math.pow(ridges, 3) * 6 +
      detail * 2.8 -
      14
    );
  }

  function sampleColor(height, x, z) {
    if (height < WORLD.seaLevel + 1.5) {
      return new THREE.Color(0xd3cfb3);
    }

    const moisture = fbm(x * 0.0042 + 20, z * 0.0042 - 10, 3, 0.6, 2.4);

    if (height > 44) {
      return new THREE.Color().setRGB(0.76, 0.79, 0.81);
    }

    if (height > 30) {
      return new THREE.Color().setRGB(0.45, 0.56, 0.42);
    }

    if (moisture > 0.58) {
      return new THREE.Color().setRGB(0.24, 0.5, 0.27);
    }

    return new THREE.Color().setRGB(0.39, 0.62, 0.3);
  }

  function fbm(x, z, octaves, persistence, lacunarity) {
    let amplitude = 1;
    let frequency = 1;
    let total = 0;
    let normalizer = 0;

    for (let i = 0; i < octaves; i += 1) {
      total += noise(x * frequency, z * frequency) * amplitude;
      normalizer += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return total / normalizer;
  }

  function blockIdFor(chunkX, chunkZ, slot, level) {
    return chunkX + "," + chunkZ + ":" + slot + ":" + level;
  }

  function chunkKey(x, z) {
    return x + "," + z;
  }

  function hash01(a, b, c) {
    const value =
      Math.sin(a * 127.1 + b * 311.7 + c * 74.7 + 19.19) * 43758.5453123;
    return value - Math.floor(value);
  }

  function createSoundEngine() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    let context = null;
    let masterGain = null;
    let noiseBuffer = null;
    let initialized = false;
    let ambienceNoiseSource = null;
    let ambienceNoiseFilter = null;
    let ambienceNoiseGain = null;
    let ambienceToneOscillator = null;
    let ambienceToneGain = null;

    function init() {
      if (initialized || !AudioContextClass) {
        return;
      }

      context = new AudioContextClass();

      const compressor = context.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 14;
      compressor.ratio.value = 8;
      compressor.attack.value = 0.002;
      compressor.release.value = 0.14;

      masterGain = context.createGain();
      masterGain.gain.value = 0.18;

      masterGain.connect(compressor);
      compressor.connect(context.destination);
      noiseBuffer = createNoiseBuffer(context);
      ambienceNoiseSource = context.createBufferSource();
      ambienceNoiseSource.buffer = noiseBuffer;
      ambienceNoiseSource.loop = true;

      ambienceNoiseFilter = context.createBiquadFilter();
      ambienceNoiseFilter.type = "bandpass";
      ambienceNoiseFilter.frequency.value = 420;
      ambienceNoiseFilter.Q.value = 0.35;

      ambienceNoiseGain = context.createGain();
      ambienceNoiseGain.gain.value = 0.0001;

      ambienceNoiseSource.connect(ambienceNoiseFilter);
      ambienceNoiseFilter.connect(ambienceNoiseGain);
      ambienceNoiseGain.connect(masterGain);
      ambienceNoiseSource.start();

      ambienceToneOscillator = context.createOscillator();
      ambienceToneOscillator.type = "triangle";
      ambienceToneOscillator.frequency.value = 54;

      ambienceToneGain = context.createGain();
      ambienceToneGain.gain.value = 0.0001;

      ambienceToneOscillator.connect(ambienceToneGain);
      ambienceToneGain.connect(masterGain);
      ambienceToneOscillator.start();
      initialized = true;
    }

    function resume() {
      init();

      if (context && context.state === "suspended") {
        context.resume().catch(function () {});
      }
    }

    function createNoiseBuffer(audioContext) {
      const buffer = audioContext.createBuffer(
        1,
        audioContext.sampleRate * 1.2,
        audioContext.sampleRate
      );
      const data = buffer.getChannelData(0);

      for (let i = 0; i < data.length; i += 1) {
        data[i] = Math.random() * 2 - 1;
      }

      return buffer;
    }

    function setEnvelope(gainNode, now, options) {
      const attack = options.attack || 0.001;
      const duration = options.duration || 0.08;
      const peak = options.peak || 0.1;
      const end = options.end || 0.0001;

      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(peak, now + attack);
      gainNode.gain.exponentialRampToValueAtTime(
        end,
        now + Math.max(attack + 0.001, duration)
      );
    }

    function playTone(options) {
      if (!context || context.state === "suspended") {
        return;
      }

      const now = context.currentTime + (options.delay || 0);
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      let tailNode = gainNode;

      oscillator.type = options.type || "triangle";
      oscillator.frequency.setValueAtTime(options.startFrequency || 220, now);
      oscillator.frequency.exponentialRampToValueAtTime(
        options.endFrequency || options.startFrequency || 220,
        now + (options.duration || 0.08)
      );

      if (options.detune) {
        oscillator.detune.setValueAtTime(options.detune, now);
      }

      if (options.filterFrequency) {
        const filter = context.createBiquadFilter();
        filter.type = options.filterType || "lowpass";
        filter.frequency.setValueAtTime(options.filterFrequency, now);
        if (options.filterEndFrequency) {
          filter.frequency.exponentialRampToValueAtTime(
            options.filterEndFrequency,
            now + (options.duration || 0.08)
          );
        }
        oscillator.connect(filter);
        filter.connect(gainNode);
      } else {
        oscillator.connect(gainNode);
      }

      setEnvelope(gainNode, now, options);
      tailNode.connect(masterGain);
      oscillator.start(now);
      oscillator.stop(now + (options.duration || 0.08) + 0.04);
    }

    function playNoise(options) {
      if (!context || context.state === "suspended" || !noiseBuffer) {
        return;
      }

      const now = context.currentTime + (options.delay || 0);
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gainNode = context.createGain();

      source.buffer = noiseBuffer;
      filter.type = options.filterType || "bandpass";
      filter.frequency.setValueAtTime(options.filterFrequency || 1200, now);
      if (options.filterEndFrequency) {
        filter.frequency.exponentialRampToValueAtTime(
          options.filterEndFrequency,
          now + (options.duration || 0.06)
        );
      }
      filter.Q.value = options.q || 0.8;

      source.connect(filter);
      filter.connect(gainNode);
      setEnvelope(gainNode, now, options);
      gainNode.connect(masterGain);

      source.start(now);
      source.stop(now + (options.duration || 0.06) + 0.02);
    }

    function fire(heat, aiming, profile) {
      if (!context || context.state === "suspended") {
        return;
      }

      const snap = aiming ? 0.85 : 1;

      if (profile === "flamethrower") {
        playNoise({
          duration: 0.05,
          peak: 0.09 * snap,
          end: 0.0001,
          filterFrequency: 1800,
          filterEndFrequency: 620,
          q: 0.54,
        });
        playTone({
          type: "sawtooth",
          startFrequency: 92 + heat * 26,
          endFrequency: 54,
          duration: 0.045,
          peak: 0.014 * snap,
          end: 0.0001,
        });
        return;
      }

      if (profile === "shotgun") {
        playNoise({
          duration: 0.085,
          peak: 0.18 * snap,
          end: 0.0001,
          filterFrequency: 920,
          filterEndFrequency: 260,
          q: 0.58,
        });
        playTone({
          type: "square",
          startFrequency: 96,
          endFrequency: 48,
          duration: 0.075,
          peak: 0.042 * snap,
          end: 0.0001,
        });
        playTone({
          type: "triangle",
          startFrequency: 160,
          endFrequency: 70,
          duration: 0.055,
          peak: 0.022 * snap,
          end: 0.0001,
          delay: 0.012,
        });
        return;
      }

      if (profile === "carbine") {
        playNoise({
          duration: 0.04,
          peak: 0.12 * snap,
          end: 0.0001,
          filterFrequency: 2200 + heat * 320,
          filterEndFrequency: 760,
          q: 0.88,
        });
        playTone({
          type: "square",
          startFrequency: 180,
          endFrequency: 84,
          duration: 0.04,
          peak: 0.032 * snap,
          end: 0.0001,
        });
        playTone({
          type: "sine",
          startFrequency: 360,
          endFrequency: 180,
          duration: 0.03,
          peak: 0.012 * snap,
          end: 0.0001,
          delay: 0.006,
        });
        return;
      }

      playNoise({
        duration: 0.055,
        peak: 0.15 * snap,
        end: 0.0001,
        filterFrequency: 1500 + heat * 500,
        filterEndFrequency: 520 + heat * 180,
        q: 0.65,
      });
      playTone({
        type: "square",
        startFrequency: 122 + heat * 38,
        endFrequency: 62,
        duration: 0.048,
        peak: 0.05 * snap,
        end: 0.0001,
        filterFrequency: 1700,
        filterEndFrequency: 600,
      });
      playTone({
        type: "triangle",
        startFrequency: 240 + heat * 30,
        endFrequency: 92,
        duration: 0.034,
        peak: 0.03 * snap,
        end: 0.0001,
      });
    }

    function update(active, speed, aiming) {
      if (
        !context ||
        context.state === "suspended" ||
        !ambienceNoiseGain ||
        !ambienceToneGain ||
        !ambienceNoiseFilter ||
        !ambienceToneOscillator
      ) {
        return;
      }

      const now = context.currentTime;
      const targetNoiseGain = active
        ? 0.008 + Math.min(0.01, speed * 0.00018)
        : 0.0001;
      const targetToneGain = active ? (aiming ? 0.0018 : 0.0035) : 0.0001;
      const targetFilterFrequency = active
        ? 360 + Math.min(280, speed * 4.4)
        : 240;
      const targetToneFrequency = active ? (aiming ? 46 : 54) : 42;

      ambienceNoiseGain.gain.cancelScheduledValues(now);
      ambienceNoiseGain.gain.setTargetAtTime(targetNoiseGain, now, 0.24);
      ambienceToneGain.gain.cancelScheduledValues(now);
      ambienceToneGain.gain.setTargetAtTime(targetToneGain, now, 0.3);
      ambienceNoiseFilter.frequency.cancelScheduledValues(now);
      ambienceNoiseFilter.frequency.setTargetAtTime(
        targetFilterFrequency,
        now,
        0.28
      );
      ambienceToneOscillator.frequency.cancelScheduledValues(now);
      ambienceToneOscillator.frequency.setTargetAtTime(
        targetToneFrequency,
        now,
        0.32
      );
    }

    function reloadStart() {
      if (!context || context.state === "suspended") {
        return;
      }

      playNoise({
        duration: 0.028,
        peak: 0.08,
        end: 0.0001,
        filterFrequency: 2200,
        filterEndFrequency: 700,
        q: 1.2,
      });
      playTone({
        type: "square",
        startFrequency: 360,
        endFrequency: 170,
        duration: 0.05,
        peak: 0.022,
        end: 0.0001,
        delay: 0.03,
      });
      playNoise({
        duration: 0.035,
        peak: 0.07,
        end: 0.0001,
        filterFrequency: 1500,
        filterEndFrequency: 480,
        q: 0.9,
        delay: 0.18,
      });
      playTone({
        type: "triangle",
        startFrequency: 220,
        endFrequency: 110,
        duration: 0.07,
        peak: 0.018,
        end: 0.0001,
        delay: 0.24,
      });
    }

    function reloadEnd() {
      if (!context || context.state === "suspended") {
        return;
      }

      playNoise({
        duration: 0.022,
        peak: 0.09,
        end: 0.0001,
        filterFrequency: 2600,
        filterEndFrequency: 900,
        q: 1.3,
      });
      playTone({
        type: "square",
        startFrequency: 440,
        endFrequency: 210,
        duration: 0.04,
        peak: 0.024,
        end: 0.0001,
        delay: 0.015,
      });
    }

    function hit() {
      if (!context || context.state === "suspended") {
        return;
      }

      playTone({
        type: "triangle",
        startFrequency: 820,
        endFrequency: 420,
        duration: 0.09,
        peak: 0.028,
        end: 0.0001,
      });
      playTone({
        type: "sine",
        startFrequency: 1240,
        endFrequency: 620,
        duration: 0.07,
        peak: 0.016,
        end: 0.0001,
        delay: 0.008,
      });
    }

    function block(profile, strength, eventType) {
      if (!context || context.state === "suspended") {
        return;
      }

      const weight = THREE.MathUtils.clamp(strength || 0.8, 0.18, 1.2);

      if (profile === "glass") {
        playTone({
          type: "sine",
          startFrequency: eventType === "break" ? 1280 : 980,
          endFrequency: 440,
          duration: 0.09,
          peak: 0.016 * weight,
          end: 0.0001,
        });
        playTone({
          type: "triangle",
          startFrequency: 1820,
          endFrequency: 760,
          duration: 0.06,
          peak: 0.012 * weight,
          end: 0.0001,
          delay: 0.008,
        });
        playNoise({
          duration: 0.032,
          peak: 0.03 * weight,
          end: 0.0001,
          filterFrequency: 3600,
          filterEndFrequency: 1400,
          q: 1.3,
        });
        return;
      }

      if (profile === "crate") {
        playNoise({
          duration: 0.05,
          peak: 0.045 * weight,
          end: 0.0001,
          filterFrequency: 1200,
          filterEndFrequency: 260,
          q: 0.76,
        });
        playTone({
          type: "square",
          startFrequency: eventType === "break" ? 240 : 180,
          endFrequency: 92,
          duration: 0.08,
          peak: 0.018 * weight,
          end: 0.0001,
        });
        return;
      }

      playNoise({
        duration: 0.06,
        peak: 0.04 * weight,
        end: 0.0001,
        filterFrequency: 760,
        filterEndFrequency: 180,
        q: 0.64,
      });
      playTone({
        type: "triangle",
        startFrequency: eventType === "break" ? 124 : 96,
        endFrequency: 58,
        duration: 0.08,
        peak: 0.014 * weight,
        end: 0.0001,
      });
    }

    function melee(hitSuccess) {
      if (!context || context.state === "suspended") {
        return;
      }

      playNoise({
        duration: 0.026,
        peak: hitSuccess ? 0.065 : 0.04,
        end: 0.0001,
        filterFrequency: hitSuccess ? 2100 : 1600,
        filterEndFrequency: hitSuccess ? 520 : 760,
        q: 1,
      });
      playTone({
        type: "triangle",
        startFrequency: hitSuccess ? 340 : 240,
        endFrequency: hitSuccess ? 140 : 170,
        duration: 0.05,
        peak: hitSuccess ? 0.018 : 0.012,
        end: 0.0001,
      });
    }

    function step(intensity) {
      if (!context || context.state === "suspended") {
        return;
      }

      const weight = THREE.MathUtils.clamp(intensity || 0.85, 0.55, 1.15);
      playNoise({
        duration: 0.03,
        peak: 0.035 * weight,
        end: 0.0001,
        filterFrequency: 260 + weight * 80,
        filterEndFrequency: 120,
        q: 0.8,
      });
      playTone({
        type: "triangle",
        startFrequency: 118 - weight * 16,
        endFrequency: 76,
        duration: 0.05,
        peak: 0.012 * weight,
        end: 0.0001,
      });
    }

    function jump() {
      if (!context || context.state === "suspended") {
        return;
      }

      playTone({
        type: "sine",
        startFrequency: 180,
        endFrequency: 300,
        duration: 0.08,
        peak: 0.018,
        end: 0.0001,
      });
      playNoise({
        duration: 0.02,
        peak: 0.022,
        end: 0.0001,
        filterFrequency: 420,
        filterEndFrequency: 180,
        q: 0.7,
      });
    }

    function land(impactSpeed) {
      if (!context || context.state === "suspended") {
        return;
      }

      const strength = THREE.MathUtils.clamp((impactSpeed - 8) / 18, 0.45, 1.2);
      playNoise({
        duration: 0.05,
        peak: 0.05 * strength,
        end: 0.0001,
        filterFrequency: 240,
        filterEndFrequency: 90,
        q: 0.75,
      });
      playTone({
        type: "triangle",
        startFrequency: 96,
        endFrequency: 52,
        duration: 0.1,
        peak: 0.016 * strength,
        end: 0.0001,
      });
    }

    function empty() {
      if (!context || context.state === "suspended") {
        return;
      }

      playNoise({
        duration: 0.018,
        peak: 0.05,
        end: 0.0001,
        filterFrequency: 3200,
        filterEndFrequency: 1200,
        q: 1.4,
      });
      playTone({
        type: "square",
        startFrequency: 190,
        endFrequency: 120,
        duration: 0.03,
        peak: 0.012,
        end: 0.0001,
      });
    }

    function scope(isOn) {
      if (!context || context.state === "suspended") {
        return;
      }

      playTone({
        type: "sine",
        startFrequency: isOn ? 440 : 280,
        endFrequency: isOn ? 720 : 180,
        duration: 0.06,
        peak: 0.02,
        end: 0.0001,
      });
      playNoise({
        duration: 0.018,
        peak: 0.03,
        end: 0.0001,
        filterFrequency: isOn ? 2600 : 1400,
        filterEndFrequency: isOn ? 1000 : 700,
        q: 1.1,
        delay: 0.01,
      });
    }

    function dropWeapon() {
      if (!context || context.state === "suspended") {
        return;
      }

      playNoise({
        duration: 0.035,
        peak: 0.038,
        end: 0.0001,
        filterFrequency: 1400,
        filterEndFrequency: 340,
        q: 0.82,
      });
      playTone({
        type: "triangle",
        startFrequency: 190,
        endFrequency: 88,
        duration: 0.07,
        peak: 0.014,
        end: 0.0001,
      });
    }

    function pickupWeapon() {
      if (!context || context.state === "suspended") {
        return;
      }

      playTone({
        type: "sine",
        startFrequency: 320,
        endFrequency: 820,
        duration: 0.06,
        peak: 0.018,
        end: 0.0001,
      });
      playNoise({
        duration: 0.016,
        peak: 0.018,
        end: 0.0001,
        filterFrequency: 2400,
        filterEndFrequency: 1200,
        q: 1.1,
        delay: 0.012,
      });
    }

    function throwBomb() {
      if (!context || context.state === "suspended") {
        return;
      }

      playNoise({
        duration: 0.028,
        peak: 0.045,
        end: 0.0001,
        filterFrequency: 1800,
        filterEndFrequency: 720,
        q: 0.86,
      });
      playTone({
        type: "triangle",
        startFrequency: 220,
        endFrequency: 120,
        duration: 0.06,
        peak: 0.014,
        end: 0.0001,
      });
    }

    function explosion() {
      if (!context || context.state === "suspended") {
        return;
      }

      playNoise({
        duration: 0.14,
        peak: 0.2,
        end: 0.0001,
        filterFrequency: 640,
        filterEndFrequency: 110,
        q: 0.46,
      });
      playTone({
        type: "square",
        startFrequency: 92,
        endFrequency: 34,
        duration: 0.16,
        peak: 0.048,
        end: 0.0001,
      });
      playTone({
        type: "triangle",
        startFrequency: 180,
        endFrequency: 52,
        duration: 0.14,
        peak: 0.025,
        end: 0.0001,
        delay: 0.012,
      });
    }

    return {
      resume: resume,
      fire: fire,
      update: update,
      reloadStart: reloadStart,
      reloadEnd: reloadEnd,
      hit: hit,
      block: block,
      step: step,
      jump: jump,
      land: land,
      empty: empty,
      scope: scope,
      melee: melee,
      dropWeapon: dropWeapon,
      pickupWeapon: pickupWeapon,
      throwBomb: throwBomb,
      explosion: explosion,
    };
  }

  function createWeaponModel(type, forAvatar) {
    switch (type) {
      case "minigun":
        return createMinigunModel(forAvatar);
      case "carbine":
        return createCarbineModel(forAvatar);
      case "shotgun":
        return createShotgunModel(forAvatar);
      case "flamethrower":
        return createFlamethrowerModel(forAvatar);
      case "bomb":
        return createBombModel(forAvatar);
      case "knife":
        return createKnifeModel(forAvatar);
      default:
        return createMinigunModel(forAvatar);
    }
  }

  function createMuzzleFlash(size, color) {
    const flash = new THREE.Mesh(
      new THREE.SphereGeometry(size, 10, 10),
      new THREE.MeshBasicMaterial({
        color: color || 0xfff1b3,
        transparent: true,
        opacity: 0,
      })
    );
    flash.visible = false;
    return flash;
  }

  function createMinigunModel(forAvatar) {
    const group = new THREE.Group();

    const shellMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b333d,
      metalness: 0.8,
      roughness: 0.3,
    });
    const detailMaterial = new THREE.MeshStandardMaterial({
      color: 0x5cc6ff,
      emissive: 0x133346,
      emissiveIntensity: 0.45,
      metalness: 0.48,
      roughness: 0.4,
    });
    const barrelMaterial = new THREE.MeshStandardMaterial({
      color: 0x14191e,
      metalness: 0.92,
      roughness: 0.2,
    });

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.18, 0.54),
      shellMaterial
    );
    body.position.set(0.02, 0.02, -0.22);
    group.add(body);

    const rearCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.18, 18),
      shellMaterial
    );
    rearCore.rotation.x = Math.PI / 2;
    rearCore.position.set(0.02, 0.01, 0.04);
    group.add(rearCore);

    const shroud = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.64, 18),
      shellMaterial
    );
    shroud.rotation.x = Math.PI / 2;
    shroud.position.set(0.02, 0.02, -0.46);
    group.add(shroud);

    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.28, 0.08),
      detailMaterial
    );
    handle.position.set(-0.08, -0.18, -0.02);
    handle.rotation.z = 0.16;
    group.add(handle);

    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.18, 18),
      detailMaterial
    );
    drum.rotation.z = Math.PI / 2;
    drum.position.set(-0.04, -0.02, -0.12);
    group.add(drum);

    const scopeMount = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.04, 0.22),
      shellMaterial
    );
    scopeMount.position.set(0.03, 0.14, -0.28);
    group.add(scopeMount);

    const scopeTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.46, 18),
      shellMaterial
    );
    scopeTube.rotation.x = Math.PI / 2;
    scopeTube.position.set(0.03, 0.18, -0.3);
    group.add(scopeTube);

    const scopeGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.038, 0.02, 18),
      new THREE.MeshStandardMaterial({
        color: 0x82dfff,
        emissive: 0x2c7aa3,
        emissiveIntensity: 0.35,
        metalness: 0.18,
        roughness: 0.22,
      })
    );
    scopeGlass.rotation.x = Math.PI / 2;
    scopeGlass.position.set(0.03, 0.18, -0.52);
    group.add(scopeGlass);

    const barrels = new THREE.Group();
    barrels.position.set(0.02, 0.02, -0.64);

    for (let i = 0; i < 6; i += 1) {
      const angle = (i / 6) * Math.PI * 2;
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.72, 12),
        barrelMaterial
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(Math.cos(angle) * 0.05, Math.sin(angle) * 0.05, 0);
      barrels.add(barrel);
    }

    const muzzleRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.075, 0.012, 10, 18),
      shellMaterial
    );
    muzzleRing.position.set(0, 0, -0.3);
    barrels.add(muzzleRing);

    group.add(barrels);

    const flash = createMuzzleFlash(0.085);
    flash.position.set(0.02, 0.02, -0.98);
    group.add(flash);

    const muzzle = new THREE.Object3D();
    muzzle.position.set(0.02, 0.02, -1.02);
    group.add(muzzle);

    if (forAvatar) {
      group.scale.setScalar(1.5);
    }

    return {
      group: group,
      barrels: barrels,
      drum: drum,
      flash: flash,
      muzzle: muzzle,
      scopeGlass: scopeGlass,
      bolt: null,
      pump: null,
      pilotLight: null,
    };
  }

  function createCarbineModel(forAvatar) {
    const group = new THREE.Group();

    const shellMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d3540,
      metalness: 0.78,
      roughness: 0.34,
    });
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0x74d9ff,
      emissive: 0x16394c,
      emissiveIntensity: 0.38,
      metalness: 0.28,
      roughness: 0.4,
    });
    const barrelMaterial = new THREE.MeshStandardMaterial({
      color: 0x171b20,
      metalness: 0.9,
      roughness: 0.22,
    });

    const stock = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.18, 0.44),
      shellMaterial
    );
    stock.position.set(0, -0.02, 0.18);
    group.add(stock);

    const receiver = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.2, 0.42),
      shellMaterial
    );
    receiver.position.set(0.02, 0.02, -0.02);
    group.add(receiver);

    const handguard = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.16, 0.42),
      accentMaterial
    );
    handguard.position.set(0.02, -0.01, -0.44);
    group.add(handguard);

    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.92, 14),
      barrelMaterial
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.02, 0.02, -0.62);
    group.add(barrel);

    const magWell = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.18, 0.14),
      shellMaterial
    );
    magWell.position.set(0, -0.12, -0.06);
    group.add(magWell);

    const magazine = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.3, 0.12),
      accentMaterial
    );
    magazine.position.set(-0.01, -0.27, -0.1);
    magazine.rotation.z = 0.06;
    group.add(magazine);

    const scopeMount = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.04, 0.2),
      shellMaterial
    );
    scopeMount.position.set(0.02, 0.14, -0.16);
    group.add(scopeMount);

    const scopeTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.038, 0.38, 14),
      shellMaterial
    );
    scopeTube.rotation.x = Math.PI / 2;
    scopeTube.position.set(0.02, 0.16, -0.18);
    group.add(scopeTube);

    const scopeGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.02, 14),
      new THREE.MeshStandardMaterial({
        color: 0x9ce6ff,
        emissive: 0x2d7696,
        emissiveIntensity: 0.34,
        metalness: 0.2,
        roughness: 0.2,
      })
    );
    scopeGlass.rotation.x = Math.PI / 2;
    scopeGlass.position.set(0.02, 0.16, -0.38);
    group.add(scopeGlass);

    const bolt = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.06, 0.14),
      barrelMaterial
    );
    bolt.position.set(0.02, 0.1, -0.02);
    group.add(bolt);

    const flash = createMuzzleFlash(0.072);
    flash.position.set(0.02, 0.02, -1.08);
    group.add(flash);

    const muzzle = new THREE.Object3D();
    muzzle.position.set(0.02, 0.02, -1.12);
    group.add(muzzle);

    if (forAvatar) {
      group.scale.setScalar(1.7);
    }

    return {
      group: group,
      barrels: null,
      drum: null,
      flash: flash,
      muzzle: muzzle,
      scopeGlass: scopeGlass,
      bolt: bolt,
      pump: null,
      pilotLight: null,
    };
  }

  function createShotgunModel(forAvatar) {
    const group = new THREE.Group();

    const shellMaterial = new THREE.MeshStandardMaterial({
      color: 0x332f2d,
      metalness: 0.54,
      roughness: 0.42,
    });
    const barrelMaterial = new THREE.MeshStandardMaterial({
      color: 0x1b1f23,
      metalness: 0.9,
      roughness: 0.2,
    });
    const woodMaterial = new THREE.MeshStandardMaterial({
      color: 0xa96f3c,
      roughness: 0.78,
      metalness: 0.04,
    });

    const stock = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.18, 0.44),
      woodMaterial
    );
    stock.position.set(0, -0.02, 0.22);
    group.add(stock);

    const receiver = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.2, 0.34),
      shellMaterial
    );
    receiver.position.set(0.02, 0.03, -0.02);
    group.add(receiver);

    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 1.05, 14),
      barrelMaterial
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.02, 0.05, -0.68);
    group.add(barrel);

    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.88, 12),
      barrelMaterial
    );
    tube.rotation.x = Math.PI / 2;
    tube.position.set(0.02, -0.06, -0.56);
    group.add(tube);

    const pump = new THREE.Group();
    pump.position.set(0.02, -0.02, -0.42);

    const pumpGrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.18, 0.26),
      woodMaterial
    );
    pump.add(pumpGrip);
    group.add(pump);

    const flash = createMuzzleFlash(0.09);
    flash.position.set(0.02, 0.05, -1.18);
    group.add(flash);

    const muzzle = new THREE.Object3D();
    muzzle.position.set(0.02, 0.05, -1.22);
    group.add(muzzle);

    if (forAvatar) {
      group.scale.setScalar(1.75);
    }

    return {
      group: group,
      barrels: null,
      drum: null,
      flash: flash,
      muzzle: muzzle,
      scopeGlass: null,
      bolt: null,
      pump: pump,
      pilotLight: null,
    };
  }

  function createFlamethrowerModel(forAvatar) {
    const group = new THREE.Group();

    const shellMaterial = new THREE.MeshStandardMaterial({
      color: 0x34302c,
      metalness: 0.68,
      roughness: 0.4,
    });
    const tankMaterial = new THREE.MeshStandardMaterial({
      color: 0xb45522,
      emissive: 0x4d1d09,
      emissiveIntensity: 0.18,
      metalness: 0.3,
      roughness: 0.5,
    });
    const hoseMaterial = new THREE.MeshStandardMaterial({
      color: 0x1d2329,
      metalness: 0.38,
      roughness: 0.62,
    });

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.18, 0.34),
      shellMaterial
    );
    body.position.set(0.02, 0.02, -0.04);
    group.add(body);

    const rearTank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.34, 16),
      tankMaterial
    );
    rearTank.rotation.x = Math.PI / 2;
    rearTank.position.set(0.02, 0.12, 0.16);
    group.add(rearTank);

    const lowerTank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.28, 14),
      tankMaterial
    );
    lowerTank.rotation.x = Math.PI / 2;
    lowerTank.position.set(0.02, -0.09, 0.08);
    group.add(lowerTank);

    const hose = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.025, 8, 24, Math.PI),
      hoseMaterial
    );
    hose.rotation.z = Math.PI / 2;
    hose.position.set(-0.02, 0.02, -0.02);
    group.add(hose);

    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.84, 14),
      shellMaterial
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.02, 0.02, -0.52);
    group.add(barrel);

    const nozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.04, 0.12, 14),
      shellMaterial
    );
    nozzle.rotation.x = Math.PI / 2;
    nozzle.position.set(0.02, 0.02, -0.94);
    group.add(nozzle);

    const grip = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.24, 0.08),
      hoseMaterial
    );
    grip.position.set(-0.06, -0.16, -0.04);
    grip.rotation.z = 0.12;
    group.add(grip);

    const pilotLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xff8c2a,
        emissive: 0xff6a1f,
        emissiveIntensity: 0.55,
        roughness: 0.2,
        metalness: 0,
      })
    );
    pilotLight.position.set(0.02, 0.03, -1.02);
    group.add(pilotLight);

    const flash = createMuzzleFlash(0.12, 0xff8a2a);
    flash.position.set(0.02, 0.02, -1.08);
    group.add(flash);

    const muzzle = new THREE.Object3D();
    muzzle.position.set(0.02, 0.02, -1.12);
    group.add(muzzle);

    if (forAvatar) {
      group.scale.setScalar(1.65);
    }

    return {
      group: group,
      barrels: null,
      drum: null,
      flash: flash,
      muzzle: muzzle,
      scopeGlass: null,
      bolt: null,
      pump: null,
      pilotLight: pilotLight,
    };
  }

  function createBombModel(forAvatar) {
    const group = new THREE.Group();

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x50555f,
      metalness: 0.74,
      roughness: 0.34,
    });
    const pinMaterial = new THREE.MeshStandardMaterial({
      color: 0xd3c28e,
      metalness: 0.84,
      roughness: 0.24,
    });

    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 12, 10),
      bodyMaterial
    );
    group.add(body);

    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.018, 8, 14),
      bodyMaterial
    );
    band.rotation.x = Math.PI / 2;
    group.add(band);

    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.08, 0.08),
      bodyMaterial
    );
    cap.position.set(0, 0.16, 0);
    group.add(cap);

    const pin = new THREE.Mesh(
      new THREE.TorusGeometry(0.05, 0.01, 6, 12),
      pinMaterial
    );
    pin.rotation.y = Math.PI / 2;
    pin.position.set(0.08, 0.18, 0);
    group.add(pin);

    const flash = createMuzzleFlash(0.02);
    flash.position.set(0, 0.18, -0.1);
    group.add(flash);

    const muzzle = new THREE.Object3D();
    muzzle.position.set(0, 0.05, -0.1);
    group.add(muzzle);

    if (forAvatar) {
      group.scale.setScalar(2.1);
    }

    return {
      group: group,
      barrels: null,
      drum: null,
      flash: flash,
      muzzle: muzzle,
      scopeGlass: null,
      bolt: null,
      pump: null,
      pilotLight: null,
    };
  }

  function createKnifeModel(forAvatar) {
    const group = new THREE.Group();

    const gripMaterial = new THREE.MeshStandardMaterial({
      color: 0x272b32,
      metalness: 0.58,
      roughness: 0.42,
    });
    const bladeMaterial = new THREE.MeshStandardMaterial({
      color: 0xc7d6df,
      emissive: 0x243640,
      emissiveIntensity: 0.18,
      metalness: 0.92,
      roughness: 0.16,
    });

    const grip = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 0.28),
      gripMaterial
    );
    grip.position.set(0, -0.04, 0.04);
    group.add(grip);

    const guard = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.04, 0.04),
      gripMaterial
    );
    guard.position.set(0, -0.02, -0.12);
    group.add(guard);

    const blade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.006, 0.52, 6),
      bladeMaterial
    );
    blade.rotation.x = Math.PI / 2;
    blade.position.set(0, 0, -0.42);
    group.add(blade);

    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.03, 0.24),
      bladeMaterial
    );
    edge.position.set(0, 0.03, -0.44);
    group.add(edge);

    const flash = createMuzzleFlash(0.04);
    flash.position.set(0, 0, -0.68);
    group.add(flash);

    const muzzle = new THREE.Object3D();
    muzzle.position.set(0, 0, -0.74);
    group.add(muzzle);

    if (forAvatar) {
      group.scale.setScalar(2.2);
    }

    return {
      group: group,
      barrels: null,
      drum: null,
      flash: flash,
      muzzle: muzzle,
      scopeGlass: null,
      bolt: null,
      pump: null,
      pilotLight: null,
    };
  }

  function createPlayerAvatar() {
    const group = new THREE.Group();
    group.visible = false;

    const armorMaterial = new THREE.MeshStandardMaterial({
      color: 0x2f3944,
      metalness: 0.52,
      roughness: 0.5,
    });
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x171d24,
      metalness: 0.66,
      roughness: 0.28,
    });
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0x6fd4ff,
      emissive: 0x18425a,
      emissiveIntensity: 0.34,
      metalness: 0.34,
      roughness: 0.42,
    });

    const hips = new THREE.Mesh(
      new THREE.BoxGeometry(1.28, 0.76, 0.82),
      frameMaterial
    );
    hips.position.set(0, 1.8, 0);
    group.add(hips);

    const torso = new THREE.Group();
    torso.position.set(0, 3.18, 0);
    group.add(torso);

    const chest = new THREE.Mesh(
      new THREE.BoxGeometry(1.66, 1.9, 0.96),
      armorMaterial
    );
    torso.add(chest);

    const chestPlate = new THREE.Mesh(
      new THREE.BoxGeometry(1.08, 1.18, 0.16),
      accentMaterial
    );
    chestPlate.position.set(0, 0.05, -0.54);
    torso.add(chestPlate);

    const backpack = new THREE.Mesh(
      new THREE.BoxGeometry(1.06, 1.34, 0.4),
      frameMaterial
    );
    backpack.position.set(0, 0, 0.56);
    torso.add(backpack);

    const shoulderRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.34, 0.46),
      armorMaterial
    );
    shoulderRight.position.set(1.02, 0.68, -0.04);
    torso.add(shoulderRight);

    const shoulderLeft = shoulderRight.clone();
    shoulderLeft.position.x = -1.02;
    torso.add(shoulderLeft);

    const head = new THREE.Group();
    head.position.set(0, 1.46, -0.04);
    torso.add(head);

    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.58, 18, 14),
      armorMaterial
    );
    helmet.scale.set(0.96, 1.08, 0.98);
    head.add(helmet);

    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.26, 0.16),
      accentMaterial
    );
    visor.position.set(0, 0.02, -0.46);
    head.add(visor);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.98, 3.68, -0.02);
    group.add(rightArm);

    const rightUpperArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 1.2, 0.42),
      armorMaterial
    );
    rightUpperArm.position.set(0, -0.58, 0);
    rightArm.add(rightUpperArm);

    const rightForearm = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 1.04, 0.36),
      frameMaterial
    );
    rightForearm.position.set(0, -1.58, -0.05);
    rightArm.add(rightForearm);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.98, 3.68, -0.02);
    group.add(leftArm);

    const leftUpperArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 1.2, 0.42),
      armorMaterial
    );
    leftUpperArm.position.set(0, -0.58, 0);
    leftArm.add(leftUpperArm);

    const leftForearm = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 1.04, 0.36),
      frameMaterial
    );
    leftForearm.position.set(0, -1.58, -0.05);
    leftArm.add(leftForearm);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.42, 1.5, 0);
    group.add(rightLeg);

    const rightThigh = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 1.5, 0.62),
      armorMaterial
    );
    rightThigh.position.set(0, -0.76, 0);
    rightLeg.add(rightThigh);

    const rightShin = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 1.3, 0.54),
      frameMaterial
    );
    rightShin.position.set(0, -2.08, 0.02);
    rightLeg.add(rightShin);

    const rightBoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.34, 0.94),
      frameMaterial
    );
    rightBoot.position.set(0, -2.92, -0.08);
    rightLeg.add(rightBoot);

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.42, 1.5, 0);
    group.add(leftLeg);

    const leftThigh = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 1.5, 0.62),
      armorMaterial
    );
    leftThigh.position.set(0, -0.76, 0);
    leftLeg.add(leftThigh);

    const leftShin = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 1.3, 0.54),
      frameMaterial
    );
    leftShin.position.set(0, -2.08, 0.02);
    leftLeg.add(leftShin);

    const leftBoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.34, 0.94),
      frameMaterial
    );
    leftBoot.position.set(0, -2.92, -0.08);
    leftLeg.add(leftBoot);

    const weaponMount = new THREE.Group();
    weaponMount.position.set(0.9, 3.26, -0.1);
    group.add(weaponMount);

    return {
      group: group,
      torso: torso,
      head: head,
      rightArm: rightArm,
      leftArm: leftArm,
      rightLeg: rightLeg,
      leftLeg: leftLeg,
      weaponMount: weaponMount,
      visor: visor,
    };
  }

  function createZombie(id) {
    const group = new THREE.Group();

    const fleshMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a8b48,
      roughness: 0.88,
      metalness: 0.04,
    });
    const clothMaterial = new THREE.MeshStandardMaterial({
      color: 0x413f57,
      roughness: 0.74,
      metalness: 0.08,
    });
    const glowMaterial = new THREE.MeshStandardMaterial({
      color: 0xb8ff89,
      emissive: 0x3b5d16,
      emissiveIntensity: 0.4,
      roughness: 0.4,
      metalness: 0.1,
    });

    const hips = new THREE.Mesh(
      new THREE.BoxGeometry(1.18, 0.7, 0.78),
      clothMaterial
    );
    hips.position.set(0, 1.76, 0);
    group.add(hips);

    const torso = new THREE.Group();
    torso.position.set(0, 3.05, 0);
    group.add(torso);

    const chest = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.82, 0.9),
      fleshMaterial
    );
    torso.add(chest);

    const ribGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.86, 0.96, 0.14),
      glowMaterial
    );
    ribGlow.position.set(0, 0.04, -0.52);
    torso.add(ribGlow);

    const head = new THREE.Group();
    head.position.set(0, 1.44, -0.02);
    torso.add(head);

    const skull = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.92, 0.76),
      fleshMaterial
    );
    head.add(skull);

    const jawGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.16, 0.12),
      glowMaterial
    );
    jawGlow.position.set(0, -0.06, -0.42);
    head.add(jawGlow);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.92, 3.58, -0.02);
    group.add(rightArm);

    const rightUpperArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 1.18, 0.36),
      fleshMaterial
    );
    rightUpperArm.position.set(0, -0.58, 0);
    rightArm.add(rightUpperArm);

    const rightForearm = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 1.02, 0.34),
      clothMaterial
    );
    rightForearm.position.set(0, -1.52, -0.04);
    rightArm.add(rightForearm);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.92, 3.58, -0.02);
    group.add(leftArm);

    const leftUpperArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 1.18, 0.36),
      fleshMaterial
    );
    leftUpperArm.position.set(0, -0.58, 0);
    leftArm.add(leftUpperArm);

    const leftForearm = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 1.02, 0.34),
      clothMaterial
    );
    leftForearm.position.set(0, -1.52, -0.04);
    leftArm.add(leftForearm);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.38, 1.44, 0);
    group.add(rightLeg);

    const rightThigh = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 1.42, 0.54),
      clothMaterial
    );
    rightThigh.position.set(0, -0.72, 0);
    rightLeg.add(rightThigh);

    const rightShin = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 1.18, 0.46),
      fleshMaterial
    );
    rightShin.position.set(0, -1.94, 0.02);
    rightLeg.add(rightShin);

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.38, 1.44, 0);
    group.add(leftLeg);

    const leftThigh = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 1.42, 0.54),
      clothMaterial
    );
    leftThigh.position.set(0, -0.72, 0);
    leftLeg.add(leftThigh);

    const leftShin = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 1.18, 0.46),
      fleshMaterial
    );
    leftShin.position.set(0, -1.94, 0.02);
    leftLeg.add(leftShin);

    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 5.3, 1.8),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
    );
    hitbox.position.set(0, 2.72, 0);
    group.add(hitbox);

    const badge = createHealthBadge();
    badge.sprite.position.set(0, 6.15, 0);
    group.add(badge.sprite);

    const zombie = {
      id: id,
      group: group,
      torso: torso,
      head: head,
      rightArm: rightArm,
      leftArm: leftArm,
      rightLeg: rightLeg,
      leftLeg: leftLeg,
      hitbox: hitbox,
      badge: badge,
      health: ZOMBIES.maxHealth,
      attackCooldown: 0.35 + Math.random() * 0.4,
      attackPulse: 0,
      moving: false,
      stepTime: Math.random() * Math.PI * 2,
      velocity: new THREE.Vector3(),
    };

    hitbox.userData.zombie = zombie;
    updateHealthBadge(
      badge,
      getZombieLabel(id),
      zombie.health,
      ZOMBIES.maxHealth,
      "#89ff72",
      "#d64040"
    );

    return zombie;
  }

  function createHealthBadge() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 80;

    const context = canvas.getContext("2d");
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(5.2, 1.7, 1);

    return {
      canvas: canvas,
      context: context,
      texture: texture,
      sprite: sprite,
    };
  }

  function updateHealthBadge(badge, label, health, maxHealth, fillColor, edgeColor) {
    const ratio = THREE.MathUtils.clamp(health / maxHealth, 0, 1);
    const ctx = badge.context;

    ctx.clearRect(0, 0, badge.canvas.width, badge.canvas.height);
    ctx.fillStyle = "rgba(7, 15, 18, 0.78)";
    ctx.fillRect(8, 8, 240, 64);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, 240, 64);

    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.font = "bold 18px Trebuchet MS";
    ctx.textAlign = "left";
    ctx.fillText(label, 20, 30);
    ctx.textAlign = "right";
    ctx.fillText(Math.ceil(health) + " HP", 236, 30);

    ctx.fillStyle = "rgba(31, 38, 42, 0.86)";
    ctx.fillRect(20, 42, 216, 14);
    ctx.fillStyle = fillColor;
    ctx.fillRect(20, 42, 216 * ratio, 14);
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 42, 216, 14);

    badge.texture.needsUpdate = true;
  }

  function createNoise(seed) {
    const permutation = new Uint8Array(512);
    const values = new Uint8Array(256);
    let state = seed >>> 0;

    for (let i = 0; i < 256; i += 1) {
      values[i] = i;
    }

    for (let i = 255; i > 0; i -= 1) {
      state = (state * 1664525 + 1013904223) >>> 0;
      const j = state % (i + 1);
      const temp = values[i];
      values[i] = values[j];
      values[j] = temp;
    }

    for (let i = 0; i < 512; i += 1) {
      permutation[i] = values[i & 255];
    }

    function fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function grad(hash, x, z) {
      switch (hash & 7) {
        case 0:
          return x + z;
        case 1:
          return -x + z;
        case 2:
          return x - z;
        case 3:
          return -x - z;
        case 4:
          return x;
        case 5:
          return -x;
        case 6:
          return z;
        default:
          return -z;
      }
    }

    return function (x, z) {
      const xi = Math.floor(x) & 255;
      const zi = Math.floor(z) & 255;
      const xf = x - Math.floor(x);
      const zf = z - Math.floor(z);

      const aa = permutation[permutation[xi] + zi];
      const ab = permutation[permutation[xi] + zi + 1];
      const ba = permutation[permutation[xi + 1] + zi];
      const bb = permutation[permutation[xi + 1] + zi + 1];

      const u = fade(xf);
      const v = fade(zf);

      const x1 = lerp(grad(aa, xf, zf), grad(ba, xf - 1, zf), u);
      const x2 = lerp(grad(ab, xf, zf - 1), grad(bb, xf - 1, zf - 1), u);

      return (lerp(x1, x2, v) + 1) * 0.5;
    };
  }
}
