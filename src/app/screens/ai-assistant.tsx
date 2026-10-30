import { useEffect, useRef, useState } from 'react';
import {
  Send, Mic, Phone, ShieldCheck, Eye, Wind, HeartPulse, Hand, Bandage, BedDouble,
  Clock, Droplet, Snowflake, Thermometer, Car, Brain, XCircle, Heart, Sparkles,
  CheckCircle2, Loader2, ChevronRight, type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { BottomNav } from '../components/bottom-nav';
import { quickPrompts } from '../data/emergency-services';
import {
  type AIGuide, type Severity, type StepIcon, matchGuide, THINKING_PHASES,
} from '../data/ai-mock-responses';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  guide?: AIGuide;
}

const STEP_ICONS: Record<StepIcon, LucideIcon> = {
  shield: ShieldCheck, phone: Phone, eye: Eye, wind: Wind, heart: HeartPulse,
  hand: Hand, bandage: Bandage, bed: BedDouble, clock: Clock, droplet: Droplet,
  snowflake: Snowflake, thermometer: Thermometer, car: Car, brain: Brain,
};

const SEVERITY_STYLES: Record<Severity, { label: string; pill: string; dot: string; accent: string; step: string }> = {
  critical: {
    label: 'CRITICAL',
    pill: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
    accent: 'from-red-500 to-rose-500',
    step: 'bg-red-50 text-red-600 ring-red-100',
  },
  urgent: {
    label: 'URGENT',
    pill: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
    accent: 'from-amber-500 to-orange-500',
    step: 'bg-amber-50 text-amber-600 ring-amber-100',
  },
  moderate: {
    label: 'MODERATE',
    pill: 'bg-sky-100 text-sky-700',
    dot: 'bg-sky-500',
    accent: 'from-sky-500 to-indigo-500',
    step: 'bg-sky-50 text-sky-600 ring-sky-100',
  },
};

const PHASE_MS = 550;

