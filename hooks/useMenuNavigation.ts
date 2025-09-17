'use client';

import { useState, useEffect } from 'react';

interface MenuItem {
  id: string;
  label: string;
  action?: () => void;
  disabled?: boolean;
}

interface UseMenuNavigationProps {
  items: MenuItem[];
  onItemSelect: (item: MenuItem) => void;
  enableKeyboard?: boolean;
  enableMouse?: boolean;
}

export function useMenuNavigation({
  items,
  onItemSelect,
  enableKeyboard = true,
  enableMouse = true
}: UseMenuNavigationProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : items.length - 1
          );
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < items.length - 1 ? prev + 1 : 0
          );
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          const selectedItem = items[selectedIndex];
          if (selectedItem && !selectedItem.disabled) {
            onItemSelect(selectedItem);
          }
          break;
        case 'Escape':
          e.preventDefault();
          // Could be used for back navigation
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, items, onItemSelect, enableKeyboard]);

  const handleItemClick = (item: MenuItem, index: number) => {
    if (enableMouse) {
      setSelectedIndex(index);
      if (!item.disabled) {
        onItemSelect(item);
      }
    }
  };

  const handleItemHover = (index: number) => {
    if (enableMouse) {
      setSelectedIndex(index);
    }
  };

  return {
    selectedIndex,
    setSelectedIndex,
    handleItemClick,
    handleItemHover
  };
}
