import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PauseMenuProps {
  onResumeGame: () => void;
  onMainMenu: () => void;
}

export function PauseMenu({ onResumeGame, onMainMenu }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
      <Card className="bg-card/95 border-accent">
        <CardContent className="p-8 text-center">
          <h1 className="text-3xl font-bold text-accent mb-6 retro-glow">
            PAUSED
          </h1>
          
          <div className="flex flex-col gap-4">
            <Button 
              onClick={onResumeGame}
              className="bg-primary hover:bg-primary/80 text-primary-foreground font-mono"
            >
              RESUME GAME
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