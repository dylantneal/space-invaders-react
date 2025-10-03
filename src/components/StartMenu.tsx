import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameState } from '../types/game';

interface StartMenuProps {
  gameState: GameState;
  onStartGame: () => void;
}

export function StartMenu({ gameState, onStartGame }: StartMenuProps) {
  return (
    <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
      <Card className="bg-card/95 border-primary">
        <CardContent className="p-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2 retro-glow">
            SPACE INVADERS
          </h1>
          <p className="text-muted-foreground mb-6">
            Defend Earth from the alien invasion!
          </p>
          
          <div className="mb-6 space-y-2 text-sm">
            <div className="text-accent">HIGH SCORE: {gameState.highScore.toLocaleString()}</div>
          </div>
          
          <div className="mb-6 space-y-1 text-xs text-muted-foreground">
            <p>← → Arrow keys to move</p>
            <p>SPACEBAR to shoot</p>
            <p>ESC to pause</p>
          </div>
          
          <Button 
            onClick={onStartGame}
            className="bg-primary hover:bg-primary/80 text-primary-foreground font-mono text-lg px-8 py-3"
          >
            START GAME
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}