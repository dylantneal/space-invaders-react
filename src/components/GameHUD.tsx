import React from 'react';
import { GameState } from '../types/game';

interface GameHUDProps {
  gameState: GameState;
}

export function GameHUD({ gameState }: GameHUDProps) {
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start text-foreground font-mono">
      <div className="hud-element flex flex-col gap-3">
        <div className="text-sm">
          SCORE: <span className="text-accent font-bold retro-glow">{gameState.score.toLocaleString()}</span>
        </div>
        <div className="text-sm">
          HIGH: <span className="text-primary font-bold retro-glow">{gameState.highScore.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span>THREAT:</span>
          <div className="alien-indicator"></div>
        </div>
      </div>
      
      <div className="text-center hud-element">
        <div className="text-lg font-bold text-primary retro-glow wave-announce">
          WAVE {gameState.wave}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          SECTOR {String(gameState.wave).padStart(3, '0')}
        </div>
      </div>
      
      <div className="hud-element flex flex-col gap-3 items-end">
        <div className="text-sm">
          LIVES: <span className="text-destructive font-bold retro-glow">{gameState.lives}</span>
        </div>
        <div className="flex gap-1 lives-indicator">
          {Array.from({ length: gameState.lives }, (_, i) => (
            <div 
              key={i} 
              className="w-4 h-3 bg-primary" 
              style={{ 
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                filter: 'drop-shadow(0 0 4px var(--primary))'
              }} 
            />
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          SHIELDS: {Math.max(0, gameState.lives * 33)}%
        </div>
      </div>
    </div>
  );
}