import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ShieldX, UserCog } from "lucide-react";

import { AppLayout } from "@/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { getTeam, grantRoleFn, revokeRoleFn } from "@/lib/admin.functions";

type RoleName = "citizen" | "responder" | "admin";
const ASSIGNABLE: RoleName[] = ["responder", "admin"];

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Team & roles — DISASTRA" },
      {
        name: "description",
        content:
          "Administrator console to grant or revoke responder and administrator access for DISASTRA accounts.",
      },
      { property: "og:title", content: "Team & roles — DISASTRA" },
      {
        property: "og:description",
        content: "Manage who can verify reports and run the operations console.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { role, loading } = useAuth();

  if (!loading && role !== "admin") {
    return (
      <AppLayout title="Team & roles">
        <EmptyState
          icon={ShieldX}
          title="Administrator access required"
          description="Only administrators can change who holds responder or administrator access."
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Team & roles">
      <div className="mx-auto max-w-4xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Access control</CardTitle>
            <CardDescription>
              Responders can verify citizen reports and update live operations. Administrators can
              additionally broadcast alerts and manage this list.
            </CardDescription>
          </CardHeader>
        </Card>
        <TeamList />
      </div>
    </AppLayout>
  );
}

function TeamList() {
  const queryClient = useQueryClient();
  const fetchTeam = useServerFn(getTeam);
  const grant = useServerFn(grantRoleFn);
  const revoke = useServerFn(revokeRoleFn);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "team"],
    queryFn: () => fetchTeam(),
  });

  const [pending, setPending] = React.useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (vars: { user_id: string; role: RoleName; action: "grant" | "revoke" }) => {
      const payload = { data: { user_id: vars.user_id, role: vars.role } };
      return vars.action === "grant" ? grant(payload) : revoke(payload);
    },
    onMutate: (vars) => setPending(`${vars.user_id}:${vars.role}`),
    onSettled: () => setPending(null),
    onSuccess: (_result, vars) => {
      toast.success(vars.action === "grant" ? `Granted ${vars.role} access` : `Removed ${vars.role} access`);
      void queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
    },
    onError: (err: Error) => toast.error(err.message || "Could not update role"),
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading accounts…</p>;
  }

  if (error) {
    return (
      <EmptyState
        icon={ShieldX}
        title="Could not load accounts"
        description={(error as Error).message}
      />
    );
  }

  if (!data?.length) {
    return <EmptyState icon={UserCog} title="No accounts yet" description="Accounts appear here after the first sign-up." />;
  }

  return (
    <div className="grid gap-3">
      {data.map((member) => (
        <Card key={member.user_id}>
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{member.email}</p>
              <p className="text-xs text-muted-foreground">
                Joined {new Date(member.created_at).toLocaleDateString()}
                {member.last_sign_in_at
                  ? ` · Last seen ${new Date(member.last_sign_in_at).toLocaleDateString()}`
                  : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {member.roles.map((r) => (
                  <Badge key={r} variant={r === "admin" ? "default" : "secondary"}>
                    {r}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {ASSIGNABLE.map((r) => {
                const has = member.roles.includes(r);
                const key = `${member.user_id}:${r}`;
                return (
                  <Button
                    key={r}
                    size="sm"
                    variant={has ? "outline" : "secondary"}
                    disabled={pending === key}
                    onClick={() =>
                      mutation.mutate({
                        user_id: member.user_id,
                        role: r,
                        action: has ? "revoke" : "grant",
                      })
                    }
                  >
                    {has ? `Remove ${r}` : `Make ${r}`}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
