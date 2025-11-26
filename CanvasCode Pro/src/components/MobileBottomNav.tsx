import React, { useState } from 'react';
import { Home, Wrench, LayoutTemplate, MessageSquare, FileCode } from 'lucide-react';

interface MobileBottomNavProps {
  onCanvasClick: () => void;
  onToolsClick: () => void;
  onTemplatesClick: () => void;
  onChatClick: () => void;
  onResultsClick: () => void;
  hasResults: boolean;
}

export function MobileBottomNav({
  onCanvasClick,
  onToolsClick,
  onTemplatesClick,
  onChatClick,
  onResultsClick,
  hasResults
}: MobileBottomNavProps) {
  const [activeTab, setActiveTab] = useState<'canvas' | 'tools' | 'templates' | 'chat' | 'results'>('canvas');

  const handleTabClick = (tab: typeof activeTab, callback: () => void) => {
    setActiveTab(tab);
    callback();
  };

  const tabs = [
    {
      id: 'canvas' as const,
      icon: Home,
      label: '畫布',
      onClick: onCanvasClick,
    },
    {
      id: 'tools' as const,
      icon: Wrench,
      label: '工具',
      onClick: onToolsClick,
    },
    {
      id: 'templates' as const,
      icon: LayoutTemplate,
      label: '模板',
      onClick: onTemplatesClick,
    },
    {
      id: 'chat' as const,
      icon: MessageSquare,
      label: '對話',
      onClick: onChatClick,
    },
    {
      id: 'results' as const,
      icon: FileCode,
      label: '結果',
      onClick: onResultsClick,
      badge: hasResults,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 z-30 safe-area-bottom">
      <div className="h-full px-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.onClick)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all relative ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
              }`}
              style={{ minWidth: '60px', minHeight: '60px' }}
              aria-label={tab.label}
            >
              {/* Badge indicator */}
              {tab.badge && !isActive && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
              )}
              
              {/* Icon */}
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              
              {/* Label */}
              <span 
                className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}
              >
                {tab.label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
