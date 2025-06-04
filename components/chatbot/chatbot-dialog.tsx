"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./message";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, SendHorizonal } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

interface ChatbotDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

type Message = {
    id: string;
    role: "user" | "assistant" | "system";
    text: string;
};

const mapToApiMessages = (uiMessages: Message[]) => {
    return uiMessages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
            role: msg.role,
            content: msg.text
        }));
};

export function ChatbotDialog({ isOpen, onOpenChange }: ChatbotDialogProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const aiResponseRef = useRef<string>(""); // To build the streaming AI response

    const addUiMessage = useCallback((role: "user" | "assistant" | "system", text: string, id?: string) => {
        const newMessageId = id || Date.now().toString() + Math.random().toString(36).substring(2, 7);
        setMessages((prev) => [...prev, { id: newMessageId, role, text }]);
    }, []);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setIsAiTyping(true);
            setError(null);
            addUiMessage("assistant", "Hello! I'm PivotHire AI. How can I help you define your project needs today?");
            setIsAiTyping(false);
        } else if (!isOpen) {
            setMessages([]);
            aiResponseRef.current = "";
        }
    }, [isOpen, addUiMessage, messages.length]);

    useEffect(() => {
        const scrollableViewport = scrollAreaRef.current?.querySelector('div:first-child');
        if (scrollableViewport) {
            scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
        }
    }, [messages, isAiTyping]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isAiTyping) return;

        const userMessageText = inputValue.trim();
        addUiMessage("user", userMessageText);
        setInputValue("");
        setIsAiTyping(true);
        setError(null);
        aiResponseRef.current = "";

        const currentConversation = [...messages, { id: 'temp-user', role: 'user' as const, text: userMessageText }];
        const apiMessagesPayload = mapToApiMessages(currentConversation);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: apiMessagesPayload }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `API request failed with status ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("Could not get reader for response body.");
            }
            const decoder = new TextDecoder();
            let done = false;
            let firstChunk = true;
            let aiMessageId: string | undefined;

            while (!done) {
                const { value, done: streamDone } = await reader.read();
                done = streamDone;
                if (value) {
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n\n').filter(line => line.startsWith('data:'));

                    for (const line of lines) {
                        const content = line.substring(6);
                        if (content) {
                            aiResponseRef.current += content;
                            if (firstChunk) {
                                const newMessage = { id: Date.now().toString() + Math.random().toString(36).substring(2, 7), role: 'assistant' as const, text: aiResponseRef.current };
                                setMessages(prevMessages => [...prevMessages, newMessage]);
                                aiMessageId = newMessage.id;
                                firstChunk = false;
                            } else if (aiMessageId) {
                                setMessages(prevMessages =>
                                    prevMessages.map(msg =>
                                        msg.id === aiMessageId ? { ...msg, text: aiResponseRef.current } : msg
                                    )
                                );
                            }
                        }
                    }
                }
                if (done) {
                    setIsAiTyping(false);
                }
            }

        } catch (err: any) {
            console.error("Failed to send message or get AI reply:", err);
            setError(err.message || "Failed to connect to the AI assistant. Please try again.");
            setIsAiTyping(false);
            addUiMessage("system", `Error: ${err.message || "Could not connect to the AI."}`);
        } finally {
            if (isAiTyping) {
                setIsAiTyping(false);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl flex flex-col h-[80vh] sm:h-[calc(100vh-8rem)]">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>PivotHire AI Assistant</DialogTitle>
                    <DialogDescription>
                        Describe your project needs, and I'll help you get started.
                    </DialogDescription>
                </DialogHeader>
                <Separator className="flex-shrink-0" />
                <ScrollArea
                    className="flex-grow basis-0 min-h-0"
                    ref={scrollAreaRef}
                >
                    <div className="p-4 space-y-4">
                        {messages.map((msg) => (
                            <ChatMessage key={msg.id} sender={msg.role === 'assistant' ? 'ai' : msg.role} text={<ReactMarkdown remarkPlugins={[remarkBreaks]}>{msg.text}</ReactMarkdown>} />
                        ))}
                        {isAiTyping && (
                            <ChatMessage key="typing" sender="ai" text={
                                <div className="flex items-center space-x-1">
                                    <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-primary rounded-full animate-pulse"></span>
                                </div>
                            } />
                        )}
                    </div>
                </ScrollArea>
                {error && (
                    <div className="px-6 pt-2 flex-shrink-0">
                        <Alert variant="destructive" className="my-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </div>
                )}
                <Separator className="flex-shrink-0" />
                <DialogFooter className="pt-4 flex-shrink-0">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                        className="flex w-full items-center space-x-2"
                    >
                        <Input
                            placeholder={isAiTyping ? "AI is typing..." : "Type your message..."}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isAiTyping}
                            className="flex-1"
                            aria-label="Chat input"
                        />
                        <Button type="submit" disabled={!inputValue.trim() || isAiTyping} size="icon">
                            <SendHorizonal className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}