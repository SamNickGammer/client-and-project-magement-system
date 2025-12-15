"use client"

import { usePathname } from "next/navigation"
import * as React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"

export function DashboardSidebarProvider({
    children,
    style,
    ...props
}: React.ComponentProps<typeof SidebarProvider>) {
    const pathname = usePathname()
    return (
        <SidebarProvider
            defaultOpen={pathname === "/dashboard"}
            style={style}
            {...props}
        >
            {children}
        </SidebarProvider>
    )
}
