import { createFileRoute, Link } from "@tanstack/react-router";
import { CloudRain, Flame, LifeBuoy, Mountain, Waves, Wind } from "lucide-react";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { PublicLayout } from "@/layouts/public-layout";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Safety Information — DISASTRA" },
      {
        name: "description",
        content:
          "Preparedness checklists and safety guidance for floods, earthquakes, fires, cyclones and more.",
      },
      { property: "og:title", content: "Safety Information — DISASTRA" },
      {
        property: "og:description",
        content: "Preparedness checklists and safety guidance for major disaster types.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SafetyPage,
});

const KIT = [
  "Drinking water for three days (4 litres per person, per day)",
  "Non-perishable food, and a manual can opener",
  "Torch, spare batteries and a power bank",
  "First-aid kit and a week of any prescription medicine",
  "Copies of ID, insurance and bank documents in a waterproof bag",
  "Whistle, dust masks, and sturdy closed shoes",
  "Cash in small notes — card terminals fail during outages",
  "Charged phone with the emergency numbers saved offline",
];

const GUIDES = [
  {
    icon: Waves,
    type: "Flood",
    before: [
      "Know whether your street is in a low-lying zone and where the nearest high ground is.",
      "Move documents, electronics and medicine above expected water level.",
      "Keep the fuel tank at least half full and the go-bag by the door.",
    ],
    during: [
      "Never walk or drive through moving water — 15 cm can knock you down, 60 cm floats a car.",
      "Switch off electricity at the mains before water reaches sockets, if it is safe to reach.",
      "Move upward, not outward, and signal from a window rather than swimming out.",
    ],
    after: [
      "Assume flood water is contaminated: boil drinking water until authorities clear it.",
      "Photograph damage before cleaning up, and discard soaked food and medicine.",
    ],
  },
  {
    icon: Mountain,
    type: "Earthquake",
    before: [
      "Anchor tall furniture, water heaters and heavy shelves to the wall.",
      "Agree a family meeting point outside the building and an out-of-area contact.",
    ],
    during: [
      "Drop, cover and hold on under a sturdy table; stay away from windows.",
      "If in bed, stay there and protect your head with a pillow.",
      "If outdoors, move to open ground away from buildings, trees and power lines.",
    ],
    after: [
      "Expect aftershocks and leave the building only when shaking stops.",
      "Check for gas smell — if present, do not use switches or flames, and evacuate.",
    ],
  },
  {
    icon: Wind,
    type: "Cyclone / storm",
    before: [
      "Secure loose outdoor items and reinforce or shutter windows.",
      "Charge devices and fill containers with clean water before landfall.",
    ],
    during: [
      "Shelter in an interior room on the lowest safe floor, away from glass.",
      "Do not go outside during the calm eye of the storm — winds return suddenly.",
    ],
    after: [
      "Stay clear of fallen power lines and standing water hiding debris.",
      "Wait for the official all-clear before returning to a damaged home.",
    ],
  },
  {
    icon: Flame,
    type: "Fire",
    before: [
      "Test smoke alarms monthly and keep two escape routes from every room.",
      "Clear dry vegetation and fuel within a defensible space around the building.",
    ],
    during: [
      "Get out and stay out — never re-enter for belongings.",
      "Stay low under the smoke and check doors with the back of your hand before opening.",
      "If your clothing catches fire: stop, drop and roll.",
    ],
    after: [
      "Seek medical review for smoke inhalation even if you feel fine.",
      "Do not re-enter a fire-damaged structure until it is declared safe.",
    ],
  },
  {
    icon: CloudRain,
    type: "Landslide",
    before: [
      "Watch for new cracks in ground, walls or paths after prolonged rain.",
      "Know the evacuation route that leads sideways out of the slide path, not downhill.",
    ],
    during: [
      "Move out of the path immediately; a rumbling sound means debris is already moving.",
      "If escape is impossible, curl into a tight ball and protect your head.",
    ],
    after: [
      "Stay away from the slide area — further slides often follow the first.",
      "Report broken utility lines to the authorities before anyone re-enters.",
    ],
  },
];

function SafetyPage() {
  return (
    <PublicLayout>
      <Container className="py-10 sm:py-14">
        <PageHeader
          eyebrow="Preparedness"
          title="Safety Information"
          description="Before, during and after guidance for floods, earthquakes, fires, cyclones and landslides."
        />

        <section className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <LifeBuoy aria-hidden="true" className="size-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">72-hour emergency kit</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Assume outside help may take three days to reach you. Pack once, check every six months.
          </p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {KIT.map((item) => (
              <li
                key={item}
                className="flex gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground"
              >
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground">Guidance by disaster type</h2>
          <Accordion type="single" collapsible className="mt-4">
            {GUIDES.map((guide) => (
              <AccordionItem key={guide.type} value={guide.type}>
                <AccordionTrigger className="text-left">
                  <span className="flex items-center gap-2">
                    <guide.icon aria-hidden="true" className="size-4 text-primary" />
                    {guide.type}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-5 pt-1 md:grid-cols-3">
                    {(
                      [
                        ["Before", guide.before],
                        ["During", guide.during],
                        ["After", guide.after],
                      ] as const
                    ).map(([label, items]) => (
                      <div key={label}>
                        <h3 className="eyebrow text-primary">{label}</h3>
                        <ul className="mt-2 space-y-2">
                          {items.map((item) => (
                            <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                              <span
                                aria-hidden="true"
                                className="mt-2 size-1.5 shrink-0 rounded-full bg-border"
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="mt-12 flex flex-col gap-4 rounded-2xl border border-border bg-accent/40 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Already in danger?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Contact local emergency services first, then log the incident so responders can see it.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/shelters">Find a shelter</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/report">Report an incident</Link>
            </Button>
          </div>
        </section>
      </Container>
    </PublicLayout>
  );
}
