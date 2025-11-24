import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage } from '../types';
import { Icons } from './Icons';
import { GeminiRequestOptions } from '../services/geminiService';

interface ChatPanelProps {
  messages: ChatMessage[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSendMessage: (text: string, options: GeminiRequestOptions) => void;
  isThinking: boolean;
  uploadedImage: string | null;
  setUploadedImage: (img: string | null) => void;
  isMobile?: boolean; // Added for mobile support
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ 
  messages, 
  isOpen, 
  setIsOpen, 
  onSendMessage, 
  isThinking,
  uploadedImage,
  setUploadedImage,
  isMobile
}) => {
  const [inputValue, setInputValue] = useState('');
  const [useThinking, setUseThinking] = useState(false);
  const [useFast, setUseFast] = useState(false);
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() || uploadedImage) {
      onSendMessage(inputValue, {
        useThinking,
        useFast,
        imageSize,
        uploadedImage: uploadedImage || undefined
      });
      setInputValue('');
      setUploadedImage(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Service expects raw base64 usually, but handleChat helper handles splitting or we do it here.
        // Let's pass the raw base64 (with prefix) to App, service strips it.
        const parts = base64.split(',');
        const rawBase64 = parts.length > 1 ? parts[1] : base64;
        setUploadedImage(rawBase64);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) {
    return (
      <div className={`absolute bottom-6 right-6 z-50 ${isMobile ? 'hidden' : ''}`}>
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-mw-accent rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-110 transition-transform cursor-pointer"
        >
          <Icons.Sparkles className="text-white w-6 h-6 animate-pulse" />
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-mw-panel/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col z-50 animate-in slide-in-from-right-10 duration-300 ${isMobile ? 'fixed inset-0 rounded-none h-full w-full' : 'absolute top-20 right-6 w-80 rounded-xl h-[70vh]'}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isThinking ? 'bg-yellow-400 animate-ping' : 'bg-green-500'}`} />
          <h2 className="text-sm font-semibold text-gray-200">Mod-Weave AI</h2>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:text-white text-gray-500 transition-colors">
          <Icons.X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.senderId === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`
              max-w-[90%] px-3 py-2 rounded-lg text-xs leading-relaxed
              ${msg.senderId === 'user' 
                ? 'bg-mw-accent/20 text-white border border-mw-accent/30 rounded-br-none' 
                : 'bg-white/5 text-gray-300 border border-white/5 rounded-bl-none'}
            `}>
              {msg.attachment && (
                <div className="mb-2 rounded-lg overflow-hidden border border-white/10">
                  <img src={msg.attachment.url} className="w-full h-auto object-cover" alt="Attachment" />
                </div>
              )}
              {msg.text}
            </div>
            {msg.widgets && (
               <div className="mt-2 flex flex-wrap gap-2">
                 {msg.widgets.map((widget, idx) => (
                   <button key={idx} className="flex items-center gap-1 bg-mw-cyan/10 hover:bg-mw-cyan/20 text-mw-cyan border border-mw-cyan/30 px-2 py-1 rounded text-[10px] transition-colors">
                     <Icons.Zap size={10} />
                     {widget.label}
                   </button>
                 ))}
               </div>
            )}
            <span className="text-[10px] text-gray-600 mt-1 px-1">
              {msg.senderId === 'user' ? 'You' : 'AI Core'}
            </span>
          </div>
        ))}
        {isThinking && (
          <div className="flex items-start">
             <div className="bg-white/5 px-3 py-2 rounded-lg rounded-bl-none border border-white/5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Upload Preview */}
      {uploadedImage && (
        <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded overflow-hidden bg-white/5">
               <img src={`data:image/png;base64,${uploadedImage}`} className="w-full h-full object-cover" />
             </div>
             <span className="text-[10px] text-gray-400">Image attached</span>
          </div>
          <button onClick={() => setUploadedImage(null)} className="text-gray-500 hover:text-white">
            <Icons.X size={12} />
          </button>
        </div>
      )}

      {/* Controls Toolbar */}
      <div className="px-3 py-2 bg-black/40 border-t border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-hide">
         <button 
           onClick={() => { setUseThinking(!useThinking); if(!useThinking) setUseFast(false); }}
           className={`p-1.5 rounded transition-all ${useThinking ? 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/50' : 'text-gray-500 hover:bg-white/5'}`}
           title="Thinking Mode (Gemini 3 Pro)"
         >
           <Icons.Brain size={14} />
         </button>
         <button 
           onClick={() => { setUseFast(!useFast); if(!useFast) setUseThinking(false); }}
           className={`p-1.5 rounded transition-all ${useFast ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50' : 'text-gray-500 hover:bg-white/5'}`}
           title="Fast Mode (Flash Lite)"
         >
           <Icons.Zap size={14} />
         </button>
         <div className="w-px h-4 bg-white/10 mx-1" />
         <button 
           onClick={() => setShowSettings(!showSettings)}
           className={`p-1.5 rounded transition-all ${showSettings ? 'text-mw-cyan bg-mw-cyan/10' : 'text-gray-500 hover:bg-white/5'}`}
           title="Generation Settings"
         >
           <Icons.Settings size={14} />
         </button>
         {showSettings && (
           <select 
             value={imageSize} 
             onChange={(e) => setImageSize(e.target.value as any)}
             className="bg-black border border-white/20 text-[10px] text-white rounded px-1 py-1 outline-none"
           >
             <option value="1K">1K</option>
             <option value="2K">2K</option>
             <option value="4K">4K</option>
           </select>
         )}
         <div className="flex-1" />
         <button 
           onClick={() => fileInputRef.current?.click()}
           className="p-1.5 rounded text-gray-500 hover:bg-white/5 hover:text-white transition-colors"
           title="Analyze Image"
         >
           <Icons.Paperclip size={14} />
         </button>
         <input 
           type="file" 
           ref={fileInputRef} 
           className="hidden" 
           accept="image/*"
           onChange={handleFileChange}
         />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-black/30 border-t border-white/5">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={useThinking ? "Ask complex query..." : "Ask AI..."}
            className="w-full bg-black/20 border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-mw-accent/50 focus:ring-1 focus:ring-mw-accent/50 transition-all"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() && !uploadedImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-mw-accent disabled:opacity-30 transition-colors"
          >
            <Icons.Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
};