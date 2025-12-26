"use client";

import * as React from "react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useIsMobile } from "@/utils/frontend/hooks/useMobile";
import { CRMNavigationItems } from "@/utils/frontend/constant/crmNavigation";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";

export function NavigationCRM() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <NavigationMenu viewport={isMobile}>
      <NavigationMenuList className="flex-wrap">
        {CRMNavigationItems.map((item) => {
          const isActive =
            item.href === "/dashboard/crm"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <NavigationMenuItem key={item.title}>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`cursor-pointer ${isActive ? "bg-muted text-primary" : "text-muted-foreground"}`}
                  onClick={() => router.push(item.href)}
                >
                  {item.title}
                </Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
