"use client";

import {useCallback, useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {ChatbotDialog} from "@/components/chatbot/chatbot-dialog";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {authClient} from "@/lib/auth-client";
import {Project} from "@/lib/types";
import {Skeleton} from "@/components/ui/skeleton";
import {ProjectCard} from "@/components/projectCard";
import styles from "../app/styles/dashboard.module.scss";

const {data: session} = await authClient.getSession();

export default function DashboardComponent() {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const router = useRouter();
    const isAuthenticated = session?.user !== undefined;
    const user = session?.user || null;
    const isLoading = session === undefined;

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/signin');
            }
        }
    }, [isLoading]);

    useEffect(() => {
        const fetchCurrentAccountType = async () => {
            if (isAuthenticated) {
                try {
                    const response = await fetch('/api/account');
                    // console.log("Response from /api/account:", response.json());
                    if (!response.ok) {
                        throw new Error('Internal server error when fetching account type.');
                    }
                    const accountType = await response.json();
                    if (accountType == 1) {
                        localStorage.setItem('accountIdentity', "Business");
                    } else if (accountType == 2) {
                        localStorage.setItem('accountIdentity', "Talent");
                    } else if (accountType == 3) {
                        localStorage.setItem('accountIdentity', "Admin");
                    }
                    if (accountType >= 0 && accountType <= 4) {
                        localStorage.setItem('accountType', accountType.toString());
                    } else {
                        localStorage.removeItem('accountType');
                        throw new Error('Invalid account type.');
                    }
                } catch (error) {
                    console.error("Failed to fetch account type:", error);
                }
            }
        };
        fetchCurrentAccountType();
    }, [isAuthenticated]);

    const handleDialogChange = useCallback((open: boolean) => {
        setIsChatbotOpen(open);
    }, []);

    return (
        <div className={styles.contentContainer}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex">Welcome, {!isAuthenticated ? <Skeleton className="w-[100px] h-[15px] rounded-sm" /> : (user?.name || "User")}!</CardTitle>
                    <CardDescription>Manage your projects and find the best talent.</CardDescription>
                </CardHeader>
                <CardContent className={styles.welcomeCardContent}>
                    <p>Ready to start a new project? Click the button below to describe your needs to
                        our AI assistant.</p>
                    <Button onClick={() => {
                        setIsChatbotOpen(true);
                    }} size="lg" disabled={!isAuthenticated}>
                        Publish New Task
                    </Button>
                </CardContent>
            </Card>

            <ChatbotDialog
                isOpen={isChatbotOpen}
                onOpenChange={handleDialogChange}
                projectForTalentSearch={null}
                avatarSrc={user?.image || undefined}
            />
        </div>
    );
}