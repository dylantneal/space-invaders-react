import { Player, Alien, Bullet, Shield, MysteryShip, PowerUp, PowerUpType, ActivePowerUps, GAME_CONFIG, POINTS, MYSTERY_SHIP_POINTS } from '../types/game';

export function createPlayer(): Player {
  return {
    x: GAME_CONFIG.CANVAS_WIDTH / 2 - 20,
    y: GAME_CONFIG.CANVAS_HEIGHT - 60,
    width: 40,
    height: 30,
    speed: GAME_CONFIG.PLAYER_SPEED,
  };
}

export function createAlienWave(wave: number): Alien[] {
  const aliens: Alien[] = [];
  const types: Array<'squid' | 'crab' | 'octopus'> = ['squid', 'crab', 'octopus'];
  
  for (let row = 0; row < GAME_CONFIG.ALIEN_ROWS; row++) {
    for (let col = 0; col < GAME_CONFIG.ALIEN_COLS; col++) {
      const type = types[Math.min(Math.floor(row / 2), types.length - 1)];
      const alien: Alien = {
        x: GAME_CONFIG.ALIEN_OFFSET_X + col * GAME_CONFIG.ALIEN_SPACING,
        y: GAME_CONFIG.ALIEN_OFFSET_Y + row * 40,
        width: 30,
        height: 20,
        velocityX: GAME_CONFIG.ALIEN_SPEED + (wave - 1) * 0.2,
        velocityY: 0,
        type,
        points: POINTS[type],
      };
      aliens.push(alien);
    }
  }
  
  return aliens;
}

export function getInitialAlienCount(): number {
  return GAME_CONFIG.ALIEN_ROWS * GAME_CONFIG.ALIEN_COLS;
}

export function calculateSpeedMultiplier(currentCount: number, initialCount: number): number {
  if (currentCount <= 0 || initialCount <= 0) return 1;
  
  const remainingRatio = currentCount / initialCount;
  const maxMultiplier = 3.5;
  const multiplier = 1 + (1 - Math.pow(remainingRatio, 0.5)) * (maxMultiplier - 1);
  
  return multiplier;
}

export function updatePlayer(player: Player, keys: { left: boolean; right: boolean }): Player {
  let newX = player.x;
  
  if (keys.left && player.x > 0) {
    newX = Math.max(0, player.x - player.speed);
  }
  if (keys.right && player.x < GAME_CONFIG.CANVAS_WIDTH - player.width) {
    newX = Math.min(GAME_CONFIG.CANVAS_WIDTH - player.width, player.x + player.speed);
  }
  
  return { ...player, x: newX };
}

export function updateAliens(aliens: Alien[], speedMultiplier: number = 1): { aliens: Alien[]; shouldDrop: boolean } {
  if (aliens.length === 0) return { aliens, shouldDrop: false };
  
  const movedAliens = aliens.map(alien => {
    const direction = Math.sign(alien.velocityX);
    const baseSpeed = Math.abs(alien.velocityX);
    const adjustedSpeed = baseSpeed * speedMultiplier;
    
    return {
      ...alien,
      x: alien.x + (direction * adjustedSpeed),
    };
  });
  
  const leftmost = Math.min(...movedAliens.map(a => a.x));
  const rightmost = Math.max(...movedAliens.map(a => a.x + a.width));
  
  let shouldDrop = false;
  
  if (leftmost <= 0 || rightmost >= GAME_CONFIG.CANVAS_WIDTH) {
    shouldDrop = true;
  }
  
  const updatedAliens = movedAliens.map(alien => {
    if (shouldDrop) {
      return {
        ...alien,
        x: Math.max(0, Math.min(GAME_CONFIG.CANVAS_WIDTH - alien.width, alien.x)),
        y: alien.y + GAME_CONFIG.ALIEN_DROP_SPEED,
        velocityX: -alien.velocityX,
      };
    } else {
      return alien;
    }
  });
  
  return { aliens: updatedAliens, shouldDrop };
}

export function updateBullets(bullets: Bullet[]): Bullet[] {
  return bullets
    .map(bullet => ({
      ...bullet,
      x: bullet.x + (bullet.velocityX || 0),
      y: bullet.y + bullet.velocityY,
    }))
    .filter(bullet => 
      bullet.y > -bullet.height && 
      bullet.y < GAME_CONFIG.CANVAS_HEIGHT &&
      bullet.x > -bullet.width &&
      bullet.x < GAME_CONFIG.CANVAS_WIDTH
    );
}

export function createPlayerBullet(player: Player): Bullet {
  return {
    x: player.x + player.width / 2 - 2,
    y: player.y,
    width: 4,
    height: 10,
    velocityY: -GAME_CONFIG.BULLET_SPEED,
    velocityX: 0,
    fromPlayer: true,
  };
}

