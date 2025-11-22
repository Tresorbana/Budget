import { useState, useRef, useEffect } from "react";

import { useAuth } from "@/context/auth-context";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  AlertCircle,
  Bot,
  Mic,
  MicOff,
  PiggyBank,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
}

export function AIPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI financial assistant. I can help you with budgeting advice, savings tips, and spending insights. How can I help you today?",
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestedQuestions = [
    { icon: TrendingUp, text: "How can I reduce my expenses?" },
    { icon: PiggyBank, text: "Tips for saving more money?" },
    { icon: AlertCircle, text: "Am I overspending this month?" },
  ];

  const callAiApi = async (prompt: string): Promise<string> => {
    try {
      // Use the API route that proxies to the AI handler in src/ai/route.ts
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      // Handle error responses
      if (!response.ok) {
        if (typeof data === "object" && data && "error" in data) {
          return `AI error: ${String(data.error)}`;
        }
        return `AI error: ${response.status} ${response.statusText}`;
      }

      // Plain string response
      if (typeof data === "string") {
        return data;
      }

      // New format from our backend: { content: "..." }
      if (typeof data === "object" && data && "content" in data) {
        return String(data.content);
      }

      // HuggingFace text-generation style: array with generated_text
      if (Array.isArray(data) && data[0]?.generated_text) {
        return String((data[0] as { generated_text: unknown }).generated_text);
      }

      // Fallback for other object shapes
      if (typeof data === "object" && data) {
        const obj = data as {
          generated_text?: unknown;
          text?: unknown;
          answer?: unknown;
          message?: unknown;
          error?: unknown;
        };

        if (typeof obj.error === "string") {
          return `AI error: ${obj.error}`;
        }

        const candidates = [
          obj.generated_text,
          obj.text,
          obj.answer,
          obj.message,
        ];

        const firstString = candidates.find((v) => typeof v === "string") as
          | string
          | undefined;

        if (firstString) {
          return firstString;
        }
      }

      // Fallback: show raw JSON
      return JSON.stringify(data, null, 2);
    } catch (error) {
      if (error instanceof Error) {
        return `The AI is currently unavailable: ${error.message}`;
      }
      return "The AI is currently unavailable. Please try again in a moment.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    const aiText = await callAiApi(inputMessage);

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiText,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate voice input
      setTimeout(() => {
        setInputMessage("How can I save more money?");
        setIsListening(false);
      }, 2000);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen p-4 md:p-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2>AI Financial Assistant</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <Card className="flex-1 p-4 overflow-y-auto mb-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] md:max-w-[70%] ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                    : "bg-muted rounded-2xl rounded-tl-sm"
                } p-4`}
              >
                {message.sender === "ai" && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-primary">AI Assistant</span>
                  </div>
                )}
                <p className="whitespace-pre-line">{message.text}</p>
                <p
                  className={`mt-2 opacity-70 ${
                    message.sender === "user"
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          {isLoading && (
            <div className="flex justify-start">
              <div className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>AI is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Suggested Questions (shown when no messages) */}
      {messages.length === 1 && (
        <div className="mb-4">
          <p className="text-muted-foreground mb-3">Suggested questions:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestedQuestions.map((question, index) => {
              const Icon = question.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto py-3 justify-start"
                  onClick={() => handleSuggestedQuestion(question.text)}
                >
                  <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="text-left">{question.text}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <Button
          variant={isListening ? "default" : "outline"}
          size="icon"
          onClick={handleVoiceInput}
          className="flex-shrink-0"
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder={
              isListening ? "Listening..." : "Ask me anything about your finances..."
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="pr-12 bg-input-background"
            disabled={isListening}
          />
          {isListening && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            </div>
          )}
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isListening || isLoading}
          className="flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      {/* Tips */}
      <div className="mt-3 text-center">
        <p className="text-muted-foreground">
          💡 You can ask about budgets, savings, expenses, and financial goals
        </p>
      </div>
    </div>
  );
}
