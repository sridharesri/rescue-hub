import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShieldAlert, Siren } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { AccountMenu } from "@/components/common/account-menu";
import { Container } from "@/components/common/container";
import { BRAND, PUBLIC_NAV } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex min-w-0 items-center gap-2", className)} aria-label={`${BRAND.name} home`}>
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
        <ShieldAlert aria-hidden="true" className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-display text-xl font-bold leading-none tracking-widest text-foreground">
          {BRAND.name}
        </span>
        <span className="hidden text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
          {BRAND.tagline}
        </span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <Container className="flex h-16 items-center gap-4">
        <BrandMark />

        <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 lg:flex">
          {PUBLIC_NAV.slice(0, 7).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === item.to && "bg-accent text-accent-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <ThemeToggle />
          <AccountMenu />
          <Button asChild variant="emergency" size="sm" className="hidden sm:inline-flex">
            <Link to="/report">
              <Siren aria-hidden="true" />
              Report
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="font-display tracking-widest">{BRAND.name}</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="mt-6 grid gap-1">
                {PUBLIC_NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === item.to && "bg-accent text-accent-foreground",
                    )}
                  >
                    <item.icon aria-hidden="true" className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                ))}
              </nav>
              <Button asChild variant="emergency" className="mt-6 w-full" onClick={() => setOpen(false)}>
                <Link to="/report">
                  <Siren aria-hidden="true" />
                  Report disaster
                </Link>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
