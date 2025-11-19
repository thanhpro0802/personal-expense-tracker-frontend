import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
// Chuyển alias @/ thành đường dẫn tương đối ./
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'; // Đảm bảo bạn đã có component này (shadcn/ui)
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Skeleton } from './ui/skeleton';
import ReactMarkdown from 'react-markdown';
// Chuyển alias @/ thành đường dẫn tương đối ../
import { aiAPI } from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [timeRange, setTimeRange] = useState('recent'); // State mới cho Time Range

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };

    // Cập nhật UI ngay
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // --- TẠO HISTORY ĐỂ GỬI ---
      // Lọc lấy các tin nhắn user/assistant trước đó (không bao gồm tin nhắn vừa nhập)
      const historyToSend = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Gọi API với tham số thứ 2 là history
      const response = await aiAPI.chat(userMessage.content, historyToSend, timeRange);
      // ---------------------------

      if (response.success && response.data) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.response || 'Sorry, I could not process your request.',
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.message || 'Failed to get response from assistant');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <>
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
              {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Start a conversation by asking a question!</p>
                  </div>
              )}

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

              <div ref={messagesEndRef} />
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
      </>
  );
}