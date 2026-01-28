import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useKeyboard } from '../hooks/use-keyboard';
import { useCollision } from '../hooks/use-collision';
import { GameRenderer } from '../lib/game-renderer';
import { soundManager } from '../lib/sound-manager';
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
  createMysteryShip,
  updateMysteryShip,
  getNextMysteryShipSpawnTime,
  getInitialAlienCount,
  calculateSpeedMultiplier,
  createPowerUp,
  updatePowerUps,
  shouldDropPowerUp,
  createInitialActivePowerUps,
  activatePowerUp,
  updateActivePowerUps,
  getFireRateCooldown,
  getScoreMultiplier,
  hasShield,
  hasSpreadShot,
  createSpreadShotBullets,
  // Boss functions
  isBossWave,
  createBoss,
  updateBoss,
  damageBoss,
  createBossBullets,
  getBossAttackInterval,
  getBossPoints,
  getBossRewards,
} from '../lib/game-engine';
import { Player, Alien, Bullet, Shield, MysteryShip, PowerUp, ActivePowerUps, Boss, BossReward, GameState, GAME_CONFIG } from '../types/game';

interface GameCanvasProps {
  gameState: GameState;
  onGameStateChange: (newState: Partial<GameState>) => void;
  onBossDefeated?: (rewards: BossReward[], bossLevel: number) => void;
}

