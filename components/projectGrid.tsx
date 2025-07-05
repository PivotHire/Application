"use client";

import styles from "@/app/styles/dashboard.module.scss";
import {ChatbotDialog} from "@/components/chatbot/chatbot-dialog";
import {authClient} from "@/lib/auth-client";
import {useCallback, useEffect, useState} from "react";
import {Project} from "@/lib/types";
import {Skeleton} from "@/components/ui/skeleton";
import {ProjectCard} from "@/components/projectCard";
import Image from "next/image";

const {data: session} = await authClient.getSession();

export default function ProjectGrid() {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const isAuthenticated = session?.user !== undefined;
    const user = session?.user || null;

    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectsError, setProjectsError] = useState<string | null>(null);

    const [projectForSearch, setProjectForSearch] = useState<Project | null>(null);

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

    const handleDialogChange = useCallback((open: boolean) => {
        setIsChatbotOpen(open);
        if (!open) {
            setProjectForSearch(null);
        }
    }, []);

    const handleFindTalent = useCallback((project: Project) => {
        setProjectForSearch(project);
        setIsChatbotOpen(true);
    }, []);

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
                    <ProjectCard key={project.id} project={project} onFindTalent={handleFindTalent}/>
                ))}
            </div>
        );
    };

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
            <div className={styles.projectsSection}>
                <h2 className={styles.projectsTitle}>Your Projects</h2>
                {renderProjectList()}
            </div>

            <ChatbotDialog
                isOpen={isChatbotOpen}
                onOpenChange={handleDialogChange}
                projectForTalentSearch={projectForSearch}
                avatarSrc={user?.image || undefined}
            />
        </div>
    );
}