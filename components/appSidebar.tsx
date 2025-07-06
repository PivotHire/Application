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
    const accountIdentity = localStorage.getItem('accountIdentity') || "Business";

    const {toggleSidebar} = useSidebar();

    const handleLogout = () => {
        authClient.signOut().then(() => {
            router.push('/signin');
        }).catch(error => {
            console.error("Logout failed:", error);
        });
    }

    const handleSwitchIdentity = () => {
        console.log(accountIdentity);
        if (accountIdentity === "Business") {
            localStorage.setItem('accountIdentity', "Talent");
        } else if (accountIdentity === "Talent") {
            localStorage.setItem('accountIdentity', "Business");
        }
        if (window.location.pathname === "/dashboard") {
            window.location.reload();
        } else {
            router.push("/dashboard");
        }
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
                            {(accountIdentity === "Business" ? BusinessEntries : TalentEntries).map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon/>
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
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
                                    {isLoading ? <Skeleton className="w-[100px] h-[15px] rounded-sm" /> : (session?.user?.name || "Username")}
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