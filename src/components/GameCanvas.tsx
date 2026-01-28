import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useKeyboard } from '../hooks/use-keyboard';
import { useCollision } from '../hooks/use-collision';
import { GameRenderer } from '../lib/game-renderer';
import {
  createPlayer,
  createAlienWave,
  updatePlayer,
  updateAliens,
  updateBullets,
  createPlayerBullet,
  createAlienBullet,
  createShields,
  checkBulletShieldCollision,
  damageShield,
} from '../lib/game-engine';
import { Player, Alien, Bullet, Shield, GameState, GAME_CONFIG } from '../types/game';

interface GameCanvasProps {
  gameState: GameState;
  onGameStateChange: (newState: Partial<GameState>) => void;
}

export function GameCanvas({ gameState, onGameStateChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const animationRef = useRef<number>(0);
  const lastFireTimeRef = useRef<number>(0);
  const lastAlienFireTimeRef = useRef<number>(0);
  
  // Refs to hold latest values for the game loop (avoids stale closures)
  const keysRef = useRef<{ left: boolean; right: boolean; space: boolean; escape: boolean; p: boolean }>({ left: false, right: false, space: false, escape: false, p: false });
  const playerRef = useRef<Player | null>(null);
  
  const [player, setPlayer] = useState<Player>(createPlayer);
  const [aliens, setAliens] = useState<Alien[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [shields, setShields] = useState<Shield[]>([]);
  const [explosions, setExplosions] = useState<Array<{ x: number; y: number; frame: number }>>([]);
  
  // Memoize static stars to prevent recreation with reduced count
  const stars = useMemo(() => 
    Array.from({ length: GAME_CONFIG.STAR_COUNT }, () => ({
      x: Math.random() * GAME_CONFIG.CANVAS_WIDTH,
      y: Math.random() * GAME_CONFIG.CANVAS_HEIGHT,
      brightness: 0.3 + Math.random() * 0.4,
    })), []
  );

  const keys = useKeyboard();
  const collision = useCollision();

  // Keep refs in sync with latest values
  useEffect(() => {
    keysRef.current = keys;
  }, [keys]);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  const initializeGame = useCallback(() => {
    setPlayer(createPlayer());
    setAliens(createAlienWave(gameState.wave));
    setBullets([]);
    setExplosions([]);
    // Only create new shields on wave 1, otherwise keep existing shields
    if (gameState.wave === 1) {
      setShields(createShields());
    }
    lastFireTimeRef.current = 0;
    lastAlienFireTimeRef.current = 0;
  }, [gameState.wave]);

  // Initialize game when starting
  useEffect(() => {
    if (gameState.gameStatus === 'playing') {
      initializeGame();
    }
  }, [gameState.gameStatus, initializeGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!rendererRef.current) {
      rendererRef.current = new GameRenderer(canvas);
    }
  }, []);

  // Optimized rendering with frame rate control
  const lastRenderTimeRef = useRef<number>(0);
  const TARGET_FPS = GAME_CONFIG.RENDER_TARGET_FPS;
  const FRAME_TIME = 1000 / TARGET_FPS;

  // Separate rendering effect with frame rate control
  useEffect(() => {
    if (gameState.gameStatus !== 'playing' || !rendererRef.current) return;

    let renderFrameId: number;
    let isActive = true;

    const render = (currentTime: number) => {
      if (!isActive) return;
      
      if (currentTime - lastRenderTimeRef.current >= FRAME_TIME) {
        rendererRef.current!.clear();
        rendererRef.current!.drawStars(stars);
        rendererRef.current!.drawShields(shields);
        rendererRef.current!.drawPlayer(player);
        rendererRef.current!.drawAliens(aliens);
        rendererRef.current!.drawBullets(bullets);
        
        explosions.forEach(explosion => {
          rendererRef.current?.drawExplosion(explosion.x, explosion.y, explosion.frame);
        });
        
        lastRenderTimeRef.current = currentTime;
      }
      
      if (isActive && gameState.gameStatus === 'playing') {
        renderFrameId = requestAnimationFrame(render);
      }
    };

    renderFrameId = requestAnimationFrame(render);
    
    // Cleanup: cancel animation frame when effect re-runs or unmounts
    return () => {
      isActive = false;
      cancelAnimationFrame(renderFrameId);
    };
  }, [gameState.gameStatus, stars, player, aliens, bullets, shields, explosions]);

  // Optimized collision detection with reduced frequency
  const lastCollisionCheckRef = useRef<number>(0);

  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const now = Date.now();
    if (now - lastCollisionCheckRef.current < GAME_CONFIG.COLLISION_CHECK_INTERVAL) return;
    lastCollisionCheckRef.current = now;

    // Check bullet-shield collisions first
    const bulletsToRemove = new Set<number>();
    
    bullets.forEach((bullet, bulletIndex) => {
      for (const shield of shields) {
        if (checkBulletShieldCollision(bullet, shield)) {
          // Damage the shield
          damageShield(shield, bullet.x, bullet.y, bullet.width, bullet.height, !bullet.fromPlayer);
          bulletsToRemove.add(bulletIndex);
          break;
        }
      }
    });
    
    // Remove bullets that hit shields
    if (bulletsToRemove.size > 0) {
      setBullets(prev => prev.filter((_, index) => !bulletsToRemove.has(index)));
      // Force shield re-render by creating new array
      setShields(prev => [...prev]);
    }

    // Check bullet-alien collisions (only for bullets not removed by shields)
    const remainingBullets = bullets.filter((_, index) => !bulletsToRemove.has(index));
    const bulletAlienCollisions = collision.checkBulletAlienCollisions(remainingBullets, aliens);
    
    if (bulletAlienCollisions.length > 0) {
      const totalPoints = bulletAlienCollisions.reduce((sum, collision) => sum + collision.points, 0);
      
      // Batch explosion updates
      const newExplosions = bulletAlienCollisions.map(collision => {
        const alien = aliens[collision.alienIndex];
        return { x: alien.x, y: alien.y, frame: 0 };
      });
      
      setExplosions(prev => [...prev, ...newExplosions]);
      
      // Remove hit bullets and aliens in one operation
      const hitBulletIndices = new Set(bulletAlienCollisions.map(c => c.bulletIndex));
      const hitAlienIndices = new Set(bulletAlienCollisions.map(c => c.alienIndex));
      
      setBullets(prev => prev.filter((_, index) => !hitBulletIndices.has(index) && !bulletsToRemove.has(index)));
      
      setAliens(prev => {
        const filtered = prev.filter((_, index) => !hitAlienIndices.has(index));
        
        // Check wave completion
        if (filtered.length === 0) {
          onGameStateChange({ gameStatus: 'victory' });
        }
        
        return filtered;
      });
      
      onGameStateChange({ score: gameState.score + totalPoints });
    }
    
    // Check player collisions
    if (collision.checkPlayerAlienCollisions(player, aliens) || 
        collision.checkPlayerBulletCollisions(player, bullets)) {
      const newLives = gameState.lives - 1;
      if (newLives <= 0) {
        onGameStateChange({ gameStatus: 'gameOver', lives: 0 });
      } else {
        onGameStateChange({ lives: newLives });
        setPlayer(createPlayer());
        setBullets(prev => prev.filter(bullet => bullet.fromPlayer));
      }
    }
    
    // Check if aliens reached bottom (shields area)
    if (collision.checkAliensReachedBottom(aliens, GAME_CONFIG.CANVAS_HEIGHT)) {
      onGameStateChange({ gameStatus: 'gameOver' });
    }
  }, [bullets, aliens, player, shields, gameState.score, gameState.lives, collision, onGameStateChange]);

  // Optimized game loop with requestAnimationFrame timing
  const gameLoop = useCallback((timestamp: number) => {
    if (gameState.gameStatus !== 'playing') return;

    const now = timestamp || Date.now();
    const currentKeys = keysRef.current;
    const currentPlayer = playerRef.current;

    // Update player using ref for latest keys
    setPlayer(prevPlayer => updatePlayer(prevPlayer, currentKeys));

    // Handle player shooting with rate limiting
    if (currentKeys.space && now - lastFireTimeRef.current > GAME_CONFIG.FIRE_RATE_LIMIT && currentPlayer) {
      setBullets(prevBullets => [...prevBullets, createPlayerBullet(currentPlayer)]);
      lastFireTimeRef.current = now;
    }

    // Update all game entities in sequence to avoid race conditions
    setAliens(prevAliens => {
      const { aliens: updatedAliens } = updateAliens(prevAliens);
      
      // Random alien shooting using updated aliens array
      if (now - lastAlienFireTimeRef.current > 1000 && updatedAliens.length > 0) {
        const randomAlien = updatedAliens[Math.floor(Math.random() * updatedAliens.length)];
        setBullets(prevBullets => [...prevBullets, createAlienBullet(randomAlien)]);
        lastAlienFireTimeRef.current = now;
      }
      
      return updatedAliens;
    });

    // Update bullets - filter out off-screen bullets and limit count for performance
    setBullets(prevBullets => {
      const filteredBullets = updateBullets(prevBullets)
        .filter(bullet => bullet.y > -bullet.height && bullet.y < GAME_CONFIG.CANVAS_HEIGHT + bullet.height);
      
      // Limit bullet count for performance
      if (filteredBullets.length > GAME_CONFIG.MAX_BULLETS) {
        return filteredBullets.slice(-GAME_CONFIG.MAX_BULLETS);
      }
      
      return filteredBullets;
    });

    // Update explosions with limit
    setExplosions(prev => {
      const updated = prev.map(explosion => ({ ...explosion, frame: explosion.frame + 1 }))
        .filter(explosion => explosion.frame < 10);
      
      // Limit explosion count for performance
      if (updated.length > GAME_CONFIG.MAX_EXPLOSIONS) {
        return updated.slice(-GAME_CONFIG.MAX_EXPLOSIONS);
      }
      
      return updated;
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.gameStatus]);

  useEffect(() => {
    if (gameState.gameStatus === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [gameState.gameStatus, gameLoop]);

  return (
    <canvas
      ref={canvasRef}
      width={GAME_CONFIG.CANVAS_WIDTH}
      height={GAME_CONFIG.CANVAS_HEIGHT}
      className="game-canvas border-2 border-primary"
    />
  );
}
