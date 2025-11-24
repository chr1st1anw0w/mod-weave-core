import React, { useEffect, useState } from 'react';
import { Icons } from './Icons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh] animate-in fade-in duration-200">
      <div 
        className="w-[600px] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <Icons.Search className="text-gray-500" size={18} />
          <input 
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
            placeholder="Type a command or ask AI..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="text-[10px] text-gray-600 border border-white/10 px-1.5 py-0.5 rounded">ESC</div>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto py-2">
          {query.length === 0 && (
            <>
              <div className="px-2 pb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Suggested</div>
              <CommandItem icon={Icons.Cpu} label="Generate new AI Layer..." shortcut="G" />
              <CommandItem icon={Icons.Waves} label="Add Motion Modifier" />
              <CommandItem icon={Icons.Share} label="Share Project Link" />
            </>
          )}
          {query.length > 0 && (
             <CommandItem icon={Icons.Sparkles} label={`Ask Gemini: "${query}"`} active />
          )}
        </div>
      </div>
    </div>
  );
};

const CommandItem = ({ icon: Icon, label, shortcut, active }: { icon: any, label: string, shortcut?: string, active?: boolean }) => (
  <div className={`
    flex items-center gap-3 px-4 py-2 mx-2 rounded-lg cursor-pointer text-sm
    ${active ? 'bg-mw-accent text-white' : 'text-gray-300 hover:bg-white/5'}
  `}>
    <Icon size={14} className={active ? 'text-white' : 'text-gray-400'} />
    <span className="flex-1">{label}</span>
    {shortcut && <span className="text-[10px] opacity-50 font-mono">{shortcut}</span>}
  </div>
);