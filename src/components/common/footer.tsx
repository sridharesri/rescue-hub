import { Link } from "@tanstack/react-router";
import { Container } from "@/components/common/container";
import { BRAND, PUBLIC_NAV } from "@/constants/navigation";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-muted/30">
      <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0">
          <p className="font-display text-2xl font-bold tracking-widest text-foreground">{BRAND.name}</p>
          <p className="mt-2 text-sm text-muted-foreground">{BRAND.tagline}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            In a life-threatening emergency, always contact your local emergency number first.
          </p>
        </div>

        <nav aria-label="Footer platform" className="min-w-0">
          <h2 className="eyebrow text-muted-foreground">Platform</h2>
          <ul className="mt-3 space-y-2">
            {PUBLIC_NAV.slice(1, 6).map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-sm text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Footer resources" className="min-w-0">
          <h2 className="eyebrow text-muted-foreground">Resources</h2>
          <ul className="mt-3 space-y-2">
            {PUBLIC_NAV.slice(6).map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-sm text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          <h2 className="eyebrow text-muted-foreground">Operating principle</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            AI produces recommendations only. A human authority always makes the final decision on
            dispatch and life-critical actions.
          </p>
        </div>
      </Container>
      <Container className="flex flex-col gap-2 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground">Detect. Respond. Protect. Recover.</p>
      </Container>
    </footer>
  );
}
