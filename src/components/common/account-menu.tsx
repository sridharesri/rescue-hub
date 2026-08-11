import { Link, useNavigate } from "@tanstack/react-router";
import { ClipboardList, LayoutDashboard, LogOut, ShieldCheck, User, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

export function AccountMenu() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link to="/auth">Sign in</Link>
      </Button>
    );
  }

  const isResponder = role === "responder" || role === "admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Account menu">
          <User aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">
          <span className="block truncate text-sm">{user.email}</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">{role}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/my-reports">
            <ClipboardList aria-hidden="true" className="size-4" />
            My reports
          </Link>
        </DropdownMenuItem>
        {isResponder ? (
          <>
            <DropdownMenuItem asChild>
              <Link to="/queue">
                <ShieldCheck aria-hidden="true" className="size-4" />
                Verification queue
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/operations">
                <LayoutDashboard aria-hidden="true" className="size-4" />
                Operations console
              </Link>
            </DropdownMenuItem>
          </>
        ) : null}
        {role === "admin" ? (
          <DropdownMenuItem asChild>
            <Link to="/admin">
              <UserCog aria-hidden="true" className="size-4" />
              Team & roles
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void signOut().then(() => navigate({ to: "/" }));
          }}
        >
          <LogOut aria-hidden="true" className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
