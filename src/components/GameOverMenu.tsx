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
  const isHighScore = gameState.score > gameState.highScore;
  
  return (
    <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
      <Card className="bg-card/95 border-destructive">
        <CardContent className="p-8 text-center">
          <h1 className="text-4xl font-bold text-destructive mb-2 retro-glow">
            GAME OVER
          </h1>
          
          {isHighScore && (
            <p className="text-accent font-bold mb-2">NEW HIGH SCORE!</p>
          )}
          
          <div className="mb-6 space-y-2">
            <div className="text-2xl font-bold text-accent">
              SCORE: {gameState.score.toLocaleString()}
            </div>
            <div className="text-lg text-muted-foreground">
              WAVE: {gameState.wave}
            </div>
            <div className="text-sm text-muted-foreground">
              HIGH SCORE: {Math.max(gameState.score, gameState.highScore).toLocaleString()}
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={onRestartGame}
              className="bg-primary hover:bg-primary/80 text-primary-foreground font-mono"
            >
              PLAY AGAIN
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