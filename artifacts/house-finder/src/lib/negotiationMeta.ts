export type NegotiationStatus =
  | "Not Started"
  | "In Discussion"
  | "Offered Made"
  | "Rejected/Declined";

export type PropertyAvailabilityStatus =
  | "Available"
  | "Visited & Shortlisted"
  | "Booked/Rented Out"
  | "My Final Choice";

export const negotiationStatusMeta: Record<NegotiationStatus, { label: string; className: string }>= {
  "Not Started": {
    label: "Not Started",
    className: "bg-yellow-100 text-yellow-900 border-yellow-200",
  },
  "In Discussion": {
    label: "In Discussion",
    className: "bg-blue-100 text-blue-900 border-blue-200",
  },
  "Offered Made": {
    label: "Offered Made",
    className: "bg-green-100 text-green-900 border-green-200",
  },
  "Rejected/Declined": {
    label: "Rejected/Declined",
    className: "bg-red-100 text-red-900 border-red-200",
  },
};

export const propertyAvailabilityStatusMeta: Record<
  PropertyAvailabilityStatus,
  { label: string; className: string }
> = {
  Available: {
    label: "Available",
    className: "bg-green-100 text-green-900 border-green-200",
  },
  "Visited & Shortlisted": {
    label: "Visited & Shortlisted",
    className: "bg-yellow-100 text-yellow-900 border-yellow-200",
  },
  "Booked/Rented Out": {
    label: "Booked/Rented Out",
    className: "bg-gray-200 text-gray-900 border-gray-300",
  },
  "My Final Choice": {
    label: "My Final Choice",
    className: "bg-purple-100 text-purple-900 border-purple-200",
  },
};

