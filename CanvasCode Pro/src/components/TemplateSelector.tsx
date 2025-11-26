import React from 'react';
import { 
  Square, 
  Atom, 
  Smartphone, 
  LayoutDashboard, 
  ArrowLeftRight,
  ImageIcon
} from './Icons';
import { CanvasObject } from '../types';

interface TemplateSelectorProps {
  onSelect: (objects: CanvasObject[]) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  
  const templates = [
    {
      id: 'image-to-code',
      title: 'Image to Code',
      desc: 'Convert screenshots to HTML.',
      icon: ImageIcon,
      generate: () => {
        const now = Date.now();
        return [
          { id: `${now}-1`, type: 'text', x: 0, y: -220, width: 600, height: 40, zIndex: 2, content: 'Right-click the image to "Ask AI"', fontSize: 20 },
          { id: `${now}-2`, type: 'image', x: 0, y: 0, width: 800, height: 450, zIndex: 1, src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
        ] as CanvasObject[];
      }
    },
    {
      id: 'blank',
      title: 'Blank Canvas',
      desc: 'Empty project.',
      icon: Square,
      generate: () => []
    },
    {
      id: 'component',
      title: 'Component Lab',
      desc: 'Design + Code views.',
      icon: Atom,
      generate: () => {
        const now = Date.now();
        return [
          { id: `${now}-1`, type: 'text', x: -350, y: -320, width: 200, height: 40, zIndex: 1, content: 'Design', fontSize: 16 },
          { id: `${now}-2`, type: 'layout', x: -350, y: 0, width: 320, height: 600, zIndex: 1, backgroundColor: '#F3F4F6' },
          { id: `${now}-3`, type: 'text', x: 0, y: -320, width: 200, height: 40, zIndex: 1, content: 'Code', fontSize: 16 },
          { id: `${now}-4`, type: 'layout', x: 0, y: 0, width: 320, height: 600, zIndex: 1, backgroundColor: '#1E1E1E' },
          { id: `${now}-5`, type: 'text', x: 350, y: -320, width: 200, height: 40, zIndex: 1, content: 'Preview', fontSize: 16 },
          { id: `${now}-6`, type: 'layout', x: 350, y: 0, width: 320, height: 600, zIndex: 1, backgroundColor: '#FFFFFF' },
        ] as CanvasObject[];
      }
    },
    {
      id: 'mobile',
      title: 'Mobile Flow',
      desc: 'App prototyping.',
      icon: Smartphone,
      generate: () => {
        const now = Date.now();
        const frames: CanvasObject[] = [];
        const width = 320;
        const height = 680;
        const gap = 60;
        const startX = -((width * 1.5) + gap);
        
        ['Login', 'Home', 'Details', 'Settings'].forEach((name, i) => {
           const x = startX + (i * (width + gap));
           frames.push({ id: `${now}-frame-${i}`, type: 'layout', x, y: 0, width, height, zIndex: 1, backgroundColor: '#FFFFFF' });
           frames.push({ id: `${now}-label-${i}`, type: 'text', x, y: -height/2 - 20, width: 200, height: 24, zIndex: 1, content: name, fontSize: 14 });
        });
        return frames;
      }
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      desc: 'Admin layouts.',
      icon: LayoutDashboard,
      generate: () => {
        const now = Date.now();
        return [
          { id: `${now}-sidebar`, type: 'layout', x: -400, y: 0, width: 200, height: 600, zIndex: 2, backgroundColor: '#1F2937' },
          { id: `${now}-main`, type: 'layout', x: 100, y: 0, width: 750, height: 600, zIndex: 1, backgroundColor: '#F3F4F6' },
          { id: `${now}-header`, type: 'layout', x: 100, y: -260, width: 700, height: 60, zIndex: 2, backgroundColor: '#FFFFFF' },
        ] as CanvasObject[];
      }
    },
    {
      id: 'reverse',
      title: 'Code → Design',
      desc: 'Reverse engineering.',
      icon: ArrowLeftRight,
      generate: () => {
        const now = Date.now();
        return [
          { id: `${now}-code`, type: 'layout', x: -300, y: 0, width: 550, height: 600, zIndex: 1, backgroundColor: '#282c34' },
          { id: `${now}-design`, type: 'layout', x: 300, y: 0, width: 550, height: 600, zIndex: 1, backgroundColor: '#FFFFFF' },
        ] as CanvasObject[];
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-fade-in bg-[rgba(249,250,251,0)]">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-800 mb-1 text-[28px]">New Project</h1>
          <p className="text-xs text-gray-500 text-[14px]">Select a template</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.generate())}
              className="group relative flex flex-col items-center text-center p-3 rounded-[20px] border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all duration-200 bg-white"
            >
              <div className="mb-2 text-gray-400 group-hover:text-gray-800 transition-colors">
                <t.icon size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xs font-bold text-gray-700 mb-0.5">
                {t.title}
              </h3>
              <p className="text-[10px] text-gray-400 line-clamp-1">
                {t.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;