import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-6">
      <Card>
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
          <CardDescription>
            The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/"
            className="min-touch-target inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back to home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
