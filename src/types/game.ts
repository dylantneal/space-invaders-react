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
  fromPlayer: boolean;
}

export interface GameState {
  gameStatus: 'menu' | 'playing' | 'paused' | 'gameOver' | 'victory';
  score: number;
  highScore: number;
  wave: number;
  lives: number;
}

export interface PowerUp extends Entity {
  type: 'extraLife' | 'rapidFire' | 'shield';
  velocityY: number;
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
  MAX_BULLETS: 20, // Limit bullets for performance
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
} as const;

export const POINTS = {
  squid: 30,
  crab: 20,
  octopus: 10,
} as const;