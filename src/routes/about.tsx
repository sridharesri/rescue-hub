import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, HeartHandshake, Radio, ShieldCheck, Siren, Users } from "lucide-react";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { PublicLayout } from "@/layouts/public-layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About DISASTRA — Disaster Intelligence Platform" },
      {
        name: "description",
        content:
          "DISASTRA connects citizens, authorities, NGOs, rescue teams and volunteers on one coordinated disaster response platform.",
      },
      { property: "og:title", content: "About DISASTRA" },
      {
        property: "og:description",
        content: "One coordinated platform for citizens, authorities, NGOs, rescue teams and volunteers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const PILLARS = [
  {
    icon: Siren,
    title: "Detect",
    body: "Citizens report incidents with a precise location, severity and impact estimate. Every report lands in a single verification queue instead of scattered phone calls.",
  },
  {
    icon: ShieldCheck,
    title: "Respond",
    body: "Responders verify reports, promote them to tracked events, publish alerts and keep the live map, shelters and hospital capacity accurate.",
  },
  {
    icon: HeartHandshake,
    title: "Protect",
    body: "The public side stays open to everyone — no login needed to find the nearest open shelter, an emergency-capable hospital or the current alert level.",
  },
  {
    icon: Activity,
    title: "Recover",
    body: "Resolved events keep their full timeline in the archive, so recovery outcomes and response speed can be reviewed after the emergency ends.",
  },
];

const AUDIENCES = [
  {
    icon: Users,
    title: "Citizens",
    body: "Report what you see, follow verified events and find shelter, medical care and safety guidance.",
  },
  {
    icon: Radio,
    title: "Responders & authorities",
    body: "Triage incoming reports, update event status and severity, log field notes and publish public alerts.",
  },
  {
    icon: HeartHandshake,
    title: "NGOs & volunteers",
    body: "See where relief is needed, which organisations already cover an area and where capacity is running out.",
  },
];

function AboutPage() {
  return (
    <PublicLayout>
      <Container className="py-10 sm:py-14">
        <PageHeader
          eyebrow="Mission"
          title="About DISASTRA"
          description="Detect. Respond. Protect. Recover. One coordinated platform for every responder."
        />

        <div className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-foreground">Why DISASTRA exists</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            In the first hours of a disaster the problem is rarely a lack of people willing to help —
            it is that nobody shares the same picture of what is happening. Reports arrive over phone,
            radio and social media, shelters fill without anyone knowing, and hospitals are sent
            patients they cannot take. DISASTRA puts one verified operational picture in front of
            citizens and responders at the same time.
          </p>
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground">How it works</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {PILLARS.map((pillar) => (
              <li key={pillar.title} className="rounded-xl border border-border bg-card p-5">
                <pillar.icon aria-hidden="true" className="size-5 text-primary" />
                <h3 className="mt-3 text-lg font-semibold text-foreground">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground">Who it is for</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {AUDIENCES.map((item) => (
              <li key={item.title} className="rounded-xl border border-border bg-card p-5">
                <item.icon aria-hidden="true" className="size-5 text-primary" />
                <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 flex flex-col gap-4 rounded-2xl border border-border bg-accent/40 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Seen something on the ground?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Reports go straight to the verification queue and can be published within minutes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/report">Report an incident</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/safety">Safety guidance</Link>
            </Button>
          </div>
        </section>
      </Container>
    </PublicLayout>
  );
}
