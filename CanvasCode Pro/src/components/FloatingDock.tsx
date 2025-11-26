import React from 'react';
import svgPaths from '../imports/svg-flzp1ehvbe';

interface FloatingDockProps {
  onToggleBrowser: () => void;
  isBrowserOpen: boolean;
  onUploadClick: () => void;
  onAddShape: () => void;
  onAddText: () => void;
  onAddLayout: () => void;
  onOpenSettings: () => void;
}

function Icon({ onClick }: { onClick?: () => void }) {
  return (
    <div 
      className="absolute left-[10.17px] size-[15.652px] top-[10.17px] cursor-pointer" 
      data-name="Icon"
      onClick={onClick}
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M3.26085 7.82612H12.3913" id="Vector" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.30435" />
          <path d="M7.82608 3.26087V12.3913" id="Vector_2" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.30435" />
        </g>
      </svg>
    </div>
  );
}

function ToolButton({ onClick }: { onClick?: () => void }) {
  return (
    <div 
      className="bg-black relative rounded-[999px] shrink-0 size-[36px] hover:bg-gray-800 transition-colors cursor-pointer shadow-md" 
      data-name="ToolButton"
      onClick={onClick}
    >
      <Icon />
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[10px] size-[16px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p2c5c6000} id="Vector" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.79348" />
        </g>
      </svg>
    </div>
  );
}

function ToolButton1() {
  return (
    <div className="bg-gray-100 relative rounded-[12px] shrink-0 size-[36px] cursor-pointer" data-name="ToolButton">
      <Icon1 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[10px] size-[16px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p1206dbe0} id="Vector" stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.43478" />
        </g>
      </svg>
    </div>
  );
}

function ToolButton2({ onClick }: { onClick?: () => void }) {
  return (
    <div 
      className="relative rounded-[12px] shrink-0 size-[36px] hover:bg-gray-50 transition-colors cursor-pointer" 
      data-name="ToolButton"
      onClick={onClick}
    >
      <Icon2 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-[10px] size-[16px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M8.00001 2.66668V13.3333" id="Vector" stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.43478" />
          <path d={svgPaths.p1f460400} id="Vector_2" stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.43478" />
          <path d="M6.00001 13.3334H10" id="Vector_3" stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.43478" />
        </g>
      </svg>
    </div>
  );
}

function ToolButton3({ onClick }: { onClick?: () => void }) {
  return (
    <div 
      className="relative rounded-[12px] shrink-0 size-[36px] hover:bg-gray-50 transition-colors cursor-pointer" 
      data-name="ToolButton"
      onClick={onClick}
    >
      <Icon3 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-[10px] size-[16px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p2c30d200} id="Vector" stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.43478" />
          <path d="M2.00001 6.0001H14" id="Vector_2" stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.43478" />
          <path d="M6.00001 14.0001V6.0001" id="Vector_3" stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.43478" />
        </g>
      </svg>
    </div>
  );
}

function ToolButton4({ onClick }: { onClick?: () => void }) {
  return (
    <div 
      className="relative rounded-[12px] shrink-0 size-[36px] hover:bg-gray-50 transition-colors cursor-pointer" 
      data-name="ToolButton"
      onClick={onClick}
    >
      <Icon4 />
    </div>
  );
}

function Icon5({ active }: { active?: boolean }) {
  return (
    <div className="absolute left-[10px] size-[16px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_16_480)" id="Icon">
          <path d={svgPaths.p28ff5100} id="Vector" stroke={active ? "black" : "#99A1AF"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.43478" />
          <path d={svgPaths.p357d980} id="Vector_2" stroke={active ? "black" : "#99A1AF"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.43478" />
          <path d="M1.33335 7.99993H14.6667" id="Vector_3" stroke={active ? "black" : "#99A1AF"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.43478" />
        </g>
        <defs>
          <clipPath id="clip0_16_480">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function ToolButton5({ onClick, active }: { onClick?: () => void, active?: boolean }) {
  return (
    <div 
      className={`relative rounded-[12px] shrink-0 size-[36px] hover:bg-gray-50 transition-colors cursor-pointer ${active ? 'bg-gray-100' : ''}`} 
      data-name="ToolButton"
      onClick={onClick}
    >
      <Icon5 active={active} />
    </div>
  );
}

function Icon6() {
  return (
    <div className="absolute left-[10px] size-[16px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p30323300} id="Vector" stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.43478" />
          <path d={svgPaths.p3a21ef80} id="Vector_2" stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.43478" />
        </g>
      </svg>
    </div>
  );
}

function ToolButton6({ onClick }: { onClick?: () => void }) {
  return (
    <div 
      className="relative rounded-[12px] shrink-0 size-[36px] hover:bg-gray-50 transition-colors cursor-pointer" 
      data-name="ToolButton"
      onClick={onClick}
    >
      <Icon6 />
    </div>
  );
}

export default function FloatingDock({
  onToggleBrowser,
  isBrowserOpen,
  onUploadClick,
  onAddShape,
  onAddText,
  onAddLayout,
  onOpenSettings
}: FloatingDockProps) {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col pointer-events-none">
      <div className="bg-white relative rounded-[128px] pointer-events-auto" data-name="FloatingDock">
        <div aria-hidden="true" className="absolute border border-gray-100 border-solid inset-0 pointer-events-none rounded-[128px] shadow-[0px_8px_16px_0px_rgba(0,0,0,0.1)]" />
        <div className="flex flex-col items-center justify-center p-2">
          <div className="box-border content-stretch flex flex-col gap-[16px] items-center justify-center p-[0px] relative">
            <ToolButton onClick={onUploadClick} />
            
            <div className="content-stretch flex flex-col gap-[4px] items-start justify-center relative shrink-0">
              <ToolButton1 />
              <ToolButton2 onClick={onAddShape} />
              <ToolButton3 onClick={onAddText} />
              <ToolButton4 onClick={onAddLayout} />
              <ToolButton5 onClick={onToggleBrowser} active={isBrowserOpen} />
              <ToolButton6 onClick={onOpenSettings} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
