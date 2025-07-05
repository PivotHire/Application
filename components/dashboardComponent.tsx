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

    const handleDialogChange = useCallback((open: boolean) => {
        setIsChatbotOpen(open);
        if (!open) {

        }
    }, []);


    return (
        <div className={styles.contentContainer}>
            <header className={styles.header}>
                <div className={styles.headerLogoGroup}>
                    <Image
                        src={'/logo-light-transparent.svg'}
                        alt="PivotHire AI Logo"
                        width={200}
                        height={100}
                    />
                </div>
            </header>

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