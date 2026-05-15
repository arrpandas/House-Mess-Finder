import React, { createContext, useContext, useState, ReactNode } from "react";
import { Listing } from "@workspace/api-client-react";

interface CompareContextType {
  selectedListings: Listing[];
  toggleListing: (listing: Listing) => void;
  clearSelection: () => void;
  removeListing: (id: string) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selectedListings, setSelectedListings] = useState<Listing[]>([]);

  const toggleListing = (listing: Listing) => {
    setSelectedListings((prev) => {
      const exists = prev.find((l) => l.id === listing.id);
      if (exists) {
        return prev.filter((l) => l.id !== listing.id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, listing];
    });
  };

  const removeListing = (id: string) => {
    setSelectedListings((prev) => prev.filter((l) => l.id !== id));
  };

  const clearSelection = () => {
    setSelectedListings([]);
  };

  return (
    <CompareContext.Provider value={{ selectedListings, toggleListing, clearSelection, removeListing }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
