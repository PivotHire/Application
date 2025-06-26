import type {Metadata} from 'next';
import DashboardComponent from '../../../components/dashboardComponent';
import {authClient} from "@/lib/auth-client";

export const metadata: Metadata = {
    title: 'Dashboard',
};

export default function DashboardPage() {
    return <DashboardComponent />;
}