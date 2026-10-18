import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Trash2, Copy, Check, X, Zap } from 'lucide-react';
import { ChatMessage, Opportunity } from '../types/campus';

interface AIChatViewProps {
  activeContextOpportunity: Opportunity | null;
  onClearContext: () => void;
  onSelectOpportunity?: (opp: Opportunity) => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-ztopus',
  sender: 'bot',
  text: `Hello! I'm **Ztopus AI**, your high-speed student opportunity & hackday advisor. ⚡
      
Ask me anything:
- 🤝 **Team-Up Pitch**: Find student teammates across CS, Bioinformatics, or Engineering
- ✉️ **Organizer Outreach**: Draft emails to event hosts, mentors, or professors
- 🏆 **Winning Strategy**: Hackday tips, submission checklists, and project pitches
- 🎓 **Scholarships & Grants**: Eligibility checks, application advice, and essay ideas

How can I help you accelerate your student journey today?`,
  timestamp: 'Just now'
};

export const AIChatView: React.FC<AIChatViewProps> = ({
  activeContextOpportunity,
  onClearContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastContextOppIdRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // When context opportunity changes to a new one, add a prompt (guarded against duplicates)
  useEffect(() => {
    if (activeContextOpportunity && lastContextOppIdRef.current !== activeContextOpportunity.id) {
      lastContextOppIdRef.current = activeContextOpportunity.id;
      const contextMsg: ChatMessage = {
        id: `context-${activeContextOpportunity.id}`,
        sender: 'bot',
        text: `I'm analyzing **"${activeContextOpportunity.title}"** by *${activeContextOpportunity.host}*.
        
Quick options:
1. Explain winning criteria & project ideas
2. Check eligibility (${activeContextOpportunity.eligibility || 'All students'})
3. Draft a team pitch or application outline`,
        timestamp: 'Just now',
        contextOpportunityId: activeContextOpportunity.id
      };
      setMessages((prev) => {
        if (prev.some((m) => m.contextOpportunityId === activeContextOpportunity.id)) {
          return prev;
        }
        return [...prev, contextMsg];
      });
    }
  }, [activeContextOpportunity]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now'
    };

    const botMessageId = `bot-${Date.now()}`;
    const initialBotMessage: ChatMessage = {
      id: botMessageId,
      sender: 'bot',
      text: '',
      timestamp: 'Just now'
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6),
          contextOpportunity: activeContextOpportunity || undefined,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const contentType = response.headers.get('content-type') || '';

      // Check if response is streaming SSE
      if (contentType.includes('text/event-stream') && response.body) {
        setMessages((prev) => [...prev, initialBotMessage]);
        setIsLoading(false); // Stop loading indicator once streaming begins

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedText = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;

            const dataContent = trimmed.replace(/^data:\s*/, '');
            if (dataContent === '[DONE]') break;

            try {
              const parsed = JSON.parse(dataContent);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMessageId ? { ...m, text: accumulatedText } : m
                  )
                );
              }
            } catch {
              // ignore parse errors for partial chunks
            }
          }
        }

        // Final safety check if accumulatedText is empty
        if (!accumulatedText.trim()) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMessageId
                ? { ...m, text: "Here to assist you with student hackdays and scholarship applications!" }
                : m
            )
          );
        }
      } else {
        // Fallback standard JSON
        const data = await response.json();
        const botMessage: ChatMessage = {
          id: botMessageId,
          sender: 'bot',
          text: data.reply || "I'm here to help with student opportunities!",
          timestamp: 'Just now'
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
      }
    } catch {
      setMessages((prev) => {
        const fallbackText = "I couldn't reach the server right now. Here is a quick tip: check the eligibility and deadline on the radar feed, then tailor your pitch directly to the event theme!";
        const exists = prev.some((m) => m.id === botMessageId);
        if (exists) {
          return prev.map((m) =>
            m.id === botMessageId
              ? { ...m, text: m.text ? `${m.text}\n\n[Response paused - server connection lost]` : fallbackText }
              : m
          );
        }
        return [
          ...prev,
          {
            id: `bot-err-${Date.now()}`,
            sender: 'bot',
            text: fallbackText,
            timestamp: 'Just now'
          }
        ];
      });
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    lastContextOppIdRef.current = null;
    setMessages([INITIAL_MESSAGE]);
    if (activeContextOpportunity) {
      onClearContext();
    }
  };

  const quickPrompts = [
    '👥 Draft a team-up pitch to find hackday teammates',
    '✉️ Draft an outreach email to the event organizer',
    '📝 Draft a scholarship motivation pitch',
    '🎯 Step-by-step winning strategy for hackathons',
    '🧬 What opportunities fit my student major?'
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Header Bar for Chat */}
      <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-3.5 h-3.5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight">Ztopus AI</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-950 border border-emerald-500/30 text-emerald-300">
                Fast
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Instant Opportunity & Hackday Advisor</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          title="Reset conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Active Context Banner */}
      {activeContextOpportunity && (
        <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400">Target Context:</span>
            <span className="font-semibold text-emerald-300 truncate">
              {activeContextOpportunity.title}
            </span>
          </div>
          <button
            onClick={onClearContext}
            className="text-slate-400 hover:text-slate-200 p-1"
            title="Clear active opportunity context"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-xs shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs shadow-sm'
              }`}
            >
              <div className="whitespace-pre-line font-sans space-y-1">
                {msg.text || (
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Ztopus AI is answering...
                  </span>
                )}
              </div>

              {msg.sender === 'bot' && msg.text && (
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-medium text-slate-400">Ztopus AI</span>
                  <button
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="hover:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Copy</span>
                  </button>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 rounded-tl-xs flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span>Ztopus AI is answering...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts Bar */}
      <div className="px-4 py-2 border-t border-slate-900/80 bg-slate-950/80 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 hover:text-emerald-400 hover:border-slate-700 whitespace-nowrap transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Message Area */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask Ztopus AI about hackdays, scholarships, or pitches..."
            disabled={isLoading}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
