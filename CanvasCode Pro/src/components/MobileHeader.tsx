import React from 'react';
import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  objectCount: number;
  onMenuClick: () => void;
}

export function MobileHeader({ objectCount, onMenuClick }: MobileHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-30">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-black text-white p-1.5 rounded-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
              <path d="M2 2l7.586 7.586"></path>
              <circle cx="11" cy="11" r="2"></circle>
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-none">CanvasCode</h1>
            <p className="text-xs text-gray-500 leading-none mt-0.5">Pro</p>
          </div>
        </div>

        {/* Object Count & Menu */}
        <div className="flex items-center gap-3">
          {objectCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 rounded-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
              <span className="text-xs font-medium text-blue-700">{objectCount}</span>
            </div>
          )}
          
          <button
            onClick={onMenuClick}
            className="p-2.5 hover:bg-gray-100 rounded-lg active:bg-gray-200 transition-colors"
            style={{ minWidth: '44px', minHeight: '44px' }}
            aria-label="開啟選單"
          >
            <Menu size={20} className="text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
}
