import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import {
  Compass,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Loader2,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

export const AIMentorChatPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    'Should I choose PCM, PCB, or Commerce after Class 10?',
    'What skills and exams are required for an AI Engineer in India?',
    'Can I pursue Corporate Law or Design without Science?',
    'Explain the MBBS vs BDS vs B.Pharm pathways',
    'How do I build a strong extracurricular portfolio for university?'
  ];

  useEffect(() => {
    ApiService.getAIHistory().then(res => {
      if (res.success) {
        setConversationId(res.conversationId);
        if (res.messages && res.messages.length > 0) {
          setMessages(res.messages);
        } else {
          // Welcome initial message
          setMessages([
            {
              role: 'ASSISTANT',
              content: `Hello ${user?.name || 'there'}! I am your FuturePath AI Career Mentor. I can help you decode Class 10 stream options, entrance examination patterns (JEE, NEET, CUET, CLAT), verified college degrees, and 5-year preparation milestones.\n\nHow can I support your educational journey today?`,
              sources: ['National Career Service Portal', 'CBSE Curriculum Guidelines']
            }
          ]);
        }
      }
    });
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg = { role: 'USER', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await ApiService.sendAIChat(textToSend, conversationId || undefined);
      if (res.success) {
        if (!conversationId) setConversationId(res.conversationId);
        setMessages(prev => [
          ...prev,
          {
            role: 'ASSISTANT',
            content: res.reply,
            sources: res.sources
          }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'ASSISTANT',
          content: 'I apologize, the career guidance service experienced a momentary timeout. Please ask your question again.',
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 flex flex-col">
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 flex-1 flex flex-col space-y-4">
        
        {/* Mentor Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">AI Career Mentor</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Contextual Indian Education & Stream Advisory</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>DPDP Safe & Ad-Free</span>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-cyan-400" />
            <span>Suggested prompts:</span>
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs whitespace-nowrap transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl glass-panel bg-slate-900 border border-slate-800 min-h-[420px] max-h-[550px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ASSISTANT' && (
                <div className="w-8 h-8 rounded-lg bg-brand-600/20 text-cyan-400 flex items-center justify-center flex-shrink-0 border border-brand-500/30 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                msg.role === 'USER'
                  ? 'bg-brand-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-950/80 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm'
              }`}>
                <div className="whitespace-pre-line font-normal">
                  {msg.content}
                </div>

                {/* Sources Citation */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-300">Verified Sources:</span>
                    <span>{msg.sources.join(' • ')}</span>
                  </div>
                )}
              </div>

              {msg.role === 'USER' && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 border border-slate-700 mt-1">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-brand-600/20 text-cyan-400 flex items-center justify-center flex-shrink-0 border border-brand-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>AI Mentor is synthesizing career intelligence...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder="Ask about streams, cutoffs, engineering, medical, law, or salaries..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            className="w-full pl-4 pr-14 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 shadow-xl"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className={`absolute right-2 p-2 rounded-lg transition-colors ${
              inputMessage.trim() && !loading
                ? 'bg-brand-600 hover:bg-brand-500 text-white'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
