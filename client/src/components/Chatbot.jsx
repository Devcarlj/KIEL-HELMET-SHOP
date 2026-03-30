import React, { useState, useEffect, useRef } from 'react';
import { IoMdClose, IoMdSend } from "react-icons/io";
import defaultAvatar from '../assets/default_user_profiles.png';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true); // Always start with tooltip showing
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "Welcome to the pit, rider! I'm Kiel. Looking for a new lid for your daily commute or a weekend track day? How can I help you stay protected today?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Initial animation: show, wait, then peek
  useEffect(() => {
    if (window.innerWidth < 768) {
      // Show for 6 seconds to allow reading dialogue
      const timer = setTimeout(() => {
        setIsMinimized(true);
        setShowTooltip(false);
      }, 6000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const toggleChat = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    
    // If opening, ensure it's not minimized
    if (nextState) {
      setIsMinimized(false);
    } else {
      // If closing, set it to minimized (peek) state on mobile
      if (window.innerWidth < 768) {
        setIsMinimized(true);
      }
    }
    
    if (showTooltip) setShowTooltip(false);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to UI
    const updatedMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      let history = updatedMessages.slice(0, -1).map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      // Gemini requires history to start with a 'user' message
      while (history.length > 0 && history[0].role !== 'user') {
        history.shift();
      }

      // Add an empty model message that we'll stream into
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      // Build the full URL for fetch (handles both dev proxy and production)
      const streamUrl = SummaryApi.chatMessageStream.url;
      const accessToken = localStorage.getItem('accessToken');

      const res = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ message: userMessage, history }),
      });

      if (!res.ok) {
        throw new Error(`Stream failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(line.slice(6));

            if (payload.error) {
              toast.error("Kiel hit a snag: " + payload.error);
              break;
            }

            if (payload.done) break;

            if (payload.text) {
              // Append chunk to the last (model) message
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = { ...last, text: last.text + payload.text };
                return updated;
              });
            }
          } catch { /* skip malformed JSON lines */ }
        }
      }

    } catch (error) {
      console.error("Chatbot stream error:", error);
      toast.error("An error occurred while talking to Kiel.");
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        // If the last message is an empty model message from the stream attempt, replace it
        if (last && last.role === 'model' && last.text === '') {
          updated[updated.length - 1] = { ...last, text: "Sorry, I hit a pothole! Try sending that again." };
        } else {
          updated.push({ role: 'model', text: "Sorry, I hit a pothole! Try sending that again." });
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (text) => {
    if (!text) return "";
    
    // Split the text into parts to handle markdown-style bolding (**bold**)
    const parts = text.split(/(\*\*.*?\*\*|__.*?__)/g);
    
    return parts.map((part, index) => {
      if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
        return <strong key={index} className="font-extrabold text-[#8B2222] italic">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Tooltip Bubble */}
      <div 
        className={`fixed bottom-24 right-4 bg-brand-cream text-brand-text px-4 py-2 rounded-2xl rounded-br-none shadow-xl border border-brand-secondary/20 text-sm font-semibold transition-all duration-500 z-[9998] max-w-[180px] ${
          showTooltip && !isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="relative">
          {isMinimized && window.innerWidth < 768 ? "Slide me if you have a question! 🏍️" : "Need help? Just tap! 🏎️"}
          <div className="absolute -bottom-4 right-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-brand-cream"></div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        style={{ zIndex: 9999 }}
        className={`fixed p-0 w-16 h-16 bg-brand-primary rounded-full shadow-[0_10px_30px_-5px_rgba(139,34,34,0.4)] flex items-center justify-center text-white hover:bg-brand-primary-dark hover:scale-110 active:scale-95 transition-all duration-500 overflow-hidden border-4 border-white
          ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 pointer-events-auto'}
          ${isMinimized 
            ? 'bottom-4 -right-12 opacity-60 hover:opacity-100 hover:-translate-x-14' 
            : 'bottom-4 right-4 animate-pulse-brand'}
          md:bottom-8 md:right-8 md:opacity-100 md:translate-x-0
        `}
        aria-label="Open Chat"
      >
        <style>
          {`
            @keyframes pulse-brand {
              0%, 100% { transform: scale(1); box-shadow: 0 10px 25px -5px rgba(139, 34, 34, 0.4); }
              50% { transform: scale(1.05); box-shadow: 0 20px 35px -5px rgba(139, 34, 34, 0.6); }
            }
            .animate-pulse-brand {
              animation: pulse-brand 3s infinite ease-in-out;
            }
          `}
        </style>
        <img 
          src={defaultAvatar} 
          alt="Kiel" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png"; // Fallback bot icon
          }}
        />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-4 right-4 w-[350px] max-w-[calc(100vw-2rem)] sm:w-[400px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-500 origin-bottom-right border border-brand-primary/10 z-[9999] ${isOpen ? 'scale-100 opacity-100 pointer-events-auto translate-y-0' : 'scale-[0.8] opacity-0 pointer-events-none translate-y-10'}`}
        style={{ height: '550px', maxHeight: 'calc(100dvh - 2rem)' }}
      >
        {/* Header */}
        <div className="bg-brand-primary p-5 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
          {/* Subtle tire track pattern or accent */}
          <div className="absolute top-0 right-0 w-32 h-full opacity-10 pointer-events-none rotate-12 -mr-8">
            <div className="w-full h-full bg-black/20 transform skew-x-12"></div>
          </div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-full bg-brand-cream overflow-hidden border-2 border-brand-secondary/50 shadow-md flex-shrink-0">
              <img src={defaultAvatar} alt="Kiel" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl tracking-tight leading-none mb-1">KIEL</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(74,222,128,0.5)]"></span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-cream/80">AI Pit Crew</p>
              </div>
            </div>
          </div>
          <button 
            onClick={toggleChat}
            className="p-2.5 bg-brand-primary-dark/50 hover:bg-brand-primary-dark hover:scale-110 active:scale-90 rounded-full transition-all relative z-10"
            aria-label="Close Chat"
          >
            <IoMdClose size={22} />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-5 bg-brand-cream/30 flex flex-col gap-5 no-scrollbar">
          {messages.map((msg, index) => {
            // Don't render an empty model bubble — the typing dots handle that state
            if (msg.role === 'model' && !msg.text) return null;

            return (
              <div 
                key={index} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full items-end gap-2`}
              >
                {msg.role === 'model' && (
                   <div className="w-6 h-6 rounded-full bg-brand-primary/10 overflow-hidden flex-shrink-0 mb-1 border border-brand-primary/20">
                      <img src={defaultAvatar} alt="K" className="w-full h-full object-cover opacity-70" />
                   </div>
                )}
                <div 
                  className={`max-w-[85%] rounded-[20px] px-4 py-3 text-[14px] leading-relaxed shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    msg.role === 'user' 
                      ? 'bg-brand-secondary text-white rounded-br-none shadow-orange-500/20' 
                      : 'bg-white text-brand-text border border-brand-primary/10 rounded-bl-none shadow-brand-primary/5 font-medium'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {formatMessage(msg.text)}
                </div>
              </div>
            );
          })}

          {/* Only show typing dots while waiting for the FIRST chunk — once text flows, hide them */}
          {isLoading && messages[messages.length - 1]?.text === '' && (
            <div className="flex justify-start w-full items-end gap-2">
              <div className="w-6 h-6 rounded-full bg-brand-primary/10 overflow-hidden flex-shrink-0 mb-1 border border-brand-primary/20 animate-pulse">
                <img src={defaultAvatar} alt="K" className="w-full h-full object-cover opacity-70" />
              </div>
              <div className="bg-white border border-brand-primary/10 text-brand-primary rounded-[20px] rounded-bl-none px-4 py-3 shadow-sm flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-brand-primary/5">
          <form onSubmit={handleSend} className="flex gap-3 relative">
            <div className="flex-1 relative group">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message your pit crew..."
                className="w-full bg-brand-cream/50 text-brand-text rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all shadow-inner border border-transparent focus:border-brand-primary/10"
                disabled={isLoading}
              />
            </div>
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-3.5 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                !input.trim() || isLoading 
                  ? 'bg-brand-cream text-brand-text/30 border border-brand-primary/5' 
                  : 'bg-brand-primary text-white hover:bg-brand-primary-dark shadow-[0_4px_12px_-2px_rgba(139,34,34,0.3)] hover:scale-105 active:scale-95'
              }`}
            >
              <IoMdSend size={20} className={input.trim() && !isLoading ? 'transform translate-x-0.5' : ''} />
            </button>
          </form>
          <div className="mt-2 text-center">
            <p className="text-[10px] text-brand-text/40 font-semibold tracking-wide uppercase">Powered by AI</p>
          </div>
        </div>
      </div>
    </>
  );
};


export default Chatbot;
