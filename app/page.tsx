"use client";

import { useEffect } from 'react';
// import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

const { data: session } = await authClient.getSession();

export default function HomePage() {
    const router = useRouter();
    const isAuthenticated = session?.user !== undefined;
    const isLoading = session === undefined;

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