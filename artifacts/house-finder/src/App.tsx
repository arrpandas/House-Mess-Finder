import React from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CompareProvider } from "@/lib/compare-context";

import Dashboard from "@/pages/Dashboard";
import ListingForm from "@/pages/ListingForm";
import ListingDetail from "@/pages/ListingDetail";
import Compare from "@/pages/Compare";
import NotFound from "@/pages/not-found";

import TuitionTracker from "@/pages/TuitionTracker";
import TuitionForm from "@/pages/TuitionForm";



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/tuition-tracker" component={TuitionTracker} />
      <Route path="/listings/new" component={ListingForm} />
      <Route path="/listings/:id" component={ListingDetail} />
      <Route path="/listings/:id/edit" component={ListingForm} />
      <Route path="/compare" component={Compare} />
      <Route component={NotFound} />
    </Switch>
  );
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CompareProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <div className="min-h-[100dvh] flex flex-col">
              <main className="flex-1">
                <Router />
              </main>
            </div>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </CompareProvider>
    </QueryClientProvider>
  );
}

export default App;
