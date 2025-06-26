
"use client";

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {ColumnType} from "kysely";
import {Separator} from "@/components/ui/separator";
import {CalendarDays, CircleDollarSign} from "lucide-react";

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
        <Card className="flex flex-col h-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg mb-2">{project.project_name}</CardTitle>
                    <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                </div>
                <CardDescription>Published on {formattedDate}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {project.project_description}
                </p>
                <div className="flex flex-wrap gap-2">
                    {project.skills_required.map(skill => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                </div>
                {(project.budget || project.timeline) && (
                    <>
                        <Separator className="my-4"/>
                        <div className="space-y-3 text-sm">
                            {project.budget && (
                                <div className="flex items-center">
                                    <CircleDollarSign className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0"/>
                                    <span className="font-semibold mr-1">Budget:</span>
                                    <span className="text-muted-foreground">{project.budget}</span>
                                </div>
                            )}
                            {project.timeline && (
                                <div className="flex items-center">
                                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0"/>
                                    <span className="font-semibold mr-1">Timeline:</span>
                                    <span className="text-muted-foreground">{project.timeline}</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
            <CardFooter>
                <Button className="w-full">Manage</Button>
            </CardFooter>
        </Card>
    );
}