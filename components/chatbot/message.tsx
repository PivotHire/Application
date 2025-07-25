"use client";

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {cn} from "@/lib/utils";

interface MessageProps {
    sender: "user" | "ai" | "system";
    text: string | React.ReactNode;
    avatarSrc?: string;
}

export function ChatMessage({sender, text, avatarSrc}: MessageProps) {
    const isUser = sender === "user";
    return (
        <div
            className={cn(
                "mb-4 flex items-start gap-3",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            {!isUser && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={"/placeholder-bot.jpg"} alt="AI Avatar"/>
                    <AvatarFallback>AI</AvatarFallback>
                </Avatar>
            )}
            <div
                className={cn(
                    "max-w-[80%] rounded-lg p-3 text-sm shadow-sm chat-message-content",
                    isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                )}
            >
                {text}
            </div>
            {isUser && (
                <Avatar className="h-8 w-8">
                    {avatarSrc ? <AvatarImage src={avatarSrc} alt="User Avatar"/> :
                        <AvatarFallback>U</AvatarFallback>}
                </Avatar>
            )}
        </div>
    );
}