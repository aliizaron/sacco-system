import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatWithGemini } from '../lib/gemini';
import { UserProfile, ChatMessage } from '../types';
import { toast } from 'sonner';

interface AdvisorTabProps {
  profile: UserProfile;
  translations: any;
}

export const AdvisorTab: React.FC<AdvisorTabProps> = ({ profile, translations: t }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!navigator.onLine) {
      toast.error("AI Advisor requires an internet connection.");
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithGemini(input, messages);
      const assistantMessage: ChatMessage = {
        role: 'model',
        content: response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to get response from AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedTopics = [
    "How can I improve my risk score?",
    "What collateral is best for a business loan?",
    "Explain the SACCO loan terms.",
    "How do I apply for a loan?"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-neutral-900 text-white border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6" />
              {t.advisor}
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Powered by Google Gemini. Ask anything about loan risks, SACCO policies, or financial advice.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white/10 rounded-xl">
              <p className="text-xs text-neutral-400 uppercase font-bold mb-2">Suggested Topics</p>
              <ul className="space-y-2 text-sm">
                {suggestedTopics.map((topic, i) => (
                  <li 
                    key={i} 
                    className="cursor-pointer hover:text-white transition-colors flex items-start gap-2"
                    onClick={() => setInput(topic)}
                  >
                    <span className="text-neutral-500">•</span>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Chat with Advisor</CardTitle>
          </CardHeader>
          <CardContent ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex justify-start">
              <div className="bg-neutral-100 p-4 rounded-2xl rounded-tl-none max-w-[80%] text-sm">
                Hello {profile.name}! I'm your AI Risk Advisor. How can I help you today?
              </div>
            </div>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[80%] text-sm ${
                  msg.role === 'user' 
                    ? 'bg-neutral-900 text-white rounded-tr-none' 
                    : 'bg-neutral-100 text-neutral-900 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs text-neutral-500">Thinking...</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t p-4">
            <form 
              className="flex w-full gap-2" 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            >
              <Input 
                placeholder="Type your message..." 
                className="flex-1" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" size="icon" className="bg-neutral-900" disabled={isLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
