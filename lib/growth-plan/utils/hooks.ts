import { useEffect, type RefObject } from "react";

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  callback: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]): void {
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ key, ctrlKey = false, shiftKey = false, callback }) => {
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isShiftPressed = event.shiftKey;
        const keyMatches = event.key.toLowerCase() === key.toLowerCase();

        if (
          keyMatches &&
          isCtrlPressed === ctrlKey &&
          isShiftPressed === shiftKey
        ) {
          event.preventDefault();
          callback();
        }
      });
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [shortcuts]);
}

export function useClickOutside(ref: RefObject<HTMLElement | null>, callback: () => void): void {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, callback]);
}

export function useFocusTrap(isActive: boolean): void {
  useEffect(() => {
    if (!isActive) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [isActive]);
}
