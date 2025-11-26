import React, { useState, useRef } from 'react';
import { LayoutTemplate, MessageSquare, FileCode } from 'lucide-react';
import CanvasBoard from './components/CanvasBoard';
import ResultsPanel from './components/ResultsPanel';
import SettingsModal from './components/SettingsModal';
import ChatSidebar from './components/ChatSidebar';
import TemplateSelector from './components/TemplateSelector';
import FloatingDock from './components/FloatingDock';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileHeader } from './components/MobileHeader';
import { MobileToolsSheet } from './components/MobileToolsSheet';
import { AnalysisResult, CanvasHandle, GenerationSettings, CanvasObject } from './types';

const App: React.FC = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isToolsSheetOpen, setIsToolsSheetOpen] = useState(false);
  
  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Lifted state for Canvas Objects
  const [objects, setObjects] = useState<CanvasObject[]>([]);

  const [settings, setSettings] = useState<GenerationSettings>({
    framework: 'html',
    device: 'mobile',
    type: 'component'
  });

  const canvasRef = useRef<CanvasHandle>(null);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAnalysisComplete = (data: AnalysisResult) => {
    setResult(data);
    setIsPanelOpen(true);
    setError(null);
  };

  const handleError = (err: any) => {
    setError("處理失敗，請檢查 API 設定後重試");
    setTimeout(() => setError(null), 5000);
  };

  const handleTemplateSelect = (newObjects: CanvasObject[]) => {
    setObjects(newObjects);
    setShowTemplateSelector(false);
  };

  // Mobile: Render optimized layout
  if (isMobile) {
    return (
      <div className="relative w-full h-screen text-gray-900 font-sans overflow-hidden bg-gray-50">
        {/* Mobile Header */}
        <MobileHeader 
          objectCount={objects.length}
          onMenuClick={() => setIsSettingsOpen(true)}
        />

        {/* Main Canvas Area - Full height minus header and nav */}
        <div className="absolute top-14 bottom-20 left-0 right-0 overflow-hidden">
          <CanvasBoard 
            ref={canvasRef}
            objects={objects}
            setObjects={setObjects}
            onAnalysisComplete={handleAnalysisComplete} 
            onError={handleError}
            isBrowserOpen={isBrowserOpen}
            onCloseBrowser={() => setIsBrowserOpen(false)}
            settings={settings}
          />
        </div>

        {/* Bottom Navigation */}
        <MobileBottomNav
          onCanvasClick={() => {
            setShowTemplateSelector(false);
            setIsChatOpen(false);
            setIsToolsSheetOpen(false);
          }}
          onToolsClick={() => setIsToolsSheetOpen(true)}
          onTemplatesClick={() => setShowTemplateSelector(true)}
          onChatClick={() => setIsChatOpen(true)}
          onResultsClick={() => setIsPanelOpen(true)}
          hasResults={result !== null}
        />

        {/* Tools Bottom Sheet */}
        <MobileToolsSheet
          isOpen={isToolsSheetOpen}
          onClose={() => setIsToolsSheetOpen(false)}
          onUploadClick={() => {
            canvasRef.current?.triggerUpload();
            setIsToolsSheetOpen(false);
          }}
          onAddShape={() => {
            canvasRef.current?.addRectangle();
            setIsToolsSheetOpen(false);
          }}
          onAddText={() => {
            canvasRef.current?.addText();
            setIsToolsSheetOpen(false);
          }}
          onAddLayout={() => {
            canvasRef.current?.addLayout();
            setIsToolsSheetOpen(false);
          }}
        />

        {/* Template Selector - Full Screen Sheet */}
        {showTemplateSelector && (
          <div className="fixed inset-0 z-50 bg-white">
            <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 bg-white">
              <h2 className="font-semibold">選擇模板</h2>
              <button
                onClick={() => setShowTemplateSelector(false)}
                className="p-2 hover:bg-gray-100 rounded-lg active:bg-gray-200 transition-colors"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="h-[calc(100vh-3.5rem)] overflow-y-auto">
              <TemplateSelector onSelect={handleTemplateSelect} />
            </div>
          </div>
        )}
        
        {/* Results Panel - Bottom Sheet */}
        <ResultsPanel 
          result={result} 
          isOpen={isPanelOpen} 
          onClose={() => setIsPanelOpen(false)} 
          isMobile={true}
        />
        
        {/* Chat Sidebar - Full Screen Sheet */}
        {isChatOpen && (
          <div className="fixed inset-0 z-50 bg-white">
            <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 bg-white">
              <h2 className="font-semibold">AI 助手</h2>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg active:bg-gray-200 transition-colors"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="h-[calc(100vh-3.5rem)]">
              <ChatSidebar 
                isOpen={true}
                onClose={() => setIsChatOpen(false)}
                objects={objects}
                isMobile={true}
              />
            </div>
          </div>
        )}

        {/* Settings Modal - Full Screen Sheet */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 bg-white">
            <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 bg-white">
              <h2 className="font-semibold">設定</h2>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg active:bg-gray-200 transition-colors"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="h-[calc(100vh-3.5rem)] overflow-y-auto">
              <SettingsModal 
                isOpen={true}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onSave={(newSettings) => {
                  setSettings(newSettings);
                  setIsSettingsOpen(false);
                }}
                isMobile={true}
              />
            </div>
          </div>
        )}

        {/* Toast Notification for Errors */}
        {error && (
          <div className="fixed top-20 left-4 right-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl shadow-lg z-50 animate-slide-in flex items-center gap-3">
            <div className="p-1 bg-red-100 rounded-full flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    );
  }

  // Desktop: Original layout (unchanged for larger screens)
  return (
    <div className="relative w-full h-screen text-gray-900 font-sans overflow-hidden">
      {showTemplateSelector && <TemplateSelector onSelect={handleTemplateSelect} />}

      {/* Header Logo */}
      <div className="fixed top-6 left-6 z-20 flex items-center gap-3 pointer-events-none">
        <div className="bg-black text-white p-2 rounded-full shadow-md">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
              <path d="M2 2l7.586 7.586"></path>
              <circle cx="11" cy="11" r="2"></circle>
           </svg>
        </div>
        <h1 className="font-bold text-lg tracking-tight bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm border border-gray-100 pointer-events-auto">
          CanvasCode <span className="text-gray-400 font-normal">Pro</span>
        </h1>
      </div>

      {/* Left Sidebar - Desktop only */}
      <FloatingDock 
        onToggleBrowser={() => setIsBrowserOpen(!isBrowserOpen)}
        isBrowserOpen={isBrowserOpen}
        onUploadClick={() => canvasRef.current?.triggerUpload()}
        onAddShape={() => canvasRef.current?.addRectangle()}
        onAddText={() => canvasRef.current?.addText()}
        onAddLayout={() => canvasRef.current?.addLayout()}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Top Right Actions - Desktop only */}
      <div className="fixed top-6 right-6 z-20 flex items-center gap-3">
        <button
          onClick={() => setShowTemplateSelector(true)}
          className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-600 hover:text-gray-900"
          title="Templates"
        >
          <LayoutTemplate size={20} />
        </button>
        
        <button
          onClick={() => {
            setIsChatOpen(!isChatOpen);
            if (!isChatOpen) setIsPanelOpen(false);
          }}
          className={`p-2.5 rounded-xl shadow-sm border transition-all ${
            isChatOpen 
              ? 'bg-blue-50 border-blue-200 text-blue-600' 
              : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 hover:text-gray-900'
          }`}
          title="AI Assistant"
        >
          <MessageSquare size={20} />
        </button>

        <button
          onClick={() => {
            setIsPanelOpen(!isPanelOpen);
            if (!isPanelOpen) setIsChatOpen(false);
          }}
          className={`p-2.5 rounded-xl shadow-sm border transition-all ${
            isPanelOpen 
              ? 'bg-blue-50 border-blue-200 text-blue-600' 
              : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 hover:text-gray-900'
          }`}
          title="Code Results"
        >
          <FileCode size={20} />
        </button>
      </div>

      {/* Main Canvas Area */}
      <CanvasBoard 
        ref={canvasRef}
        objects={objects}
        setObjects={setObjects}
        onAnalysisComplete={handleAnalysisComplete} 
        onError={handleError}
        isBrowserOpen={isBrowserOpen}
        onCloseBrowser={() => setIsBrowserOpen(false)}
        settings={settings}
      />

      {/* Right Results Panel */}
      <ResultsPanel 
        result={result} 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
      />
      
      {/* Chat Sidebar */}
      <ChatSidebar 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        objects={objects}
      />

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => {
          setSettings(newSettings);
          setIsSettingsOpen(false);
        }}
      />

      {/* Toast Notification for Errors */}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 text-red-600 px-6 py-3 rounded-xl shadow-lg z-50 animate-slide-in flex items-center gap-3">
           <div className="p-1 bg-red-100 rounded-full">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                 <circle cx="12" cy="12" r="10"></circle>
                 <line x1="12" y1="8" x2="12" y2="12"></line>
                 <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
           </div>
           {error}
        </div>
      )}
    </div>
  );
};

export default App;
