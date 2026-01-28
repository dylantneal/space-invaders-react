import { Player, Alien, Bullet, Shield, GAME_CONFIG, POINTS } from '../types/game';

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
        y: GAME_CONFIG.ALIEN_OFFSET_Y + row * 40, // Consistent row spacing
        width: 30,
        height: 20,
        velocityX: GAME_CONFIG.ALIEN_SPEED + (wave - 1) * 0.2, // Gradual speed increase
        velocityY: 0,
        type,
        points: POINTS[type],
      };
      aliens.push(alien);
    }
  }
  
  return aliens;
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

export function updateAliens(aliens: Alien[]): { aliens: Alien[]; shouldDrop: boolean } {
  if (aliens.length === 0) return { aliens, shouldDrop: false };
  
  // First, move aliens horizontally
  const movedAliens = aliens.map(alien => ({
    ...alien,
    x: alien.x + alien.velocityX,
  }));
  
  const leftmost = Math.min(...movedAliens.map(a => a.x));
  const rightmost = Math.max(...movedAliens.map(a => a.x + a.width));
  
  let shouldDrop = false;
  
  // Check if any alien hit the edge
  if (leftmost <= 0 || rightmost >= GAME_CONFIG.CANVAS_WIDTH) {
    shouldDrop = true;
  }
  
  const updatedAliens = movedAliens.map(alien => {
    if (shouldDrop) {
      // Drop down and reverse direction
      return {
        ...alien,
        x: Math.max(0, Math.min(GAME_CONFIG.CANVAS_WIDTH - alien.width, alien.x)), // Keep in bounds
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
      y: bullet.y + bullet.velocityY,
    }))
    .filter(bullet => bullet.y > -bullet.height && bullet.y < GAME_CONFIG.CANVAS_HEIGHT);
}

export function createPlayerBullet(player: Player): Bullet {
  return {
    x: player.x + player.width / 2 - 2,
    y: player.y,
    width: 4,
    height: 10,
    velocityY: -GAME_CONFIG.BULLET_SPEED,
    fromPlayer: true,
  };
}

export function createAlienBullet(alien: Alien): Bullet {
  return {
    x: alien.x + alien.width / 2 - 2,
    y: alien.y + alien.height,
    width: 4,
    height: 8,
    velocityY: GAME_CONFIG.BULLET_SPEED / 2,
    fromPlayer: false,
  };
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
  
  // Create pixel grid with classic bunker shape
  const pixels: boolean[][] = [];
  
  for (let row = 0; row < rows; row++) {
    pixels[row] = [];
    for (let col = 0; col < cols; col++) {
      // Create bunker shape - arch at top, notch at bottom
      const centerCol = cols / 2;
      const distFromCenter = Math.abs(col - centerCol);
      
      // Top arch - curved top
      if (row < 3) {
        const archWidth = cols / 2 - row * 1.5;
        pixels[row][col] = distFromCenter < archWidth;
      }
      // Middle section - full width
      else if (row < rows - 3) {
        pixels[row][col] = true;
      }
      // Bottom notch - opening for player to hide in
      else {
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
  // Convert bullet position to shield pixel coordinates
  const relX = bulletX - shield.x;
  const relY = bulletY - shield.y;
  
  const startCol = Math.floor(relX / shield.pixelSize);
  const endCol = Math.floor((relX + bulletWidth) / shield.pixelSize);
  const startRow = Math.floor(relY / shield.pixelSize);
  const endRow = Math.floor((relY + bulletHeight) / shield.pixelSize);
  
  let damaged = false;
  
  // Damage pixels in the bullet's path
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      if (row >= 0 && row < shield.pixels.length && 
          col >= 0 && col < shield.pixels[0].length) {
        if (shield.pixels[row][col]) {
          shield.pixels[row][col] = false;
          damaged = true;
          
          // Damage a few extra pixels for more realistic erosion
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
  // First check bounding box
  if (bullet.x + bullet.width < shield.x || 
      bullet.x > shield.x + shield.width ||
      bullet.y + bullet.height < shield.y || 
      bullet.y > shield.y + shield.height) {
    return false;
  }
  
  // Check if bullet hits any existing pixel
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
