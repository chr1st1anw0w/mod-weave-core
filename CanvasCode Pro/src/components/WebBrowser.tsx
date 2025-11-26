
import React, { useState, useRef, useEffect } from 'react';
import { X, Globe, Loader2, Grip, ArrowLeft, ArrowRight, Figma, Camera, Code, Link } from './Icons';

interface WebBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onImportImages: (images: string[]) => void;
}

const WebBrowser: React.FC<WebBrowserProps> = ({ isOpen, onClose, onImportImages }) => {
  const [url, setUrl] = useState('https://www.figma.com/design/12345/My-Project');
  const [isLoading, setIsLoading] = useState(false);
  const [isFigmaUrl, setIsFigmaUrl] = useState(true);
  
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 750, height: 550 });
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
       setPosition({ x: window.innerWidth / 2 - 375, y: 100 });
    }
  }, []);

  useEffect(() => {
    setIsFigmaUrl(url.includes('figma.com'));
  }, [url]);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      setPosition(prev => ({ ...prev, x: Math.max(50, window.innerWidth / 2 - size.width / 2) }));
    }
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).closest('.resize-handle')) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    isResizing.current = true;
    resizeStart.current = { x: e.clientX, y: e.clientY, width: size.width, height: size.height };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    } else if (isResizing.current) {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      setSize({ width: Math.max(400, resizeStart.current.width + dx), height: Math.max(300, resizeStart.current.height + dy) });
    }
  };

  const handleMouseUp = () => { isDragging.current = false; isResizing.current = false; };

  const handleLoad = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); }, 1000);
  };

  const handleSmartCapture = () => {
    // Simulate capturing a screenshot of the website
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        onImportImages(["https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1000&q=80"]);
        onClose();
    }, 1500);
  };

  const handleExtractCode = () => {
      setIsLoading(true);
      setTimeout(() => {
          setIsLoading(false);
          // Simulate extracting code - we import a text object with the 'code'
          onImportImages(["CODE_SNIPPET: <div class='p-4 bg-white rounded shadow'>Extracted Component</div>"]);
          onClose();
      }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-40 font-sans animate-fade-in"
      style={{ left: position.x, top: position.y, width: size.width, height: size.height }}
      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="h-14 bg-[#F1F3F4] border-b border-gray-200 flex items-center px-4 gap-3 cursor-move select-none">
        <div className="flex gap-2 text-gray-500">
           <button className="p-1 hover:bg-gray-200 rounded"><ArrowLeft size={16} /></button>
           <button className="p-1 hover:bg-gray-200 rounded"><ArrowRight size={16} /></button>
        </div>
        <form onSubmit={handleLoad} className="flex-1 relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
             {isFigmaUrl ? <Figma size={14} className="text-purple-500"/> : <Globe size={14} />}
          </div>
          <input 
            type="text" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-full border border-transparent bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 group-hover:shadow-md transition-shadow"
          />
        </form>
        <button onClick={onClose} className="p-1.5 text-gray-500 hover:bg-red-100 hover:text-red-500 rounded-md">
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50 relative overflow-hidden flex flex-col items-center justify-center" onMouseDown={(e) => e.stopPropagation()}>
         {isLoading ? (
             <div className="flex flex-col items-center gap-3">
                 <Loader2 size={32} className="animate-spin text-blue-600" />
                 <p className="text-sm text-gray-500">Loading content...</p>
             </div>
         ) : isFigmaUrl ? (
             <div className="flex flex-col items-center gap-6 text-center p-8 max-w-md">
                 <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center shadow-xl">
                    <Figma size={40} className="text-white" />
                 </div>
                 <div>
                     <h3 className="text-xl font-bold text-gray-900 mb-2">Connect to Figma</h3>
                     <p className="text-sm text-gray-500">Authenticate to import frames, components, and styles directly from your Figma files.</p>
                 </div>
                 <button className="bg-[rgb(152,152,152)] hover:bg-[#09B974] text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                     <Link size={16} />
                     Connect Account
                 </button>
             </div>
         ) : (
             <div className="w-full h-full flex flex-col">
                 <div className="flex-1 bg-white border-b border-gray-200 relative">
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400">
                        <Globe size={64} opacity={0.2} />
                    </div>
                    <iframe src={url} className="w-full h-full opacity-40 pointer-events-none" title="preview" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none"></div>
                 </div>
                 <div className="h-24 bg-white flex items-center justify-between px-8">
                     <div className="flex flex-col">
                         <span className="font-bold text-gray-800 text-lg">Web Capture</span>
                         <span className="text-xs text-gray-500">Import this page as a visual reference</span>
                     </div>
                     <div className="flex gap-3">
                        <button 
                           onClick={handleExtractCode}
                           className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Code size={16} />
                            Extract Code
                        </button>
                        <button 
                           onClick={handleSmartCapture}
                           className="px-5 py-2.5 rounded-lg bg-black text-white text-sm font-bold hover:bg-gray-800 shadow-lg flex items-center gap-2"
                        >
                            <Camera size={16} />
                            Capture View
                        </button>
                     </div>
                 </div>
             </div>
         )}
      </div>

      <div className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-center justify-center resize-handle z-50 text-gray-400" onMouseDown={handleResizeMouseDown}>
         <Grip size={14} />
      </div>
    </div>
  );
};

export default WebBrowser;
