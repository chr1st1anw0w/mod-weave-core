import React, { useState, useRef, useEffect } from 'react';
import { X, Globe, RefreshCw, CheckSquare, Square, Plus, Loader2, Check } from './Icons';

interface PinterestBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onImportImages: (images: string[]) => void;
}

const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=236&q=80",
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=236&q=80",
  "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=236&q=80",
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=236&q=80",
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=236&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=236&q=80",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=236&q=80",
  "https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=236&q=80",
];

// Pre-calculated heights for skeleton loader to mimic masonry layout
const SKELETON_HEIGHTS = [280, 200, 260, 300, 220, 240, 180, 290, 210];

const PinterestBrowser: React.FC<PinterestBrowserProps> = ({ isOpen, onClose, onImportImages }) => {
  const [url, setUrl] = useState('https://www.pinterest.com/christianwow/skywalk-inc/');
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  
  // Dragging state
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 250, y: 100 });
  const [size, setSize] = useState({ width: 750, height: 550 });
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Reset position on open
  useEffect(() => {
    if (isOpen) {
      // Center roughly
      setPosition({ x: Math.max(50, window.innerWidth / 2 - size.width / 2), y: 100 });
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
    resizeStart.current = { 
      x: e.clientX, 
      y: e.clientY, 
      width: size.width, 
      height: size.height 
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    } else if (isResizing.current) {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      setSize({
        width: Math.max(300, resizeStart.current.width + dx),
        height: Math.max(300, resizeStart.current.height + dy)
      });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    isResizing.current = false;
  };

  const getHighResUrl = (lowResUrl: string) => {
    if (lowResUrl.includes('unsplash')) {
      return lowResUrl.replace('&w=236', '&w=1080');
    }
    if (lowResUrl.includes('pinimg.com/236x')) {
      return lowResUrl.replace('/236x/', '/originals/');
    }
    return lowResUrl;
  };

  const handleLoad = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setHasLoaded(false);
    setTimeout(() => {
      setIsLoading(false);
      setHasLoaded(true);
    }, 1500);
  };

  const handleImageClick = (index: number) => {
    if (isBatchMode) {
      const newSelected = new Set(selectedIndices);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      setSelectedIndices(newSelected);
    } else {
      const highRes = getHighResUrl(MOCK_IMAGES[index]);
      onImportImages([highRes]);
      onClose(); // Close browser immediately on single selection
    }
  };

  const handleBatchImport = () => {
    const urlsToImport = Array.from(selectedIndices).map((idx: number) => getHighResUrl(MOCK_IMAGES[idx]));
    onImportImages(urlsToImport);
    setSelectedIndices(new Set());
  };

  // Check if URL is Pinterest (mock) or real
  const isPinterestUrl = url.includes('pinterest.com');

  if (!isOpen) return null;

  return (
    <div 
      className="fixed bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-200 flex flex-col overflow-hidden z-40 font-sans animate-fade-in"
      style={{ 
        left: position.x, 
        top: position.y,
        width: size.width,
        height: size.height
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Browser Header */}
      <div className="h-12 bg-[#F9F9F9] border-b border-gray-200 flex items-center px-4 gap-3 cursor-move select-none flex-shrink-0">
        <div className="flex items-center gap-2 text-gray-400">
           <Globe size={16} />
        </div>
        <form onSubmit={handleLoad} className="flex-1 relative">
          <input 
            type="text" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste URL"
            className="w-full h-8 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-600"
          />
        </form>
        <button onClick={() => handleLoad()} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors">
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
        </button>
        <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Browser Content */}
      <div className="flex-1 bg-white relative overflow-hidden" onMouseDown={(e) => e.stopPropagation()}>
        {/* Case 1: Not loaded yet */}
        {!hasLoaded && !isLoading && !isPinterestUrl && (
           <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 select-none">
             <Globe size={48} className="text-gray-200" />
             <p>Enter a URL to browse</p>
           </div>
        )}

        {/* Case 2: Loading State (Skeleton) */}
        {isLoading && (
           <div className="p-4 h-full overflow-hidden">
              <div className="flex items-center justify-between mb-4 py-2">
                 <div className="flex items-center gap-2">
                   <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                   <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                 </div>
                 <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              
              <div className="columns-3 gap-3 space-y-3">
                {SKELETON_HEIGHTS.map((height, i) => (
                  <div 
                    key={i} 
                    className="bg-gray-100 rounded-xl break-inside-avoid animate-pulse" 
                    style={{ 
                      height: `${height}px`,
                      opacity: 1 - (i * 0.05) 
                    }} 
                  />
                ))}
              </div>
           </div>
        )}

        {/* Case 3: Real Iframe for non-Pinterest URLs */}
        {hasLoaded && !isPinterestUrl && (
          <iframe 
            src={url} 
            title="Embedded Browser"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin" 
          />
        )}

        {/* Case 4: Mock Pinterest View (Smart Grid) */}
        {(hasLoaded || (!hasLoaded && !isLoading && isPinterestUrl)) && isPinterestUrl && !isLoading && (
          <div className="h-full overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white/90 backdrop-blur py-2 z-10">
               <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#E60023] rounded-full flex items-center justify-center text-white text-xs font-bold">P</div>
                  <span className="font-bold text-gray-800 text-sm">Pins</span>
               </div>
               <button 
                 onClick={() => setIsBatchMode(!isBatchMode)}
                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                   isBatchMode 
                     ? 'bg-black text-white' 
                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                 }`}
               >
                 {isBatchMode ? <CheckSquare size={14} /> : <Square size={14} />}
                 {isBatchMode ? 'Done' : 'Select'}
               </button>
            </div>

            <div className="columns-3 gap-3 space-y-3 pb-20">
              {MOCK_IMAGES.map((src, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleImageClick(idx)}
                  className={`relative group break-inside-avoid rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                    selectedIndices.has(idx) 
                      ? 'ring-2 ring-black ring-offset-1' 
                      : 'hover:brightness-90'
                  }`}
                >
                   <img src={src} alt="Pin" className="w-full h-auto object-cover" />
                   
                   {(isBatchMode || selectedIndices.has(idx)) && (
                      <div className="absolute top-2 left-2">
                         <div className={`w-5 h-5 rounded-full border shadow-sm flex items-center justify-center transition-colors ${
                            selectedIndices.has(idx) ? 'bg-black border-black text-white' : 'bg-white/90 border-gray-300'
                         }`}>
                            {selectedIndices.has(idx) && <Check size={12} />}
                         </div>
                      </div>
                   )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resize Handle */}
      <div 
        className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-center justify-center resize-handle z-50"
        onMouseDown={handleResizeMouseDown}
      >
         <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-gray-400">
            <path d="M8 2L2 8" stroke="currentColor" strokeLinecap="round" />
            <path d="M8 6L6 8" stroke="currentColor" strokeLinecap="round" />
         </svg>
      </div>

      {/* Batch Action Bar */}
      {isBatchMode && selectedIndices.size > 0 && (
        <div className="absolute bottom-4 right-4 animate-slide-in z-50" onMouseDown={(e) => e.stopPropagation()}>
          <button 
            onClick={handleBatchImport}
            className="bg-[#111] hover:bg-black text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={16} />
            Import Selected ({selectedIndices.size})
          </button>
        </div>
      )}
    </div>
  );
};

export default PinterestBrowser;