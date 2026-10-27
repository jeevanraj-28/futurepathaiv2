import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { Dhruv } from '../components/brand';
import { Character, characterForRole } from '../components/Character';
import { Alert, Badge, Button } from '../components/ui';
import { cn } from '../lib/utils';

type Message = { role: 'USER' | 'ASSISTANT'; content: string; sources?: string[] };

const SUGGESTIONS = [
  'Should I choose PCM, PCB or Commerce after Class 10?',
  'Which exams do I need for an AI engineer career?',
  'Can I study law or design without Science?',
  'MBBS vs BDS vs B.Pharm — what’s the difference?',
];

/** Renders the mentor's plain-text replies with paragraphs, bullet lists and **bold**. */
const RichText: React.FC<{ text: string }> = ({ text }) => {
  const inline = (line: string) =>
    line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <React.Fragment key={i}>{part}</React.Fragment>
    );
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      blocks.push(<ul key={`l${blocks.length}`} className="ml-5 list-disc space-y-1">{list.map((li, i) => <li key={i}>{inline(li)}</li>)}</ul>);
      list = [];
    }
  };
  text.split('\n').forEach((raw) => {
    const line = raw.trim();
    if (/^([-•*]|\d+[.)])\s+/.test(line)) list.push(line.replace(/^([-•*]|\d+[.)])\s+/, ''));
    else {
      flush();
      if (line) blocks.push(<p key={`p${blocks.length}`}>{inline(line.replace(/^#+\s*/, ''))}</p>);
    }
  });
  flush();
  return <div className="flex flex-col gap-2.5">{blocks}</div>;
};

export const AIMentorChatPage: React.FC = () => {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  useEffect(() => {
    ApiService.getAIHistory()
      .then((res) => {
        if (res.success) {
          setConversationId((id) => id || res.conversationId);
          // never replace messages already on screen (a question may have been sent while history loaded)
          setMessages((prev) => prev.length ? prev : res.messages?.length ? res.messages : [{
            role: 'ASSISTANT',
            content: `Hi ${user?.name?.split(' ')[0] || 'there'}! I’m Dhruv. Ask me about streams, entrance exams, colleges or your report. I’ll point you to official sources, and I’ll tell you when something needs a human counsellor.`,
          }]);
        }
      })
      .catch(() => setMessages((prev) => prev.length ? prev : [{ role: 'ASSISTANT', content: 'Hi! I’m Dhruv. Ask me anything about streams, exams, colleges or careers.' }]))
      .finally(() => setReady(true));
  }, [user]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, sending]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setMessages((m) => [...m, { role: 'USER', content: msg }]);
    setInput('');
    setSending(true);
    setError(null);
    try {
      const res = await ApiService.sendAIChat(msg, conversationId || undefined);
      if (res.success) {
        if (!conversationId) setConversationId(res.conversationId);
        setMessages((m) => [...m, { role: 'ASSISTANT', content: res.reply, sources: res.sources }]);
      }
    } catch (err: any) {
      setError(err.message || 'Dhruv couldn’t reply just now. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // questions passed from other screens ("Ask Dhruv about my report") are sent once history has loaded
  useEffect(() => {
    const q = params.get('q');
    if (ready && q && !sentInitial.current) {
      sentInitial.current = true;
      setParams({}, { replace: true });
      send(q);
    }
  }, [ready]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <section aria-label="Chat with Dhruv" className="flex h-[calc(100vh-180px)] min-h-[520px] flex-col overflow-hidden rounded-4xl border border-line bg-white md:h-[calc(100vh-112px)]">
        <header className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3.5">
          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-royal-50"><Dhruv pose="wave" size={48} decorative /></span>
          <div className="flex flex-1 flex-col">
            <h1 className="text-lg font-bold">Dhruv · AI mentor</h1>
            <span className="text-sm text-ink-3">Guidance, not guarantees. Check dates on official sites.</span>
          </div>
          <Badge tone="leaf">Cites official sources</Badge>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6" aria-live="polite">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {messages.map((m, i) =>
              m.role === 'ASSISTANT' ? (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-royal-50"><Dhruv pose="wave" size={40} decorative /></span>
                  <div className="flex min-w-0 max-w-[620px] flex-col gap-2">
                    <div className="rounded-[4px_18px_18px_18px] border border-line bg-mist px-4 py-3.5 text-[15px] leading-relaxed sm:text-base">
                      <RichText text={m.content} />
                    </div>
                    {m.sources && m.sources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink-3">
                        <span>Sources:</span>
                        {m.sources.map((s) => <span key={s} className="rounded-full border border-line-strong bg-white px-2.5 py-1 font-semibold text-royal-600">{s}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex items-end justify-end gap-2.5">
                  <div className="max-w-[520px] rounded-[18px_18px_4px_18px] bg-royal-500 px-4 py-3 text-[15px] leading-relaxed text-white sm:text-base">{m.content}</div>
                  <Character who={characterForRole(user?.role)} size={32} animate={false} />
                </div>
              )
            )}
            {sending && (
              <div className="flex items-center gap-3" role="status">
                <Dhruv pose="think" size={48} decorative />
                <span className="text-[15px] text-ink-3">Dhruv is checking sources…</span>
              </div>
            )}
            {error && <Alert>{error}</Alert>}
            <div ref={endRef} />
          </div>
        </div>

        <div className="border-t border-line px-4 pb-4 pt-3 sm:px-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {messages.length <= 2 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)} disabled={sending} className="min-h-[44px] shrink-0 rounded-full border border-line-strong bg-mist px-4 text-sm font-semibold hover:border-royal-300">
                    {s}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
              <label htmlFor="chat-input" className="sr-only">Message Dhruv</label>
              <input
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about streams, exams, colleges or your report"
                className="field-input"
                autoComplete="off"
              />
              <button type="submit" aria-label="Send" disabled={!input.trim() || sending} className={cn('flex w-14 shrink-0 items-center justify-center rounded-[10px] text-white', input.trim() && !sending ? 'bg-royal-500 hover:bg-royal-600' : 'bg-line-strong')}>
                <Send className="h-5 w-5" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <aside className="hidden flex-col gap-4 xl:flex">
        <div className="flex flex-col gap-3 rounded-3xl bg-ink p-6 text-white">
          <div className="flex items-center gap-3">
            <Character who="ananya" size={48} />
            <h2 className="text-lg font-bold text-white">Want a human view?</h2>
          </div>
          <p className="text-[15px] leading-relaxed text-night-text">Book a verified counsellor for a one-on-one session with your family.</p>
          <Button to="/counselors" variant="white" size="sm">Book a counsellor</Button>
        </div>
        <div className="card flex flex-col gap-2 p-6">
          <h2 className="text-lg font-bold">Good to know</h2>
          <ul className="flex flex-col gap-2 text-[15px] leading-relaxed text-ink-2">
            <li>Dhruv never invents cutoffs or guarantees admission.</li>
            <li>For dates and fees, always confirm on the official website.</li>
            <li>Chats are saved, so you can pick up where you left off.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
};
