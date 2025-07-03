"use client";

import {useState, useEffect, useRef, useCallback} from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {ScrollArea} from "@/components/ui/scroll-area";
import {ChatMessage} from "./message";
import {Separator} from "@/components/ui/separator";
import {AlertCircle, CheckCircle2, SendHorizonal} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import styles from "../../app/styles/chatbot.module.scss";
import type { Project } from "@/lib/types";

interface ChatbotDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    avatarSrc?: string;
    projectForTalentSearch?: Project | null;
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

export function ChatbotDialog({isOpen, onOpenChange, avatarSrc, projectForTalentSearch}: ChatbotDialogProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isCreateModeComplete, setIsCreateModeComplete] = useState(false);
    const [projectData, setProjectData] = useState<object | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const mode = projectForTalentSearch ? "findTalent" : "createProject";

    const addUiMessage = useCallback((role: "user" | "assistant" | "system", text: string, id?: string) => {
        const newMessageId = id || Date.now().toString() + Math.random().toString(36).substring(2, 7);
        setMessages((prev) => [...prev, {id: newMessageId, role, text}]);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(false);
            setError(null);
            setSuccessMessage(null);
            setMessages([]);

            if (mode === 'findTalent' && projectForTalentSearch) {
                addUiMessage("assistant", `Looking for talent for your project: **${projectForTalentSearch.project_name}**...`);
                runTalentSearch(projectForTalentSearch, []);
            } else {
                addUiMessage("assistant", "Hello! I'm PivotHire AI. How can I help you define your project needs today?");
                setIsCreateModeComplete(false);
                setProjectData(null);
                setIsSubmitting(false);
            }
        }
    }, [isOpen, projectForTalentSearch, mode]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);
    useEffect(() => { if (isOpen && !isLoading) { setTimeout(() => inputRef.current?.focus(), 100); } }, [isOpen, isLoading]);

    useEffect(() => {
        if (isCreateModeComplete) {
            setTimeout(
                () => {window.location.reload();},
                2000,
            );
        }
    }, [isCreateModeComplete]);

    const runTalentSearch = async (project: Project, conversationHistory: Message[]) => {
        setIsLoading(true);
        setError(null);

        const apiMessages = mapToApiMessages(conversationHistory);

        try {
            const response = await fetch('/api/chat/talents/find', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project, messages: apiMessages }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to find talents.");

            addUiMessage("assistant", data.reply || "I've analyzed the results.");

        } catch (err: any) {
            setError(err.message);
            addUiMessage("system", `Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitProject = async () => {
        if (!projectData) {
            setError("Project data is missing.");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "An unknown error occurred while publishing.");
            }
            setSuccessMessage(result.message || "Project published successfully!");
            setIsCreateModeComplete(true);
        } catch (err: any) {
            console.error("Failed to publish project:", err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading || isCreateModeComplete) return;

        const userMessageText = inputValue.trim();
        addUiMessage("user", userMessageText);
        setInputValue("");

        const currentConversation = [...messages, { id: 'temp-user', role: 'user' as const, text: userMessageText }];
        const apiMessagesPayload = mapToApiMessages(currentConversation);

        if (mode === 'findTalent' && projectForTalentSearch) {
            console.log(projectForTalentSearch);
            await runTalentSearch(projectForTalentSearch, currentConversation);
        } else {
            setIsLoading(true);
            setError(null);
            let accumulatedResponse = "";
            let aiMessageId: string | undefined;

            try {
                const response = await fetch('/api/chat/projects/create', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({messages: apiMessagesPayload}),
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
                    const {value, done: streamDone} = await reader.read();
                    done = streamDone;
                    if (value) {
                        const chunk = decoder.decode(value);
                        const events = chunk.split('\n\n').filter(event => event.startsWith('data:'));

                        for (const event of events) {
                            const eventDataString = event.substring(6);
                            try {
                                const parsedData = JSON.parse(eventDataString);

                                if (parsedData.type === 'text') {
                                    if (!aiMessageId) {
                                        const newMessage = { id: Date.now().toString(), role: 'assistant' as const, text: parsedData.value };
                                        setMessages(prev => [...prev, newMessage]);
                                        aiMessageId = newMessage.id;
                                    } else {
                                        setMessages(prev =>
                                            prev.map(msg =>
                                                msg.id === aiMessageId ? { ...msg, text: msg.text + parsedData.value } : msg
                                            )
                                        );
                                    }
                                } else if (parsedData.type === 'tool_call') {
                                    const { name, arguments: args } = parsedData.tool_call;
                                    if (name === 'submitProjectRequirements') {
                                        setProjectData(args);
                                        setIsLoading(false);
                                        addUiMessage("assistant", "Please confirm and publish your project details below.");
                                        console.log("Project data submitted:", args);
                                    }
                                } else if (parsedData.type === 'error') {
                                    setError(parsedData.value);
                                }
                            } catch (e) {
                                console.warn("Could not parse SSE event data:", eventDataString, e);
                            }
                        }

                        if (done) {
                            setIsLoading(false);
                        }
                    }
                }
            } catch (err: any) {
                console.error("Failed to send message or get AI reply:", err);
                setError(err.message || "Failed to connect to the AI assistant. Please try again.");
                addUiMessage("system", `Error: ${err.message || "Could not connect to the AI."}`);
                setIsLoading(false);
            }
            finally { setIsLoading(false); }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={styles.dialogContent}>
                <DialogHeader className={styles.header}>
                    <DialogTitle>PivotHire AI Assistant</DialogTitle>
                    <DialogDescription>
                        Describe your project needs, and I'll help you get started.
                    </DialogDescription>
                </DialogHeader>
                <Separator className={styles.separator}/>
                <ScrollArea className={styles.scrollArea}>
                    <div className={styles.messageListContainer}>
                        {messages.map((msg) => (
                            <ChatMessage
                                key={msg.id}
                                sender={msg.role === 'assistant' ? 'ai' : msg.role}
                                text={<ReactMarkdown remarkPlugins={[remarkBreaks]}>{msg.text}</ReactMarkdown>}
                                avatarSrc={avatarSrc}
                            />
                        ))}
                        {projectData && (
                            <div className={styles.summaryCard}>
                                <h3>Project Summary</h3>
                                <p>Please review the details below and click the publish button.</p>
                                <pre>{JSON.stringify(projectData, null, 2)}</pre>
                                <Button onClick={handleSubmitProject} disabled={isSubmitting || !!successMessage}>
                                    {isSubmitting ? "Publishing..." : "Confirm and Publish Project"}
                                </Button>
                            </div>
                        )}
                        <div ref={messagesEndRef}/>
                    </div>
                </ScrollArea>
                <div className={styles.msgContainer}>
                {isCreateModeComplete && successMessage && (
                        <Alert>
                            <CheckCircle2 />
                            <AlertTitle>Success!</AlertTitle>
                            <AlertDescription>{successMessage} The page will be refreshed.</AlertDescription>
                        </Alert>
                )}
                {error && (
                        <Alert variant="destructive" className={styles.alert}>
                            <AlertCircle/>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                )}
                </div>
                <Separator className={styles.separator}/>
                <DialogFooter className={styles.footer}>
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className={styles.form}>
                        <Input
                            placeholder={isCreateModeComplete ? "Review and publish project above." : (isLoading ? "AI is thinking..." : "Type your message...")}
                            value={inputValue}
                            ref={inputRef}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isLoading || isCreateModeComplete}
                            className={styles.input}
                        />
                        <Button type="submit" disabled={!inputValue.trim() || isLoading || isCreateModeComplete} className={styles.sendButton}>
                            <SendHorizonal/>
                        </Button>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}