
"use client";

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {CalendarDays, CircleDollarSign} from "lucide-react";
import styles from '../app/styles/projectCard.module.scss';

export type Project = {
    id: number;
    user_id: string | undefined;
    project_name: string;
    project_description: string;
    skills_required: string[];
    budget: string | null;
    timeline: string | null;
    status: string;
    created_at: Date;
};

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({project}: ProjectCardProps) {
    const formattedDate = new Date(project.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Card className={styles.card}>
            <CardHeader className={styles.header}>
                <div className={styles.headerTop}>
                    <CardTitle className={styles.title}>{project.project_name}</CardTitle>
                    <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                </div>
                <CardDescription>Published on {formattedDate}</CardDescription>
            </CardHeader>
            <CardContent className={styles.content}>
                <p className={styles.description}>
                    {project.project_description}
                </p>
                <div className={styles.skillsContainer}>
                    {project.skills_required.map(skill => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                </div>
                {(project.budget || project.timeline) && (
                    <>
                        <Separator className={styles.metadataSeparator}/>
                        <div className={styles.metadataContainer}>
                            {project.budget && (
                                <div className={styles.metadataRow}>
                                    <CircleDollarSign className={styles.icon}/>
                                    <span className={styles.label}>Budget:</span>
                                    <span className={styles.value}>{project.budget}</span>
                                </div>
                            )}
                            {project.timeline && (
                                <div className={styles.metadataRow}>
                                    <CalendarDays className={styles.icon}/>
                                    <span className={styles.label}>Timeline:</span>
                                    <span className={styles.value}>{project.timeline}</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
            <CardFooter className={styles.footer}>
                <Button variant="secondary">Manage</Button>
                <Button>Find Talent</Button>
            </CardFooter>
        </Card>
    );
}