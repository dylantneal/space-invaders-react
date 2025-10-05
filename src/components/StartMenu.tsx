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
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-10">
      <Card className="bg-card/98 border-primary menu-fade-in menu-container">
        <CardContent className="p-10 text-center max-w-md">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-primary mb-3 retro-glow">
              SPACE
            </h1>
            <h1 className="text-5xl font-bold text-accent mb-4 retro-glow">
              INVADERS
            </h1>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent mb-4"></div>
            <p className="text-muted-foreground text-lg">
              Defend Earth from the alien invasion!
            </p>
          </div>
          
          <div className="mb-8 space-y-3">
            <div className="hud-element">
              <div className="text-accent font-bold text-xl">
                HIGH SCORE: {gameState.highScore.toLocaleString()}
              </div>
              <div className="text-muted-foreground text-sm mt-1">
                GALACTIC RECORD
              </div>
            </div>
          </div>
          
          <div className="mb-8 space-y-2 text-sm text-muted-foreground hud-element">
            <p className="text-primary font-bold mb-3">MISSION BRIEFING</p>
            <p>← → Arrow keys to move (or A/D)</p>
            <p>SPACEBAR to shoot</p>
            <p>ESC to pause mission</p>
            <p className="text-accent text-xs">P for performance monitor</p>
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs">Destroy all alien forces to advance</p>
            </div>
          </div>
          
          <Button 
            onClick={onStartGame}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xl px-12 py-4 button-glow transition-all duration-300 hover:scale-105"
          >
            LAUNCH MISSION
          </Button>
          
          <div className="mt-6 text-xs text-muted-foreground">
            VERSION 2.1 • EARTH DEFENSE FORCE
          </div>
        </CardContent>
      </Card>
    </div>
  );
}