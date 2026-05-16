import { useState } from "react";
import { useParams, useLocation } from "wouter";
import {
  useGetListing,
  getGetListingQueryKey,
  useDeleteListing,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListListingsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  ArrowLeft,
  MapPin,
  Bath,
  Users,
  Ruler,
  Phone,
  Share2,
  Map,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  Home,
  Zap,
  Wifi,
  Wind,
  Leaf,
  Layers,
  Clock,
  Droplets,
  Flame,
  Edit,
  MessageCircle,
  Banknote,
  Calendar,
} from "lucide-react";

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

const FURNISHED_COLORS: Record<string, string> = {
  "Unfurnished": "bg-gray-100 text-gray-700",
  "Semi-furnished": "bg-yellow-100 text-yellow-800",
  "Fully furnished": "bg-teal-100 text-teal-800",
};

export default function ListingDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: listing, isLoading } = useGetListing(params.id, {
    query: {
      enabled: !!params.id,
      queryKey: getGetListingQueryKey(params.id),
    },
  });

  const deleteMutation = useDeleteListing({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListListingsQueryKey() });
        toast({ title: "Listing deleted" });
        setLocation("/");
      },
    },
  });

  const handleShare = () => {
    if (!listing) return;
    const bills = (listing.bills ?? {}) as Record<string, number | null | undefined>;
    const billsTotal = totalBills(bills);
    const serviceCharge = Number(listing.serviceCharge ?? 0);
    const grandTotal = Number(listing.rent) + billsTotal + serviceCharge;
    const text = [
      `Location: ${listing.location} (${listing.category})`,
      `Negotiation: ${listing.negotiationStatus ?? "Not Started"}${listing.finalNegotiatedRent != null ? ` (Final: ৳${Number(listing.finalNegotiatedRent).toLocaleString()})` : ""}`,
      `Property: ${listing.propertyAvailabilityStatus ?? "Available"}`,
      listing.finalNegotiatedRent != null ? `Final Negotiated Rent: ৳${Number(listing.finalNegotiatedRent).toLocaleString()}` : null,
      `Rent: ৳${Number(listing.rent).toLocaleString()}/mo${listing.isNegotiable ? " (Negotiable)" : ""}`,
      listing.advanceDeposit ? `Advance: ${listing.advanceDeposit}` : null,

      listing.availableFrom ? `Available From: ${listing.availableFrom}` : null,
      serviceCharge > 0 ? `Service Charge: ৳${serviceCharge.toLocaleString()}/mo` : null,
      billsTotal > 0 ? `Bills: ৳${billsTotal.toLocaleString()}/mo` : null,
      `Total: ৳${grandTotal.toLocaleString()}/mo`,
      `Bathroom: ${listing.bathroom}`,
      listing.floor ? `Floor: ${listing.floor}` : null,
      listing.furnished ? `Furnished: ${listing.furnished}` : null,
      listing.hasLift ? "Lift: Yes" : null,
      listing.hasBalcony ? "Balcony: Yes" : null,
      listing.hasChadAccess ? "Roof Access: Yes" : null,
      listing.hasGuestAccess ? "Guest Access: Yes" : null,
      listing.hasGenerator ? "Generator: Yes" : null,
      listing.hasParking ? "Parking: Yes" : null,
      listing.hasSecurity ? "Security: Yes" : null,
      listing.hasCctv ? "CCTV: Yes" : null,
      listing.hasFridge ? "Fridge: Yes" : null,
      listing.hasAc ? "AC: Yes" : null,
      listing.hasGeyser ? "Geyser: Yes" : null,
      listing.hasMealSystem ? "Meal System: Yes" : null,
      listing.timeLimit ? `Time Limit: ${listing.timeLimit}` : null,
      listing.roommates != null ? `Roommates: ${listing.roommates}` : null,
      listing.distance ? `Distance: ${listing.distance}` : null,
      listing.pros?.length ? `Pros: ${listing.pros.join(", ")}` : null,
      listing.cons?.length ? `Cons: ${listing.cons.join(", ")}` : null,
      `Contact: ${listing.contactInfo?.name ? listing.contactInfo.name + " — " : ""}${listing.contactInfo?.mobile ?? ""}`,
      listing.googleMapUrl ? `Map: ${listing.googleMapUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied to clipboard", description: "Share it on WhatsApp or Messenger" });
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-72 rounded-xl mb-6" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Listing not found.</p>
          <Button onClick={() => setLocation("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const bills = (listing.bills ?? {}) as Record<string, number | null | undefined>;
  const billsTotal = totalBills(bills);
  const serviceCharge = Number(listing.serviceCharge ?? 0);
  const grandTotal = Number(listing.rent) + billsTotal + serviceCharge;
  const images = listing.images ?? [];
  const videos = listing.videos ?? [];

  const featureItems = [
    { active: listing.hasLift, label: "Lift" },
    { active: listing.hasBalcony, label: "Balcony" },
    { active: listing.hasChadAccess, label: "Roof Access" },
    { active: listing.hasGuestAccess, label: "Guest Access" },
    { active: listing.hasGenerator, label: "Generator" },
    { active: listing.hasParking, label: "Parking" },
    { active: listing.hasSecurity, label: "Security" },
    { active: listing.hasCctv, label: "CCTV" },
    { active: listing.hasFridge, label: "Fridge" },
    { active: listing.hasAc, label: "AC" },
    { active: listing.hasGeyser, label: "Geyser" },
    { active: listing.hasMealSystem, label: "Meal System" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} data-testid="button-back-detail">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setLocation(`/listings/${listing.id}/edit`)} data-testid="button-edit-detail">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} data-testid="button-share">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            {listing.googleMapUrl && (
              <Button
                variant="outline"
                size="sm"
                data-testid="button-map"
                onClick={() => window.open(listing.googleMapUrl!, "_blank")}
              >
                <Map className="w-4 h-4 mr-2" />
                View on Map
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="button-delete-detail" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete listing?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this listing.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => deleteMutation.mutate({ id: listing.id })}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Images */}
        {images.length > 0 && (
          <div className="mb-6">
            <div
              className="h-64 sm:h-80 rounded-xl overflow-hidden cursor-pointer bg-muted"
              onClick={() => setLightboxIndex(0)}
              data-testid="image-primary"
            >
              <img
                src={`/api/storage${images[0]}`}
                alt={listing.location}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {images.slice(1).map((img, i) => (
                  <div
                    key={i}
                    className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer bg-muted"
                    onClick={() => setLightboxIndex(i + 1)}
                    data-testid={`image-thumb-${i + 1}`}
                  >
                    <img
                      src={`/api/storage${img}`}
                      alt={`Photo ${i + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Info */}
        <div className="bg-card border rounded-xl p-5 mb-4">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    CATEGORY_COLORS[listing.category] ?? "bg-gray-100 text-gray-800"
                  }`}
                >
                  {listing.category}
                </span>
                {listing.furnished && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      FURNISHED_COLORS[listing.furnished] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {listing.furnished}
                  </span>
                )}
                {listing.isNegotiable && (
                  <Badge variant="secondary" className="text-xs">Negotiable</Badge>
                )}
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                ৳{Number(listing.rent).toLocaleString()}
                <span className="text-base font-normal text-muted-foreground">/mo</span>
              </h2>
              {(billsTotal > 0 || serviceCharge > 0) && (
                <p className="text-sm text-muted-foreground">
                  {serviceCharge > 0 && `+ ৳${serviceCharge.toLocaleString()} service `}
                  {billsTotal > 0 && `+ ৳${billsTotal.toLocaleString()} bills `}
                  ={" "}
                  <span className="font-semibold text-foreground">
                    ৳{grandTotal.toLocaleString()} total
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm font-medium" data-testid="text-location">{listing.location}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bath className="w-4 h-4 text-primary" />
              <span>{listing.bathroom} Bathroom</span>
            </div>
            {listing.floor && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Layers className="w-4 h-4 text-primary" />
                <span>{listing.floor.includes("floor") ? listing.floor : `Floor ${listing.floor}`}</span>
              </div>
            )}
            {listing.roommates != null && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-primary" />
                <span>{listing.roommates} Roommates</span>
              </div>
            )}
            {listing.distance && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Ruler className="w-4 h-4 text-primary" />
                <span>{listing.distance}</span>
              </div>
            )}
            {listing.timeLimit && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" />
                <span>{listing.timeLimit}</span>
              </div>
            )}
            {listing.advanceDeposit && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Banknote className="w-4 h-4 text-primary" />
                <span>Advance: {listing.advanceDeposit}</span>
              </div>
            )}
            {listing.availableFrom && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Available: {listing.availableFrom}</span>
              </div>
            )}
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-2">
            {featureItems.map(({ active, label }) => (
              <span
                key={label}
                className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground line-through opacity-60"
                }`}
              >
                {active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {/* Bills */}
          {(Object.values(bills).some((v) => v != null) || serviceCharge > 0) && (
            <div className="bg-card border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">Bills & Charges</h3>
              <div className="space-y-2">
                {serviceCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Home className="w-3.5 h-3.5" />Service Charge</span>
                    <span className="font-medium text-foreground">৳{serviceCharge}</span>
                  </div>
                )}
                {bills.electricity != null && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Zap className="w-3.5 h-3.5" />Electricity</span>
                    <span className="font-medium text-foreground">৳{bills.electricity}</span>
                  </div>
                )}
                {bills.wifi != null && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Wifi className="w-3.5 h-3.5" />WiFi</span>
                    <span className="font-medium text-foreground">৳{bills.wifi}</span>
                  </div>
                )}
                {bills.gas != null && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Flame className="w-3.5 h-3.5" />Gas</span>
                    <span className="font-medium text-foreground">৳{bills.gas}</span>
                  </div>
                )}
                {bills.water != null && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Droplets className="w-3.5 h-3.5" />Water</span>
                    <span className="font-medium text-foreground">৳{bills.water}</span>
                  </div>
                )}
                {bills.maid != null && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Wind className="w-3.5 h-3.5" />Maid</span>
                    <span className="font-medium text-foreground">৳{bills.maid}</span>
                  </div>
                )}
                {bills.waste != null && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Leaf className="w-3.5 h-3.5" />Waste</span>
                    <span className="font-medium text-foreground">৳{bills.waste}</span>
                  </div>
                )}
                {(billsTotal > 0 || serviceCharge > 0) && (
                  <div className="flex justify-between text-sm font-semibold border-t pt-2 mt-2">
                    <span>Total Extras</span>
                    <span className="text-primary">৳{(billsTotal + serviceCharge).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">Contact</h3>
            <div className="space-y-2">
              {listing.contactInfo?.name && (
                <p className="text-sm font-medium text-foreground" data-testid="text-contact-name">
                  {listing.contactInfo?.name}
                </p>
              )}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span data-testid="text-contact-mobile">{listing.contactInfo?.mobile}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 border-green-200 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800"
                  onClick={() => window.open(`https://wa.me/${listing.contactInfo?.mobile.replace(/[^0-9]/g, "")}`, "_blank")}
                >
                  <MessageCircle className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Videos */}
        {videos.length > 0 && (
          <div className="mb-6 space-y-3">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Videos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map((vid: string, i: number) => (
                <div key={i} className="aspect-video bg-muted rounded-xl overflow-hidden border">
                  <video
                    src={`/api/storage${vid}`}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pros & Cons */}
        {((listing.pros?.length ?? 0) > 0 || (listing.cons?.length ?? 0) > 0) && (
          <div className="grid sm:grid-cols-2 gap-4">
            {(listing.pros?.length ?? 0) > 0 && (
              <div className="bg-card border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide text-green-600">Pros</h3>
                <ul className="space-y-1.5">
                  {listing.pros?.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(listing.cons?.length ?? 0) > 0 && (
              <div className="bg-card border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide text-red-600">Cons</h3>
                <ul className="space-y-1.5">
                  {listing.cons?.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && images.length > 0 && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
          data-testid="lightbox"
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setLightboxIndex(null)}
            data-testid="button-lightbox-close"
          >
            <X className="w-7 h-7" />
          </button>
          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 text-white/80 hover:text-white"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
              data-testid="button-lightbox-prev"
            >
              <ChevronLeft className="w-9 h-9" />
            </button>
          )}
          {lightboxIndex < images.length - 1 && (
            <button
              className="absolute right-4 text-white/80 hover:text-white"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
              data-testid="button-lightbox-next"
            >
              <ChevronRight className="w-9 h-9" />
            </button>
          )}
          <img
            src={`/api/storage${images[lightboxIndex]}`}
            alt={`Photo ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 text-white/60 text-sm">
            {lightboxIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </div>
  );
}
