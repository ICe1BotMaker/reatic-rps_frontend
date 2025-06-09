"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { ChartPieIcon, LeafIcon, UserIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { match } from "@/shared/utils/url-match";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    if (match(pathname, "/regex:^[a-z]+$/admin")) {
        return children;
    }

    const items = [
        {
            title: "인사이트",
            url: "/ko/admin/insight",
            icon: ChartPieIcon,
        },
        {
            title: "회원 관리",
            url: "/ko/admin/user",
            icon: UserIcon,
        },
        {
            title: "시즌 관리",
            url: "/ko/admin/season",
            icon: LeafIcon,
        },
    ];

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>관리자 메뉴</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

            {children}
        </SidebarProvider>
    );
}
