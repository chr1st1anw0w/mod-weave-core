import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { X, Code, Figma, Wand2, Copy, Check, Play } from './Icons';

interface ResultsPanelProps {
  result: AnalysisResult | null;
  onClose: () => void;
  isOpen: boolean;
  isMobile?: boolean;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, onClose, isOpen, isMobile = false }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'code' | 'figma'>('code');
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to format markdown content nicely
  const renderMarkdown = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) return <h1 key={index} className="text-2xl font-bold mt-6 mb-3 text-gray-900">{line.replace('# ', '')}</h1>;
      if (line.startsWith('## ')) return <h2 key={index} className="text-xl font-semibold mt-5 mb-2 text-gray-800">{line.replace('## ', '')}</h2>;
      if (line.startsWith('### ')) return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-gray-800">{line.replace('### ', '')}</h3>;
      if (line.startsWith('- **')) {
          const parts = line.split('**');
          return <li key={index} className="ml-4 list-disc text-gray-700 mb-1"><strong className="text-gray-900">{parts[1]}</strong>{parts[2]}</li>;
      }
      if (line.startsWith('- ')) return <li key={index} className="ml-4 list-disc text-gray-700 mb-1">{line.replace('- ', '')}</li>;
      if (line.match(/^\d+\. /)) return <div key={index} className="text-gray-700 mb-2 font-medium pl-2 border-l-2 border-blue-100">{line}</div>;
      return <p key={index} className="text-gray-600 mb-2 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div 
      className={`fixed ${
        isMobile 
          ? 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl' 
          : 'inset-y-0 right-0 w-full md:w-[600px]'
      } bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
        isOpen ? (isMobile ? 'translate-y-0' : 'translate-x-0') : (isMobile ? 'translate-y-full' : 'translate-x-full')
      }`}
    >
      {/* Mobile Drag Handle */}
      {isMobile && (
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
      )}

      {/* Header */}
      <div className={`${isMobile ? 'h-14' : 'h-16'} border-b border-gray-100 flex items-center justify-between ${isMobile ? 'px-4' : 'px-6'} bg-white/90 backdrop-blur`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <h2 className="font-bold text-gray-800">Generation Complete</h2>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-gray-100 rounded-lg active:bg-gray-200 text-gray-500 transition-colors"
          style={isMobile ? { minWidth: '44px', minHeight: '44px' } : {}}
        >
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} bg-gray-50/50 border-b border-gray-100`}>
        <div className="flex gap-1 bg-gray-200 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 ${isMobile ? 'py-2.5 px-2' : 'py-2 px-3'} rounded-md ${isMobile ? 'text-xs' : 'text-sm'} font-medium flex items-center justify-center gap-2 transition-all ${
              activeTab === 'analysis' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
            style={isMobile ? { minHeight: '44px' } : {}}
          >
            <Wand2 size={isMobile ? 14 : 16} /> {isMobile ? '分析' : 'Analysis'}
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`flex-1 ${isMobile ? 'py-2.5 px-2' : 'py-2 px-3'} rounded-md ${isMobile ? 'text-xs' : 'text-sm'} font-medium flex items-center justify-center gap-2 transition-all ${
              activeTab === 'code' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
            style={isMobile ? { minHeight: '44px' } : {}}
          >
            <Code size={isMobile ? 14 : 16} /> {isMobile ? '程式' : 'Code'}
          </button>
          <button 
            onClick={() => setActiveTab('figma')}
            className={`flex-1 ${isMobile ? 'py-2.5 px-2' : 'py-2 px-3'} rounded-md ${isMobile ? 'text-xs' : 'text-sm'} font-medium flex items-center justify-center gap-2 transition-all ${
              activeTab === 'figma' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
            style={isMobile ? { minHeight: '44px' } : {}}
          >
            <Figma size={isMobile ? 14 : 16} /> Figma
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        {activeTab === 'analysis' && (
          <div className={`${isMobile ? 'p-4' : 'p-8'} space-y-2`}>
             {renderMarkdown(result.analysis)}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="flex flex-col h-full">
            <div className={`${isMobile ? 'p-3' : 'p-4'} border-b border-gray-100 flex ${isMobile ? 'flex-col gap-2' : 'justify-between items-center'} bg-gray-50`}>
               <div className="flex gap-2">
                 <button 
                   onClick={() => setShowPreview(false)}
                   className={`text-xs font-semibold px-3 py-2 rounded-md border ${!showPreview ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-600 border-gray-200'}`}
                   style={isMobile ? { minHeight: '44px' } : {}}
                 >
                   原始碼
                 </button>
                 <button 
                   onClick={() => setShowPreview(true)}
                   className={`text-xs font-semibold px-3 py-2 rounded-md border ${showPreview ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-600 border-gray-200'}`}
                   style={isMobile ? { minHeight: '44px' } : {}}
                 >
                   預覽
                 </button>
               </div>
               <button 
                  onClick={handleCopy}
                  className={`flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 hover:text-black bg-white border border-gray-200 px-4 py-2 rounded-md shadow-sm transition-colors ${isMobile ? 'w-full' : ''}`}
                  style={isMobile ? { minHeight: '44px' } : {}}
                >
                  {copied ? <Check size={14} className="text-green-500"/> : <Copy size={14} />}
                  {copied ? '已複製' : '複製程式碼'}
               </button>
            </div>
            <div className="flex-1 relative bg-gray-50">
              {showPreview ? (
                <iframe 
                  title="Preview" 
                  className="w-full h-full border-none bg-white"
                  srcDoc={result.code} 
                />
              ) : (
                <pre className="p-4 text-sm font-mono text-gray-800 overflow-auto h-full whitespace-pre-wrap">
                  {result.code}
                </pre>
              )}
            </div>
          </div>
        )}

        {activeTab === 'figma' && (
          <div className={`${isMobile ? 'p-4' : 'p-8'}`}>
             <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Figma className="text-purple-600" size={24} />
                  </div>
                  <h3 className="font-bold text-purple-900 text-lg">Figma Import</h3>
                </div>
                {renderMarkdown(result.figmaGuide)}
             </div>

             <button 
                onClick={handleCopy}
                className={`w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 flex items-center justify-center gap-2 shadow-lg transition-all mb-6 ${isMobile ? 'active:bg-gray-700' : ''}`}
                style={isMobile ? { minHeight: '52px' } : {}}
             >
               {copied ? <Check size={18} /> : <Copy size={18} />}
               {copied ? '已複製程式碼！' : '複製程式碼給外掛'}
             </button>

             <div className={`p-4 bg-gray-50 rounded-lg border border-gray-200 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
               <p className="flex items-center gap-2">
                 <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">提示</span>
                 {isMobile ? '先到程式分頁複製原始碼！' : 'Use the copy button in the Code tab to grab the source first!'}
               </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;