
"use client";

import {Footer} from "@/components/footer";
import styles from "../styles/mainLayout.module.scss";
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import AppSidebar from "@/components/appSidebar";
import {useEffect, useState} from "react";
import {authClient} from "@/lib/auth-client";

export default function MainLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
    return (
        <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <AppSidebar open={sidebarOpen} />
            <div className={styles.pageWrapper}>

                <main className={styles.mainContent}>
                    {children}
                </main>

                <Footer/>
            </div>
        </SidebarProvider>

    )
        ;
}