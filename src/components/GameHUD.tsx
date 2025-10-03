import React from 'react';
import { GameState } from '../types/game';

interface GameHUDProps {
  gameState: GameState;
}

export function GameHUD({ gameState }: GameHUDProps) {
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start text-foreground font-mono">
      <div className="flex flex-col gap-2">
        <div className="text-sm">
          SCORE: <span className="text-accent font-bold">{gameState.score.toLocaleString()}</span>
        </div>
        <div className="text-sm">
          HIGH: <span className="text-primary font-bold">{gameState.highScore.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-lg font-bold text-primary retro-glow">
          WAVE {gameState.wave}
        </div>
      </div>
      
      <div className="flex flex-col gap-2 items-end">
        <div className="text-sm">
          LIVES: <span className="text-destructive font-bold">{gameState.lives}</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: gameState.lives }, (_, i) => (
            <div key={i} className="w-4 h-3 bg-primary" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}