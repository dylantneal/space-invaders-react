import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PauseMenuProps {
  onResumeGame: () => void;
  onMainMenu: () => void;
}

export function PauseMenu({ onResumeGame, onMainMenu }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-10">
      <Card className="bg-card/98 border-accent menu-fade-in menu-container">
        <CardContent className="p-10 text-center max-w-sm">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-accent mb-4 retro-glow">
              MISSION
            </h1>
            <h1 className="text-4xl font-bold text-accent mb-4 retro-glow">
              PAUSED
            </h1>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-accent to-transparent mb-4"></div>
            <p className="text-muted-foreground">
              Systems on standby
            </p>
          </div>
          
          <div className="mb-8 hud-element">
            <div className="text-sm text-muted-foreground mb-2">MISSION STATUS</div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-accent font-mono">ACTIVE</span>
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={onResumeGame}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-lg py-3 button-glow transition-all duration-300 hover:scale-105"
            >
              RESUME MISSION
            </Button>
            <Button 
              onClick={onMainMenu}
              variant="outline"
              className="border-muted text-muted-foreground hover:bg-muted/20 font-mono py-3 transition-all duration-300 hover:scale-105"
            >
              ABORT MISSION
            </Button>
          </div>
          
          <div className="mt-6 text-xs text-muted-foreground">
            PRESS ESC TO RESUME
          </div>
        </CardContent>
      </Card>
    </div>
  );
}