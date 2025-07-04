// components/chatbot/chatbot-dialog.tsx
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
import {AlertCircle, CheckCircle2, SendHorizonal, Loader2} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import styles from "../../app/styles/chatbot.module.scss";
import type {Project} from "@/lib/types";

// 1. 更新 Props 接口以接受项目数据和回调函数
interface ChatbotDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    avatarSrc?: string;
    projectForTalentSearch?: Project | null;
    onProjectCreated?: () => void; // 用于刷新仪表盘的回调
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

export function ChatbotDialog({
                                  isOpen,
                                  onOpenChange,
                                  avatarSrc,
                                  projectForTalentSearch,
                                  onProjectCreated,
                              }: ChatbotDialogProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // "Create Project" 模式所需的状态
    const [isCreateModeComplete, setIsCreateModeComplete] = useState(false);
    const [projectData, setProjectData] = useState<object | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 根据传入的 props 决定当前模式
    const mode = projectForTalentSearch ? "findTalent" : "createProject";

    const addUiMessage = useCallback((role: "user" | "assistant" | "system", text: string, id?: string) => {
        const newMessageId = id || Date.now().toString() + Math.random().toString(36).substring(2, 7);
        setMessages((prev) => [...prev, {id: newMessageId, role, text}]);
    }, []);

    // 2. 更新的 useEffect，用于处理两种模式的初始化
    useEffect(() => {
        if (isOpen) {
            // 重置通用状态
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

    // 自动滚动和自动聚焦的 useEffect (保持不变)
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages, isLoading]);
    useEffect(() => {
        if (isOpen && !isLoading && !isCreateModeComplete) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, isLoading, isCreateModeComplete]);

    // 3. 统一的流式数据处理函数
    const processStream = async (response: Response) => {
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API request failed with status ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Could not get reader for response body.");

        const decoder = new TextDecoder();
        let buffer = "";
        let aiMessageId: string | undefined;
        let accumulatedResponse = "";

        while (true) {
            const {value, done} = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, {stream: true});
            let boundaryIndex = buffer.indexOf('\n\n');

            while (boundaryIndex !== -1) {
                const eventString = buffer.substring(0, boundaryIndex);
                buffer = buffer.substring(boundaryIndex + 2);

                if (eventString.startsWith('data:')) {
                    const eventDataString = eventString.substring(6).trim();
                    if (eventDataString === '[DONE]') continue;

                    try {
                        const parsedData = JSON.parse(eventDataString);
                        if (parsedData.type === 'text') {
                            accumulatedResponse += parsedData.value;
                            if (!aiMessageId) {
                                const newMessage = {
                                    id: Date.now().toString(),
                                    role: 'assistant' as const,
                                    text: accumulatedResponse
                                };
                                setMessages(prev => [...prev, newMessage]);
                                aiMessageId = newMessage.id;
                            } else {
                                setMessages(prev =>
                                    prev.map(msg => msg.id === aiMessageId ? {...msg, text: accumulatedResponse} : msg)
                                );
                            }
                        } else if (parsedData.type === 'tool_call') {
                            const {name, arguments: args} = parsedData.tool_call;
                            if (name === 'submitProjectRequirements') {
                                setProjectData(args);
                                setIsCreateModeComplete(true);
                                addUiMessage("assistant", "Please review the summarized project details below and click 'Publish' to finalize.");
                            }
                        } else if (parsedData.type === 'error') {
                            setError(parsedData.value);
                        }
                    } catch (e) {
                        console.warn("Could not parse SSE event data:", eventDataString, e);
                    }
                }
                boundaryIndex = buffer.indexOf('\n\n');
            }
        }
    };

    // 'findTalent' 模式的专属函数
    const runTalentSearch = async (project: Project, conversationHistory: Message[]) => {
        setIsLoading(true);
        setError(null);
        const apiMessages = mapToApiMessages(conversationHistory);
        try {
            const response = await fetch('/api/chat/talents/find', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({project, messages: apiMessages}),
            });
            // 注意：这里我们假设 /api/talents/find 也被修改为流式返回
            await processStream(response);
        } catch (err: any) {
            setError(err.message);
            addUiMessage("system", `Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // 'createProject' 模式的提交函数
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
            setTimeout(() => onOpenChange(false), 500);
            setIsCreateModeComplete(true);
        } catch (err: any) {
            console.error("Failed to publish project:", err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 主发送消息处理函数
    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading || isCreateModeComplete) return;

        const userMessageText = inputValue.trim();
        addUiMessage("user", userMessageText);
        setInputValue("");
        const currentConversation = [...messages, {id: 'temp-user', role: 'user' as const, text: userMessageText}];

        if (mode === 'findTalent' && projectForTalentSearch) {
            await runTalentSearch(projectForTalentSearch, currentConversation);
        } else {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/chat/projects/create', { // 原来的 /api/chat/projects/create 路径不标准，已修正为 /api/chat
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({messages: mapToApiMessages(currentConversation)}),
                });
                await processStream(response);
            } catch (err: any) {
                setError(err.message || "An error occurred.");
                addUiMessage("system", `Error: ${err.message || "Could not connect."}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={styles.dialogContent}>
                <DialogHeader className={styles.header}>
                    <DialogTitle>{mode === 'findTalent' ? 'Find Talent' : 'PivotHire AI Assistant'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'findTalent' ? `Getting recommendations for "${projectForTalentSearch?.project_name}"` : "Describe your project needs to get started."}
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
                            <CheckCircle2/>
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
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }} className={styles.form}>
                        <Input
                            placeholder={isCreateModeComplete ? "Review and publish project above." : (isLoading ? "AI is thinking..." : "Type your message...")}
                            value={inputValue}
                            ref={inputRef}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isLoading || isCreateModeComplete}
                            className={styles.input}
                        />
                        <Button type="submit" disabled={!inputValue.trim() || isLoading || isCreateModeComplete}
                                className={styles.sendButton}>
                            <SendHorizonal/>
                        </Button>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}