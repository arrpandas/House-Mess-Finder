import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Placeholder until OpenAPI + orval regeneration adds tuition API hooks.
export default function TuitionTracker() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/" )}>
              Back
            </Button>
            <h1 className="text-lg font-bold text-foreground">Tuition Tracker</h1>
          </div>
          <div className="w-24" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Card className="p-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            Tuition Tracker UI will be implemented after OpenAPI + orval regeneration.
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/tuition-tracker/new">Add Tuition</Link>
            </Button>
          </div>
        </Card>

        <div className="space-y-3">
          <p className="text-sm font-medium">Recent tuitions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

