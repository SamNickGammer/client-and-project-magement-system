import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/common/theme-toggle";

import { DynamicBreadcrumb } from "@/components/common/dynamic-breadcrumb";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { SessionTimer } from "@/components/common/session-timer";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-env";

export async function SiteHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  let expiry = 0;

  if (token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      expiry = (payload.exp as number) * 1000;
    } catch {
      // Ignore invalid tokens
    }
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <DynamicBreadcrumb />
        <div className="ml-auto flex items-center gap-2">
          {expiry > 0 && <SessionTimer expiry={expiry} />}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
