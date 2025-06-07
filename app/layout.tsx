import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { AuthProvider } from "@/components/auth-provider";
// import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: {
        template: '%s | PivotHire AI',
        default: 'PivotHire AI - Revolutionary Freelancing Platform',
    },

    description: 'The AI-driven freelancing platform for hiring match.',

    keywords: ['startup', 'tech', 'hiring', 'labor market', 'HR', 'AI', 'freelancing', 'job matching'],

    authors: [{name: 'Kevin Zhong'}, {name: 'Richard Liu'}, {name: 'Konrad Pan'}],

    creator: 'PivotHire AI',

    publisher: 'PivotHire AI',

    openGraph: {
        title: 'PivotHire AI - Revolutionary Freelancing Platform',
        description: 'The AI-driven freelancing platform for hiring match.',
        url: 'https://demo.pivothire.tech/',
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
        <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
        {children}
        </body>
        </html>
    );
}