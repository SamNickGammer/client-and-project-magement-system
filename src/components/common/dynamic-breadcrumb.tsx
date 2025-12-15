"use client"

import { usePathname } from "next/navigation"
import React from "react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function DynamicBreadcrumb() {
    const pathname = usePathname()
    const paths = pathname === "/" ? [] : pathname.split("/").filter((item) => item !== "")

    return (
        <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                {paths.length > 0 && <BreadcrumbSeparator />}
                {paths.map((item, index) => {
                    const href = `/${paths.slice(0, index + 1).join("/")}`
                    const isLast = index === paths.length - 1
                    const title = item.charAt(0).toUpperCase() + item.slice(1)

                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{title}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
