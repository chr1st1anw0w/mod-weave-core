import React, { useEffect, useState } from 'react';
import { Upload, Square, Type, Layout, X, ChevronDown } from 'lucide-react';

interface MobileToolsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadClick: () => void;
  onAddShape: () => void;
  onAddText: () => void;
  onAddLayout: () => void;
}

export function MobileToolsSheet({
  isOpen,
  onClose,
  onUploadClick,
  onAddShape,
  onAddText,
  onAddLayout,
}: MobileToolsSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Slight delay for animation
      setTimeout(() => setIsExpanded(true), 10);
    } else {
      setIsExpanded(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tools = [
    {
      id: 'upload',
      icon: Upload,
      label: '上傳圖片',
      description: '從裝置上傳 Wireframe 或設計稿',
      color: 'bg-blue-50 text-blue-600',
      onClick: onUploadClick,
    },
    {
      id: 'shape',
      icon: Square,
      label: '新增形狀',
      description: '加入矩形或其他基礎形狀',
      color: 'bg-purple-50 text-purple-600',
      onClick: onAddShape,
    },
    {
      id: 'text',
      icon: Type,
      label: '新增文字',
      description: '插入文字框或標註',
      color: 'bg-green-50 text-green-600',
      onClick: onAddText,
    },
    {
      id: 'layout',
      icon: Layout,
      label: '新增佈局',
      description: '建立區塊或容器佈局',
      color: 'bg-orange-50 text-orange-600',
      onClick: onAddLayout,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isExpanded ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div 
        className={`fixed left-0 right-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 transition-transform duration-300 ${
          isExpanded ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">工具箱</h2>
            <p className="text-sm text-gray-500 mt-0.5">選擇要使用的工具</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg active:bg-gray-200 transition-colors"
            style={{ minWidth: '44px', minHeight: '44px' }}
            aria-label="關閉"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Tools Grid */}
        <div className="p-6 pb-8 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 100px)' }}>
          <div className="grid grid-cols-1 gap-3">
            {tools.map((tool) => {
              const Icon = tool.icon;
              
              return (
                <button
                  key={tool.id}
                  onClick={tool.onClick}
                  className="flex items-start gap-4 p-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 active:bg-gray-50 transition-all text-left"
                  style={{ minHeight: '88px' }}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${tool.color}`}>
                    <Icon size={24} strokeWidth={2} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {tool.label}
                    </h3>
                    <p className="text-sm text-gray-600 leading-snug">
                      {tool.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 text-gray-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex gap-3">
              <div className="flex-shrink-0 text-gray-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium mb-1">使用提示</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  點選工具後會自動關閉此面板，並在畫布上新增對應元素。長按物件可開啟更多選項。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
