import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameState } from '../types/game';

interface VictoryMenuProps {
  gameState: GameState;
  onNextWave: () => void;
  onMainMenu: () => void;
}

export function VictoryMenu({ gameState, onNextWave, onMainMenu }: VictoryMenuProps) {
  return (
    <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
      <Card className="bg-card/95 border-secondary">
        <CardContent className="p-8 text-center">
          <h1 className="text-3xl font-bold text-secondary mb-2 retro-glow">
            WAVE CLEARED!
          </h1>
          
          <div className="mb-6 space-y-2">
            <div className="text-2xl font-bold text-accent">
              SCORE: {gameState.score.toLocaleString()}
            </div>
            <div className="text-lg text-secondary">
              WAVE {gameState.wave - 1} COMPLETE
            </div>
            <div className="text-sm text-muted-foreground">
              Prepare for Wave {gameState.wave}
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={onNextWave}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-mono"
            >
              NEXT WAVE
            </Button>
            <Button 
              onClick={onMainMenu}
              variant="outline"
              className="border-muted text-muted-foreground hover:bg-muted/20 font-mono"
            >
              MAIN MENU
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}