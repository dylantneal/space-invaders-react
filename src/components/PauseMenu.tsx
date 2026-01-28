import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PauseMenuProps {
  onResumeGame: () => void;
  onMainMenu: () => void;
}

export function PauseMenu({ onResumeGame, onMainMenu }: PauseMenuProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center">
      <Card className="relative bg-slate-900/95 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 max-w-sm mx-4">
        <CardContent className="p-8 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          
          <div className="mb-8">
            <div className="text-5xl mb-4">⏸️</div>
            <h1 className="text-4xl font-black text-cyan-400" style={{ textShadow: '0 0 30px rgba(34, 211, 238, 0.5)' }}>
              PAUSED
            </h1>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={onResumeGame}
              className="w-full py-5 text-lg font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 border-0"
            >
              RESUME
            </Button>
            <Button 
              onClick={onMainMenu}
              variant="outline"
              className="w-full py-5 text-lg font-semibold border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              QUIT TO MENU
            </Button>
          </div>
          
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        </CardContent>
      </Card>
    </div>
  );
}
