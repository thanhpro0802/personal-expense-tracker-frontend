/**
 * Demo page to showcase ChatAssistant component
 * This page demonstrates the UI without requiring backend authentication
 */

import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../components/ui/sheet';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '# Welcome to Smart Financial Assistant! 👋\n\nI can help you with:\n\n- **Budget analysis** - Track your spending patterns\n- **Financial advice** - Get personalized tips\n- **Expense insights** - Understand where your money goes\n- **Goal planning** - Set and achieve financial goals\n\nWhat would you like to know?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const demoResponses = [
    "Based on your expenses this month, you've spent **$1,234** on groceries, which is 15% more than last month.\n\n### Recommendations:\n1. Consider meal planning to reduce costs\n2. Look for sales and use coupons\n3. Buy in bulk for non-perishables",
    "Your **current savings rate** is excellent! Here's a breakdown:\n\n- Income: $5,000/month\n- Expenses: $3,200/month\n- Savings: $1,800/month (36%)\n\n💡 Tip: Consider investing some of your savings for long-term growth.",
    "I can help you analyze your spending patterns!\n\n### Top Categories:\n1. 🏠 Housing - 35%\n2. 🍔 Food - 20%\n3. 🚗 Transportation - 15%\n4. 🎬 Entertainment - 10%\n5. 💳 Other - 20%"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      const assistantMessage: Message = {
        role: 'assistant',
        content: randomResponse,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Smart Financial Assistant Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Click the button below to open the chat assistant
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 space-y-4">
          <div className="flex items-center justify-center gap-4">
            <MessageSquare className="h-12 w-12 text-primary" />
            <div className="text-left">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI-Powered Chat
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Get instant answers about your finances
              </p>
            </div>
          </div>

          <ul className="text-left space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Markdown formatting support
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Loading skeleton while processing
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Slide-over panel with Shadcn Sheet
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Floating action button
            </li>
          </ul>

          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="w-full"
          >
            Open Chat Assistant
          </Button>
        </div>
      </div>

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Chat Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col h-full p-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle>Smart Financial Assistant</SheetTitle>
            <SheetDescription>
              Ask me anything about your finances and expenses
            </SheetDescription>
          </SheetHeader>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Skeleton */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
