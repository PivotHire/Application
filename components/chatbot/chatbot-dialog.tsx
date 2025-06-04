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
import { submitProjectRequirements } from "@/lib/actions";

interface ChatbotDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

type Message = {
    id: string;
    sender: "user" | "ai";
    text: string | React.ReactNode;
};

const initialQuestions = [
    { id: "projectName", question: "Great! What's the name of your project or task?" },
    { id: "projectDescription", question: "Could you briefly describe the project?" },
    { id: "skillsRequired", question: "What specific skills are you looking for in a freelancer? (e.g., React, Python, Graphic Design)" },
    { id: "budget", question: "Do you have an estimated budget or budget range for this task? (e.g., $500, $1000-$1500, Not sure yet)" },
    { id: "timeline", question: "What's the desired timeline or deadline for this project?" },
    { id: "additionalInfo", question: "Is there any other important information or specific requirements you'd like to share?" },
];

export function ChatbotDialog({ isOpen, onOpenChange }: ChatbotDialogProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [collectedData, setCollectedData] = useState<Record<string, string>>({});
    const [isCompleted, setIsCompleted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const addMessage = useCallback((sender: "user" | "ai", text: string | React.ReactNode) => {
        const newMessageId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
        setMessages((prev) => [...prev, { id: newMessageId, sender, text }]);
    }, []);
    useEffect(() => {
        if (isOpen) {
            console.log("ChatbotDialog: isOpen is true. Initializing chat state.");
            setCollectedData({});
            setCurrentQuestionIndex(0);
            setIsCompleted(false);
            setIsSubmitting(false);
            setMessages([
                { id: 'welcome-' + Date.now(), sender: 'ai', text: "Hello! I'm the PivotHire AI assistant. I'll help you define your project needs. Let's get started!" }
            ]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || isCompleted) return;

        const lastMessage = messages[messages.length - 1];

        if (currentQuestionIndex < initialQuestions.length) {
            const currentQuestionText = initialQuestions[currentQuestionIndex].question;
            if (messages.length > 0 && lastMessage?.text !== currentQuestionText) {
                if (
                    (currentQuestionIndex === 0 && lastMessage?.sender === 'ai' && messages.length === 1) ||
                    (lastMessage?.sender === 'user')
                ) {
                    const timer = setTimeout(() => {
                        console.log(`ChatbotDialog: Asking question index ${currentQuestionIndex}: "${currentQuestionText}"`);
                        addMessage("ai", currentQuestionText);
                    }, lastMessage?.sender === 'user' ? 700 : 500);
                    return () => clearTimeout(timer);
                }
            }
        } else if (currentQuestionIndex >= initialQuestions.length && Object.keys(collectedData).length >= initialQuestions.length) {
            const summaryAlreadyShown = messages.some(msg => msg.id === 'summary-message');
            if (!summaryAlreadyShown) {
                console.log("ChatbotDialog: All questions answered, preparing summary.");
                const summaryText = (
                    <div>
                        <p className="font-semibold">Thanks! Here's a summary of your requirements:</p>
                        <ul className="my-2 list-disc pl-5">
                            {Object.entries(collectedData).map(([key, value]) => {
                                const questionLabel = initialQuestions.find(q => q.id === key)?.question.split(/[\s?:]+/)[0] || key;
                                return <li key={key}><strong>{questionLabel}:</strong> {value}</li>
                            })}
                        </ul>
                        <p>If this looks correct, I'll submit it. Otherwise, you can close this and start over.</p>
                    </div>
                );
                setMessages((prev) => [...prev, { id: 'summary-message', sender: 'ai', text: summaryText }]);
                setIsCompleted(true);
            }
        }
    }, [isOpen, currentQuestionIndex, messages, isCompleted, collectedData, initialQuestions, addMessage]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollableViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (scrollableViewport) {
                setTimeout(() => {
                    scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
                }, 50);
            }
        }
    }, [messages]);

    const handleUserInput = async () => {
        if (!inputValue.trim() || isCompleted || isSubmitting || currentQuestionIndex >= initialQuestions.length) {
            return;
        }

        addMessage("user", inputValue);
        const currentQuestionId = initialQuestions[currentQuestionIndex].id;

        setCollectedData((prev) => ({ ...prev, [currentQuestionId]: inputValue.trim() }));
        setInputValue("");

        setCurrentQuestionIndex((prev) => prev + 1);
    };

    const handleSubmitRequirements = async () => {
        if (!isCompleted || isSubmitting) return;
        setIsSubmitting(true);
        addMessage("ai", "Submitting your requirements...");

        try {
            const result = await submitProjectRequirements(collectedData);
            console.log("Submission result:", result);
            addMessage("ai", `Successfully submitted! Our backend AI will now process this. Reference ID: ${result.taskId || 'N/A'}`);
            setTimeout(() => onOpenChange(false), 3000);
        } catch (error) {
            console.error("Submission error:", error);
            addMessage("ai", "Sorry, there was an error submitting your requirements. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDialogClose = (openState: boolean) => {
        if (!openState) {
            console.log("ChatbotDialog: Dialog closing. Resetting chat state for next open.");
        }
        onOpenChange(openState);
    }


    return (
        <Dialog open={isOpen} onOpenChange={handleDialogClose}>
            <DialogContent className="max-w-2xl flex flex-col h-[80vh] sm:h-[calc(100vh-4rem)]">
                <DialogHeader>
                    <DialogTitle>PivotHire AI Assistant</DialogTitle>
                    <DialogDescription>
                        Let's define your project needs. Answer the questions below.
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <ScrollArea className="flex-grow p-1 pr-4 -mr-2" ref={scrollAreaRef}>
                    <div className="space-y-4 py-4 px-1">
                        {messages.map((msg) => (
                            <ChatMessage key={msg.id} sender={msg.sender} text={msg.text} />
                        ))}
                    </div>
                </ScrollArea>
                <Separator />
                <DialogFooter className="pt-4 sm:justify-between">
                    {isCompleted ? (
                        <div className="flex w-full flex-col sm:flex-row gap-2">
                            <Button onClick={() => {
                                setIsCompleted(false);
                                setCurrentQuestionIndex(0);
                                setCollectedData({});
                                setMessages(prev => prev.slice(0,1));
                            }} variant="outline" className="flex-1 order-2 sm:order-1">
                                Start Over
                            </Button>
                            <Button onClick={handleSubmitRequirements} disabled={isSubmitting} className="flex-1 order-1 sm:order-2">
                                {isSubmitting ? "Submitting..." : "Confirm & Submit"}
                            </Button>
                        </div>
                    ) : (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUserInput();
                            }}
                            className="flex w-full items-center space-x-2"
                        >
                            <Input
                                placeholder="Type your answer..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isCompleted || currentQuestionIndex >= initialQuestions.length || messages[messages.length-1]?.sender === 'ai'} // Disable if AI is "typing"
                                className="flex-1"
                                aria-label="Chat input"
                            />
                            <Button type="submit" disabled={!inputValue.trim() || isCompleted || currentQuestionIndex >= initialQuestions.length || messages[messages.length-1]?.sender === 'ai'}>
                                Send
                            </Button>
                        </form>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}