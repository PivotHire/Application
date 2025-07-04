"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import the router hook

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/dashboard');
    }, [router]);
}