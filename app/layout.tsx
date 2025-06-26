import type { Metadata } from "next";
import "./globals.css";

import { Montserrat } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

const montserrat = Montserrat({
    subsets: ['latin'],
    variable: '--font-montserrat',
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        template: '%s | PivotHire AI',
        default: 'PivotHire AI - Revolutionary Freelancing Platform',
    },
    description: 'PivotHire AI is building a high-trust network where quality-driven companies and skilled freelance professionals collaborate with confidence.',
    keywords: ['startup', 'tech', 'hiring', 'labor market', 'HR', 'AI', 'freelancing', 'job matching'],
    authors: [{name: 'Kevin Zhong'}, {name: 'Richard Liu'}, {name: 'Konrad Pan'}],
    creator: 'PivotHire AI',
    publisher: 'PivotHire AI',
    openGraph: {
        title: 'PivotHire AI - Revolutionary Freelancing Platform',
        description: 'PivotHire AI is building a high-trust network where quality-driven companies and skilled freelance professionals collaborate with confidence.',
        url: 'https://app.pivothire.tech/',
        siteName: 'PivotHire AI',
        images: [
            {
                url: 'https://www.pivothire.tech/og-image-light(1200x630).png',
                width: 1200,
                height: 630,
                alt: 'PivotHire AI',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
    },
    icons: {
        icon: {
            url: '/favicon.png',
            type: 'image/png',
            sizes: '96x96',
        },
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${montserrat.variable} ${GeistSans.variable} ${GeistMono.variable}`}
        >
        <body>
        {children}
        </body>
        </html>
    );
}