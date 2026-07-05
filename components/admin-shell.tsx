"use client";

import {
  IconBook,
  IconDashboard,
  IconPackages,
  IconReceipt,
  IconSettings,
  IconShieldLock,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

type AdminShellProps = {
  children: React.ReactNode;
};

type NavigationItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  match: (pathname: string) => boolean;
};

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: IconDashboard,
    description: "Vue globale des KPIs",
    match: (pathname) => pathname === "/admin",
  },
  {
    title: "Commandes",
    href: "/admin/orders",
    icon: IconReceipt,
    description: "Suivi et traitement des paiements",
    match: (pathname) => pathname.startsWith("/admin/orders"),
  },
  {
    title: "Offres",
    href: "/admin/offers",
    icon: IconPackages,
    description: "Catalogue et offres Stripe",
    match: (pathname) => pathname.startsWith("/admin/offers"),
  },
  {
    title: "Livre",
    href: "/admin/book",
    icon: IconBook,
    description: "Contenu éditorial et assets",
    match: (pathname) => pathname.startsWith("/admin/book"),
  },
  {
    title: "Paramètres",
    href: "/admin/settings",
    icon: IconSettings,
    description: "Configuration technique",
    match: (pathname) => pathname.startsWith("/admin/settings"),
  },
];

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const activeItem =
    navigationItems.find((item) => item.match(pathname)) ?? navigationItems[0];

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen>
        <Sidebar variant="inset" collapsible="icon">
          <SidebarHeader className="px-3 pt-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/admin" />}
                  size="lg"
                  className="h-12 rounded-xl bg-sidebar-primary/10 text-sidebar-foreground"
                >
                  <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary/20 text-sidebar-primary">
                    <IconShieldLock className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left">
                    <span className="truncate text-sm font-semibold">
                      Admin Panel
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarSeparator />

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={item.match(pathname)}
                        tooltip={item.title}
                        className="h-10 rounded-xl"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="bg-[radial-gradient(circle_at_top,oklch(0.98_0.015_90),transparent_45%)]">
          <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl">
            <div className="flex h-14 items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <div>
                  <p className="text-sm font-semibold tracking-tight">
                    {activeItem.title}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="rounded-full px-2.5">
                Back-office
              </Badge>
            </div>
          </header>

          <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 md:px-8">
            <section className="w-full rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur-sm md:p-6">
              {children}
            </section>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
