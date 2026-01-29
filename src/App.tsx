import React, { useState, useEffect, useRef } from 'react';
import { useKV } from '@github/spark/hooks';
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
  const [highScoreStr, setHighScoreStr] = useKV('alien-invaders-high-score', '0');
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useKV('alien-invaders-perf-monitor', 'false');
  const [soundEnabledStr, setSoundEnabledStr] = useKV('alien-invaders-sound', 'true');
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

  const keys = useKeyboard();

  // Sync sound manager with stored preference
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
    musicManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Track previous game status for music control
  const prevGameStatusForMusicRef = useRef<string>(gameState.gameStatus);

  // Control music based on game status
  useEffect(() => {
    const wasStatus = prevGameStatusForMusicRef.current;
    prevGameStatusForMusicRef.current = gameState.gameStatus;
    
    if (gameState.gameStatus === 'playing') {
      // If resuming from pause, don't restart music (resumeGame handles it)
      if (wasStatus === 'paused') {
        return;
      }
      // Play gameplay music for all waves (including boss)
      musicManager.playGameplayMusic();
    } else if (gameState.gameStatus === 'paused') {
      musicManager.pause();
    } else if (gameState.gameStatus === 'menu' || gameState.gameStatus === 'gameOver' || gameState.gameStatus === 'victory') {
      musicManager.stop();
    }
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

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabledStr(newValue ? 'true' : 'false');
    soundManager.setEnabled(newValue);
    musicManager.setEnabled(newValue);
    
    // Play a test sound when enabling
    if (newValue) {
      soundManager.play('powerUp');
    }
  };

  const startGame = () => {
    // Reset high score notification flag when starting a new game
    highScoreNotifiedRef.current = false;
    // Store the current high score as the target to beat
    originalHighScoreRef.current = parseInt(highScoreStr || '0');
    
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
      {/* Sound toggle button */}
      <button
        onClick={toggleSound}
        className="absolute top-4 right-4 z-50 p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 transition-colors border border-slate-600"
        title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
      >
        {soundEnabled ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="22" y1="9" x2="16" y2="15" />
            <line x1="16" y1="9" x2="22" y2="15" />
          </svg>
        )}
      </button>
      
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
