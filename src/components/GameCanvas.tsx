import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
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
  }, [gameState.wave]);

  useEffect(() => {
    if (gameState.gameStatus === 'playing' && aliens.length === 0) {
      initializeGame();
    }
  }, [gameState.gameStatus, aliens.length, initializeGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!rendererRef.current) {
      rendererRef.current = new GameRenderer(canvas);
    }
  }, []);

  const gameLoop = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return;

    const now = Date.now();

    // Update player
    setPlayer(prevPlayer => updatePlayer(prevPlayer, keys));

    // Handle player shooting
    if (keys.space && now - lastFireTimeRef.current > GAME_CONFIG.FIRE_RATE_LIMIT) {
      setBullets(prevBullets => [...prevBullets, createPlayerBullet(player)]);
      lastFireTimeRef.current = now;
    }

    // Update aliens
    setAliens(prevAliens => {
      const { aliens: updatedAliens } = updateAliens(prevAliens);
      return updatedAliens;
    });

    // Random alien shooting
    if (now - lastAlienFireTimeRef.current > 1000 && aliens.length > 0) {
      const randomAlien = aliens[Math.floor(Math.random() * aliens.length)];
      setBullets(prevBullets => [...prevBullets, createAlienBullet(randomAlien)]);
      lastAlienFireTimeRef.current = now;
    }

    // Update bullets
    setBullets(prevBullets => updateBullets(prevBullets));

    // Check collisions
    const bulletAlienCollisions = collision.checkBulletAlienCollisions(bullets, aliens);
    
    if (bulletAlienCollisions.length > 0) {
      const totalPoints = bulletAlienCollisions.reduce((sum, collision) => sum + collision.points, 0);
      
      setBullets(prevBullets => 
        prevBullets.filter((_, index) => 
          !bulletAlienCollisions.some(collision => collision.bulletIndex === index)
        )
      );
      
      setAliens(prevAliens => {
        const newAliens = prevAliens.filter((_, index) => 
          !bulletAlienCollisions.some(collision => collision.alienIndex === index)
        );
        
        // Add explosions
        bulletAlienCollisions.forEach(collision => {
          const alien = prevAliens[collision.alienIndex];
          setExplosions(prev => [...prev, { x: alien.x, y: alien.y, frame: 0 }]);
        });
        
        return newAliens;
      });
      
      onGameStateChange({ score: gameState.score + totalPoints });
    }

    // Check player collisions
    if (collision.checkPlayerAlienCollisions(player, aliens) || 
        collision.checkPlayerBulletCollisions(player, bullets)) {
      const newLives = gameState.lives - 1;
      if (newLives <= 0) {
        onGameStateChange({ gameStatus: 'gameOver', lives: newLives });
      } else {
        onGameStateChange({ lives: newLives });
        setPlayer(createPlayer());
        setBullets(prevBullets => prevBullets.filter(bullet => bullet.fromPlayer));
      }
    }

    // Check if aliens reached bottom
    if (collision.checkAliensReachedBottom(aliens, GAME_CONFIG.CANVAS_HEIGHT)) {
      onGameStateChange({ gameStatus: 'gameOver' });
    }

    // Check wave completion
    if (aliens.length === 0 && gameState.gameStatus === 'playing') {
      onGameStateChange({ 
        gameStatus: 'victory',
        wave: gameState.wave + 1 
      });
    }

    // Update explosions
    setExplosions(prev => 
      prev.map(explosion => ({ ...explosion, frame: explosion.frame + 1 }))
          .filter(explosion => explosion.frame < 10)
    );

    // Render
    if (rendererRef.current) {
      rendererRef.current.clear();
      rendererRef.current.drawStars(stars);
      rendererRef.current.drawPlayer(player);
      rendererRef.current.drawAliens(aliens);
      rendererRef.current.drawBullets(bullets);
      
      explosions.forEach(explosion => {
        rendererRef.current?.drawExplosion(explosion.x, explosion.y, explosion.frame);
      });
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, keys, player, aliens, bullets, explosions, stars, collision, onGameStateChange]);

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