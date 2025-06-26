"use client";

import {useEffect, useState} from "react";
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

    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectsError, setProjectsError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            setProjectsLoading(true);
            setProjectsError(null);
            try {
                const response = await fetch('/api/projects');
                if (!response.ok) {
                    throw new Error("Failed to fetch projects.");
                }
                const data = await response.json();
                setProjects(data);
            } catch (error: any) {
                setProjectsError(error.message);
            } finally {
                setProjectsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchProjects();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/signin');
            }
        }
    }, [session]);

    const renderProjectList = () => {
        if (projectsLoading) {
            return (
                <div className={styles.projectGrid}>
                    {Array.from({length: 3}).map((_, index) => (
                        <div key={index} className={styles.skeletonCard}>
                            <Skeleton className="h-[125px] w-full rounded-xl"/>
                            <div className={styles.skeletonContent}>
                                <Skeleton className="h-4 w-full"/>
                                <Skeleton className="h-4 w-full"/>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (projectsError) {
            return <p className={styles.errorText}>Error: {projectsError}</p>;
        }

        if (projects.length === 0) {
            return <p className={styles.infoText}>You haven't published any projects yet. Click "Publish New Task" to
                get started!</p>;
        }

        return (
            <div className={styles.projectGrid}>
                {projects.map(project => (
                    <ProjectCard key={project.id} project={project}/>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.dashboardContainer}>
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
                    <Button onClick={() => setIsChatbotOpen(true)} size="lg" disabled={!isAuthenticated}>
                        Publish New Task
                    </Button>
                </CardContent>
            </Card>

            <div className={styles.projectsSection}>
                <h2 className={styles.projectsTitle}>Your Projects</h2>
                {renderProjectList()}
            </div>

            <ChatbotDialog
                isOpen={isChatbotOpen}
                onOpenChange={setIsChatbotOpen}
                avatarSrc={user?.image || undefined}
            />
        </div>
    );
}