import { useEffect, useState } from 'react';

interface KeyboardState {
  left: boolean;
  right: boolean;
  space: boolean;
  escape: boolean;
}

export function useKeyboard() {
  const [keys, setKeys] = useState<KeyboardState>({
    left: false,
    right: false,
    space: false,
    escape: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowLeft':
          setKeys(prev => ({ ...prev, left: true }));
          event.preventDefault();
          break;
        case 'ArrowRight':
          setKeys(prev => ({ ...prev, right: true }));
          event.preventDefault();
          break;
        case 'Space':
          setKeys(prev => ({ ...prev, space: true }));
          event.preventDefault();
          break;
        case 'Escape':
          setKeys(prev => ({ ...prev, escape: true }));
          event.preventDefault();
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowLeft':
          setKeys(prev => ({ ...prev, left: false }));
          break;
        case 'ArrowRight':
          setKeys(prev => ({ ...prev, right: false }));
          break;
        case 'Space':
          setKeys(prev => ({ ...prev, space: false }));
          break;
        case 'Escape':
          setKeys(prev => ({ ...prev, escape: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
}