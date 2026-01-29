import { Player, Alien, Bullet, Shield, MysteryShip, PowerUp, PowerUpType, ActivePowerUps, Boss, BossReward, GAME_CONFIG, POINTS, MYSTERY_SHIP_POINTS, BOSS_REWARDS } from '../types/game';

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
        velocityX: GAME_CONFIG.ALIEN_SPEED + (wave - 1) * 0.12,
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

// ==================== BOSS FUNCTIONS ====================

// Check if current wave is a boss wave
export function isBossWave(wave: number): boolean {
  return wave > 0 && wave % GAME_CONFIG.BOSS_WAVE_INTERVAL === 0;
}

// Get boss level from wave number (boss 1 at wave 5, boss 2 at wave 10, etc.)
export function getBossLevel(wave: number): number {
  return Math.floor(wave / GAME_CONFIG.BOSS_WAVE_INTERVAL);
}

// Create a boss for the given wave
export function createBoss(wave: number): Boss {
  const bossLevel = getBossLevel(wave);
  
  // Wave 12 is the ULTIMATE BOSS - VOID EMPEROR
  const isUltimateBoss = wave === 12;
  
  // Ultimate boss has 3x health and starts faster
  const healthMultiplier = isUltimateBoss 
    ? 3.5  // Void Emperor has massive health
    : 1 + (bossLevel - 1) * 0.5; // Each normal boss has 50% more health
  const baseHealth = Math.floor(GAME_CONFIG.BOSS_BASE_HEALTH * healthMultiplier);
  
  // Ultimate boss is larger
  const bossWidth = isUltimateBoss ? GAME_CONFIG.BOSS_WIDTH * 1.3 : GAME_CONFIG.BOSS_WIDTH;
  const bossHeight = isUltimateBoss ? GAME_CONFIG.BOSS_HEIGHT * 1.2 : GAME_CONFIG.BOSS_HEIGHT;
  
  return {
    x: GAME_CONFIG.CANVAS_WIDTH / 2 - bossWidth / 2,
    y: isUltimateBoss ? 80 : 100, // Ultimate boss sits higher
    width: bossWidth,
    height: bossHeight,
    health: baseHealth,
    maxHealth: baseHealth,
    phase: 1,
    velocityX: GAME_CONFIG.BOSS_SPEED * (isUltimateBoss ? 2.0 : 1 + bossLevel * 0.1), // Ultimate boss is fast
    velocityY: 0,
    lastAttackTime: 0,
    animationFrame: 0,
    isEnraged: false,
    bossLevel: isUltimateBoss ? 6 : bossLevel, // Use special color index 6 for ultimate boss
  };
}

// Update boss position and state
export function updateBoss(boss: Boss, playerX?: number): Boss {
  // Calculate tracking factor based on boss level (higher level = tighter tracking)
  // Level 1: 0.025 (lazy), Level 2: 0.04, Level 3: 0.055, etc.
  const baseTrackingFactor = 0.01;
  const trackingIncrease = 0.015;
  const trackingFactor = baseTrackingFactor + (boss.bossLevel * trackingIncrease);
  
  // When enraged, tracking becomes much tighter
  const effectiveTrackingFactor = boss.isEnraged ? trackingFactor * 2 : trackingFactor;
  
  // Calculate desired velocity toward player
  let newVelocityX = boss.velocityX;
  
  if (playerX !== undefined) {
    // Calculate the center of the boss and target position
    const bossCenterX = boss.x + boss.width / 2;
    const targetX = playerX;
    
    // Determine direction to player
    const direction = targetX > bossCenterX ? 1 : -1;
    const maxSpeed = GAME_CONFIG.BOSS_SPEED * (1 + boss.bossLevel * 0.15);
    const targetVelocity = direction * maxSpeed;
    
    // Smoothly interpolate toward target velocity (lazy tracking)
    newVelocityX = newVelocityX + (targetVelocity - newVelocityX) * effectiveTrackingFactor;
  }
  
  // Apply velocity and clamp to boundaries
  let newX = boss.x + newVelocityX;
  newX = Math.max(20, Math.min(GAME_CONFIG.CANVAS_WIDTH - boss.width - 20, newX));
  
  // Vertical movement - slight bobbing, more aggressive when enraged
  let newVelocityY = boss.velocityY;
  let newY = boss.y;
  
  const bobSpeed = boss.isEnraged ? 150 : 300;
  const bobAmount = boss.isEnraged ? 1.0 : 0.3;
  newVelocityY = Math.sin(Date.now() / bobSpeed) * bobAmount;
  newY = Math.max(80, Math.min(140, boss.y + newVelocityY));
  
  // Update animation frame
  const newAnimationFrame = (boss.animationFrame + 1) % 60;
  
  // Check if boss should become enraged
  const healthRatio = boss.health / boss.maxHealth;
  const isEnraged = healthRatio <= GAME_CONFIG.BOSS_ENRAGE_THRESHOLD;
  
  // Update phase based on health
  let phase = 1;
  if (healthRatio <= 0.3) phase = 3;
  else if (healthRatio <= 0.6) phase = 2;
  
  return {
    ...boss,
    x: newX,
    y: newY,
    velocityX: newVelocityX,
    velocityY: newVelocityY,
    animationFrame: newAnimationFrame,
    isEnraged,
    phase,
  };
}

