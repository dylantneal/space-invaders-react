import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  const [stars] = useState(() => 
    Array.from({ length: 100 }, () => ({
      x: Math.random() * GAME_CONFIG.CANVAS_WIDTH,
      y: Math.random() * GAME_CONFIG.CANVAS_HEIGHT,
      brightness: 0.3 + Math.random() * 0.4,
    }))
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

  // Separate rendering effect
  useEffect(() => {
    if (gameState.gameStatus !== 'playing' || !rendererRef.current) return;

    rendererRef.current.clear();
    rendererRef.current.drawStars(stars);
    rendererRef.current.drawPlayer(player);
    rendererRef.current.drawAliens(aliens);
    rendererRef.current.drawBullets(bullets);
    
    explosions.forEach(explosion => {
      rendererRef.current?.drawExplosion(explosion.x, explosion.y, explosion.frame);
    });
  }, [gameState.gameStatus, stars, player, aliens, bullets, explosions]);

  // Collision detection effect - runs after state updates
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    // Check bullet-alien collisions
    const bulletAlienCollisions = collision.checkBulletAlienCollisions(bullets, aliens);
    
    if (bulletAlienCollisions.length > 0) {
      const totalPoints = bulletAlienCollisions.reduce((sum, collision) => sum + collision.points, 0);
      
      // Add explosions for hit aliens
      bulletAlienCollisions.forEach(collision => {
        const alien = aliens[collision.alienIndex];
        setExplosions(prev => [...prev, { x: alien.x, y: alien.y, frame: 0 }]);
      });
      
      // Remove hit bullets and aliens
      setBullets(prev => prev.filter((_, index) => 
        !bulletAlienCollisions.some(collision => collision.bulletIndex === index)
      ));
      
      setAliens(prev => {
        const filtered = prev.filter((_, index) => 
          !bulletAlienCollisions.some(collision => collision.alienIndex === index)
        );
        
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

  const gameLoop = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return;

    const now = Date.now();

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

    // Update bullets
    setBullets(prevBullets => updateBullets(prevBullets));

    // Update explosions
    setExplosions(prev => 
      prev.map(explosion => ({ ...explosion, frame: explosion.frame + 1 }))
          .filter(explosion => explosion.frame < 10)
    );

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