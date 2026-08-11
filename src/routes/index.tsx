import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Activity, ArrowRight, Building2, Map, Radar, ShieldCheck, Siren, Sparkles, Users } from "lucide-react";

import heroImage from "@/assets/hero-operations.jpg";
import { PublicLayout } from "@/layouts/public-layout";
import { Container } from "@/components/common/container";
import { ErrorState } from "@/components/common/error-state";
import { ListSkeleton } from "@/components/common/loading-skeletons";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/constants/navigation";
import { SeverityBadge, StatusBadge } from "@/components/common/status-badge";
import { overviewQuery, disastersQuery } from "@/lib/queries";
import { compactNumber, relativeTime, severityRank } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DISASTRA — Disaster Intelligence. Faster Response." },
      {
        name: "description",
        content:
          "DISASTRA is an AI-assisted disaster management platform linking citizens, authorities, NGOs, rescue teams and volunteers for faster, safer response.",
      },
      { property: "og:title", content: "DISASTRA — Disaster Intelligence. Faster Response." },
      {
        property: "og:description",
        content: "Detect. Respond. Protect. Recover. One coordinated disaster response platform.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(overviewQuery());
    context.queryClient.ensureQueryData(disastersQuery());
  },
  component: Index,
  pendingComponent: () => (
    <PublicLayout>
      <Container className="py-16">
        <ListSkeleton rows={5} />
      </Container>
    </PublicLayout>
  ),
  errorComponent: ({ error }) => (
    <PublicLayout>
      <Container className="py-16">
        <ErrorState title="Couldn't load the live snapshot" description={error.message} />
      </Container>
    </PublicLayout>
  ),
  notFoundComponent: () => (
    <PublicLayout>
      <Container className="py-16">
        <ErrorState title="Page not found" description="This page doesn't exist." />
      </Container>
    </PublicLayout>
  ),
});


