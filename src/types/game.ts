export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends Entity {
  speed: number;
  lives: number;
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

export const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  PLAYER_SPEED: 5,
  BULLET_SPEED: 8,
  ALIEN_SPEED: 1,
  ALIEN_DROP_SPEED: 20,
  FIRE_RATE_LIMIT: 200, // milliseconds
  ALIEN_ROWS: 5,
  ALIEN_COLS: 11,
  ALIEN_SPACING: 60,
  ALIEN_OFFSET_X: 50,
  ALIEN_OFFSET_Y: 80,
} as const;

export const POINTS = {
  squid: 30,
  crab: 20,
  octopus: 10,
} as const;