export function GameCanvas({ gameState, onGameStateChange, onBossDefeated }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const animationRef = useRef<number>(0);
  const lastFireTimeRef = useRef<number>(0);
  const lastAlienFireTimeRef = useRef<number>(0);
  
  // Mystery ship timing
  const nextMysteryShipSpawnRef = useRef<number>(0);
  
  // Track previous mystery ship state for sound
  const prevMysteryShipRef = useRef<MysteryShip | null>(null);
  
  // Track previous lives for low health warning
  const prevLivesRef = useRef<number>(3);
  
  // Initial alien count for speed calculation
  const initialAlienCountRef = useRef<number>(getInitialAlienCount());
  
  // Refs to hold latest values for the game loop (avoids stale closures)
  const keysRef = useRef<{ left: boolean; right: boolean; space: boolean; escape: boolean; p: boolean }>({ left: false, right: false, space: false, escape: false, p: false });
  const playerRef = useRef<Player | null>(null);
  const mysteryShipRef = useRef<MysteryShip | null>(null);
  const aliensRef = useRef<Alien[]>([]);
  const activePowerUpsRef = useRef<ActivePowerUps>(createInitialActivePowerUps());
  
  const [player, setPlayer] = useState<Player>(createPlayer);
  const [aliens, setAliens] = useState<Alien[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [shields, setShields] = useState<Shield[]>([]);
  const [explosions, setExplosions] = useState<Array<{ x: number; y: number; frame: number }>>([]);
  const [mysteryShip, setMysteryShip] = useState<MysteryShip | null>(null);
  const [mysteryShipExplosion, setMysteryShipExplosion] = useState<{ x: number; y: number; frame: number; points: number } | null>(null);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUps>(createInitialActivePowerUps);
  
  // Boss state
  const [boss, setBoss] = useState<Boss | null>(null);
  const [bossExplosion, setBossExplosion] = useState<{ x: number; y: number; width: number; height: number; frame: number; bossLevel: number } | null>(null);
  const [pendingBossRewards, setPendingBossRewards] = useState<BossReward[]>([]);
  const bossRef = useRef<Boss | null>(null);
  const lastBossAttackTimeRef = useRef<number>(0);
  const bossWasEnragedRef = useRef<boolean>(false);
  
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

  useEffect(() => {
    mysteryShipRef.current = mysteryShip;
    
    // Handle mystery ship sound
    if (mysteryShip && !prevMysteryShipRef.current) {
      soundManager.startMysteryShipSound();
    } else if (!mysteryShip && prevMysteryShipRef.current) {
      soundManager.stopMysteryShipSound();
    }
    prevMysteryShipRef.current = mysteryShip;
  }, [mysteryShip]);

  useEffect(() => {
    aliensRef.current = aliens;
  }, [aliens]);

  useEffect(() => {
    activePowerUpsRef.current = activePowerUps;
  }, [activePowerUps]);

  useEffect(() => {
    bossRef.current = boss;
    
    // Play enraged sound when boss becomes enraged
    if (boss && boss.isEnraged && !bossWasEnragedRef.current) {
      soundManager.play('bossEnraged');
    }
    bossWasEnragedRef.current = boss?.isEnraged ?? false;
  }, [boss]);

  // Track previous lives (keeping ref for other uses)
  useEffect(() => {
    prevLivesRef.current = gameState.lives;
  }, [gameState.lives]);

  // Handle game status changes for sound
  useEffect(() => {
    if (gameState.gameStatus === 'playing') {
      const speedMultiplier = calculateSpeedMultiplier(
        aliensRef.current.length || getInitialAlienCount(),
        initialAlienCountRef.current
      );
      soundManager.startHeartbeat(speedMultiplier);
    } else {
      soundManager.stopHeartbeat();
      soundManager.stopMysteryShipSound();
      soundManager.stopLowHealthWarning();
    }
    
    if (gameState.gameStatus === 'victory') {
      soundManager.play('victory');
    } else if (gameState.gameStatus === 'gameOver') {
      soundManager.play('gameOver');
    }
  }, [gameState.gameStatus]);

  const initializeGame = useCallback(() => {
    setPlayer(createPlayer());
    setBullets([]);
    setExplosions([]);
    setMysteryShip(null);
    setMysteryShipExplosion(null);
    setPowerUps([]);
    setActivePowerUps(createInitialActivePowerUps());
    setBossExplosion(null);
    setPendingBossRewards([]);
    
    // Check if this is a boss wave
    if (isBossWave(gameState.wave)) {
      // Boss wave - no regular aliens
      setAliens([]);
      const newBoss = createBoss(gameState.wave);
      setBoss(newBoss);
      bossRef.current = newBoss;
      lastBossAttackTimeRef.current = 0;
      bossWasEnragedRef.current = false;
      initialAlienCountRef.current = 1; // For speed calculation purposes
      
      // Play boss appear sound
      soundManager.play('bossAppear');
      
      // Stop regular heartbeat for boss waves
      soundManager.stopHeartbeat();
    } else {
      // Regular wave - normal aliens
      const newAliens = createAlienWave(gameState.wave);
      setAliens(newAliens);
      setBoss(null);
      bossRef.current = null;
      initialAlienCountRef.current = newAliens.length;
    }
    
    if (gameState.wave === 1) {
      setShields(createShields());
    }
    lastFireTimeRef.current = 0;
    lastAlienFireTimeRef.current = 0;
    nextMysteryShipSpawnRef.current = getNextMysteryShipSpawnTime();
    prevMysteryShipRef.current = null;
    // Lives are always 3 when starting/restarting a game
    prevLivesRef.current = 3;
  }, [gameState.wave]);

  // Track previous game status to only initialize on transition to 'playing'
  const prevGameStatusRef = useRef<string>(gameState.gameStatus);

  // Initialize game when starting (only when transitioning TO 'playing')
  useEffect(() => {
    const wasPlaying = prevGameStatusRef.current === 'playing';
    const isPlaying = gameState.gameStatus === 'playing';
    
    // Only initialize when we transition TO playing, not when already playing
    if (isPlaying && !wasPlaying) {
      initializeGame();
    }
    
    prevGameStatusRef.current = gameState.gameStatus;
  }, [gameState.gameStatus, initializeGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!rendererRef.current) {
      rendererRef.current = new GameRenderer(canvas);
    }
  }, []);

  // Cleanup sound manager on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      soundManager.stopHeartbeat();
      soundManager.stopMysteryShipSound();
      soundManager.stopLowHealthWarning();
    };
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
        rendererRef.current!.drawPlayer(player, hasShield(activePowerUps));
        rendererRef.current!.drawAliens(aliens, soundManager.alienAnimationFrame);
        rendererRef.current!.drawBullets(bullets);
        rendererRef.current!.drawPowerUps(powerUps);
        
        if (mysteryShip) {
          rendererRef.current!.drawMysteryShip(mysteryShip);
        }
        
        if (mysteryShipExplosion) {
          rendererRef.current!.drawMysteryShipExplosion(
            mysteryShipExplosion.x,
            mysteryShipExplosion.y,
            mysteryShipExplosion.frame,
            mysteryShipExplosion.points
          );
        }
        
        explosions.forEach(explosion => {
          rendererRef.current?.drawExplosion(explosion.x, explosion.y, explosion.frame);
        });
        
        // Draw boss
        if (boss) {
          rendererRef.current!.drawBoss(boss);
        }
        
        // Draw boss explosion
        if (bossExplosion) {
          rendererRef.current!.drawBossExplosion(
            bossExplosion.x,
            bossExplosion.y,
            bossExplosion.width,
            bossExplosion.height,
            bossExplosion.frame,
            bossExplosion.bossLevel
          );
        }
        
        rendererRef.current!.drawActivePowerUpIndicators(activePowerUps, GAME_CONFIG.CANVAS_WIDTH);
        
        lastRenderTimeRef.current = currentTime;
      }
      
      if (isActive && gameState.gameStatus === 'playing') {
        renderFrameId = requestAnimationFrame(render);
      }
    };

    renderFrameId = requestAnimationFrame(render);
    
    return () => {
      isActive = false;
      cancelAnimationFrame(renderFrameId);
    };
  }, [gameState.gameStatus, stars, player, aliens, bullets, shields, explosions, mysteryShip, mysteryShipExplosion, powerUps, activePowerUps, boss, bossExplosion]);

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
          damageShield(shield, bullet.x, bullet.y, bullet.width, bullet.height, !bullet.fromPlayer);
          bulletsToRemove.add(bulletIndex);
          // Play shield hit sound
          soundManager.play('shieldHit');
          break;
        }
      }
    });
    
    if (bulletsToRemove.size > 0) {
      setBullets(prev => prev.filter((_, index) => !bulletsToRemove.has(index)));
      setShields(prev => [...prev]);
    }

    // Check bullet-mystery ship collisions
    if (mysteryShip && mysteryShip.active) {
      const remainingPlayerBullets = bullets.filter((b, index) => b.fromPlayer && !bulletsToRemove.has(index));
      
      for (let i = 0; i < remainingPlayerBullets.length; i++) {
        const bullet = remainingPlayerBullets[i];
        if (collision.checkCollision(bullet, mysteryShip)) {
          const points = mysteryShip.points * getScoreMultiplier(activePowerUps);
          
          soundManager.play('mysteryShipExplosion');
          
          setMysteryShipExplosion({
            x: mysteryShip.x,
            y: mysteryShip.y,
            frame: 0,
            points: points,
          });
          
          setMysteryShip(null);
          
          const bulletIndex = bullets.findIndex(b => b === bullet);
          if (bulletIndex !== -1) {
            bulletsToRemove.add(bulletIndex);
          }
          
          onGameStateChange({ score: gameState.score + points });
          nextMysteryShipSpawnRef.current = getNextMysteryShipSpawnTime();
          
          break;
        }
      }
    }
    
    // Check bullet-boss collisions
    if (boss) {
      const remainingPlayerBullets = bullets.filter((b, index) => b.fromPlayer && !bulletsToRemove.has(index));
      
      for (let i = 0; i < remainingPlayerBullets.length; i++) {
        const bullet = remainingPlayerBullets[i];
        if (collision.checkCollision(bullet, boss)) {
          const bulletIndex = bullets.findIndex(b => b === bullet);
          if (bulletIndex !== -1) {
            bulletsToRemove.add(bulletIndex);
          }
          
          soundManager.play('bossHit');
          
          // Damage the boss
          const updatedBoss = damageBoss(boss, 1);
          
          if (updatedBoss === null) {
            // Boss defeated!
            soundManager.play('bossDefeated');
            
            const bossPoints = getBossPoints(boss) * getScoreMultiplier(activePowerUps);
            onGameStateChange({ score: gameState.score + bossPoints });
            
            // Start boss explosion
            setBossExplosion({
              x: boss.x,
              y: boss.y,
              width: boss.width,
              height: boss.height,
              frame: 0,
              bossLevel: boss.bossLevel,
            });
            
            // Get rewards
            const rewards = getBossRewards(boss.bossLevel);
            setPendingBossRewards(rewards);
            
            setBoss(null);
          } else {
            setBoss(updatedBoss);
          }
          
          break; // Only one bullet hits per frame
        }
      }
    }
    
    if (bulletsToRemove.size > 0) {
      setBullets(prev => prev.filter((_, index) => !bulletsToRemove.has(index)));
    }

    // Check player-powerup collisions
    const collectedPowerUps: number[] = [];
    powerUps.forEach((powerUp, index) => {
      if (collision.checkCollision(player, powerUp)) {
        collectedPowerUps.push(index);
        soundManager.play('powerUp');
        setActivePowerUps(prev => activatePowerUp(prev, powerUp.type));
      }
    });
    
    if (collectedPowerUps.length > 0) {
      setPowerUps(prev => prev.filter((_, index) => !collectedPowerUps.includes(index)));
    }

    // Check bullet-alien collisions
    const remainingBullets = bullets.filter((_, index) => !bulletsToRemove.has(index));
    const bulletAlienCollisions = collision.checkBulletAlienCollisions(remainingBullets, aliens);
    
    if (bulletAlienCollisions.length > 0) {
      const scoreMultiplier = getScoreMultiplier(activePowerUps);
      const totalPoints = bulletAlienCollisions.reduce((sum, coll) => sum + coll.points, 0) * scoreMultiplier;
      
      // Play explosion sounds with combo tracking
      bulletAlienCollisions.forEach(() => {
        soundManager.registerKill();
        soundManager.play('explosion');
      });
      
      // Play bigger explosion if multiple kills at once
      if (bulletAlienCollisions.length >= 2) {
        soundManager.play('explosionBig');
      }
      
      const newExplosions = bulletAlienCollisions.map(coll => {
        const alien = aliens[coll.alienIndex];
        return { x: alien.x, y: alien.y, frame: 0 };
      });
      
      setExplosions(prev => [...prev, ...newExplosions]);
      
      const hitBulletIndices = new Set(bulletAlienCollisions.map(c => c.bulletIndex));
      const hitAlienIndices = new Set(bulletAlienCollisions.map(c => c.alienIndex));
      
      setBullets(prev => prev.filter((_, index) => !hitBulletIndices.has(index) && !bulletsToRemove.has(index)));
      
      // Spawn power-ups from destroyed aliens
      const newPowerUps: PowerUp[] = [];
      bulletAlienCollisions.forEach(coll => {
        if (shouldDropPowerUp()) {
          const alien = aliens[coll.alienIndex];
          newPowerUps.push(createPowerUp(alien.x + alien.width / 2, alien.y + alien.height));
        }
      });
      
      if (newPowerUps.length > 0) {
        setPowerUps(prev => [...prev, ...newPowerUps]);
      }
      
      setAliens(prev => {
        const filtered = prev.filter((_, index) => !hitAlienIndices.has(index));
        
        // Update heartbeat speed based on remaining aliens
        const newSpeedMultiplier = calculateSpeedMultiplier(filtered.length, initialAlienCountRef.current);
        soundManager.updateHeartbeatSpeed(newSpeedMultiplier);
        
        if (filtered.length === 0) {
          soundManager.stopHeartbeat();
          soundManager.stopLowHealthWarning();
          onGameStateChange({ gameStatus: 'victory' });
        }
        
        return filtered;
      });
      
      onGameStateChange({ score: gameState.score + totalPoints });
    }
    
    // Check player collisions
    const playerHit = collision.checkPlayerAlienCollisions(player, aliens) || 
        collision.checkPlayerBulletCollisions(player, bullets);
    
    if (playerHit) {
      if (hasShield(activePowerUps)) {
        // Shield blocked the hit - consume the shield (one-hit protection)
        soundManager.play('shieldHit');
        setActivePowerUps(prev => ({ ...prev, shield: null }));
        // Clear enemy bullets that were about to hit (the shield absorbed them)
        setBullets(prev => prev.filter(bullet => bullet.fromPlayer));
      } else {
        soundManager.play('playerDeath');
        const newLives = gameState.lives - 1;
        if (newLives <= 0) {
          soundManager.stopHeartbeat();
          soundManager.stopLowHealthWarning();
          onGameStateChange({ gameStatus: 'gameOver', lives: 0 });
        } else {
          onGameStateChange({ lives: newLives });
          setPlayer(createPlayer());
          setBullets(prev => prev.filter(bullet => bullet.fromPlayer));
        }
      }
    }
    
    // Check if aliens reached bottom
    if (collision.checkAliensReachedBottom(aliens, GAME_CONFIG.CANVAS_HEIGHT)) {
      soundManager.stopHeartbeat();
      soundManager.stopLowHealthWarning();
      onGameStateChange({ gameStatus: 'gameOver' });
    }
  }, [bullets, aliens, player, shields, mysteryShip, powerUps, activePowerUps, boss, gameState.score, gameState.lives, collision, onGameStateChange]);

  // Optimized game loop with requestAnimationFrame timing
  const gameLoop = useCallback((timestamp: number) => {
    if (gameState.gameStatus !== 'playing') return;

    const now = timestamp || Date.now();
    const currentKeys = keysRef.current;
    const currentPlayer = playerRef.current;
    const currentAliens = aliensRef.current;
    const currentActivePowerUps = activePowerUpsRef.current;

    setPlayer(prevPlayer => updatePlayer(prevPlayer, currentKeys));

    // Handle player shooting with rate limiting
    const fireRateCooldown = getFireRateCooldown(currentActivePowerUps);
    if (currentKeys.space && now - lastFireTimeRef.current > fireRateCooldown && currentPlayer) {
      soundManager.play('playerShoot');
      
      if (hasSpreadShot(currentActivePowerUps)) {
        const spreadBullets = createSpreadShotBullets(currentPlayer);
        setBullets(prevBullets => [...prevBullets, ...spreadBullets]);
      } else {
        setBullets(prevBullets => [...prevBullets, createPlayerBullet(currentPlayer)]);
      }
      lastFireTimeRef.current = now;
    }

    const speedMultiplier = calculateSpeedMultiplier(
      currentAliens.length,
      initialAlienCountRef.current
    );

    setAliens(prevAliens => {
      const { aliens: updatedAliens } = updateAliens(prevAliens, speedMultiplier);
      
      if (now - lastAlienFireTimeRef.current > 1000 && updatedAliens.length > 0) {
        const randomAlien = updatedAliens[Math.floor(Math.random() * updatedAliens.length)];
        soundManager.play('alienShoot');
        setBullets(prevBullets => [...prevBullets, createAlienBullet(randomAlien)]);
        lastAlienFireTimeRef.current = now;
      }
      
      return updatedAliens;
    });

    setBullets(prevBullets => {
      const filteredBullets = updateBullets(prevBullets);
      
      if (filteredBullets.length > GAME_CONFIG.MAX_BULLETS) {
        return filteredBullets.slice(-GAME_CONFIG.MAX_BULLETS);
      }
      
      return filteredBullets;
    });

    setPowerUps(prev => updatePowerUps(prev));

    setActivePowerUps(prev => updateActivePowerUps(prev));

    setExplosions(prev => {
      const updated = prev.map(explosion => ({ ...explosion, frame: explosion.frame + 1 }))
        .filter(explosion => explosion.frame < 10);
      
      if (updated.length > GAME_CONFIG.MAX_EXPLOSIONS) {
        return updated.slice(-GAME_CONFIG.MAX_EXPLOSIONS);
      }
      
      return updated;
    });

    setMysteryShip(prev => {
      if (prev) {
        return updateMysteryShip(prev);
      }
      
      if (Date.now() >= nextMysteryShipSpawnRef.current) {
        nextMysteryShipSpawnRef.current = getNextMysteryShipSpawnTime();
        return createMysteryShip();
      }
      
      return null;
    });

    setMysteryShipExplosion(prev => {
      if (!prev) return null;
      
      const newFrame = prev.frame + 1;
      if (newFrame >= 20) {
        return null;
      }
      
      return { ...prev, frame: newFrame };
    });

    // Update boss
    setBoss(prev => {
      if (!prev) return null;
      return updateBoss(prev);
    });
    
    // Boss attacks
    const currentBoss = bossRef.current;
    if (currentBoss) {
      const attackInterval = getBossAttackInterval(currentBoss);
      if (now - lastBossAttackTimeRef.current > attackInterval) {
        soundManager.play('bossAttack');
        const bossBullets = createBossBullets(currentBoss);
        setBullets(prevBullets => [...prevBullets, ...bossBullets]);
        lastBossAttackTimeRef.current = now;
      }
    }
    
    // Update boss explosion
    setBossExplosion(prev => {
      if (!prev) return null;
      
      const newFrame = prev.frame + 1;
      if (newFrame >= 40) {
        // Boss explosion done - give rewards and trigger victory
        const rewards = pendingBossRewards;
        if (rewards.length > 0 && onBossDefeated) {
          onBossDefeated(rewards, prev.bossLevel);
        }
        setPendingBossRewards([]);
        soundManager.play('bossReward');
        onGameStateChange({ gameStatus: 'victory' });
        return null;
      }
      
      return { ...prev, frame: newFrame };
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.gameStatus, onGameStateChange, onBossDefeated, pendingBossRewards]);

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