// Damage the boss and return updated boss (or null if destroyed)
export function damageBoss(boss: Boss, damage: number = 1): Boss | null {
  const newHealth = boss.health - damage;
  if (newHealth <= 0) {
    return null; // Boss destroyed
  }
  return {
    ...boss,
    health: newHealth,
  };
}

// Create boss bullets based on attack pattern and phase
export function createBossBullets(boss: Boss): Bullet[] {
  const bullets: Bullet[] = [];
  const centerX = boss.x + boss.width / 2;
  const bottomY = boss.y + boss.height;
  
  // VOID EMPEROR (boss level 6) has devastating unique attacks
  const isVoidEmperor = boss.bossLevel === 6;
  
  if (isVoidEmperor) {
    // Void Emperor has brutal attack patterns in every phase
    switch (boss.phase) {
      case 1:
        // Phase 1: Triple helix pattern
        for (let i = -1; i <= 1; i++) {
          bullets.push({
            x: centerX - 3 + i * 25,
            y: bottomY,
            width: 8,
            height: 14,
            velocityY: GAME_CONFIG.BOSS_BULLET_SPEED * 1.3,
            velocityX: i * 2,
            fromPlayer: false,
          });
        }
        // Plus side shots
        bullets.push({
          x: boss.x + 20,
          y: bottomY - 20,
          width: 6,
          height: 10,
          velocityY: GAME_CONFIG.BOSS_BULLET_SPEED,
          velocityX: -2,
          fromPlayer: false,
        });
        bullets.push({
          x: boss.x + boss.width - 20,
          y: bottomY - 20,
          width: 6,
          height: 10,
          velocityY: GAME_CONFIG.BOSS_BULLET_SPEED,
          velocityX: 2,
          fromPlayer: false,
        });
        break;
        
      case 2:
        // Phase 2: Seven-way barrage
        for (let i = -3; i <= 3; i++) {
          bullets.push({
            x: centerX - 3 + i * 18,
            y: bottomY,
            width: 8,
            height: 14,
            velocityY: GAME_CONFIG.BOSS_BULLET_SPEED * 1.4,
            velocityX: i * 1.8,
            fromPlayer: false,
          });
        }
        break;
        
      case 3:
        // Phase 3: VOID STORM - Nine-way devastation + homing-like spread
        for (let i = -4; i <= 4; i++) {
          bullets.push({
            x: centerX - 3 + i * 14,
            y: bottomY,
            width: 8,
            height: 14,
            velocityY: GAME_CONFIG.BOSS_BULLET_SPEED * 1.5,
            velocityX: i * 2.2,
            fromPlayer: false,
          });
        }
        // Additional vertical pillars
        bullets.push({
          x: boss.x + 30,
          y: bottomY,
          width: 10,
          height: 20,
          velocityY: GAME_CONFIG.BOSS_BULLET_SPEED * 1.8,
          velocityX: 0,
          fromPlayer: false,
        });
        bullets.push({
          x: boss.x + boss.width - 40,
          y: bottomY,
          width: 10,
          height: 20,
          velocityY: GAME_CONFIG.BOSS_BULLET_SPEED * 1.8,
          velocityX: 0,
          fromPlayer: false,
        });
        break;
    }
    
    // Void Emperor ALWAYS fires side lasers
    bullets.push({
      x: boss.x - 5,
      y: boss.y + boss.height / 2,
      width: 8,
      height: 10,
      velocityY: 3,
      velocityX: -4,
      fromPlayer: false,
    });
    bullets.push({
      x: boss.x + boss.width + 5,
      y: boss.y + boss.height / 2,
      width: 8,
      height: 10,
      velocityY: 3,
      velocityX: 4,
      fromPlayer: false,
    });
    
    // When enraged, Void Emperor fires even more
    if (boss.isEnraged) {
      // Diagonal death rays
      bullets.push({
        x: boss.x + 15,
        y: boss.y + boss.height - 10,
        width: 10,
        height: 10,
        velocityY: 5,
        velocityX: -5,
        fromPlayer: false,
      });
      bullets.push({
        x: boss.x + boss.width - 15,
        y: boss.y + boss.height - 10,
        width: 10,
        height: 10,
        velocityY: 5,
        velocityX: 5,
        fromPlayer: false,
      });
    }
    
    return bullets;
  }
  
  // Normal boss attack patterns
  switch (boss.phase) {
    case 1:
      // Phase 1: Single aimed shot
      bullets.push({
        x: centerX - 3,
        y: bottomY,
        width: 6,
        height: 12,
        velocityY: GAME_CONFIG.BOSS_BULLET_SPEED,
        velocityX: 0,
        fromPlayer: false,
      });
      break;
      
    case 2:
      // Phase 2: Triple spread shot
      for (let i = -1; i <= 1; i++) {
        bullets.push({
          x: centerX - 3 + i * 20,
          y: bottomY,
          width: 6,
          height: 12,
          velocityY: GAME_CONFIG.BOSS_BULLET_SPEED,
          velocityX: i * 1.5,
          fromPlayer: false,
        });
      }
      break;
      
    case 3:
      // Phase 3: Five-way spread + faster
      for (let i = -2; i <= 2; i++) {
        bullets.push({
          x: centerX - 3 + i * 15,
          y: bottomY,
          width: 6,
          height: 12,
          velocityY: GAME_CONFIG.BOSS_BULLET_SPEED * 1.2,
          velocityX: i * 2,
          fromPlayer: false,
        });
      }
      break;
  }
  
  // Enraged bosses fire additional side shots
  if (boss.isEnraged) {
    bullets.push({
      x: boss.x,
      y: boss.y + boss.height / 2,
      width: 6,
      height: 8,
      velocityY: 2,
      velocityX: -3,
      fromPlayer: false,
    });
    bullets.push({
      x: boss.x + boss.width,
      y: boss.y + boss.height / 2,
      width: 6,
      height: 8,
      velocityY: 2,
      velocityX: 3,
      fromPlayer: false,
    });
  }
  
  return bullets;
}

