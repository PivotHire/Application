import type {Metadata} from 'next';
import ProjectGrid from "@/components/projectGrid";

export const metadata: Metadata = {
    title: 'Projects',
};

export default function ProjectsPage() {
    return <ProjectGrid />;
}