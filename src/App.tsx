import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorageString } from './hooks/use-local-storage';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { StartMenu } from './components/StartMenu';
import { GameOverMenu } from './components/GameOverMenu';
import { PauseMenu } from './components/PauseMenu';
import { VictoryMenu } from './components/VictoryMenu';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { Toaster } from '@/components/ui/sonner';
import { useKeyboard } from './hooks/use-keyboard';
import { GameState, BossReward, GAME_CONFIG } from './types/game';
import { isBossWave } from './lib/game-engine';
import { toast } from 'sonner';
import { soundManager } from './lib/sound-manager';
import { musicManager } from './lib/music-manager';

function App() {
  const [highScoreStr, setHighScoreStr] = useLocalStorageString('alien-invaders-high-score', '0');
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useLocalStorageString('alien-invaders-perf-monitor', 'false');
  const [soundEnabledStr, setSoundEnabledStr] = useLocalStorageString('alien-invaders-sound', 'true');
  const [musicEnabledStr, setMusicEnabledStr] = useLocalStorageString('alien-invaders-music', 'true');
  const [gameState, setGameState] = useState<GameState>({
    gameStatus: 'menu',
    score: 0,
    highScore: parseInt(highScoreStr || '0'),
    wave: 1,
    lives: 3,
  });

  // Track if we've already shown the high score notification this game session
  const highScoreNotifiedRef = useRef(false);
  // Store the original high score at the start of the game to compare against
  const originalHighScoreRef = useRef(parseInt(highScoreStr || '0'));
  
  // Boss rewards to be applied on next wave
  const [pendingBossRewards, setPendingBossRewards] = useState<BossReward[]>([]);
  const [lastDefeatedBossLevel, setLastDefeatedBossLevel] = useState<number>(0);

  const soundEnabled = soundEnabledStr === 'true';
  const musicEnabled = musicEnabledStr === 'true';

  const keys = useKeyboard();

  // Sync sound and music managers with stored preferences
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    musicManager.setEnabled(musicEnabled);
  }, [musicEnabled]);

  // Track if we've already started music after user interaction
  const musicStartedRef = useRef(false);

  // Start music on first user interaction (browsers block autoplay until interaction)
  useEffect(() => {
    const startMusicOnInteraction = () => {
      if (!musicStartedRef.current && musicEnabled && gameState.gameStatus === 'menu') {
        musicStartedRef.current = true;
        musicManager.playMenuMusic();
      }
      // Remove listeners after first interaction
      document.removeEventListener('click', startMusicOnInteraction);
      document.removeEventListener('keydown', startMusicOnInteraction);
      document.removeEventListener('touchstart', startMusicOnInteraction);
    };

    // Try to play immediately (will work if user has interacted before)
    if (musicEnabled && gameState.gameStatus === 'menu') {
      musicManager.playMenuMusic();
    }

    // Also listen for first interaction in case autoplay was blocked
    document.addEventListener('click', startMusicOnInteraction);
    document.addEventListener('keydown', startMusicOnInteraction);
    document.addEventListener('touchstart', startMusicOnInteraction);

    return () => {
      document.removeEventListener('click', startMusicOnInteraction);
      document.removeEventListener('keydown', startMusicOnInteraction);
      document.removeEventListener('touchstart', startMusicOnInteraction);
    };
  }, [musicEnabled, gameState.gameStatus]);

  // Track previous game status and wave for music control
  const prevGameStatusForMusicRef = useRef<string>(gameState.gameStatus);
  const prevWaveForMusicRef = useRef<number>(gameState.wave);

  // Control music based on game status
  useEffect(() => {
    const wasStatus = prevGameStatusForMusicRef.current;
    const wasWave = prevWaveForMusicRef.current;
    prevGameStatusForMusicRef.current = gameState.gameStatus;
    prevWaveForMusicRef.current = gameState.wave;
    
    if (gameState.gameStatus === 'playing') {
      // If resuming from pause, just resume (don't restart)
      if (wasStatus === 'paused') {
        return;
      }
      
      // Calculate which music slot we're in (0-3) for waves 1-3, 4-6, 7-9, 10-12
      const currentSlot = Math.floor((gameState.wave - 1) / 3);
      const previousSlot = Math.floor((wasWave - 1) / 3);
      
      // Only call playForWave when:
      // 1. Starting a new game (wasStatus was menu or gameOver)
      // 2. Moving to a new wave group (slot changed)
      const startingNewGame = wasStatus === 'menu' || wasStatus === 'gameOver';
      const changedMusicSlot = currentSlot !== previousSlot && wasStatus === 'victory';
      
      if (startingNewGame || changedMusicSlot) {
        musicManager.playForWave(gameState.wave);
      }
    } else if (gameState.gameStatus === 'paused') {
      musicManager.pause();
    } else if (gameState.gameStatus === 'menu') {
      // Play menu music
      musicManager.playMenuMusic();
    } else if (gameState.gameStatus === 'gameOver') {
      // Stop music on game over
      musicManager.stop();
    }
    // Note: We don't stop music on 'victory' - it keeps playing through wave transitions
  }, [gameState.gameStatus, gameState.wave]);

  useEffect(() => {
    const newHighScore = parseInt(highScoreStr || '0');
    setGameState(prev => ({ ...prev, highScore: newHighScore }));
    // Update original high score reference when it changes from storage
    originalHighScoreRef.current = newHighScore;
  }, [highScoreStr]);

  useEffect(() => {
    if (keys.escape && gameState.gameStatus === 'playing') {
      setGameState(prev => ({ ...prev, gameStatus: 'paused' }));
    }
    
    // Debug key: P to toggle performance monitor
    if (keys.p && gameState.gameStatus === 'menu') {
      setShowPerformanceMonitor(prev => prev === 'true' ? 'false' : 'true');
    }
  }, [keys.escape, keys.p, gameState.gameStatus, setShowPerformanceMonitor]);

  const handleGameStateChange = (newState: Partial<GameState>) => {
    setGameState(prev => {
      const updated = { ...prev, ...newState };
      
      // Check if we've beaten the high score
      if (updated.score > updated.highScore) {
        updated.highScore = updated.score;
        setHighScoreStr(updated.score.toString());
        
        // Only show notification if:
        // 1. We haven't notified yet this game session
        // 2. The score actually exceeded the original high score from when the game started
        if (!highScoreNotifiedRef.current && updated.score > originalHighScoreRef.current) {
          highScoreNotifiedRef.current = true;
          toast.success('New High Score!', {
            description: `${updated.score.toLocaleString()} points`,
          });
        }
      }
      
      return updated;
    });
  };

  // Toggle just sound effects - used in pause menu
  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabledStr(newValue ? 'true' : 'false');
    soundManager.setEnabled(newValue);
    
    // Play a test sound when enabling
    if (newValue) {
      soundManager.play('powerUp');
    }
  };

  // Toggle just music - used in pause menu
  const toggleMusic = () => {
    const newValue = !musicEnabled;
    setMusicEnabledStr(newValue ? 'true' : 'false');
    musicManager.setEnabled(newValue);
  };

  const startGame = () => {
    // Reset high score notification flag when starting a new game
    highScoreNotifiedRef.current = false;
    // Store the current high score as the target to beat
    originalHighScoreRef.current = parseInt(highScoreStr || '0');
    
    // Shuffle the music playlist for this playthrough
    musicManager.initializePlaylist();
    
    setGameState(prev => ({
      ...prev,
      gameStatus: 'playing',
      score: 0,
      wave: 1,
      lives: 3,
    }));
  };

  const restartGame = () => {
    // Reset high score notification flag when restarting
    highScoreNotifiedRef.current = false;
    // Store the current high score as the target to beat
    originalHighScoreRef.current = parseInt(highScoreStr || '0');
    
    // Shuffle the music playlist for this new playthrough
    musicManager.initializePlaylist();
    
    setGameState(prev => ({
      ...prev,
      gameStatus: 'playing',
      score: 0,
      wave: 1,
      lives: 3,
    }));
  };

  const nextWave = () => {
    // Check if there are pending boss rewards to apply
    let extraLives = 0;
    let extraScore = 0;
    const powerUpRewards: string[] = [];
    
    if (pendingBossRewards.length > 0) {
      // Apply boss rewards
      pendingBossRewards.forEach(reward => {
        switch (reward.type) {
          case 'extraLife':
            extraLives += 1;
            powerUpRewards.push('Extra Life');
            break;
          case 'megaPoints':
            extraScore += reward.value || 0;
            powerUpRewards.push(`+${reward.value} Points`);
            break;
          case 'rapidFire':
            powerUpRewards.push('Rapid Fire');
            break;
          case 'spreadShot':
            powerUpRewards.push('Spread Shot');
            break;
          case 'shield':
            powerUpRewards.push('Shield');
            break;
          case 'scoreMultiplier':
            powerUpRewards.push('Score Multiplier');
            break;
          case 'fullShields':
            powerUpRewards.push('Full Shields Restored');
            break;
        }
      });
      
      // Clear pending rewards
      setPendingBossRewards([]);
    }
    
    const wasBossWave = isBossWave(gameState.wave);
    const normalBonus = wasBossWave ? 0 : 1; // Regular waves give 1 life, boss waves give rewards instead
    
    setGameState(prev => ({
      ...prev,
      gameStatus: 'playing',
      wave: prev.wave + 1,
      lives: Math.min(prev.lives + normalBonus + extraLives, 5), // Max 5 lives
      score: prev.score + extraScore,
    }));
    
    if (wasBossWave) {
      const rewardsList = powerUpRewards.length > 0 
        ? `Rewards: ${powerUpRewards.join(', ')}, Shields Restored!`
        : 'Shields Restored!';
      toast.success(`Boss Defeated! Wave ${gameState.wave + 1} begins!`, {
        description: rewardsList,
        duration: 5000,
      });
    } else {
      toast.success(`Wave ${gameState.wave + 1} begins!`, {
        description: 'Bonus life awarded',
      });
    }
  };

  const returnToMenu = () => {
    // Reset notification flag when returning to menu
    highScoreNotifiedRef.current = false;
    
    setGameState(prev => ({
      ...prev,
      gameStatus: 'menu',
      score: 0,
      wave: 1,
      lives: 3,
    }));
  };

  const resumeGame = () => {
    musicManager.resume();
    setGameState(prev => ({ ...prev, gameStatus: 'playing' }));
  };

  const handleBossDefeated = (rewards: BossReward[], bossLevel: number) => {
    setPendingBossRewards(rewards);
    setLastDefeatedBossLevel(bossLevel);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative">
      
      {/* Game container with canvas */}
      <div className="relative game-container">
        <div className="scanlines relative">
          <GameCanvas
            gameState={gameState}
            onGameStateChange={handleGameStateChange}
            onBossDefeated={handleBossDefeated}
          />
        </div>
        
        {gameState.gameStatus === 'playing' && (
          <GameHUD gameState={gameState} />
        )}
      </div>
      
      {/* Menu overlays - positioned outside game-container to avoid styling conflicts */}
      {gameState.gameStatus === 'menu' && (
        <StartMenu gameState={gameState} onStartGame={startGame} />
      )}
      
      {gameState.gameStatus === 'gameOver' && (
        <GameOverMenu
          gameState={gameState}
          onRestartGame={restartGame}
          onMainMenu={returnToMenu}
        />
      )}
      
      {gameState.gameStatus === 'paused' && (
        <PauseMenu 
          gameState={gameState}
          onResumeGame={resumeGame} 
          onMainMenu={returnToMenu}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          musicEnabled={musicEnabled}
          onToggleMusic={toggleMusic}
        />
      )}
      
      {gameState.gameStatus === 'victory' && (
        <VictoryMenu
          gameState={gameState}
          onNextWave={nextWave}
          onMainMenu={returnToMenu}
          bossRewards={pendingBossRewards}
          bossLevel={lastDefeatedBossLevel}
        />
      )}
      
      <Toaster />
      <PerformanceMonitor enabled={showPerformanceMonitor === 'true'} />
    </div>
  );
}

export default App;
