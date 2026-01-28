export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends Entity {
  speed: number;
}

export interface Alien extends Entity {
  velocityX: number;
  velocityY: number;
  type: 'squid' | 'crab' | 'octopus';
  points: number;
}

export interface Bullet extends Entity {
  velocityY: number;
  velocityX?: number; // For spread shot
  fromPlayer: boolean;
}

export interface GameState {
  gameStatus: 'menu' | 'playing' | 'paused' | 'gameOver' | 'victory';
  score: number;
  highScore: number;
  wave: number;
  lives: number;
}

// Power-up types
export type PowerUpType = 'rapidFire' | 'spreadShot' | 'shield' | 'scoreMultiplier';

export interface PowerUp extends Entity {
  type: PowerUpType;
  velocityY: number;
}

// Track active power-up effects with their expiration times
export interface ActivePowerUps {
  rapidFire: number | null;      // Expiration timestamp or null if not active
  spreadShot: number | null;
  shield: number | null;
  scoreMultiplier: number | null;
}

export interface MysteryShip extends Entity {
  velocityX: number;
  points: number;
  active: boolean;
}

export interface Shield {
  x: number;
  y: number;
  width: number;
  height: number;
  // Grid of pixels - true means pixel exists, false means destroyed
  pixels: boolean[][];
  pixelSize: number;
}

export const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  PLAYER_SPEED: 5,
  BULLET_SPEED: 8,
  ALIEN_SPEED: 0.8, // Slower alien movement
  ALIEN_DROP_SPEED: 15, // Less aggressive dropping
  FIRE_RATE_LIMIT: 200, // milliseconds
  ALIEN_ROWS: 5,
  ALIEN_COLS: 11,
  ALIEN_SPACING: 60,
  ALIEN_OFFSET_X: 50,
  ALIEN_OFFSET_Y: 80,
  
  // Performance optimization settings
  MAX_BULLETS: 30, // Increased for spread shot
  MAX_EXPLOSIONS: 10, // Limit simultaneous explosions
  COLLISION_CHECK_INTERVAL: 16, // ms between collision checks (~60fps)
  RENDER_TARGET_FPS: 60,
  STAR_COUNT: 75, // Reduced from 100 for better performance
  
  // Shield configuration
  SHIELD_COUNT: 4,
  SHIELD_WIDTH: 60,
  SHIELD_HEIGHT: 40,
  SHIELD_PIXEL_SIZE: 4,
  SHIELD_Y_POSITION: 480, // Position above player
  
  // Mystery ship configuration
  MYSTERY_SHIP_SPEED: 2,
  MYSTERY_SHIP_WIDTH: 50,
  MYSTERY_SHIP_HEIGHT: 20,
  MYSTERY_SHIP_Y: 40,
  MYSTERY_SHIP_MIN_INTERVAL: 10000, // Minimum 10 seconds between spawns
  MYSTERY_SHIP_MAX_INTERVAL: 25000, // Maximum 25 seconds between spawns
  
  // Power-up configuration
  POWERUP_DROP_CHANCE: 0.15, // 15% chance to drop on alien kill
  POWERUP_SPEED: 2,
  POWERUP_WIDTH: 24,
  POWERUP_HEIGHT: 24,
  POWERUP_DURATION: 8000, // 8 seconds duration for timed power-ups
  
  // Power-up effect values
  RAPID_FIRE_COOLDOWN: 80, // Reduced from 200ms to 80ms
  SPREAD_SHOT_ANGLE: 15, // Degrees spread for side bullets
  SCORE_MULTIPLIER: 2, // 2x score
} as const;

export const POINTS = {
  squid: 30,
  crab: 20,
  octopus: 10,
} as const;

// Mystery ship gives random bonus points
export const MYSTERY_SHIP_POINTS = [50, 100, 150, 200, 300] as const;

// Power-up colors for rendering
export const POWERUP_COLORS = {
  rapidFire: { main: '#f59e0b', glow: '#fbbf24' },      // Amber/Yellow
  spreadShot: { main: '#8b5cf6', glow: '#a78bfa' },     // Purple
  shield: { main: '#06b6d4', glow: '#22d3ee' },         // Cyan
  scoreMultiplier: { main: '#10b981', glow: '#34d399' }, // Emerald/Green
} as const;
