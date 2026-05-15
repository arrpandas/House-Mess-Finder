import { useLocation } from "wouter";
import { useCompare } from "@/lib/compare-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X, Home, Bath, Users, Ruler, MapPin, Phone, CheckCircle, XCircle } from "lucide-react";

function totalBills(bills: Record<string, number | null | undefined>): number {
  let sum = 0;
  for (const v of Object.values(bills)) {
    if (typeof v === "number") sum += v;
  }
  return sum;
}

const CATEGORY_COLORS: Record<string, string> = {
  Sublet: "bg-blue-100 text-blue-800",
  Mess: "bg-purple-100 text-purple-800",
  Flat: "bg-green-100 text-green-800",
  Seat: "bg-orange-100 text-orange-800",
};

interface RowProps {
  label: string;
  values: (string | number | boolean | null | undefined)[];
}

function Row({ label, values }: RowProps) {
  return (
    <tr className="border-b last:border-0">
      <td className="py-3 px-4 text-sm font-medium text-muted-foreground bg-muted/30 w-36 min-w-[9rem]">
        {label}
      </td>
      {values.map((val, i) => (
        <td key={i} className="py-3 px-4 text-sm text-foreground text-center align-top">
          {val === null || val === undefined || val === "" ? (
            <span className="text-muted-foreground">—</span>
          ) : typeof val === "boolean" ? (
            val ? (
              <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
            ) : (
              <XCircle className="w-4 h-4 text-muted-foreground mx-auto" />
            )
          ) : (
            String(val)
          )}
        </td>
      ))}
    </tr>
  );
}

export default function Compare() {
  const [, setLocation] = useLocation();
  const { selectedListings, removeListing, clearSelection } = useCompare();

  if (selectedListings.length < 2) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Select at least 2 listings to compare.</p>
        <Button onClick={() => setLocation("/")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")} data-testid="button-back-compare">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h1 className="text-lg font-bold text-foreground">Compare Listings</h1>
          </div>
          <Button variant="outline" size="sm" onClick={clearSelection} data-testid="button-clear-compare">
            Clear All
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 overflow-x-auto">
        <table className="w-full border-collapse border rounded-xl overflow-hidden bg-card shadow-sm" data-testid="table-compare">
          <thead>
            <tr className="border-b">
              <th className="py-3 px-4 text-left text-sm font-semibold text-muted-foreground bg-muted/30 w-36">
                Feature
              </th>
              {selectedListings.map((listing) => (
                <th key={listing.id} className="py-3 px-4 text-center min-w-[180px]">
                  <div className="flex flex-col items-center gap-2">
                    {/* Image */}
                    <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted mx-auto">
                      {listing.images?.[0] ? (
                        <img
                          src={`/api/storage${listing.images[0]}`}
                          alt={listing.location}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-6 h-6 text-muted-foreground opacity-40" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-foreground leading-tight">
                      {listing.location}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        CATEGORY_COLORS[listing.category] ?? "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {listing.category}
                    </span>
                    <button
                      onClick={() => removeListing(listing.id)}
                      data-testid={`button-remove-compare-${listing.id}`}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row
              label="Rent"
              values={selectedListings.map((l) => `৳${Number(l.rent).toLocaleString()}/mo${l.isNegotiable ? " (Neg.)" : ""}`)}
            />
            <Row
              label="Bills Total"
              values={selectedListings.map((l) => {
                const bills = (l.bills ?? {}) as Record<string, number | null | undefined>;
                const t = totalBills(bills);
                return t > 0 ? `৳${t.toLocaleString()}` : null;
              })}
            />
            <Row
              label="Total Cost"
              values={selectedListings.map((l) => {
                const bills = (l.bills ?? {}) as Record<string, number | null | undefined>;
                const t = totalBills(bills);
                return `৳${(Number(l.rent) + t).toLocaleString()}`;
              })}
            />
            <Row label="Bathroom" values={selectedListings.map((l) => l.bathroom)} />
            <Row label="Roommates" values={selectedListings.map((l) => l.roommates != null ? `${l.roommates}` : null)} />
            <Row label="Distance" values={selectedListings.map((l) => l.distance)} />
            <Row
              label="Electricity"
              values={selectedListings.map((l) => {
                const bills = (l.bills ?? {}) as Record<string, number | null | undefined>;
                return bills.electricity != null ? `৳${bills.electricity}` : null;
              })}
            />
            <Row
              label="WiFi"
              values={selectedListings.map((l) => {
                const bills = (l.bills ?? {}) as Record<string, number | null | undefined>;
                return bills.wifi != null ? `৳${bills.wifi}` : null;
              })}
            />
            <Row
              label="Maid"
              values={selectedListings.map((l) => {
                const bills = (l.bills ?? {}) as Record<string, number | null | undefined>;
                return bills.maid != null ? `৳${bills.maid}` : null;
              })}
            />
            <Row
              label="Waste"
              values={selectedListings.map((l) => {
                const bills = (l.bills ?? {}) as Record<string, number | null | undefined>;
                return bills.waste != null ? `৳${bills.waste}` : null;
              })}
            />
            <Row label="Negotiable" values={selectedListings.map((l) => l.isNegotiable)} />
            <Row
              label="Pros"
              values={selectedListings.map((l) =>
                l.pros?.length ? l.pros.join(", ") : null
              )}
            />
            <Row
              label="Cons"
              values={selectedListings.map((l) =>
                l.cons?.length ? l.cons.join(", ") : null
              )}
            />
            <Row
              label="Contact"
              values={selectedListings.map((l) =>
                l.contactInfo ? `${l.contactInfo.name} — ${l.contactInfo.mobile}` : null
              )}
            />
            <Row
              label="Map"
              values={selectedListings.map((l) =>
                l.googleMapUrl ? "Available" : null
              )}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}
