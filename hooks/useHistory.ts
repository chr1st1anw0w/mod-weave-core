import { useState, useCallback } from 'react';

const MAX_HISTORY_SIZE = 50;

export const useHistory = <T,>(initialState: T) => {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [index, setIndex] = useState(0);

  const currentState = history[index];
  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  const setState = useCallback((newState: T | ((prevState: T) => T), skipHistory = false) => {
    const nextState = typeof newState === 'function'
      ? (newState as (prevState: T) => T)(currentState)
      : newState;

    if (Object.is(nextState, currentState)) {
      return;
    }

    if (skipHistory) {
        const newHistory = [...history];
        newHistory[index] = nextState;
        setHistory(newHistory);
    } else {
        const newHistory = history.slice(0, index + 1);
        newHistory.push(nextState);

        if (newHistory.length > MAX_HISTORY_SIZE) {
            newHistory.shift();
        }

        setHistory(newHistory);
        setIndex(newHistory.length - 1);
    }
  }, [currentState, history, index]);

  const undo = useCallback(() => {
    if (canUndo) {
      setIndex(prevIndex => prevIndex - 1);
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      setIndex(prevIndex => prevIndex + 1);
    }
  }, [canRedo]);

  return {
    state: currentState,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
