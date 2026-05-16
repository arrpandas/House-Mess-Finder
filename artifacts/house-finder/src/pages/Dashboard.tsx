import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  useListListings,
  useGetListingsSummary,
  getListListingsQueryKey,
  useDeleteListing,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCompare } from "@/lib/compare-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  ArrowUpDown,
  Plus,
  GitCompare,
  Trash2,
  Bath,
  Ruler,
  Users,
  Home,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Layers,
  Sofa,
  Clock,
} from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  Sublet: "bg-blue-100 text-blue-800",
  Mess: "bg-purple-100 text-purple-800",
  Flat: "bg-green-100 text-green-800",
  Seat: "bg-orange-100 text-orange-800",
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "rent_asc", label: "Rent: Low to High" },
  { value: "rent_desc", label: "Rent: High to Low" },
  { value: "distance", label: "Distance" },
];

const CATEGORIES = ["All", "Sublet", "Mess", "Flat", "Seat"];

function totalBills(bills: Record<string, number | null | undefined>): number {
  let sum = 0;
  for (const v of Object.values(bills)) {
    if (typeof v === "number") sum += v;
  }
  return sum;
}

const FURNISHED_COLORS: Record<string, string> = {
  "Unfurnished": "bg-gray-100 text-gray-700",
  "Semi-furnished": "bg-yellow-100 text-yellow-800",
  "Fully furnished": "bg-teal-100 text-teal-800",
};

