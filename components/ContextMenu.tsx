import React, { useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { hapticFeedback } from '../hooks/useMobileOptimizations';

interface ContextMenuItem {
  label: string;
  icon: any;
  action: () => void;
  variant?: 'default' | 'danger' | 'success';
  disabled?: boolean;
}

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  position,
  items,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Adjust menu position to stay within viewport
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = position.x;
    let adjustedY = position.y;

    // Adjust horizontal position
    if (rect.right > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 10;
    }
    if (adjustedX < 10) {
      adjustedX = 10;
    }

    // Adjust vertical position
    if (rect.bottom > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 10;
    }
    if (adjustedY < 10) {
      adjustedY = 10;
    }

    menu.style.left = `${adjustedX}px`;
    menu.style.top = `${adjustedY}px`;
  }, [isOpen, position]);

  if (!isOpen) return null;

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;

    hapticFeedback.light();
    item.action();
    onClose();
  };

  const getVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return 'text-red-400 hover:bg-red-500/10 active:bg-red-500/20';
      case 'success':
        return 'text-green-400 hover:bg-green-500/10 active:bg-green-500/20';
      default:
        return 'text-gray-200 hover:bg-white/10 active:bg-white/20';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-200" />

      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-mw-panel/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all
                touch-manipulation select-none
                ${getVariantClasses(item.variant)}
                ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
                ${index > 0 ? 'border-t border-white/5' : ''}
              `}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};

/**
 * Helper hook for using context menu
 */
export function useContextMenu() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [items, setItems] = React.useState<ContextMenuItem[]>([]);

  const open = (x: number, y: number, menuItems: ContextMenuItem[]) => {
    hapticFeedback.medium();
    setPosition({ x, y });
    setItems(menuItems);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    position,
    items,
    open,
    close,
  };
}
