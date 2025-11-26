import React from 'react';
import svgPaths from '../imports/svg-uiv1g6sxwg';
import { AIMode } from '../types';

interface HoverToolbarProps {
  onAIAction: (mode: AIMode) => void;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

function Container({ className, onAIAction, label = "Layer Name" }: { className?: string; onAIAction: (mode: AIMode) => void; label?: string }) {
  return (
    <div className={className} data-name="Container">
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0 px-2" data-name="Text">
        <p className="font-sans font-bold leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-nowrap text-white tracking-[-0.15px] whitespace-pre max-w-[120px] truncate">
          {label}
        </p>
        <div className="flex flex-row items-center self-stretch h-[20px]">
          <div className="bg-[rgba(255,255,255,0.5)] h-full shrink-0 w-[1px]" data-name="Container" />
        </div>
      </div>
      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Icon">
        
        {/* Magic Wand / Analyze */}
        <button 
          onClick={() => onAIAction('analyze')}
          className="box-border content-stretch flex flex-col items-start p-[6px] relative rounded-[8px] shrink-0 size-[32px] hover:bg-gray-800 transition-colors group"
          title="Analyze Code"
        >
          <div className="size-[20px] overflow-clip relative shrink-0" data-name="Icon">
            <div className="absolute inset-0 text-[#DAB2FF] group-hover:text-white transition-colors">
              <svg className="block size-full" fill="none" viewBox="0 0 18 18">
                  <path d={svgPaths.p2a8500c0} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
              </svg>
              <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%]">
                 <svg className="block size-full" fill="none" viewBox="0 0 4 4">
                  <path d="M0.8 0.8L3.2 3.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                 </svg>
              </div>
            </div>
          </div>
        </button>

        {/* Layout / Wireframe */}
        <button 
          onClick={() => onAIAction('wireframe')}
          className="box-border content-stretch flex flex-col items-start p-[6px] relative rounded-[8px] shrink-0 size-[32px] hover:bg-gray-800 transition-colors group"
          title="Wireframe"
        >
          <div className="size-[20px] overflow-clip relative shrink-0" data-name="Icon">
             <div className="absolute inset-0 text-[#8EC5FF] group-hover:text-white transition-colors">
                <svg className="block size-full" fill="none" viewBox="0 0 16 16" style={{ padding: '2px' }}>
                  <path d={svgPaths.p1481f600} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" transform="scale(0.8) translate(2,4)" />
                  <path d={svgPaths.pa7221b0} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" transform="scale(0.6) translate(4, 12)" />
                </svg>
             </div>
          </div>
        </button>

        {/* Palette / Design System */}
        <button 
          onClick={() => onAIAction('designSystem')}
          className="box-border content-stretch flex flex-col items-start p-[6px] relative rounded-[8px] shrink-0 size-[32px] hover:bg-gray-800 transition-colors group"
          title="Design System"
        >
           <div className="size-[20px] overflow-clip relative shrink-0" data-name="Icon">
             <div className="absolute inset-0 text-[#7BF1A8] group-hover:text-white transition-colors">
                <svg className="block size-full" fill="none" viewBox="0 0 18 18">
                  <path d={svgPaths.p36b13500} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                </svg>
             </div>
           </div>
        </button>

        {/* Brush / Style */}
        <button 
          onClick={() => onAIAction('style')}
          className="box-border content-stretch flex flex-col items-start p-[6px] relative rounded-[8px] shrink-0 size-[32px] hover:bg-gray-800 transition-colors group"
          title="Style"
        >
          <div className="size-[20px] overflow-clip relative shrink-0" data-name="Icon">
            <div className="absolute inset-0 text-[#FDA5D5] group-hover:text-white transition-colors">
               <svg className="block size-full" fill="none" viewBox="0 0 14 14" style={{ padding: '2px' }}>
                 <path d={svgPaths.p3e98d400} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                 <path d={svgPaths.p2233ae00} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" transform="translate(8, 0)" />
               </svg>
            </div>
          </div>
        </button>

        {/* Scan / OCR (Assuming logic exists or placeholder) */}
        <button 
          onClick={() => onAIAction('editable-layer')} // Using a valid AIMode or repurposing
          className="box-border content-stretch flex flex-col items-start p-[6px] relative rounded-[8px] shrink-0 size-[32px] hover:bg-gray-800 transition-colors group"
          title="Make Editable"
        >
          <div className="size-[20px] overflow-clip relative shrink-0" data-name="Icon">
             <div className="absolute inset-0 text-[#FFB86A] group-hover:text-white transition-colors">
                <svg className="block size-full" fill="none" viewBox="0 0 16 16" style={{ padding: '2px' }}>
                  <path d={svgPaths.p1f4c8800} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" transform="translate(2,2)" />
                  <path d={svgPaths.p267d6e00} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" transform="translate(2,2)" />
                  <path d={svgPaths.p3268b400} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" transform="translate(8,8)" />
                  <path d={svgPaths.p23e5d400} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" transform="translate(8,2)" />
                  <path d={svgPaths.p335c1d00} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" transform="translate(4,4)" />
                </svg>
             </div>
          </div>
        </button>

        {/* Refresh / Regenerate */}
        <button 
          className="box-border content-stretch flex flex-col items-start p-[6px] relative rounded-[8px] shrink-0 size-[32px] hover:bg-gray-800 transition-colors group"
          title="Reset"
        >
          <div className="size-[20px] overflow-clip relative shrink-0" data-name="Icon">
             <div className="absolute inset-0 text-[#FFDF20] group-hover:text-white transition-colors">
                <svg className="block size-full" fill="none" viewBox="0 0 16 16" style={{ padding: '1px' }}>
                   <path d={svgPaths.pbba7448} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" transform="translate(2, 1)" />
                   <path d={svgPaths.p3aece100} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" transform="translate(1, 8)" />
                </svg>
             </div>
          </div>
        </button>

      </div>
    </div>
  );
}

export default function HoverToolbar({ onAIAction, label, className, style }: HoverToolbarProps) {
  return (
    <div
      className={`absolute z-50 pointer-events-auto ${className || ''}`}
      style={{
        left: '50%',
        top: '-60px', // Adjusted to be slightly above the object
        transform: 'translateX(-50%)',
        ...style
      }}
    >
      <Container 
        className="bg-black relative rounded-[10px] shadow-xl p-1.5 flex items-center" 
        onAIAction={onAIAction} 
        label={label}
      />
    </div>
  );
}