export default function Dashboard() {
  const [category, setCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [, setLocation] = useLocation();
  const { selectedListings, toggleListing, clearSelection } = useCompare();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const params = {
    ...(category !== "All" ? { category } : {}),
    sortBy: sortBy as "newest" | "rent_asc" | "rent_desc" | "distance",
  };

  const { data: listings, isLoading } = useListListings(params, {
    query: { queryKey: getListListingsQueryKey(params) },
  });

  const { data: summary } = useGetListingsSummary();

  const deleteMutation = useDeleteListing({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListListingsQueryKey() });
        toast({ title: "Listing deleted" });
      },
    },
  });

  const selectedIds = new Set(selectedListings.map((l) => l.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">House Hunting Tracker</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/tuition-tracker">
              <Button variant="outline" size="sm" data-testid="button-tuition-tracker">
                Tuition Tracker
              </Button>
            </Link>
            <Link href="/listings/new">
              <Button data-testid="button-add-listing">
                <Plus className="w-4 h-4 mr-2" />
                Add Listing
              </Button>
            </Link>
          </div>

        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border rounded-lg p-4" data-testid="stat-total">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Home className="w-4 h-4" /> Total Listings
              </div>
              <p className="text-2xl font-bold text-foreground">{summary.total}</p>
            </div>
            <div className="bg-card border rounded-lg p-4" data-testid="stat-avg-rent">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <DollarSign className="w-4 h-4" /> Avg Rent
              </div>
              <p className="text-2xl font-bold text-foreground">
                {summary.avgRent ? `৳${Math.round(summary.avgRent).toLocaleString()}` : "—"}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4" data-testid="stat-min-rent">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <TrendingDown className="w-4 h-4" /> Min Rent
              </div>
              <p className="text-2xl font-bold text-foreground">
                {summary.minRent ? `৳${Number(summary.minRent).toLocaleString()}` : "—"}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4" data-testid="stat-max-rent">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <TrendingUp className="w-4 h-4" /> Max Rent
              </div>
              <p className="text-2xl font-bold text-foreground">
                {summary.maxRent ? `৳${Number(summary.maxRent).toLocaleString()}` : "—"}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                data-testid={`filter-category-${cat.toLowerCase()}`}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48" data-testid="select-sort">
                <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing) => {
              const bills = (listing.bills ?? {}) as Record<string, number | null | undefined>;
              const billsTotal = totalBills(bills);
              const imgSrc = listing.images?.[0]
                ? `/api/storage${listing.images[0]}`
                : null;
              const isSelected = selectedIds.has(listing.id);

              return (
                <div
                  key={listing.id}
                  data-testid={`card-listing-${listing.id}`}
                  className={`bg-card border rounded-xl overflow-hidden transition-shadow hover:shadow-md ${
                    isSelected ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {/* Image */}
                  <div
                    className="h-44 bg-muted cursor-pointer relative"
                    onClick={() => setLocation(`/listings/${listing.id}`)}
                  >
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={listing.location}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Home className="w-12 h-12 opacity-30" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          CATEGORY_COLORS[listing.category] ?? "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {listing.category}
                      </span>
                      {listing.furnished && (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            FURNISHED_COLORS[listing.furnished] ?? "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {listing.furnished}
                        </span>
                      )}
                    </div>
                    <div
                      className="absolute top-2 right-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur rounded-lg px-2 py-1.5">
                        <Checkbox
                          id={`compare-${listing.id}`}
                          data-testid={`checkbox-compare-${listing.id}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleListing(listing)}
                          disabled={!isSelected && selectedListings.length >= 4}
                        />
                        <label
                          htmlFor={`compare-${listing.id}`}
                          className="text-xs text-gray-700 cursor-pointer font-medium"
                        >
                          Compare
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setLocation(`/listings/${listing.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap font-semibold text-foreground text-base leading-tight">
                          <span>
                            ৳{Number(listing.rent).toLocaleString()}
                            <span className="text-sm font-normal text-muted-foreground">
                              /mo
                            </span>
                          </span>
                          {listing.isNegotiable && (
                            <Badge variant="secondary" className="text-xs">
                              Negotiable
                            </Badge>
                          )}
                        </div>
                        {(billsTotal > 0 || Number(listing.serviceCharge ?? 0) > 0) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            + ৳{(billsTotal + Number(listing.serviceCharge ?? 0)).toLocaleString()} extras ={" "}
                            <span className="font-medium text-foreground">
                              ৳{(Number(listing.rent) + billsTotal + Number(listing.serviceCharge ?? 0)).toLocaleString()} total
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{listing.location}</span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5" />
                        {listing.bathroom}
                      </span>
                      {listing.floor != null && (
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" />
                          Floor {listing.floor}
                        </span>
                      )}
                      {listing.roommates != null && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {listing.roommates} roommates
                        </span>
                      )}
                      {listing.distance && (
                        <span className="flex items-center gap-1">
                          <Ruler className="w-3.5 h-3.5" />
                          {listing.distance}
                        </span>
                      )}
                      {listing.timeLimit && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {listing.timeLimit}
                        </span>
                      )}
                    </div>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {listing.hasLift && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Lift</span>
                      )}
                      {listing.hasBalcony && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Balcony</span>
                      )}
                      {listing.hasParking && (
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">Parking</span>
                      )}
                      {listing.hasSecurity && (
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">Security</span>
                      )}
                      {listing.hasGenerator && (
                        <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">Generator</span>
                      )}
                      {listing.hasCctv && (
                        <span className="text-xs bg-slate-50 text-slate-700 px-2 py-0.5 rounded-full">CCTV</span>
                      )}
                      {listing.hasMealSystem && (
                        <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full">Meals</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="px-4 pb-3 flex justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-delete-${listing.id}`}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete listing?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the listing for{" "}
                            {listing.location}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() =>
                              deleteMutation.mutate({ id: listing.id })
                            }
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 text-muted-foreground">
            <Home className="w-14 h-14 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No listings yet</p>
            <p className="text-sm mt-1 mb-6">Add your first listing to get started</p>
            <Link href="/listings/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Listing
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Floating Compare Button */}
      {selectedListings.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-card border shadow-lg rounded-full px-5 py-3">
          <span className="text-sm font-medium text-foreground">
            {selectedListings.length} selected
          </span>
          <Button
            size="sm"
            data-testid="button-compare"
            onClick={() => setLocation("/compare")}
          >
            <GitCompare className="w-4 h-4 mr-2" />
            Compare
          </Button>
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