// Get attack interval based on boss state (faster when enraged)
export function getBossAttackInterval(boss: Boss): number {
  let interval = GAME_CONFIG.BOSS_ATTACK_INTERVAL;
  
  // Faster attacks in higher phases
  interval -= (boss.phase - 1) * 100;
  
  // Even faster when enraged
  if (boss.isEnraged) {
    interval *= 0.6;
  }
  
  // Slightly faster for higher level bosses
  interval -= (boss.bossLevel - 1) * 50;
  
  return Math.max(300, interval); // Minimum 300ms between attacks
}

// Calculate points for defeating a boss
export function getBossPoints(boss: Boss): number {
  return GAME_CONFIG.BOSS_POINTS_BASE * boss.bossLevel;
}

// Get rewards for defeating a boss
export function getBossRewards(bossLevel: number): BossReward[] {
  // Determine which reward tier to use
  let rewardTier: number;
  if (bossLevel <= 1) {
    rewardTier = 0;
  } else if (bossLevel <= 2) {
    rewardTier = 1;
  } else {
    rewardTier = 2;
  }
  
  const availableRewards = BOSS_REWARDS[rewardTier];
  
  // Give more rewards for higher level bosses
  const numRewards = Math.min(2 + Math.floor(bossLevel / 2), availableRewards.length);
  
  // Shuffle and pick rewards
  const shuffled = [...availableRewards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, numRewards);
}
