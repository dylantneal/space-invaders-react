import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameState } from '../types/game';

interface GameOverMenuProps {
  gameState: GameState;
  onRestartGame: () => void;
  onMainMenu: () => void;
}

export function GameOverMenu({ gameState, onRestartGame, onMainMenu }: GameOverMenuProps) {
  const isHighScore = gameState.score >= gameState.highScore;
  
  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-10">
      <Card className="bg-card/98 border-destructive menu-fade-in menu-container">
        <CardContent className="p-10 text-center max-w-md">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-destructive mb-4 retro-glow">
              MISSION
            </h1>
            <h1 className="text-5xl font-bold text-destructive mb-4 retro-glow">
              FAILED
            </h1>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-destructive to-transparent mb-4"></div>
            
            {isHighScore && (
              <div className="hud-element mb-6 animate-pulse">
                <p className="text-accent font-bold text-xl retro-glow">NEW GALACTIC RECORD!</p>
                <p className="text-muted-foreground text-sm mt-1">COMMANDER PROMOTED</p>
              </div>
            )}
          </div>
          
          <div className="mb-8 space-y-4">
            <div className="hud-element">
              <div className="text-3xl font-bold text-accent retro-glow">
                {gameState.score.toLocaleString()}
              </div>
              <div className="text-muted-foreground text-sm">FINAL SCORE</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="hud-element">
                <div className="text-lg font-bold text-primary">
                  {gameState.wave}
                </div>
                <div className="text-muted-foreground text-xs">WAVES SURVIVED</div>
              </div>
              <div className="hud-element">
                <div className="text-lg font-bold text-secondary">
                  {Math.max(gameState.score, gameState.highScore).toLocaleString()}
                </div>
                <div className="text-muted-foreground text-xs">BEST RECORD</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={onRestartGame}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-lg py-3 button-glow transition-all duration-300 hover:scale-105"
            >
              RETRY MISSION
            </Button>
            <Button 
              onClick={onMainMenu}
              variant="outline"
              className="border-muted text-muted-foreground hover:bg-muted/20 font-mono py-3 transition-all duration-300 hover:scale-105"
            >
              RETURN TO BASE
            </Button>
          </div>
          
          <div className="mt-6 text-xs text-muted-foreground">
            EARTH DEFENSE FORCE • MISSION LOG #{String(Date.now()).slice(-6)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}