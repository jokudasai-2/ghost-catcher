import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface GameModeContextType {
  isGameMode: boolean;
  toggleGameMode: () => void;
  currentUserId: string | null;
  setCurrentUserId: (userId: string) => void;
}

const GameModeContext = createContext<GameModeContextType | undefined>(undefined);

export function GameModeProvider({ children }: { children: ReactNode }) {
  const [isGameMode, setIsGameMode] = useState(() => {
    const saved = localStorage.getItem('ghostcatcher_gamemode');
    return saved === 'true';
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem('ghostcatcher_userid');
  });

  useEffect(() => {
    localStorage.setItem('ghostcatcher_gamemode', String(isGameMode));
  }, [isGameMode]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem('ghostcatcher_userid', currentUserId);
    }
  }, [currentUserId]);

  const toggleGameMode = () => {
    setIsGameMode(prev => !prev);
  };

  return (
    <GameModeContext.Provider value={{ isGameMode, toggleGameMode, currentUserId, setCurrentUserId }}>
      {children}
    </GameModeContext.Provider>
  );
}

export function useGameMode() {
  const context = useContext(GameModeContext);
  if (context === undefined) {
    throw new Error('useGameMode must be used within a GameModeProvider');
  }
  return context;
}
