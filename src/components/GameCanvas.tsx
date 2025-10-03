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
} from '../lib/game-engine';
import { Player, Alien, Bullet, GameState, GAME_CONFIG } from '../types/game';

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
  
  const [player, setPlayer] = useState<Player>(createPlayer);
  const [aliens, setAliens] = useState<Alien[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
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

  const initializeGame = useCallback(() => {
    setPlayer(createPlayer());
    setAliens(createAlienWave(gameState.wave));
    setBullets([]);
    setExplosions([]);
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

    const render = (currentTime: number) => {
      if (currentTime - lastRenderTimeRef.current >= FRAME_TIME) {
        rendererRef.current!.clear();
        rendererRef.current!.drawStars(stars);
        rendererRef.current!.drawPlayer(player);
        rendererRef.current!.drawAliens(aliens);
        rendererRef.current!.drawBullets(bullets);
        
        explosions.forEach(explosion => {
          rendererRef.current?.drawExplosion(explosion.x, explosion.y, explosion.frame);
        });
        
        lastRenderTimeRef.current = currentTime;
      }
      
      if (gameState.gameStatus === 'playing') {
        requestAnimationFrame(render);
      }
    };

    requestAnimationFrame(render);
  }, [gameState.gameStatus, stars, player, aliens, bullets, explosions]);

  // Optimized collision detection with reduced frequency
  const lastCollisionCheckRef = useRef<number>(0);

  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const now = Date.now();
    if (now - lastCollisionCheckRef.current < GAME_CONFIG.COLLISION_CHECK_INTERVAL) return;
    lastCollisionCheckRef.current = now;

    // Check bullet-alien collisions
    const bulletAlienCollisions = collision.checkBulletAlienCollisions(bullets, aliens);
    
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
      
      setBullets(prev => prev.filter((_, index) => !hitBulletIndices.has(index)));
      
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
    
    // Check if aliens reached bottom
    if (collision.checkAliensReachedBottom(aliens, GAME_CONFIG.CANVAS_HEIGHT)) {
      onGameStateChange({ gameStatus: 'gameOver' });
    }
  }, [bullets, aliens, player, gameState.score, gameState.lives, collision, onGameStateChange]);

  // Optimized game loop with requestAnimationFrame timing
  const gameLoop = useCallback((timestamp: number) => {
    if (gameState.gameStatus !== 'playing') return;

    const now = timestamp || Date.now();

    // Update player
    setPlayer(prevPlayer => updatePlayer(prevPlayer, keys));

    // Handle player shooting with rate limiting
    if (keys.space && now - lastFireTimeRef.current > GAME_CONFIG.FIRE_RATE_LIMIT) {
      setBullets(prevBullets => [...prevBullets, createPlayerBullet(player)]);
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
  }, [gameState.gameStatus, keys, player]);

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