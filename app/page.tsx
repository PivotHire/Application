"use client";

import { useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                router.replace('/dashboard');
            } else {
                router.replace('/signin');
            }
        }
    }, [isLoading, isAuthenticated, router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );
}