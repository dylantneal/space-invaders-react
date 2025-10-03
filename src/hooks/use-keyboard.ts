import { useEffect, useState, useCallback } from 'react';

interface KeyboardState {
  left: boolean;
  right: boolean;
  space: boolean;
  escape: boolean;
  p: boolean;
}

export function useKeyboard() {
  const [keys, setKeys] = useState<KeyboardState>({
    left: false,
    right: false,
    space: false,
    escape: false,
    p: false,
  });

  // Memoize handlers to prevent recreation on every render
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
        setKeys(prev => prev.left ? prev : { ...prev, left: true });
        event.preventDefault();
        break;
      case 'ArrowRight':
      case 'KeyD':
        setKeys(prev => prev.right ? prev : { ...prev, right: true });
        event.preventDefault();
        break;
      case 'Space':
        setKeys(prev => prev.space ? prev : { ...prev, space: true });
        event.preventDefault();
        break;
      case 'Escape':
        setKeys(prev => prev.escape ? prev : { ...prev, escape: true });
        event.preventDefault();
        break;
      case 'KeyP':
        setKeys(prev => prev.p ? prev : { ...prev, p: true });
        event.preventDefault();
        break;
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
        setKeys(prev => !prev.left ? prev : { ...prev, left: false });
        break;
      case 'ArrowRight':
      case 'KeyD':
        setKeys(prev => !prev.right ? prev : { ...prev, right: false });
        break;
      case 'Space':
        setKeys(prev => !prev.space ? prev : { ...prev, space: false });
        break;
      case 'Escape':
        setKeys(prev => !prev.escape ? prev : { ...prev, escape: false });
        break;
      case 'KeyP':
        setKeys(prev => !prev.p ? prev : { ...prev, p: false });
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return keys;
}