function LiveSnapshot() {
  const { data: overview } = useSuspenseQuery(overviewQuery());
  const stats = overview.stats;
  const { data: disasters } = useSuspenseQuery(disastersQuery());
  const latest = [...disasters].sort((a, b) => severityRank(a) - severityRank(b)).slice(0, 3);

  const tiles = [
    { label: "Active disasters", value: String(stats.activeDisasters) },
    { label: "Critical events", value: String(stats.criticalDisasters) },
    { label: "Live alerts", value: String(stats.liveAlerts) },
    { label: "People affected", value: compactNumber(stats.peopleAffected) },
    {
      label: "Shelter space free",
      value: compactNumber(Math.max(0, stats.shelterCapacity - stats.shelterOccupancy)),
    },
    { label: "Hospital beds free", value: compactNumber(stats.availableBeds) },
  ];

  return (
    <section aria-labelledby="live-heading" className="border-b border-border bg-muted/30">
      <Container className="py-14 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-primary">Live now</p>
            <h2 id="live-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Current operational picture
            </h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/disasters">
              All disasters
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <dl className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-lg border border-border bg-card p-4">
              <dt className="text-xs text-muted-foreground">{tile.label}</dt>
              <dd className="mt-1 text-2xl font-bold text-foreground">{tile.value}</dd>
            </div>
          ))}
        </dl>

        {latest.length > 0 ? (
          <ul className="mt-8 grid gap-4 lg:grid-cols-3">
            {latest.map((item) => (
              <li key={item.id}>
                <Link
                  to="/disasters/$id"
                  params={{ id: item.id }}
                  className="block h-full rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={item.severity} />
                    <StatusBadge status={item.status} />
                    <span className="ml-auto text-xs text-muted-foreground">
                      {relativeTime(item.occurred_at)}
                    </span>
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.area}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </section>
  );
}

const PILLARS = [
  {
    icon: Radar,
    title: "Detect",
    body: "Citizen reports, authority feeds and AI triage surface emerging incidents early.",
  },
  {
    icon: Siren,
    title: "Respond",
    body: "Rescue teams, NGOs and volunteers coordinate on one shared operational picture.",
  },
  {
    icon: ShieldCheck,
    title: "Protect",
    body: "Verified alerts, shelters and hospitals guide people to safety in real time.",
  },
  {
    icon: Activity,
    title: "Recover",
    body: "Relief operations, resource tracking and post-event analysis close the loop.",
  },
];

const ROLES = [
  { icon: Users, title: "Citizens", body: "Report incidents, find shelter and request emergency help." },
  { icon: ShieldCheck, title: "Authorities", body: "Verify incidents, dispatch teams and issue official alerts." },
  { icon: Building2, title: "NGOs", body: "Run relief operations, manage volunteers and track resources." },
  { icon: Siren, title: "Rescue teams", body: "Receive assignments and update rescue status from the field." },
];

function Index() {
  return (
    <PublicLayout>
      <section className="relative isolate overflow-hidden border-b border-border">
        <img
          src={heroImage}
          alt="Aerial view of emergency rescue vehicles responding on a flooded urban road at dusk"
          width={1600}
          height={1008}
          className="absolute inset-0 size-full object-cover"
        />
        <div
          className="absolute inset-0 bg-linear-to-r from-background via-background/90 to-background/60 dark:from-background dark:via-background/85 dark:to-background/45"
          aria-hidden="true"
        />
        <div className="grid-field absolute inset-0 opacity-40" aria-hidden="true" />

        <Container className="relative py-20 sm:py-28">
          <p className="eyebrow text-primary">{BRAND.tagline}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {BRAND.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            DISASTRA connects citizens, authorities, NGOs, rescue teams and volunteers on a single
            coordinated platform — so critical information reaches the right responder first.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="emergency" size="lg">
              <Link to="/disasters">
                <Siren aria-hidden="true" />
                Report disaster
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/map">
                <Map aria-hidden="true" />
                View live map
              </Link>
            </Button>
          </div>

          <p className="mt-8 max-w-xl rounded-md border border-border bg-card/80 px-4 py-3 text-xs text-muted-foreground backdrop-blur">
            In a life-threatening emergency, contact your local emergency number immediately.
            DISASTRA supports coordination — it does not replace emergency services.
          </p>
        </Container>
      </section>

      <LiveSnapshot />

      <section aria-labelledby="pillars-heading">
        <Container className="py-16 sm:py-20">
          <h2 id="pillars-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Four stages of every emergency
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p) => (
              <Card key={p.title} className="h-full">
                <CardHeader>
                  <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                    <p.icon aria-hidden="true" className="size-5" />
                  </span>
                  <CardTitle className="mt-3">{p.title}</CardTitle>
                  <CardDescription>{p.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="roles-heading" className="border-y border-border bg-muted/30">
        <Container className="py-16 sm:py-20">
          <h2 id="roles-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Built for every responder
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Each role gets a purpose-built workspace with only the actions and data it is authorised
            to use.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r) => (
              <Card key={r.title} className="h-full">
                <CardHeader className="flex-row items-start gap-3 space-y-0">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground">
                    <r.icon aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <CardTitle className="text-base">{r.title}</CardTitle>
                    <CardDescription>{r.body}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="ai-heading">
        <Container className="py-16 sm:py-20">
          <div className="grid gap-6 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-elevate)] sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <p className="eyebrow inline-flex items-center gap-2 text-primary">
                <Sparkles aria-hidden="true" className="size-3.5" />
                AI intelligence
              </p>
              <h2 id="ai-heading" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                AI Recommendation — Human Authority Makes Final Decision.
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                DISASTRA uses AI to classify reports, suggest severity, score priority and detect
                duplicates. Every recommendation is labelled, auditable, and never dispatches teams
                or takes life-critical action on its own.
              </p>
            </div>
            <Button asChild variant="outline" size="lg" className="justify-self-start">
              <Link to="/about">
                How it works
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </PublicLayout>
  );
}
