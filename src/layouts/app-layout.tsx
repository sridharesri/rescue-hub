import { Link, useRouterState } from "@tanstack/react-router";
import { Siren } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { AccountMenu } from "@/components/common/account-menu";
import { ADMIN_NAV, BRAND, RESPONDER_NAV, WORKSPACE_NAV } from "@/constants/navigation";
import { useAuth } from "@/hooks/use-auth";

function WorkspaceSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role } = useAuth();
  const items =
    role === "admin"
      ? [...WORKSPACE_NAV, ...RESPONDER_NAV, ...ADMIN_NAV]
      : role === "responder"
        ? [...WORKSPACE_NAV, ...RESPONDER_NAV]
        : WORKSPACE_NAV;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-display tracking-widest">{BRAND.name}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={pathname === item.to} tooltip={item.label}>
                    <Link to={item.to} className="flex items-center gap-2">
                      <item.icon aria-hidden="true" className="size-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

/** Shell for signed-in workspaces. Role-aware navigation lands in Phase 4. */
export function AppLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <WorkspaceSidebar />
        <SidebarInset>
          <header className="grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-3">
            <SidebarTrigger />
            <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />
              <AccountMenu />
              <Button asChild variant="emergency" size="sm">
                <Link to="/report">
                  <Siren aria-hidden="true" />
                  <span className="hidden sm:inline">Report</span>
                </Link>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
