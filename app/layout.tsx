import type { Metadata } from "next";
import "./globals.css";

import { Montserrat, Geist, Geist_Mono } from 'next/font/google';

const montserrat = Montserrat({
    subsets: ['latin'],
    variable: '--font-montserrat',
    display: 'swap',
});

const geist = Geist({
    subsets: ['latin'],
    variable: '--font-geist-sans',
    display: 'swap',
});

const geistMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-geist-mono',
    display: 'swap',
});


export const metadata: Metadata = {
    title: {
        template: '%s | PivotHire',
        default: 'PivotHire - Revolutionary Project Delivery Platform',
    },
    description: 'PivotHire is building a high-trust network where quality-driven companies and skilled freelance professionals collaborate with confidence.',
    keywords: ['startup', 'tech', 'hiring', 'labor market', 'HR', 'AI', 'freelancing', 'job matching'],
    authors: [{name: 'Kevin Zhong'}, {name: 'Richard Liu'}, {name: 'Tony Qiu'}],
    creator: 'PivotHire',
    publisher: 'PivotHire',
    openGraph: {
        title: 'PivotHire - Revolutionary Project Delivery Platform',
        description: 'PivotHire is building a high-trust network where quality-driven companies and skilled freelance professionals collaborate with confidence.',
        url: 'https://app.pivothire.tech/',
        siteName: 'PivotHire',
        images: [
            {
                url: 'https://www.pivothire.tech/og-image-light(1200x630).png',
                width: 1200,
                height: 630,
                alt: 'PivotHire Logo',
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
            className={`${montserrat.variable} ${geist.variable} ${geistMono.variable}`}
        >
        <body className="antialiased md:subpixel-antialiased">
        {children}
        </body>
        </html>
    );
}