// Create spread shot bullets (3 bullets in a fan pattern)
export function createSpreadShotBullets(player: Player): Bullet[] {
  const centerX = player.x + player.width / 2 - 2;
  const angleRad = (GAME_CONFIG.SPREAD_SHOT_ANGLE * Math.PI) / 180;
  
  // Center bullet (straight up)
  const centerBullet: Bullet = {
    x: centerX,
    y: player.y,
    width: 4,
    height: 10,
    velocityY: -GAME_CONFIG.BULLET_SPEED,
    velocityX: 0,
    fromPlayer: true,
  };
  
  // Left bullet (angled left)
  const leftBullet: Bullet = {
    x: centerX - 8,
    y: player.y,
    width: 4,
    height: 10,
    velocityY: -GAME_CONFIG.BULLET_SPEED * Math.cos(angleRad),
    velocityX: -GAME_CONFIG.BULLET_SPEED * Math.sin(angleRad),
    fromPlayer: true,
  };
  
  // Right bullet (angled right)
  const rightBullet: Bullet = {
    x: centerX + 8,
    y: player.y,
    width: 4,
    height: 10,
    velocityY: -GAME_CONFIG.BULLET_SPEED * Math.cos(angleRad),
    velocityX: GAME_CONFIG.BULLET_SPEED * Math.sin(angleRad),
    fromPlayer: true,
  };
  
  return [leftBullet, centerBullet, rightBullet];
}

export function createAlienBullet(alien: Alien): Bullet {
  return {
    x: alien.x + alien.width / 2 - 2,
    y: alien.y + alien.height,
    width: 4,
    height: 8,
    velocityY: GAME_CONFIG.BULLET_SPEED / 2,
    velocityX: 0,
    fromPlayer: false,
  };
}

// Power-up functions
export function createInitialActivePowerUps(): ActivePowerUps {
  return {
    rapidFire: null,
    spreadShot: null,
    shield: null,
    scoreMultiplier: null,
  };
}

export function shouldDropPowerUp(): boolean {
  return Math.random() < GAME_CONFIG.POWERUP_DROP_CHANCE;
}

export function getRandomPowerUpType(): PowerUpType {
  const types: PowerUpType[] = ['rapidFire', 'spreadShot', 'shield', 'scoreMultiplier'];
  return types[Math.floor(Math.random() * types.length)];
}

export function createPowerUp(x: number, y: number): PowerUp {
  return {
    x: x - GAME_CONFIG.POWERUP_WIDTH / 2,
    y: y,
    width: GAME_CONFIG.POWERUP_WIDTH,
    height: GAME_CONFIG.POWERUP_HEIGHT,
    type: getRandomPowerUpType(),
    velocityY: GAME_CONFIG.POWERUP_SPEED,
  };
}

export function updatePowerUps(powerUps: PowerUp[]): PowerUp[] {
  return powerUps
    .map(powerUp => ({
      ...powerUp,
      y: powerUp.y + powerUp.velocityY,
    }))
    .filter(powerUp => powerUp.y < GAME_CONFIG.CANVAS_HEIGHT);
}

export function activatePowerUp(activePowerUps: ActivePowerUps, type: PowerUpType): ActivePowerUps {
  const expirationTime = Date.now() + GAME_CONFIG.POWERUP_DURATION;
  
  return {
    ...activePowerUps,
    [type]: expirationTime,
  };
}

export function updateActivePowerUps(activePowerUps: ActivePowerUps): ActivePowerUps {
  const now = Date.now();
  
  return {
    rapidFire: activePowerUps.rapidFire && activePowerUps.rapidFire > now ? activePowerUps.rapidFire : null,
    spreadShot: activePowerUps.spreadShot && activePowerUps.spreadShot > now ? activePowerUps.spreadShot : null,
    shield: activePowerUps.shield && activePowerUps.shield > now ? activePowerUps.shield : null,
    scoreMultiplier: activePowerUps.scoreMultiplier && activePowerUps.scoreMultiplier > now ? activePowerUps.scoreMultiplier : null,
  };
}

export function getFireRateCooldown(activePowerUps: ActivePowerUps): number {
  return activePowerUps.rapidFire ? GAME_CONFIG.RAPID_FIRE_COOLDOWN : GAME_CONFIG.FIRE_RATE_LIMIT;
}

export function getScoreMultiplier(activePowerUps: ActivePowerUps): number {
  return activePowerUps.scoreMultiplier ? GAME_CONFIG.SCORE_MULTIPLIER : 1;
}

export function hasShield(activePowerUps: ActivePowerUps): boolean {
  return activePowerUps.shield !== null;
}

export function hasSpreadShot(activePowerUps: ActivePowerUps): boolean {
  return activePowerUps.spreadShot !== null;
}

// Mystery Ship Functions
export function createMysteryShip(): MysteryShip {
  const goingRight = Math.random() > 0.5;
  const startX = goingRight ? -GAME_CONFIG.MYSTERY_SHIP_WIDTH : GAME_CONFIG.CANVAS_WIDTH;
  const velocity = goingRight ? GAME_CONFIG.MYSTERY_SHIP_SPEED : -GAME_CONFIG.MYSTERY_SHIP_SPEED;
  const points = MYSTERY_SHIP_POINTS[Math.floor(Math.random() * MYSTERY_SHIP_POINTS.length)];
  
  return {
    x: startX,
    y: GAME_CONFIG.MYSTERY_SHIP_Y,
    width: GAME_CONFIG.MYSTERY_SHIP_WIDTH,
    height: GAME_CONFIG.MYSTERY_SHIP_HEIGHT,
    velocityX: velocity,
    points,
    active: true,
  };
}

