import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  SendHorizontal, 
  Bot, 
  User, 
  MessageSquare, 
  Square,
  Search,
  Highlighter,
  Presentation,
  Zap,
  Mic,
  PenTool,
  Languages,
  ScanText,
  Smile,
  Telescope
} from './Icons';
import { CanvasObject, ChatMessage } from '../types';
import { chatWithGemini } from '../services/geminiService';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  objects: CanvasObject[];
  isMobile?: boolean;
}

interface ToolAction {
  id: string;
  label: string;
  icon: React.ElementType;
  tip: string;
  cmd: string;
}

const TOOLS: ToolAction[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare, tip: '提問即可獲得設計、創作建議！', cmd: '' },
  { id: 'research', label: 'Deep Research', icon: Telescope, tip: '貼上文檔，/prompt 讓 AI 幫你摘要分析', cmd: '/prompt ' },
  { id: 'highlight', label: 'Highlight', icon: Highlighter, tip: '收藏重點、快速標記事項', cmd: '/highlight ' },
  { id: 'slides', label: 'AI Slides', icon: Presentation, tip: '幫你打造高質感簡報', cmd: '/slide ' },
  { id: 'fusion', label: 'Sider Fusion', icon: Zap, tip: '@模型名 進行多 AI 協同討論', cmd: '@' },
  { id: 'rec', label: 'Record', icon: Mic, tip: '直接開始記錄，對話內容自動保存', cmd: '/rec ' },
  { id: 'agent', label: 'Agent', icon: Bot, tip: '派工特定AI完成分派任務', cmd: '@Agent ' },
  { id: 'write', label: 'Write', icon: PenTool, tip: '讓超會寫作AI幫你生成文章', cmd: '/write ' },
  { id: 'trans', label: 'Translate', icon: Languages, tip: '輸入後自動翻譯任意語言', cmd: '/trans ' },
  { id: 'ocr', label: 'OCR', icon: ScanText, tip: '輸入圖片立即提取文字', cmd: '/ocr ' },
  { id: 'avatar', label: 'Avatar', icon: Smile, tip: '隨時切換你的數位形象', cmd: '/avatar ' },
];

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onClose, objects, isMobile = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi! I'm Gemini. Mention an object using '@' to discuss it, or ask me anything about design.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [activeToolId, setActiveToolId] = useState<string>('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTool = TOOLS.find(t => t.id === activeToolId) || TOOLS[0];

  const scrollBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollBottom();
  }, [messages, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    if (val.endsWith('@')) {
      setShowMentions(true);
    } else if (!val.includes('@')) {
      setShowMentions(false);
    }
  };

  const handleToolClick = (tool: ToolAction) => {
    setActiveToolId(tool.id);
    if (tool.cmd) {
      setInput(prev => tool.cmd + prev); // Prepend command
      inputRef.current?.focus();
    }
  };

  const insertMention = (obj: CanvasObject, index: number) => {
    const name = `Image_${index + 1}`;
    const newValue = input.slice(0, -1) + `@${name} `;
    setInput(newValue);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setActiveToolId('chat'); // Reset to default chat after sending
    
    const attachments: { type: 'image', data: string }[] = [];
    const mentionRegex = /@Image_(\d+)/g;
    let match;
    
    while ((match = mentionRegex.exec(userText)) !== null) {
      const index = parseInt(match[1], 10) - 1;
      if (objects[index] && objects[index].type === 'image' && objects[index].src) {
        attachments.push({
          type: 'image',
          data: objects[index].src!
        });
      }
    }

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const historyForApi = messages.filter(m => !m.isLoading);
      const responseText = await chatWithGemini(historyForApi, userText, attachments);
      
      const newBotMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, newBotMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Sorry, I had trouble connecting. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`${
      isMobile 
        ? 'w-full h-full flex flex-col bg-white' 
        : 'fixed top-0 right-0 h-screen w-[340px] bg-white text-gray-800 flex flex-col border-l border-gray-200 shadow-[-4px_0_20px_rgba(0,0,0,0.05)] font-sans z-40 animate-slide-in'
    }`}>
      {/* Header - Only show for desktop */}
      {!isMobile && (
        <div className="p-[24px_20px_12px] text-[1.1em] font-bold tracking-tight border-b border-gray-100 bg-white flex justify-between items-center">
          <span className="text-gray-900">Gemini Chat</span>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-black transition-colors p-1 hover:bg-gray-100 rounded-full"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Actions Grid */}
      <div className={`${isMobile ? 'p-4' : 'p-[16px_20px_0_20px]'} grid grid-cols-2 gap-2 overflow-x-auto`}>
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool)}
            className={`flex items-center gap-[6px] ${isMobile ? 'px-3 py-3' : 'px-[12px] py-[8px]'} rounded-[10px] ${isMobile ? 'text-xs' : 'text-[12px]'} font-medium transition-all border ${
              activeToolId === tool.id 
                ? 'bg-black text-white border-black shadow-sm' 
                : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100 active:bg-gray-200'
            }`}
            style={isMobile ? { minHeight: '52px' } : {}}
          >
            <tool.icon size={isMobile ? 16 : 14} strokeWidth={2} />
            <span className="truncate">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-4' : 'p-5'} space-y-6 bg-white`}>
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100 ${
              msg.role === 'user' ? 'bg-black text-white' : 'bg-white text-blue-600'
            }`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-black text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}>
              {msg.attachments && (
                <div className="flex gap-2 mb-2 overflow-x-auto">
                  {msg.attachments.map((att, i) => (
                    <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <img src={att.data} alt="attachment" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-white border border-gray-100 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot size={16} />
             </div>
             <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></span>
                </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`${isMobile ? 'p-4' : 'p-[16px_20px]'} border-t border-gray-100 bg-white relative ${isMobile ? 'safe-area-bottom' : ''}`}>
        
        {/* TopTips */}
        <div className="text-gray-400 text-[11px] font-medium mb-[10px] flex items-center gap-2 animate-fade-in">
            <div className="p-1 bg-gray-100 rounded">
               <activeTool.icon size={10} className="text-gray-600" />
            </div>
            <span>{activeTool.tip}</span>
        </div>

        {/* Mentions Popover */}
        {showMentions && (
          <div className="absolute bottom-full left-4 mb-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto z-50">
             <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase bg-gray-50 border-b border-gray-100">Suggested Objects</div>
             {objects.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">No objects on canvas</div>}
             {objects.map((obj, idx) => (
               <button
                 key={obj.id}
                 onClick={() => insertMention(obj, idx)}
                 className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
               >
                 <div className="w-8 h-8 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                   {obj.type === 'image' && obj.src ? (
                     <img src={obj.src} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-400">
                       {obj.type === 'text' ? 'T' : <Square size={12} />}
                     </div>
                   )}
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="text-sm font-medium text-gray-800 truncate">
                     {obj.type === 'image' ? `Image_${idx + 1}` : `Object_${idx + 1}`}
                   </div>
                   <div className="text-xs text-gray-400 capitalize">{obj.type}</div>
                 </div>
               </button>
             ))}
          </div>
        )}

        <form onSubmit={handleSend} className="relative group">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything..."
            className={`w-full ${isMobile ? 'min-h-[52px]' : 'min-h-[48px]'} rounded-[14px] bg-gray-50 text-gray-800 ${isMobile ? 'text-base' : 'text-[15px]'} p-[14px_56px_14px_16px] outline-none border border-transparent focus:bg-white focus:border-gray-200 focus:shadow-sm transition-all placeholder-gray-400`}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`absolute ${isMobile ? 'right-2' : 'right-3'} top-1/2 -translate-y-1/2 ${isMobile ? 'p-3' : 'p-2'} text-gray-400 hover:text-black active:text-black disabled:opacity-30 transition-colors`}
            style={isMobile ? { minWidth: '48px', minHeight: '48px' } : {}}
          >
            <SendHorizontal size={isMobile ? 20 : 18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatSidebar;