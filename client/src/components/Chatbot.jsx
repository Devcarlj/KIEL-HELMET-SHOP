import React, { useState, useEffect, useRef } from 'react';
import { IoMdClose, IoMdSend } from "react-icons/io";
import defaultAvatar from '../assets/default_user_profiles.png';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

const ChatProductCard = ({ id, slug, name, onClick }) => {
  return (
    <Link 
      to={`/product/${id}`} // Linking by ID is safer based on how CardProduct works
      onClick={onClick}
      className="bg-white border text-left border-brand-primary/20 p-3 rounded-2xl shadow-sm flex items-center justify-between hover:bg-brand-cream/30 hover:border-brand-primary/40 transition-all min-w-[200px] w-full max-w-[240px] mt-1 group shrink-0"
    >
      <div className="flex flex-col pr-2">
        <span className="text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors line-clamp-1">
          {name ? `View ${name}` : "View Product"}
        </span>
        <span className="text-[10px] text-brand-primary/70 uppercase font-black tracking-wider">Tap to check details</span>
      </div>
      <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-colors">
        <svg className='w-4 h-4' fill='none' stroke='currentColor' strokeWidth={3} viewBox='0 0 24 24'>
           <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </Link>
  );
};

// ─── LocalStorage Daily Counter Helpers ──────────────────────────────────────
const DAILY_LIMIT = 20;
const LS_DATE_KEY  = 'kiel_chat_date';
const LS_COUNT_KEY = 'kiel_chat_count';

const getTodayStr = () => new Date().toISOString().slice(0, 10);

/** Returns the number of messages sent today (auto-resets if the stored date ≠ today). */
const getDailyCount = () => {
  const storedDate = localStorage.getItem(LS_DATE_KEY);
  if (storedDate !== getTodayStr()) {
    // New day — reset
    localStorage.setItem(LS_DATE_KEY, getTodayStr());
    localStorage.setItem(LS_COUNT_KEY, '0');
    return 0;
  }
  return parseInt(localStorage.getItem(LS_COUNT_KEY) || '0', 10);
};

/** Increment and persist the daily counter. Returns the new count. */
const incrementDailyCount = () => {
  const newCount = getDailyCount() + 1;
  localStorage.setItem(LS_DATE_KEY, getTodayStr());
  localStorage.setItem(LS_COUNT_KEY, String(newCount));
  return newCount;
};

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [dailyLimitReached, setDailyLimitReached] = useState(() => getDailyCount() >= DAILY_LIMIT);
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

  // Re-check the daily limit every time the chat opens (handles midnight reset)
  useEffect(() => {
    if (isOpen) {
      setDailyLimitReached(getDailyCount() >= DAILY_LIMIT);
    }
  }, [isOpen]);

  // Initial animation: show, wait, then peek
  useEffect(() => {
    if (window.innerWidth < 768) {
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
    
    if (nextState) {
      setIsMinimized(false);
    } else {
      if (window.innerWidth < 768) {
        setIsMinimized(true);
      }
    }
    
    if (showTooltip) setShowTooltip(false);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || dailyLimitReached) return;

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

      // ── Handle 429 Rate-Limit Response ──
      if (res.status === 429) {
        const errorData = await res.json().catch(() => ({}));
        const friendlyMsg = errorData.message || "Take a break, rider! You've sent too many messages.";
        const limitType = errorData.limitType;

        // Show the server's friendly message in the chat
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'model' && last.text === '') {
            updated[updated.length - 1] = { ...last, text: friendlyMsg };
          } else {
            updated.push({ role: 'model', text: friendlyMsg });
          }
          return updated;
        });

        // If it's a daily limit, lock the input
        if (limitType === 'daily') {
          setDailyLimitReached(true);
        }

        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`Stream failed: ${res.status}`);
      }

      // ── Count this successful message against the daily budget ──
      const newCount = incrementDailyCount();
      if (newCount >= DAILY_LIMIT) {
        setDailyLimitReached(true);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          let payload;
          try {
            payload = JSON.parse(line.slice(6));
          } catch (e) {
            continue; // Skip malformed JSON
          }

          if (payload.error) {
            console.error("[Developer Console] Kiel hit a snag via payload: ", payload.error);
            // Instead of just throwing (which was being caught and ignored by an inner catch nearby),
            // we specifically handle the error state here to show it in the UI.
            setMessages(prev => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              const errMsg = "Sorry, I hit a pothole! Try sending that again.";
              if (last && last.role === 'model' && last.text === '') {
                updated[updated.length - 1] = { ...last, text: errMsg };
              } else {
                updated.push({ role: 'model', text: errMsg });
              }
              return updated;
            });
            setIsLoading(false);
            return; // Terminate this stream processing
          }

          if (payload.done) break;

          if (payload.text) {
            setMessages(prev => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === 'model') {
                updated[updated.length - 1] = { ...last, text: last.text + payload.text };
              }
              return updated;
            });
          }
        }
      }

    } catch (error) {
      console.error("[Developer Console] Chatbot stream error:", error);
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
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

  const extractProductJSON = (text) => {
    if (!text) return { cleanText: "", cards: [] };
    
    // Non-greedy match for {"ui": "product_card", ...}
    const regex = /\{[\s\S]*?"ui"\s*:\s*"product_card"[\s\S]*?\}/g;
    const matches = text.match(regex);
    let cards = [];
    let cleanText = text;

    if (matches) {
      matches.forEach(match => {
        try {
          const parsed = JSON.parse(match);
          if (parsed.ui === "product_card") {
            cards.push(parsed);
          }
          cleanText = cleanText.replace(match, '');
        } catch (e) {
          // Keep looking if malformed matching part
        }
      });
    }

    // Hide partial JSON stream fragments
    const partialMatch = cleanText.match(/\{"ui"\s*:\s*"product_card".*$/);
    if (partialMatch) {
       cleanText = cleanText.replace(partialMatch[0], '');
    }

    return { cleanText: cleanText.trim(), cards };
  };

  const formatMessage = (text) => {
    if (!text) return "";
    
    // Split the text into parts to handle markdown-style bolding (**bold**) and links [Text](url)
    const parts = text.split(/(\*\*.*?\*\*|__.*?__|\[.*?\]\(.*?\))/g);
    
    return parts.map((part, index) => {
      if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
        return <strong key={index} className="font-extrabold text-[#8B2222] italic">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const titleMatch = part.match(/\[(.*?)\]/);
        const urlMatch = part.match(/\((.*?)\)/);
        if (titleMatch && urlMatch) {
          return (
            <Link 
              key={index} 
              to={urlMatch[1]} 
              onClick={() => {
                if (window.innerWidth < 768) {
                  toggleChat();
                }
              }}
              className="text-brand-primary underline font-bold hover:text-brand-primary-dark transition-colors"
            >
              {titleMatch[1]}
            </Link>
          );
        }
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

            const { cleanText, cards } = msg.role === 'model' ? extractProductJSON(msg.text) : { cleanText: msg.text, cards: [] };

            return (
              <div 
                key={index} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} w-full gap-1`}
              >
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full items-end gap-2`}>
                  {msg.role === 'model' && (
                     <div className="w-6 h-6 rounded-full bg-brand-primary/10 overflow-hidden flex-shrink-0 mb-1 border border-brand-primary/20">
                        <img src={defaultAvatar} alt="K" className="w-full h-full object-cover opacity-70" />
                     </div>
                  )}
                  {cleanText && (
                    <div 
                      className={`max-w-[85%] rounded-[20px] px-4 py-3 text-[14px] leading-relaxed shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                        msg.role === 'user' 
                          ? 'bg-brand-secondary text-white rounded-br-none shadow-orange-500/20' 
                          : 'bg-white text-brand-text border border-brand-primary/10 rounded-bl-none shadow-brand-primary/5 font-medium'
                      }`}
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {formatMessage(cleanText)}
                    </div>
                  )}
                </div>
                {cards.length > 0 && msg.role === 'model' && (
                  <div className="flex flex-row overflow-x-auto no-scrollbar gap-3 ml-8 pb-1">
                    {cards.map((card, i) => (
                      <ChatProductCard 
                        key={i} 
                        id={card.id} 
                        slug={card.slug} 
                        name={card.name}
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            toggleChat();
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
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

        {/* Input Area or CTA */}
        <div className="p-4 bg-white border-t border-brand-primary/5">
          {dailyLimitReached ? (
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => {
                  toggleChat();
                  navigate('/');
                  window.scrollTo(0, 0);
                }}
                className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-2xl hover:bg-brand-primary-dark transition-colors shadow-md"
              >
                View our Helmets
              </button>
            </div>
          ) : (
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
          )}
          <div className="mt-2 text-center">
            <p className="text-[10px] text-brand-text/40 font-semibold tracking-wide uppercase">Powered by AI</p>
          </div>
        </div>
      </div>
    </>
  );
};


export default Chatbot;
