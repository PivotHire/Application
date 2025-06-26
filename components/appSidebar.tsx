
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar"

import {
    Calendar,
    ChevronLeft,
    ChevronUp, FolderClosed,
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
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

const items = [
    {title: "Home", url: "#", icon: Home},
    {title: "Projects", url: "#", icon: FolderClosed},
    {title: "Notification", url: "#", icon: MessageSquareDot},
    {title: "Billing", url: "#", icon: Wallet},
    {title: "Settings", url: "#", icon: Settings},
];

interface SidebarProps {
    open: boolean;
}

const {data: session} = await authClient.getSession();

export default function AppSidebar(props: SidebarProps) {

    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const {toggleSidebar} = useSidebar();

    useEffect(() => {
        if (session) {
            setIsLoading(false);
        }
    }, [session]);

    const handleLogout = () => {
        authClient.signOut().then(() => {
            router.push('/signin');
        }).catch(error => {
            console.error("Logout failed:", error);
        });
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
                            {items.map((item) => (
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
                                <DropdownMenuItem>
                                    <span>Billing</span>
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