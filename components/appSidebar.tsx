"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar"

import {
    BadgeCheck,
    Calendar,
    ChevronLeft,
    ChevronUp, FileUser, FolderClosed,
    Home,
    Inbox, MessageSquareDot,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
    Settings,
    User2, Wallet
} from "lucide-react"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import styles from '../app/styles/sidebar.module.scss';
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {authClient} from "@/lib/auth-client";
import {Skeleton} from "@/components/ui/skeleton";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useRouter} from "next/navigation";
import {atom, useAtom} from "jotai";
import {accountIdentityAtom} from "@/lib/atoms";
import {use, useEffect} from "react";

const BusinessEntries = [
    {title: "Home", url: "dashboard", icon: Home},
    {title: "Projects", url: "projects", icon: FolderClosed},
    {title: "Verification", url: "#", icon: BadgeCheck},
    {title: "Notification", url: "#", icon: MessageSquareDot},
    {title: "Billing", url: "#", icon: Wallet},
    {title: "Profile", url: "#", icon: FileUser},
];

const TalentEntries = [
    {title: "Home", url: "dashboard", icon: Home},
    {title: "Verification", url: "#", icon: BadgeCheck},
    {title: "Notification", url: "#", icon: MessageSquareDot},
    {title: "Profile", url: "/profile", icon: FileUser},
];

interface SidebarProps {
    open: boolean;
}

const {data: session} = await authClient.getSession();

export default function AppSidebar(props: SidebarProps) {

    const isLoading = session?.user === undefined;
    const router = useRouter();
    const [accountIdentity, setAccountIdentity] = useAtom(accountIdentityAtom);

    const {toggleSidebar} = useSidebar();

    const handleLogout = () => {
        authClient.signOut().then(() => {
            router.push('/signin');
        }).catch(error => {
            console.error("Logout failed:", error);
        });
    }

    const handleSwitchIdentity = () => {
        setAccountIdentity(prev => (prev === "Business" ? "Talent" : "Business"));
    };

    const menuEntries = accountIdentity === "Business" ? BusinessEntries : TalentEntries;


    const getMenuItems = () => {
        if (isLoading) {
            return (
                <>
                    <SidebarMenuItem key="Skeleton1">
                        <SidebarMenuButton asChild>
                            <a>
                                <Skeleton className="w-[24px] h-[24px]"/>
                                <span><Skeleton className="w-[96px] max-w-full h-[15px]"/></span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem key="Skeleton2">
                        <SidebarMenuButton asChild>
                            <a>
                                <Skeleton className="w-[24px] h-[24px]"/>
                                <span><Skeleton className="w-[96px] max-w-full h-[15px]"/></span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem key="Skeleton3">
                        <SidebarMenuButton asChild>
                            <a>
                                <Skeleton className="w-[24px] h-[24px]"/>
                                <span><Skeleton className="w-[96px] max-w-full h-[15px]"/></span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem key="Skeleton4">
                        <SidebarMenuButton asChild>
                            <a>
                                <Skeleton className="w-[24px] h-[24px]"/>
                                <span><Skeleton className="w-[96px] max-w-full h-[15px]"/></span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </>
            );
        }
        return (
            menuEntries.map((item) => (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                        <a href={item.url}>
                            <item.icon/>
                            <span>{item.title}</span>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))
        );
    }

    return (
        <Sidebar className={styles.sidebar}>
            <SidebarHeader/>

            <button onClick={toggleSidebar} className={styles.trigger}>
                {props.open ? <PanelLeftClose className={styles.triggerIcon}/> :
                    <PanelLeftOpen className={styles.triggerIcon}/>}
            </button>

            <SidebarContent className={styles.sidebarContent}>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {getMenuItems()}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <Avatar className={styles.avatar}>
                                        <AvatarImage src={session?.user?.image || undefined}
                                                     alt={session?.user?.name || "Avatar"}/>
                                        <AvatarFallback>{isLoading ? <Skeleton/> : <User2/>}</AvatarFallback>
                                    </Avatar>
                                    {isLoading ? <Skeleton
                                        className="w-[100px] h-[15px] rounded-sm"/> : (session?.user?.name || "Username")}
                                    <ChevronUp className="ml-auto"/>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>
                                    <span>Account</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleSwitchIdentity}>
                                    <span>Switch Identity</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout}>
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}