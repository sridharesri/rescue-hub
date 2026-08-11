import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Globe, HeartHandshake, Mail, Phone } from "lucide-react";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ListSkeleton } from "@/components/common/loading-skeletons";
import { PublicLayout } from "@/layouts/public-layout";
import { ngosQuery } from "@/lib/queries";

export const Route = createFileRoute("/ngos")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(ngosQuery());
  },
  head: () => ({
    meta: [
      { title: "Relief Organisations — DISASTRA" },
      {
        name: "description",
        content:
          "Verified NGOs and relief organisations active in the response network, with focus areas and contacts.",
      },
      { property: "og:title", content: "Relief Organisations — DISASTRA" },
      {
        property: "og:description",
        content: "Verified NGOs active in the response network, with focus areas and contacts.",
      },
    ],
  }),
  component: NgosPage,
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
        <ErrorState title="Couldn't load organisations" description={error.message} />
      </Container>
    </PublicLayout>
  ),
});

function NgosPage() {
  const { data } = useSuspenseQuery(ngosQuery());

  return (
    <PublicLayout>
      <Container className="py-10 sm:py-14">
        <PageHeader
          eyebrow="Response partners"
          title="NGOs"
          description="Relief organisations coordinating on the ground, verified partners listed first."
        />

        {data.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={HeartHandshake}
            title="No organisations listed"
            description="No relief organisation has joined the network yet."
          />
        ) : (
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {data.map((ngo) => (
              <li
                key={ngo.id}
                className="flex h-full flex-col rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-foreground">{ngo.name}</h2>
                  {ngo.verified ? (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Verified
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{ngo.description}</p>

                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {ngo.focus_areas.map((area) => (
                    <li
                      key={area}
                      className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {area}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-wrap gap-4 pt-5 text-sm">
                  {ngo.contact_phone ? (
                    <a
                      href={`tel:${ngo.contact_phone}`}
                      className="flex items-center gap-1.5 font-medium text-primary hover:underline"
                    >
                      <Phone aria-hidden="true" className="size-3.5" />
                      {ngo.contact_phone}
                    </a>
                  ) : null}
                  {ngo.contact_email ? (
                    <a
                      href={`mailto:${ngo.contact_email}`}
                      className="flex items-center gap-1.5 font-medium text-primary hover:underline"
                    >
                      <Mail aria-hidden="true" className="size-3.5" />
                      Email
                    </a>
                  ) : null}
                  {ngo.website ? (
                    <a
                      href={ngo.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center gap-1.5 font-medium text-primary hover:underline"
                    >
                      <Globe aria-hidden="true" className="size-3.5" />
                      Website
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </PublicLayout>
  );
}
