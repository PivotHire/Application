import type { Metadata } from 'next';
import DashboardComponent from './DashboardComponent';

export const metadata: Metadata = {
    title: 'Dashboard',
};

export default function DashboardPage() {
    return (
        <div>
            <DashboardComponent />
        </div>
    );
}