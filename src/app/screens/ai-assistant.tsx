import { useState } from 'react';
import { Send, Mic } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { BottomNav } from '../components/bottom-nav';
import { quickPrompts } from '../data/emergency-services';
import { AI_CONFIG } from '../config/ai';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isOffline?: boolean;
  isError?: boolean;
}

type OpenRouterMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const SYSTEM_INSTRUCTION = `You are RoadSoS AI, an emergency first aid assistant for road accident victims in India.

Rules:
- ALWAYS start with emergency number if life-threatening: '🚨 Call 108 (Ambulance) immediately'
- Give maximum 4 numbered steps — short and clear
- End every response with: 'Stay calm. Help is on the way.'
- Never give medical diagnosis
- If unsure, always say call 108
- Responses for panicking bystanders — simple language
- Keep total response under 150 words
- For non-emergency questions redirect to relevant emergency service`;

const buildOpenRouterMessages = (history: Message[], userText: string): OpenRouterMessage[] => {
  const recentConversation = history
    .filter(message => message.type === 'user' || message.type === 'ai')
    .slice(-8)
    .map(message => ({
      role: message.type === 'user' ? 'user' : 'assistant',
      content: message.content,
    })) as OpenRouterMessage[];

  return [
    { role: 'system', content: SYSTEM_INSTRUCTION },
    ...recentConversation,
    { role: 'user', content: userText },
  ];
};

const parseRetrySeconds = (message: string) => {
  const match = message.match(/retry in\s+([\d.]+)s/i);
  if (!match) return null;
  const seconds = Number.parseFloat(match[1]);
  return Number.isFinite(seconds) ? Math.ceil(seconds) : null;
};

const getFriendlyAIError = (err: unknown) => {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();

  if (lower.includes('quota exceeded') || lower.includes('429')) {
    const retrySeconds = parseRetrySeconds(raw);
    const retryText = retrySeconds
      ? `Please try again in about ${retrySeconds}s.`
      : 'Please try again in a minute.';

    return `OpenRouter rate limit reached. ${retryText}\nIf this continues, check your OpenRouter credits, key limits, or model availability.\nFor urgent help: Call 108.`;
  }

  if (lower.includes('401') || lower.includes('403') || lower.includes('api key')) {
    return 'AI key is invalid or lacks permission for this model. Update the API key configuration and try again. For urgent help: Call 108.';
  }

  return 'AI unavailable right now. Call 108 for medical emergency.';
};

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
  const [isTyping, setIsTyping] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isResponding) return;

    if (!navigator.onLine) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: text,
        timestamp: new Date(),
      };
      const offlineMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '⚡ AI assistant unavailable offline.\nUse the First Aid Guide tab for step-by-step emergency instructions.',
        timestamp: new Date(),
        isOffline: true,
      };
      setMessages(prev => [...prev, userMessage, offlineMessage]);
      setInput('');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setIsResponding(true);

    try {
      const response = await fetch(AI_CONFIG.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AI_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Emergency Response Dashboard',
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          messages: buildOpenRouterMessages(messages, text),
          max_tokens: AI_CONFIG.maxTokens,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const retryAfter = response.headers.get('retry-after');
        const retryHint = retryAfter ? ` Retry in about ${retryAfter}s.` : '';
        throw new Error(`OpenRouter request failed (${response.status}). ${errorBody}${retryHint}`);
      }

      const data = await response.json();
      const aiText = data?.choices?.[0]?.message?.content?.trim();

      if (!aiText) {
        throw new Error('OpenRouter returned an empty response.');
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: aiText,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error('OpenRouter error:', err);
      const friendlyError = getFriendlyAIError(err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: friendlyError,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
      setIsResponding(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const handleQuickPrompt = (prompt: string) => {
    if (isResponding) return;
    sendMessage(prompt);
  };

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

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-20 flex flex-col">
      {/* Header */}
      <div className="bg-[#1A1A2E] px-4 py-4 border-b border-[#8888AA]/20">
        <h1 className="font-bold text-[#F0F0F0] text-lg mb-1">AI First Aid Assistant</h1>
        <p className="text-sm text-[#8888AA] flex items-center gap-2">
          Powered by OpenRouter
          <span className="px-2 py-0.5 bg-[#06D6A0]/20 text-[#06D6A0] rounded text-xs font-medium">
            Beta
          </span>
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-[#D62828] text-white'
                  : message.isOffline
                  ? 'bg-amber-900/40 border border-amber-500/40 text-[#F0F0F0]'
                  : message.isError
                  ? 'bg-red-900/40 border border-red-500/40 text-red-300'
                  : 'bg-[#1A1A2E] text-[#F0F0F0]'
              }`}
            >
              <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>

              {message.isOffline && (
                <button
                  onClick={() => navigate('/first-aid')}
                  className="mt-3 w-full bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                >
                  Open First Aid Guide →
                </button>
              )}

              <p className="text-[10px] opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#1A1A2E] rounded-2xl px-4 py-3 flex items-center gap-1">
              <span className="w-2 h-2 bg-[#8888AA] rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-[#8888AA] rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-[#8888AA] rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts — shown until conversation starts */}
      {messages.length === 1 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-[#8888AA] mb-2">Quick situations:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map(prompt => (
              <button
                key={prompt}
                onClick={() => handleQuickPrompt(prompt)}
                disabled={isResponding}
                className="px-3 py-1.5 bg-[#1A1A2E] text-[#F0F0F0] rounded-full text-xs font-medium hover:bg-[#222233] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[#8888AA]/20 bg-[#1A1A2E] p-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1 bg-[#0D0D0D] rounded-2xl px-4 py-3 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Describe the emergency..."
              className="flex-1 bg-transparent text-[#F0F0F0] placeholder:text-[#8888AA] outline-none text-sm"
            />
            <button
              onClick={handleMic}
              className={`transition-colors ${
                isListening ? 'text-red-500' : 'text-[#8888AA] hover:text-[#F0F0F0]'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isResponding}
            className="w-12 h-12 bg-[#D62828] hover:bg-[#B81F1F] disabled:bg-[#8888AA]/20 disabled:text-[#8888AA] text-white rounded-full flex items-center justify-center transition-colors active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[10px] text-[#8888AA] mt-2 text-center">
          AI guidance is not a substitute for professional medical care
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