function GuideCard({ guide, onOpenGuide }: { guide: AIGuide; onOpenGuide: (id: string) => void }) {
  const sev = SEVERITY_STYLES[guide.severity];

  return (
    <div className="w-full bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
      <div className={`h-1 bg-gradient-to-r ${sev.accent}`} />

      <div className="p-4 space-y-4">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${sev.pill}`}>
            <span className="relative flex w-1.5 h-1.5">
              <span className={`absolute inline-flex h-full w-full rounded-full ${sev.dot} opacity-75 animate-ping`} />
              <span className={`relative inline-flex rounded-full w-1.5 h-1.5 ${sev.dot}`} />
            </span>
            {sev.label}
          </span>
          <h3 className="mt-2 font-bold text-[#111827] text-base leading-snug">{guide.title}</h3>
          <p className="mt-1 text-xs text-[#6B7280] leading-relaxed">{guide.summary}</p>
        </motion.div>

        {/* Call banner */}
        {guide.call && (
          <motion.a
            href={`tel:${guide.call.number}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white rounded-xl px-3 py-2.5 transition-all"
          >
            <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-bold">{guide.call.label}</span>
              <span className="block text-[11px] text-white/80">Tap to call now</span>
            </span>
            <ChevronRight className="w-4 h-4 opacity-80" />
          </motion.a>
        )}

        {/* Steps */}
        <ol className="relative space-y-3">
          <span className="absolute left-[17px] top-4 bottom-4 w-px bg-[#E5E7EB]" aria-hidden />
          {guide.steps.map((step, i) => {
            const Icon = STEP_ICONS[step.icon];
            return (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.15 }}
                className="relative flex gap-3"
              >
                <span className={`relative z-10 shrink-0 w-9 h-9 rounded-full ring-4 flex items-center justify-center ${sev.step}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <div className="pt-0.5">
                  <p className="text-sm font-semibold text-[#111827]">
                    <span className="text-[#9CA3AF] mr-1">{i + 1}.</span>
                    {step.title}
                  </p>
                  <p className="text-xs text-[#6B7280] leading-relaxed mt-0.5">{step.detail}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>

        {/* Avoid */}
        {guide.avoid.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + guide.steps.length * 0.15 }}
            className="bg-red-50 border border-red-100 rounded-xl p-3"
          >
            <p className="text-[11px] font-bold text-red-700 tracking-wide mb-1.5">AVOID</p>
            <ul className="space-y-1">
              {guide.avoid.map(item => (
                <li key={item} className="flex gap-2 text-xs text-red-800">
                  <XCircle className="w-3.5 h-3.5 mt-px shrink-0 text-red-500" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 + guide.steps.length * 0.15 }}
          className="flex items-center justify-between gap-2 pt-1"
        >
          <p className="flex items-center gap-1.5 text-xs font-medium text-[#4F46E5]">
            <Heart className="w-3.5 h-3.5 fill-current" />
            Stay calm. Help is on the way.
          </p>
          {guide.firstAidId && (
            <button
              onClick={() => onOpenGuide(guide.firstAidId!)}
              className="text-[11px] font-semibold text-[#6B7280] hover:text-[#111827] flex items-center gap-0.5"
            >
              Full guide <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function ThinkingIndicator({ phase }: { phase: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3 space-y-1.5"
    >
      {THINKING_PHASES.map((label, i) => (
        <div
          key={label}
          className={`flex items-center gap-2 text-xs transition-opacity ${i <= phase ? 'opacity-100' : 'opacity-30'}`}
        >
          {i < phase ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
          ) : i === phase ? (
            <Loader2 className="w-3.5 h-3.5 text-[#4F46E5] animate-spin" />
          ) : (
            <span className="w-3.5 h-3.5 rounded-full border border-[#D1D5DB]" />
          )}
          <span className={i === phase ? 'text-[#111827] font-medium' : 'text-[#6B7280]'}>{label}</span>
        </div>
      ))}
    </motion.div>
  );
}

export function AIAssistantScreen() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm RoadSoS AI. Describe the emergency situation and I'll provide immediate first aid guidance.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [thinkingPhase, setThinkingPhase] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isResponding = thinkingPhase !== null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, thinkingPhase]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isResponding) return;

    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), type: 'user', content: text, timestamp: new Date() },
    ]);
    setInput('');

    // Step through the "thinking" phases, then reveal the guide
    setThinkingPhase(0);
    THINKING_PHASES.forEach((_, i) => {
      if (i > 0) setTimeout(() => setThinkingPhase(i), i * PHASE_MS);
    });
    setTimeout(() => {
      const guide = matchGuide(text);
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), type: 'ai', content: guide.title, timestamp: new Date(), guide },
      ]);
      setThinkingPhase(null);
    }, THINKING_PHASES.length * PHASE_MS);
  };

  const handleSend = () => sendMessage(input);

  const handleMic = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast('Voice input available on mobile');
      return;
    }

    if (isListening) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const lastGuideId = [...messages].reverse().find(m => m.guide)?.guide?.id;

  return (
    <div className="min-h-screen bg-[#FAFBFC] pb-20 flex flex-col">
      {/* Header */}
      <div className="bg-[#FFFFFF] px-4 py-4 border-b border-[#E5E7EB] flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white shadow-sm">
          <Sparkles className="w-5 h-5" />
        </span>
        <div>
          <h1 className="font-bold text-[#111827] text-lg leading-tight">AI First Aid Assistant</h1>
          <p className="text-xs text-[#6B7280] flex items-center gap-2">
            Instant step-by-step guidance
            <span className="px-2 py-0.5 bg-[#10B981]/20 text-[#10B981] rounded text-[10px] font-medium">
              Works offline
            </span>
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.guide ? (
              <div className="w-full max-w-[92%]">
                <GuideCard guide={message.guide} onOpenGuide={id => navigate(`/first-aid/${id}`)} />
              </div>
            ) : (
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-[#4F46E5] text-white'
                    : 'bg-[#FFFFFF] text-[#111827] border border-[#E5E7EB]'
                }`}
              >
                <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
                <p className="text-[10px] opacity-60 mt-2">
                  {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </motion.div>
        ))}

        <AnimatePresence>
          {thinkingPhase !== null && (
            <div className="flex justify-start">
              <ThinkingIndicator phase={thinkingPhase} />
            </div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts — initial list, then related follow-ups */}
      {!isResponding && (
        <div className="px-4 pb-3">
          <p className="text-xs text-[#6B7280] mb-2">
            {messages.length === 1 ? 'Quick situations:' : 'Ask about another situation:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts
              .filter(prompt => messages.length === 1 || matchGuide(prompt).id !== lastGuideId)
              .map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="px-3 py-1.5 bg-[#FFFFFF] text-[#111827] border border-[#E5E7EB] rounded-full text-xs font-medium hover:bg-[#F3F4F6] transition-colors"
                >
                  {prompt}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[#E5E7EB] bg-[#FFFFFF] p-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1 bg-[#F3F4F6] rounded-2xl px-4 py-3 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Describe the emergency..."
              className="flex-1 bg-transparent text-[#111827] placeholder:text-[#9CA3AF] outline-none text-sm"
            />
            <button
              onClick={handleMic}
              className={`transition-colors ${
                isListening ? 'text-red-500' : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isResponding}
            className="w-12 h-12 bg-[#4F46E5] hover:bg-[#4338CA] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] text-white rounded-full flex items-center justify-center transition-colors active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[10px] text-[#6B7280] mt-2 text-center">
          AI guidance is not a substitute for professional medical care
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
