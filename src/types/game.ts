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

// Boss alien that appears every 5 waves
export interface Boss extends Entity {
  health: number;
  maxHealth: number;
  phase: number; // Current attack phase (1-3)
  velocityX: number;
  velocityY: number;
  lastAttackTime: number;
  animationFrame: number;
  isEnraged: boolean; // Below 30% health
  bossLevel: number; // Which boss (1 = wave 5, 2 = wave 10, etc.)
}

// Rewards given after defeating a boss
export type BossReward = {
  type: 'extraLife' | 'fullShields' | 'rapidFire' | 'spreadShot' | 'shield' | 'scoreMultiplier' | 'megaPoints';
  value?: number;
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
  
  // Boss configuration
  BOSS_WAVE_INTERVAL: 3, // Boss appears every 3 waves
  BOSS_WIDTH: 120,
  BOSS_HEIGHT: 80,
  BOSS_BASE_HEALTH: 50, // Base health, multiplied by boss level
  BOSS_SPEED: 1.5,
  BOSS_ATTACK_INTERVAL: 800, // ms between attacks
  BOSS_BULLET_SPEED: 4,
  BOSS_ENRAGE_THRESHOLD: 0.3, // Below 30% health
  BOSS_POINTS_BASE: 1000, // Base points, multiplied by boss level
} as const;

// Boss colors for each level
export const BOSS_COLORS = {
  1: { main: '#dc2626', secondary: '#991b1b', glow: '#ef4444', eye: '#fbbf24' }, // Red Destroyer
  2: { main: '#7c3aed', secondary: '#5b21b6', glow: '#a78bfa', eye: '#22d3ee' }, // Purple Phantom
  3: { main: '#059669', secondary: '#047857', glow: '#34d399', eye: '#f472b6' }, // Emerald Terror
  4: { main: '#d97706', secondary: '#b45309', glow: '#fbbf24', eye: '#06b6d4' }, // Golden Fury
  5: { main: '#0ea5e9', secondary: '#0284c7', glow: '#38bdf8', eye: '#f43f5e' }, // Azure Annihilator
} as const;

export const POINTS = {
  squid: 30,
  crab: 20,
  octopus: 10,
} as const;

// Mystery ship gives random bonus points
export const MYSTERY_SHIP_POINTS = [50, 100, 150, 200, 300] as const;

// Boss rewards - rewards get better with higher boss levels
export const BOSS_REWARDS: BossReward[][] = [
  // Boss Level 1 (Wave 5) - Basic rewards
  [
    { type: 'extraLife' },
    { type: 'rapidFire' },
    { type: 'megaPoints', value: 500 },
  ],
  // Boss Level 2 (Wave 10) - Better rewards
  [
    { type: 'extraLife' },
    { type: 'spreadShot' },
    { type: 'fullShields' },
    { type: 'megaPoints', value: 1000 },
  ],
  // Boss Level 3+ (Wave 15+) - Best rewards
  [
    { type: 'extraLife' },
    { type: 'extraLife' },
    { type: 'rapidFire' },
    { type: 'spreadShot' },
    { type: 'shield' },
    { type: 'scoreMultiplier' },
    { type: 'fullShields' },
    { type: 'megaPoints', value: 2000 },
  ],
];

// Power-up colors for rendering
export const POWERUP_COLORS = {
  rapidFire: { main: '#f59e0b', glow: '#fbbf24' },      // Amber/Yellow
  spreadShot: { main: '#8b5cf6', glow: '#a78bfa' },     // Purple
  shield: { main: '#06b6d4', glow: '#22d3ee' },         // Cyan
  scoreMultiplier: { main: '#10b981', glow: '#34d399' }, // Emerald/Green
} as const;
