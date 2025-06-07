"use client";

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {ChatbotDialog} from "@/components/chatbot/chatbot-dialog";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {authClient} from "@/lib/auth-client";

const {data: session} = await authClient.getSession();

export default function DashboardComponent() {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const router = useRouter();
    const isAuthenticated = session?.user !== undefined;
    const user = session?.user || null;
    const isLoading = session === undefined;
    const [loadingMsg, setLoadingMsg] = useState("Loading dashboard...");

    console.log(session);

    useEffect(() => {
        if (isLoading) {
            setLoadingMsg("Loading dashboard...");
        }

        if (!isAuthenticated) {
            router.push('/signin');
            setLoadingMsg("Redirecting to sign in...");
        }
    }, [session]);

    const getInitials = (name?: string | null, fallback = "U") => {
        if (!name) return fallback;
        const parts = name.split(' ');
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const displayName = user?.name || "User";
    const userInitials = getInitials(displayName, user?.email?.[0]?.toUpperCase() || "P");

    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center"><p>{loadingMsg}</p></div>
        )
    }

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
                                <AvatarImage src={user.image || undefined} alt={displayName}/>
                                <AvatarFallback>{userInitials}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                                <div className="font-medium">{displayName}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                        </div>
                    )}
                    <Button variant="outline">Logout</Button>
                </div>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Welcome, {user?.name || "User"}!</CardTitle>
                    <CardDescription>Manage your projects and find the best talent.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-6">Ready to start a new project? Click the button below to describe your needs to
                        our AI assistant.</p>
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