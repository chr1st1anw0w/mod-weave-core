
import React, { useEffect, useRef } from 'react';
import { 
  Wand2, 
  Copy, 
  Trash2, 
  Figma, 
  Layers, 
  Eye, 
  Lock, 
  ScanSearch, 
  Download, 
  Upload, 
  Type, 
  ImageIcon,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  LayoutTemplate,
  Palette,
  Brush
} from './Icons';

interface ContextMenuProps {
  x: number;
  y: number;
  type: 'canvas' | 'object';
  context?: {
    isMulti: boolean;
    hasGroup: boolean;
  };
  onClose: () => void;
  onAction: (action: string) => void;
}

const MenuItem: React.FC<{ 
  icon?: React.ElementType; 
  label: string; 
  shortcut?: string; 
  onClick: () => void;
  danger?: boolean;
}> = ({ icon: Icon, label, shortcut, onClick, danger }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors ${
      danger ? 'text-red-500 hover:bg-red-50' : 'text-gray-700'
    }`}
  >
    <div className="flex items-center gap-2.5">
      {Icon && <Icon size={16} strokeWidth={1.5} />}
      <span>{label}</span>
    </div>
    {shortcut && <span className="text-xs text-gray-400 font-mono">{shortcut}</span>}
  </button>
);

const Separator = () => <div className="h-px bg-gray-100 my-1 mx-2"></div>;

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, type, context, onClose, onAction }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={menuRef}
      className="fixed z-50 bg-white/95 backdrop-blur-sm border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-xl w-64 py-1.5 animate-fade-in overflow-hidden"
      style={{ left: x, top: y }}
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {type === 'object' ? (
        <>
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Ask AI
          </div>
          <MenuItem icon={Wand2} label="Analyze UI to Code" onClick={() => onAction('analyze')} />
          <MenuItem icon={Layers} label="Make Editable Layer" onClick={() => onAction('make-editable')} />
          <MenuItem icon={Figma} label="Optimize for Figma" onClick={() => onAction('optimize-figma')} />
          <MenuItem icon={LayoutTemplate} label="Image to Wireframe" onClick={() => onAction('wireframe')} />
          <MenuItem icon={Palette} label="Generate Design System" onClick={() => onAction('design-system')} />
          <MenuItem icon={Brush} label="Analyze Style" onClick={() => onAction('style')} />
          <MenuItem icon={ScanSearch} label="UX & Accessibility Audit" onClick={() => onAction('ux-audit')} />
          
          <Separator />
          <MenuItem icon={Figma} label="Convert to Figma" onClick={() => onAction('figma')} />
          <MenuItem icon={Copy} label="Copy" shortcut="⌘C" onClick={() => onAction('copy')} />
          
          {context?.isMulti && (
            <MenuItem icon={Layers} label="Group Selection" shortcut="⌘G" onClick={() => onAction('group')} />
          )}
          
          {context?.hasGroup && (
             <MenuItem icon={Layers} label="Ungroup" shortcut="⇧⌘G" onClick={() => onAction('ungroup')} />
          )}
          
          <MenuItem icon={ArrowUpToLine} label="Bring to Front" shortcut="]" onClick={() => onAction('bringToFront')} />
          <MenuItem icon={ArrowUp} label="Bring Forward" onClick={() => onAction('bringForward')} />
          <MenuItem icon={ArrowDown} label="Send Backward" onClick={() => onAction('sendBackward')} />
          <MenuItem icon={ArrowDownToLine} label="Send to Back" shortcut="[" onClick={() => onAction('sendToBack')} />

          <Separator />
          <MenuItem icon={Trash2} label="Delete" danger onClick={() => onAction('delete')} />
        </>
      ) : (
        <>
          <MenuItem icon={ImageIcon} label="Add photos or videos" onClick={() => onAction('add-photo')} />
          <MenuItem icon={Type} label="Add text" onClick={() => onAction('add-text')} />
          <MenuItem icon={Upload} label="Add files (docs, PDF...)" onClick={() => onAction('add-files')} />
          <Separator />
          <MenuItem icon={Wand2} label="Inspiration" onClick={() => onAction('inspiration')} />
          <MenuItem icon={Copy} label="Paste" shortcut="⌘V" onClick={() => onAction('paste')} />
        </>
      )}
    </div>
  );
};

export default ContextMenu;
