import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { StartMenu } from './components/StartMenu';
import { GameOverMenu } from './components/GameOverMenu';
import { PauseMenu } from './components/PauseMenu';
import { VictoryMenu } from './components/VictoryMenu';
import { Toaster } from '@/components/ui/sonner';
import { useKeyboard } from './hooks/use-keyboard';
import { GameState } from './types/game';
import { toast } from 'sonner';

function App() {
  const [highScoreStr, setHighScoreStr] = useKV('space-invaders-high-score', '0');
  const [gameState, setGameState] = useState<GameState>({
    gameStatus: 'menu',
    score: 0,
    highScore: parseInt(highScoreStr || '0'),
    wave: 1,
    lives: 3,
  });

  const keys = useKeyboard();

  useEffect(() => {
    setGameState(prev => ({ ...prev, highScore: parseInt(highScoreStr || '0') }));
  }, [highScoreStr]);

  useEffect(() => {
    if (keys.escape && gameState.gameStatus === 'playing') {
      setGameState(prev => ({ ...prev, gameStatus: 'paused' }));
    }
  }, [keys.escape, gameState.gameStatus]);

  const handleGameStateChange = (newState: Partial<GameState>) => {
    setGameState(prev => {
      const updated = { ...prev, ...newState };
      
      // Update high score if needed
      if (updated.score > updated.highScore) {
        updated.highScore = updated.score;
        setHighScoreStr(updated.score.toString());
        if (newState.score && newState.score > prev.score) {
          toast.success('New High Score!', {
            description: `${updated.score.toLocaleString()} points`,
          });
        }
      }
      
      return updated;
    });
  };

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'playing',
      score: 0,
      wave: 1,
      lives: 3,
    }));
  };

  const restartGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'playing',
      score: 0,
      wave: 1,
      lives: 3,
    }));
  };

  const nextWave = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'playing',
      lives: Math.min(prev.lives + 1, 3), // Bonus life for completing wave
    }));
    toast.success(`Wave ${gameState.wave} begins!`, {
      description: 'Bonus life awarded',
    });
  };

  const returnToMenu = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'menu',
      score: 0,
      wave: 1,
      lives: 3,
    }));
  };

  const resumeGame = () => {
    setGameState(prev => ({ ...prev, gameStatus: 'playing' }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="relative">
        <div className="scanlines">
          <GameCanvas
            gameState={gameState}
            onGameStateChange={handleGameStateChange}
          />
        </div>
        
        {gameState.gameStatus === 'playing' && (
          <GameHUD gameState={gameState} />
        )}
        
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
          <PauseMenu onResumeGame={resumeGame} onMainMenu={returnToMenu} />
        )}
        
        {gameState.gameStatus === 'victory' && (
          <VictoryMenu
            gameState={gameState}
            onNextWave={nextWave}
            onMainMenu={returnToMenu}
          />
        )}
      </div>
      <Toaster />
    </div>
  );
}

export default App;