export function updateMysteryShip(mysteryShip: MysteryShip | null): MysteryShip | null {
  if (!mysteryShip || !mysteryShip.active) return null;
  
  const newX = mysteryShip.x + mysteryShip.velocityX;
  
  if (newX < -GAME_CONFIG.MYSTERY_SHIP_WIDTH || newX > GAME_CONFIG.CANVAS_WIDTH) {
    return null;
  }
  
  return {
    ...mysteryShip,
    x: newX,
  };
}

export function getNextMysteryShipSpawnTime(): number {
  return Date.now() + GAME_CONFIG.MYSTERY_SHIP_MIN_INTERVAL + 
    Math.random() * (GAME_CONFIG.MYSTERY_SHIP_MAX_INTERVAL - GAME_CONFIG.MYSTERY_SHIP_MIN_INTERVAL);
}

export function createShields(): Shield[] {
  const shields: Shield[] = [];
  const shieldSpacing = GAME_CONFIG.CANVAS_WIDTH / (GAME_CONFIG.SHIELD_COUNT + 1);
  
  for (let i = 0; i < GAME_CONFIG.SHIELD_COUNT; i++) {
    const x = shieldSpacing * (i + 1) - GAME_CONFIG.SHIELD_WIDTH / 2;
    const shield = createShield(x, GAME_CONFIG.SHIELD_Y_POSITION);
    shields.push(shield);
  }
  
  return shields;
}

function createShield(x: number, y: number): Shield {
  const cols = Math.floor(GAME_CONFIG.SHIELD_WIDTH / GAME_CONFIG.SHIELD_PIXEL_SIZE);
  const rows = Math.floor(GAME_CONFIG.SHIELD_HEIGHT / GAME_CONFIG.SHIELD_PIXEL_SIZE);
  
  const pixels: boolean[][] = [];
  
  for (let row = 0; row < rows; row++) {
    pixels[row] = [];
    for (let col = 0; col < cols; col++) {
      const centerCol = cols / 2;
      const distFromCenter = Math.abs(col - centerCol);
      
      if (row < 3) {
        const archWidth = cols / 2 - row * 1.5;
        pixels[row][col] = distFromCenter < archWidth;
      } else if (row < rows - 3) {
        pixels[row][col] = true;
      } else {
        const notchWidth = cols / 4;
        pixels[row][col] = distFromCenter > notchWidth;
      }
    }
  }
  
  return {
    x,
    y,
    width: GAME_CONFIG.SHIELD_WIDTH,
    height: GAME_CONFIG.SHIELD_HEIGHT,
    pixels,
    pixelSize: GAME_CONFIG.SHIELD_PIXEL_SIZE,
  };
}

export function damageShield(shield: Shield, bulletX: number, bulletY: number, bulletWidth: number, bulletHeight: number, fromAbove: boolean): boolean {
  const relX = bulletX - shield.x;
  const relY = bulletY - shield.y;
  
  const startCol = Math.floor(relX / shield.pixelSize);
  const endCol = Math.floor((relX + bulletWidth) / shield.pixelSize);
  const startRow = Math.floor(relY / shield.pixelSize);
  const endRow = Math.floor((relY + bulletHeight) / shield.pixelSize);
  
  let damaged = false;
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      if (row >= 0 && row < shield.pixels.length && 
          col >= 0 && col < shield.pixels[0].length) {
        if (shield.pixels[row][col]) {
          shield.pixels[row][col] = false;
          damaged = true;
          
          if (fromAbove && row + 1 < shield.pixels.length) {
            shield.pixels[row + 1][col] = false;
          } else if (!fromAbove && row - 1 >= 0) {
            shield.pixels[row - 1][col] = false;
          }
        }
      }
    }
  }
  
  return damaged;
}

export function checkBulletShieldCollision(bullet: Bullet, shield: Shield): boolean {
  if (bullet.x + bullet.width < shield.x || 
      bullet.x > shield.x + shield.width ||
      bullet.y + bullet.height < shield.y || 
      bullet.y > shield.y + shield.height) {
    return false;
  }
  
  const relX = bullet.x - shield.x;
  const relY = bullet.y - shield.y;
  
  const startCol = Math.max(0, Math.floor(relX / shield.pixelSize));
  const endCol = Math.min(shield.pixels[0].length - 1, Math.floor((relX + bullet.width) / shield.pixelSize));
  const startRow = Math.max(0, Math.floor(relY / shield.pixelSize));
  const endRow = Math.min(shield.pixels.length - 1, Math.floor((relY + bullet.height) / shield.pixelSize));
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      if (shield.pixels[row] && shield.pixels[row][col]) {
        return true;
      }
    }
  }
  
  return false;
}
