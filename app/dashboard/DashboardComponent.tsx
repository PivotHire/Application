"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatbotDialog } from "@/components/chatbot/chatbot-dialog";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function DashboardComponent() {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const { user, logout, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><p>Loading dashboard...</p></div>;
    }

    if (!isAuthenticated) {
        router.push('/signin');
        return <div className="flex h-screen items-center justify-center"><p>Redirecting to sign in...</p></div>;
    }

    const getInitials = (name?: string | null, fallback = "U") => {
        if (!name) return fallback;
        const parts = name.split(' ');
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const displayName = user?.nick_name || user?.username || "User";
    const userInitials = getInitials(displayName, user?.email?.[0]?.toUpperCase() || "P");


    return (
        <div className="container mx-auto p-2 md:p-4">
            <header className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-x-3">
                    <Image
                        src={'/logo-light-transparent.png'}
                        alt="PivotHire AI Logo"
                        width={200}
                        height={100}
                    />
                </div>
                <div className="flex items-center gap-4">
                    {user && (
                        <div className="flex items-center gap-2">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user.avatar_url || undefined} alt={displayName} />
                                <AvatarFallback>{userInitials}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                                <div className="font-medium">{displayName}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                        </div>
                    )}
                    <Button onClick={logout} variant="outline">Logout</Button>
                </div>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Welcome, {user?.nick_name || user?.username || "User"}!</CardTitle>
                    <CardDescription>Manage your projects and find the best AI talent.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-6">Ready to start a new project? Click the button below to describe your needs to our AI assistant.</p>
                    <Button onClick={() => setIsChatbotOpen(true)} size="lg">
                        Publish New Task
                    </Button>
                </CardContent>
            </Card>

            <ChatbotDialog
                isOpen={isChatbotOpen}
                onOpenChange={setIsChatbotOpen}
            />
        </div>
    );
}