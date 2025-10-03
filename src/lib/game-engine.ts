import { Player, Alien, Bullet, GAME_CONFIG, POINTS } from '../types/game';

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