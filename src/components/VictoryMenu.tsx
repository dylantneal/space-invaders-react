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
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-10">
      <Card className="bg-card/98 border-secondary menu-fade-in menu-container">
        <CardContent className="p-10 text-center max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-secondary mb-3 retro-glow">
              SECTOR
            </h1>
            <h1 className="text-4xl font-bold text-secondary mb-4 retro-glow">
              SECURED
            </h1>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-secondary to-transparent mb-4"></div>
            <p className="text-muted-foreground text-lg">
              Outstanding work, Commander!
            </p>
          </div>
          
          <div className="mb-8 space-y-4">
            <div className="hud-element">
              <div className="text-3xl font-bold text-accent retro-glow">
                {gameState.score.toLocaleString()}
              </div>
              <div className="text-muted-foreground text-sm">MISSION SCORE</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="hud-element">
                <div className="text-2xl font-bold text-secondary retro-glow">
                  {gameState.wave}
                </div>
                <div className="text-muted-foreground text-xs">WAVE COMPLETE</div>
              </div>
              <div className="hud-element">
                <div className="text-2xl font-bold text-primary retro-glow">
                  +1
                </div>
                <div className="text-muted-foreground text-xs">BONUS LIFE</div>
              </div>
            </div>
            
            <div className="hud-element bg-secondary/10">
              <div className="text-lg font-bold text-secondary">
                INCOMING TRANSMISSION
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Wave {gameState.wave + 1} aliens detected.<br/>
                Reinforcements en route.
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={onNextWave}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-mono text-lg py-3 button-glow transition-all duration-300 hover:scale-105"
            >
              ADVANCE TO WAVE {gameState.wave + 1}
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
            MISSION RATING: EXCELLENT • EDF COMMAND
          </div>
        </CardContent>
      </Card>
    </div>
  );
}