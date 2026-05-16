import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateListing,
  useUpdateListing,
  useGetListing,
  useRequestUploadUrl,
  useUploadFromUrl,
  getListListingsQueryKey,
  getGetListingQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ArrowLeft,
  Plus,
  X,
  Upload,
  Loader2,
  ImagePlus,
  Film,
  Link as LinkIcon,
} from "lucide-react";

const formSchema = z.object({
  location: z.string().min(1, "Location is required"),
  category: z.enum(["Sublet", "Mess", "Flat", "Seat"]),
  rent: z.coerce.number().min(0, "Rent must be a positive number"),
  isNegotiable: z.boolean().default(false),
  negotiationStatus: z.enum(["Not Started", "In Discussion", "Offered Made", "Rejected/Declined"]).default("Not Started"),
  finalNegotiatedRent: z.coerce.number().min(0, "Final rent must be a positive number").optional().or(z.literal("")),
  propertyAvailabilityStatus: z.enum(["Available", "Visited & Shortlisted", "Booked/Rented Out", "My Final Choice"]).default("Available"),
  bathroom: z.enum(["Attached", "Common"]),

  roommates: z.coerce.number().int().optional().or(z.literal("")),
  distance: z.string().optional(),
  floor: z.string().optional(),
  advanceDeposit: z.string().optional(),
  availableFrom: z.string().optional(),
  hasLift: z.boolean().default(false),
  hasBalcony: z.boolean().default(false),
  hasChadAccess: z.boolean().default(false),
  hasGuestAccess: z.boolean().default(false),
  serviceCharge: z.coerce.number().optional().or(z.literal("")),
  hasGenerator: z.boolean().default(false),
  hasParking: z.boolean().default(false),
  hasSecurity: z.boolean().default(false),
  hasFridge: z.boolean().default(false),
  hasAc: z.boolean().default(false),
  hasGeyser: z.boolean().default(false),
  hasCctv: z.boolean().default(false),
  hasMealSystem: z.boolean().default(false),
  timeLimit: z.string().optional(),
  furnished: z.enum(["Unfurnished", "Semi-furnished", "Fully furnished"]).optional(),
  billsElectricity: z.coerce.number().optional().or(z.literal("")),
  billsWifi: z.coerce.number().optional().or(z.literal("")),
  billsMaid: z.coerce.number().optional().or(z.literal("")),
  billsWaste: z.coerce.number().optional().or(z.literal("")),
  billsGas: z.coerce.number().optional().or(z.literal("")),
  billsWater: z.coerce.number().optional().or(z.literal("")),
  contactName: z.string().optional().or(z.literal("")),
  contactMobile: z.string().min(1, "Contact mobile is required"),
  googleMapUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ListingForm() {
  const params = useParams<{ id?: string }>();
  const isEditing = !!params.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [newPro, setNewPro] = useState("");
  const [newCon, setNewCon] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: existingListing, isLoading: isLoadingListing } = useGetListing(params.id!, {
    query: {
      enabled: isEditing,
      queryKey: getGetListingQueryKey(params.id!),
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      category: "Flat",
      rent: 0,
      isNegotiable: false,
      negotiationStatus: "Not Started",
      finalNegotiatedRent: "",
      propertyAvailabilityStatus: "Available",
      bathroom: "Attached",

      roommates: "",
      distance: "",
      floor: "",
      advanceDeposit: "",
      availableFrom: "",
      hasLift: false,
      hasBalcony: false,
      hasChadAccess: false,
      hasGuestAccess: false,
      serviceCharge: "",
      hasGenerator: false,
      hasParking: false,
      hasSecurity: false,
      hasFridge: false,
      hasAc: false,
      hasGeyser: false,
      hasCctv: false,
      hasMealSystem: false,
      timeLimit: "",
      furnished: undefined,
      billsElectricity: "",
      billsWifi: "",
      billsMaid: "",
      billsWaste: "",
      billsGas: "",
      billsWater: "",
      contactName: "",
      contactMobile: "",
      googleMapUrl: "",
    },
  });

  useEffect(() => {
    if (existingListing) {
      const bills = (existingListing.bills ?? {}) as Record<string, number | null | undefined>;
      form.reset({
        location: existingListing.location,
        category: existingListing.category as any,
        rent: Number(existingListing.rent),
        isNegotiable: existingListing.isNegotiable,
        negotiationStatus: existingListing.negotiationStatus ?? "Not Started",
        finalNegotiatedRent: existingListing.finalNegotiatedRent ?? "",
        propertyAvailabilityStatus: existingListing.propertyAvailabilityStatus ?? "Available",
        bathroom: existingListing.bathroom as any,

        roommates: existingListing.roommates ?? "",
        distance: existingListing.distance ?? "",
        floor: existingListing.floor ?? "",
        advanceDeposit: existingListing.advanceDeposit ?? "",
        availableFrom: existingListing.availableFrom ?? "",
        hasLift: existingListing.hasLift,
        hasBalcony: existingListing.hasBalcony,
        hasChadAccess: existingListing.hasChadAccess,
        hasGuestAccess: existingListing.hasGuestAccess,
        serviceCharge: existingListing.serviceCharge ?? "",
        hasGenerator: existingListing.hasGenerator,
        hasParking: existingListing.hasParking,
        hasSecurity: existingListing.hasSecurity,
        hasFridge: existingListing.hasFridge,
        hasAc: existingListing.hasAc,
        hasGeyser: existingListing.hasGeyser,
        hasCctv: existingListing.hasCctv,
        hasMealSystem: existingListing.hasMealSystem,
        timeLimit: existingListing.timeLimit ?? "",
        furnished: (existingListing.furnished as any) || undefined,
        billsElectricity: bills.electricity ?? "",
        billsWifi: bills.wifi ?? "",
        billsMaid: bills.maid ?? "",
        billsWaste: bills.waste ?? "",
        billsGas: bills.gas ?? "",
        billsWater: bills.water ?? "",
        contactName: existingListing.contactInfo?.name ?? "",
        contactMobile: existingListing.contactInfo?.mobile ?? "",
        googleMapUrl: existingListing.googleMapUrl ?? "",
      });
      setPros(existingListing.pros ?? []);
      setCons(existingListing.cons ?? []);
      setUploadedImages(existingListing.images ?? []);
      setUploadedVideos(existingListing.videos ?? []);
    }
  }, [existingListing, form]);

  const { mutateAsync: requestUploadUrl } = useRequestUploadUrl();
  const { mutateAsync: uploadFromUrl } = useUploadFromUrl();

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setUploadingCount((c) => c + files.length);

    const imagePaths: string[] = [];
    const videoPaths: string[] = [];

    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        toast({ title: `Skipping ${file.name}: Not an image or video`, variant: "destructive" });
        setUploadingCount((c) => c - 1);
        continue;
      }

      try {
        const result = await requestUploadUrl({
          data: {
            name: file.name,
            size: file.size,
            contentType: file.type,
          },
        });

        const uploadResponse = await fetch(result.uploadURL, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadResponse.ok) throw new Error("Upload failed");

        if (isImage) imagePaths.push(result.objectPath);
        else videoPaths.push(result.objectPath);
      } catch (err) {
        console.error(`Error uploading ${file.name}:`, err);
        toast({ title: `Failed to upload ${file.name}`, variant: "destructive" });
      } finally {
        setUploadingCount((c) => c - 1);
      }
    }

    if (imagePaths.length > 0) setUploadedImages((prev) => [...prev, ...imagePaths]);
    if (videoPaths.length > 0) setUploadedVideos((prev) => [...prev, ...videoPaths]);
  }, [requestUploadUrl, toast]);

  const handleUrlUpload = async () => {
    if (!imageUrl.trim()) return;
    setUploadingCount((c) => c + 1);
    try {
      const result = await uploadFromUrl({
        data: { url: imageUrl.trim() },
      });
      setUploadedImages((prev) => [...prev, result.objectPath]);
      setImageUrl("");
      toast({ title: "Image uploaded from URL" });
    } catch (err) {
      console.error("Error uploading from URL:", err);
      toast({ title: "Failed to upload image from URL", variant: "destructive" });
    } finally {
      setUploadingCount((c) => c - 1);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    uploadFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      let files: File[] = [];
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        files = Array.from(e.clipboardData.files);
      } else if (e.clipboardData?.items) {
        const items = Array.from(e.clipboardData.items);
        for (const item of items) {
          if (item.type.startsWith("image/") || item.type.startsWith("video/")) {
            const file = item.getAsFile();
            if (file) files.push(file);
          }
        }
      }
      
      if (files.length > 0) {
        uploadFiles(files);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [uploadFiles]);

  const createMutation = useCreateListing({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListListingsQueryKey() });
        toast({ title: "Listing added successfully" });
        setLocation("/");
      },
    },
  });

  const updateMutation = useUpdateListing({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetListingQueryKey(params.id!) });
        toast({ title: "Listing updated successfully" });
        setLocation(`/listings/${params.id}`);
      },
    },
  });

  const addPro = () => {
    const trimmed = newPro.trim();
    if (trimmed) { setPros((p) => [...p, trimmed]); setNewPro(""); }
  };

  const addCon = () => {
    const trimmed = newCon.trim();
    if (trimmed) { setCons((c) => [...c, trimmed]); setNewCon(""); }
  };

  const onSubmit = (values: FormValues) => {
    const bills: Record<string, number> = {};
    if (values.billsElectricity !== "" && values.billsElectricity != null) bills.electricity = Number(values.billsElectricity);
    if (values.billsWifi !== "" && values.billsWifi != null) bills.wifi = Number(values.billsWifi);
    if (values.billsMaid !== "" && values.billsMaid != null) bills.maid = Number(values.billsMaid);
    if (values.billsWaste !== "" && values.billsWaste != null) bills.waste = Number(values.billsWaste);
    if (values.billsGas !== "" && values.billsGas != null) bills.gas = Number(values.billsGas);
    if (values.billsWater !== "" && values.billsWater != null) bills.water = Number(values.billsWater);

    const payload = {
      location: values.location,

      category: values.category,
      rent: values.rent,
      isNegotiable: values.isNegotiable,
      negotiationStatus: values.negotiationStatus,
      finalNegotiatedRent: values.finalNegotiatedRent !== "" ? Number(values.finalNegotiatedRent) : null,
      propertyAvailabilityStatus: values.propertyAvailabilityStatus,
      bills,
      bathroom: values.bathroom,

      roommates: values.roommates !== "" && values.roommates != null ? Number(values.roommates) : null,
      distance: values.distance || null,
      floor: values.floor || null,
      advanceDeposit: values.advanceDeposit || null,
      availableFrom: values.availableFrom || null,
      hasLift: values.hasLift,
      hasBalcony: values.hasBalcony,
      hasChadAccess: values.hasChadAccess,
      hasGuestAccess: values.hasGuestAccess,
      serviceCharge: values.serviceCharge !== "" && values.serviceCharge != null ? Number(values.serviceCharge) : null,
      hasGenerator: values.hasGenerator,
      hasParking: values.hasParking,
      hasSecurity: values.hasSecurity,
      hasFridge: values.hasFridge,
      hasAc: values.hasAc,
      hasGeyser: values.hasGeyser,
      hasCctv: values.hasCctv,
      hasMealSystem: values.hasMealSystem,
      timeLimit: values.timeLimit || null,
      furnished: values.furnished ?? null,
      pros,
      cons,
      images: uploadedImages,
      videos: uploadedVideos,
      contactInfo: {
        name: values.contactName || null,
        mobile: values.contactMobile,
      },
      googleMapUrl: values.googleMapUrl || null,
    };

    if (isEditing) {
      updateMutation.mutate({ id: params.id!, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  };

  if (isEditing && isLoadingListing) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setLocation(isEditing ? `/listings/${params.id}` : "/")} data-testid="button-back-form">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h1 className="text-lg font-bold text-foreground">{isEditing ? "Edit Listing" : "Add New Listing"}</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <section className="bg-card border rounded-xl p-5 space-y-6">
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide border-b pb-2">1. Basic Info</h2>
              
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="Ex: Mohakhali Wireless, Alley 5" {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-4">
                        {["Flat", "Sublet", "Mess", "Seat"].map((cat) => (
                          <FormItem key={cat} className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value={cat} /></FormControl>
                            <FormLabel className="font-normal cursor-pointer">{cat}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="bathroom" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Bathroom</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                        {["Attached", "Common"].map((type) => (
                          <FormItem key={type} className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value={type} /></FormControl>
                            <FormLabel className="font-normal cursor-pointer">{type}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField control={form.control} name="rent" render={({ field }) => (
                  <FormItem><FormLabel>Rent (৳/month)</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="isNegotiable" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Rent is negotiable</FormLabel>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField control={form.control} name="negotiationStatus" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Negotiation Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Not Started">🟡 Not Started</SelectItem>
                          <SelectItem value="In Discussion">🔵 In Discussion</SelectItem>
                          <SelectItem value="Offered Made">🟢 Offered Made</SelectItem>
                          <SelectItem value="Rejected/Declined">🔴 Rejected/Declined</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="finalNegotiatedRent" render={({ field }) => (
                  <FormItem><FormLabel>Final Negotiated Rent</FormLabel><FormControl><Input type="number" min={0} placeholder="৳ Final rent, e.g. ৳ 11,500" {...field} value={field.value ?? ""} onChange={(e)=>field.onChange(e.target.value)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="propertyAvailabilityStatus" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Property Availability Status</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select property status..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">🟢 Available</SelectItem>
                        <SelectItem value="Visited & Shortlisted">🟡 Visited & Shortlisted</SelectItem>
                        <SelectItem value="Booked/Rented Out">🔒 Booked/Rented Out</SelectItem>
                        <SelectItem value="My Final Choice">🎉 My Final Choice</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField control={form.control} name="advanceDeposit" render={({ field }) => (
                  <FormItem><FormLabel>Advance/Security Deposit</FormLabel><FormControl><Input placeholder="Ex: 2 months rent" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="availableFrom" render={({ field }) => (
                  <FormItem><FormLabel>Available From</FormLabel><FormControl><Input placeholder="Ex: Current month / Next month" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField control={form.control} name="roommates" render={({ field }) => (
                  <FormItem><FormLabel>Roommates</FormLabel><FormControl><Input type="number" min={0} placeholder="Number of roommates" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="distance" render={({ field }) => (
                  <FormItem><FormLabel>Distance</FormLabel><FormControl><Input placeholder="Ex: 10 minutes walk / 2 km" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="googleMapUrl" render={({ field }) => (
                <FormItem><FormLabel>Google Map URL</FormLabel><FormControl><Input type="url" placeholder="https://maps.google.com/..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </section>

            <section className="bg-card border rounded-xl p-5 space-y-6">
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide border-b pb-2">2. Property Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField control={form.control} name="floor" render={({ field }) => (
                  <FormItem><FormLabel>Floor / Level</FormLabel><FormControl><Input placeholder="Ex: 4th floor / 4 floors" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="serviceCharge" render={({ field }) => (
                  <FormItem><FormLabel>Service Charge</FormLabel><FormControl><Input type="number" min={0} placeholder="Ex: 2000" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField control={form.control} name="furnished" render={({ field }) => (
                  <FormItem><FormLabel>Furnished Status</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ""}><FormControl><SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Unfurnished">Unfurnished</SelectItem><SelectItem value="Semi-furnished">Semi-furnished</SelectItem><SelectItem value="Fully furnished">Fully furnished</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="timeLimit" render={({ field }) => (
                  <FormItem><FormLabel>Time Limit</FormLabel><FormControl><Input placeholder="e.g. 11 PM" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              
              <div className="space-y-4">
                <Label className="text-sm font-medium">Amenities</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                  {[
                    { name: "hasLift", label: "Lift" },
                    { name: "hasBalcony", label: "Balcony" },
                    { name: "hasChadAccess", label: "Roof Access" },
                    { name: "hasGuestAccess", label: "Guest Access" },
                    { name: "hasGenerator", label: "Generator" },
                    { name: "hasParking", label: "Parking" },
                    { name: "hasSecurity", label: "Security" },
                    { name: "hasCctv", label: "CCTV" },
                    { name: "hasFridge", label: "Fridge" },
                    { name: "hasAc", label: "AC" },
                    { name: "hasGeyser", label: "Geyser" },
                    { name: "hasMealSystem", label: "Meal System" },
                  ].map((item) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={item.name as any}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-card border rounded-xl p-5 space-y-6">
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide border-b pb-2">3. Bills</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {["Electricity", "Wifi", "Gas", "Water", "Maid", "Waste"].map((bill) => (
                  <FormField key={bill} control={form.control} name={`bills${bill}` as any} render={({ field }) => (
                    <FormItem><FormLabel>{bill} (৳)</FormLabel><FormControl><Input type="number" min={0} placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                ))}
              </div>
            </section>

            <section className="bg-card border rounded-xl p-5 space-y-6">
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide border-b pb-2">4. Pros & Cons</h2>
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <Label className="text-green-600 mb-3 block font-medium">Pros</Label>
                  <div className="flex gap-2 mb-3">
                    <Input value={newPro} onChange={(e) => setNewPro(e.target.value)} placeholder="Add a pro..." onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPro(); } }} />
                    <Button type="button" size="icon" variant="outline" className="shrink-0" onClick={addPro}><Plus className="w-4 h-4" /></Button>
                  </div>
                  <div className="space-y-2">{pros.map((p, i) => <div key={i} className="flex items-start gap-2 text-sm bg-green-50 text-green-800 rounded-lg px-3 py-2 border border-green-100"><span className="flex-1 leading-tight">{p}</span><button type="button" className="mt-0.5" onClick={() => setPros(pros.filter((_, j) => j !== i))}><X className="w-3.5 h-3.5" /></button></div>)}</div>
                </div>
                <div>
                  <Label className="text-red-500 mb-3 block font-medium">Cons</Label>
                  <div className="flex gap-2 mb-3">
                    <Input value={newCon} onChange={(e) => setNewCon(e.target.value)} placeholder="Add a con..." onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCon(); } }} />
                    <Button type="button" size="icon" variant="outline" className="shrink-0" onClick={addCon}><Plus className="w-4 h-4" /></Button>
                  </div>
                  <div className="space-y-2">{cons.map((c, i) => <div key={i} className="flex items-start gap-2 text-sm bg-red-50 text-red-700 rounded-lg px-3 py-2 border border-red-100"><span className="flex-1 leading-tight">{c}</span><button type="button" className="mt-0.5" onClick={() => setCons(cons.filter((_, j) => j !== i))}><X className="w-3.5 h-3.5" /></button></div>)}</div>
                </div>
              </div>
            </section>

            <section className="bg-card border rounded-xl p-5 space-y-6">
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide border-b pb-2">5. Contact Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField control={form.control} name="contactName" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Ex: John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="contactMobile" render={({ field }) => (
                  <FormItem><FormLabel>Mobile</FormLabel><FormControl><Input type="tel" placeholder="01XXXXXXXXX" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </section>

            <section className="bg-card border rounded-xl p-5 space-y-6">
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide border-b pb-2">6. Media</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Tip: Drag & drop or paste images/videos anywhere!</p>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "hover:border-primary hover:bg-muted/50"}`}
                    onClick={() => fileInputRef.current?.click()} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}
                  >
                    {uploadingCount > 0 ? (
                      <div className="flex flex-col items-center gap-3 text-muted-foreground"><Loader2 className="w-10 h-10 animate-spin text-primary" /><p className="text-sm font-medium">Uploading {uploadingCount} files...</p></div>
                    ) : isDragging ? (
                      <div className="flex flex-col items-center gap-3 text-primary"><Upload className="w-10 h-10 animate-bounce" /><p className="text-sm font-bold">Drop files here</p></div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <div className="relative">
                          <ImagePlus className="w-10 h-10 opacity-40" />
                          <Film className="w-6 h-6 opacity-40 absolute -bottom-1 -right-1 bg-background rounded-sm" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">Click to upload, or drag & drop</p>
                          <p className="text-xs">JPG, PNG, WEBP, MP4, WebM (Max 50MB)</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Or paste image link</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        className="pl-9" 
                        placeholder="https://example.com/image.jpg" 
                        value={imageUrl} 
                        onChange={(e) => setImageUrl(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUrlUpload(); } }}
                      />
                    </div>
                    <Button type="button" variant="secondary" onClick={handleUrlUpload} disabled={!imageUrl.trim() || uploadingCount > 0}>
                      Add URL
                    </Button>
                  </div>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Photos ({uploadedImages.length})</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                      {uploadedImages.map((path, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted group border shadow-sm">
                          <img src={`/api/storage${path}`} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          <button type="button" onClick={() => setUploadedImages(prev => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadedVideos.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Videos ({uploadedVideos.length})</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {uploadedVideos.map((path, i) => (
                        <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-muted group border shadow-sm">
                          <video src={`/api/storage${path}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <Film className="w-6 h-6 text-white" />
                          </div>
                          <button type="button" onClick={() => setUploadedVideos(prev => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <div className="sticky bottom-4 z-10 sm:static">
              <Button type="submit" size="lg" className="w-full shadow-lg" disabled={createMutation.isPending || updateMutation.isPending || uploadingCount > 0}>
                {(createMutation.isPending || updateMutation.isPending) ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</> : <><Upload className="w-5 h-5 mr-2" /> {isEditing ? "Update Listing" : "Save Listing"}</>}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
