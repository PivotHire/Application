import type {Metadata} from 'next';
import DashboardComponent from '@/components/dashboardComponent';

export const metadata: Metadata = {
    title: 'Dashboard',
};

export default function DashboardPage() {
    return <DashboardComponent />;
}