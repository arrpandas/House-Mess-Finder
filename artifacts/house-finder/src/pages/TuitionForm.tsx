import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

// Placeholder until tuition API hooks are generated from OpenAPI.
export default function TuitionForm() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const isEditing = !!params.id;
  const [submitted] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/tuition-tracker")}>
              Back
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLocation("/")}>
              House Hunting Dashboard
            </Button>
          </div>
          <h1 className="text-lg font-bold text-foreground">
            {isEditing ? "Edit Tuition" : "Add Tuition"}
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-card border rounded-xl p-6">
          <p className="text-sm text-muted-foreground">
            TuitionForm will be implemented after OpenAPI + orval regeneration.
            (This placeholder prevents routing/build errors meanwhile.)
          </p>
          {submitted && (
            <p className="text-sm mt-4 text-primary">Saved.</p>
          )}
        </div>
      </div>
    </div>
  );
}

