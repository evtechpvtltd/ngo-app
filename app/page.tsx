import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Network, WifiOff, GitBranch, Radio } from "lucide-react";

const FOUNDATION_STATUS = [
  {
    title: "Security Foundation",
    description:
      "Default-deny RLS on every table, server-side authorization, centralized permission checks, and a documented threat model.",
    icon: ShieldCheck,
  },
  {
    title: "API Foundation",
    description:
      "Versioned /api/v1 contract with canonical response shape, request IDs, and Zod-validated payloads.",
    icon: Network,
  },
  {
    title: "PWA Foundation",
    description:
      "Installable manifest, a versioned service worker with an explicit update lifecycle, and safe-area-aware layout.",
    icon: Radio,
  },
  {
    title: "Offline Architecture",
    description:
      "Typed IndexedDB mutation queue with idempotency keys and status tracking, ready for feature-level sync handlers.",
    icon: WifiOff,
  },
  {
    title: "Open Source",
    description:
      "Contributor docs, issue/PR templates, CI gates, and a documented (pending) license decision.",
    icon: GitBranch,
  },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3 text-center">
        <Badge variant="secondary" className="mx-auto">
          v0.0.1 · Foundation Release
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Bhoirwadi Sanskritik Association
        </h1>
        <p className="text-balance text-muted-foreground">
          Open Source Community Platform
        </p>
      </header>

      <section aria-labelledby="status-heading" className="flex flex-col gap-4">
        <h2 id="status-heading" className="sr-only">
          Foundation status
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FOUNDATION_STATUS.map(({ title, description, icon: Icon }) => (
            <Card key={title}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <CardTitle className="text-base">{title}</CardTitle>
                </div>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <footer className="text-center text-sm text-muted-foreground">
        <p>
          This release establishes the platform&rsquo;s architecture.
          Community-facing features (gallery, videos, reviews, livestream,
          payments) arrive in subsequent releases — see{" "}
          <code className="rounded bg-muted px-1 py-0.5">CHANGELOG.md</code>.
        </p>
      </footer>
    </div>
  );
}
