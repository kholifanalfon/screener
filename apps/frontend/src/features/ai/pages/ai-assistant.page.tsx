import { useState, useRef, useEffect } from 'react';
import { useAIChat } from '@/features/ai/hooks/use-ai';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card';
import { Send, Bot, User, Sparkles, AlertTriangle } from 'lucide-react';
import type { ChatMessageInput } from '@/features/ai/types/ai.types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Halo! Saya adalah Asisten Trading AI. Ada yang bisa saya bantu hari ini mengenai pasar saham atau analisis indikator?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const chatMutation = useAIChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMutation.isPending]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Siapkan history obrolan untuk Gemini API
    const history: ChatMessageInput[] = messages.map(m => ({
      role: m.sender === 'user' ? 'user' as const : 'model' as const,
      parts: m.text,
    }));

    chatMutation.mutate(
      { message: textToSend, history },
      {
        onSuccess: (data) => {
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: data.reply,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiMsg]);
        },
        onError: () => {
          const errMsg: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: 'Gagal mendapatkan respon dari server AI. Pastikan kunci API Gemini sudah terpasang dengan benar.',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errMsg]);
        },
      }
    );
  };

  const quickPrompts = [
    'Apa itu indikator RSI?',
    'Bagaimana membaca sinyal MACD Golden Cross?',
    'Bagaimana prospek saham BBCA?',
    'Jelaskan tentang Bollinger Bands.',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
      {/* Sidebar Suggestions */}
      <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800 lg:col-span-1 flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-200">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Rekomendasi Obrolan
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Pilih pertanyaan cepat untuk dijawab oleh Asisten AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 flex-1 overflow-y-auto">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              disabled={chatMutation.isPending}
              onClick={() => handleSend(prompt)}
              className="w-full text-left text-xs bg-slate-950/50 hover:bg-indigo-950/20 hover:text-indigo-300 border border-slate-800 rounded-lg p-3 text-slate-400 transition-all duration-200 font-medium active:scale-98 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </CardContent>
        <div className="p-4 border-t border-slate-850 bg-slate-950/30 rounded-b-lg">
          <div className="flex gap-2 text-amber-500/90 text-[10px] items-start">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Analisis pasar ini merupakan simulasi edukasi terkomputerisasi. Lakukan riset mandiri sebelum bertransaksi.
            </p>
          </div>
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800 lg:col-span-3 flex flex-col h-full overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div key={msg.id} className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}>
                {isAI && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-indigo-400" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isAI
                      ? 'bg-slate-950/60 border border-slate-800 text-slate-300 rounded-tl-none'
                      : 'bg-indigo-600 text-white rounded-tr-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className={`text-[10px] block mt-2 text-right ${isAI ? 'text-slate-500' : 'text-indigo-200'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {!isAI && (
                  <div className="w-8 h-8 rounded-lg bg-slate-850 flex items-center justify-center shrink-0 border border-slate-800">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </div>
            );
          })}

          {chatMutation.isPending && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl rounded-tl-none p-4 max-w-[75%] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="p-4 border-t border-slate-850 bg-slate-950/40 flex gap-3 items-center"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pesan untuk Asisten AI..."
            className="flex-1 bg-slate-950 border-slate-850 focus-visible:ring-indigo-500 text-sm py-5"
            disabled={chatMutation.isPending}
          />
          <Button
            type="submit"
            disabled={!input.trim() || chatMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 p-3 h-11 w-11 rounded-lg flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
