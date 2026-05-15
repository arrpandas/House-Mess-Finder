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
  getListListingsQueryKey,
  getGetListingQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "lucide-react";

const formSchema = z.object({
  location: z.string().min(1, "Location is required"),
  category: z.enum(["Sublet", "Mess", "Flat", "Seat"]),
  rent: z.coerce.number().min(0, "Rent must be a positive number"),
  isNegotiable: z.boolean().default(false),
  bathroom: z.enum(["Attached", "Common"]),
  roommates: z.coerce.number().int().optional().or(z.literal("")),
  distance: z.string().optional(),
  floor: z.coerce.number().int().optional().or(z.literal("")),
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
      bathroom: "Attached",
      roommates: "",
      distance: "",
      floor: "",
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
        bathroom: existingListing.bathroom as any,
        roommates: existingListing.roommates ?? "",
        distance: existingListing.distance ?? "",
        floor: existingListing.floor ?? "",
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

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    console.log(`Starting upload for ${files.length} files...`);
    setUploadingCount((c) => c + files.length);

    const imagePaths: string[] = [];
    const videoPaths: string[] = [];

    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        console.warn(`Skipping file ${file.name} as it's neither image nor video.`);
        toast({ title: `Skipping ${file.name}: Not an image or video`, variant: "destructive" });
        setUploadingCount((c) => c - 1);
        continue;
      }

      try {
        console.log(`Requesting upload URL for ${file.name}...`);
        const result = await requestUploadUrl({
          data: {
            name: file.name,
            size: file.size,
            contentType: file.type,
          },
        });

        console.log(`Uploading ${file.name} to storage...`);
        const uploadResponse = await fetch(result.uploadURL, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadResponse.ok) throw new Error("Upload failed");

        console.log(`Successfully uploaded ${file.name}. Path: ${result.objectPath}`);
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
    console.log("Files dropped!");
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      console.log("Paste detected!");
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
        console.log(`Found ${files.length} files in clipboard.`);
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
      bills,
      bathroom: values.bathroom,
      roommates: values.roommates !== "" && values.roommates != null ? Number(values.roommates) : null,
      distance: values.distance || null,
      floor: values.floor !== "" && values.floor != null ? Number(values.floor) : null,
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
    <div className="min-h-screen bg-background">
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

            <section className="bg-card border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Basic Info</h2>
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g. Mohakhali Wireless" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Sublet">Sublet</SelectItem><SelectItem value="Mess">Mess</SelectItem><SelectItem value="Flat">Flat</SelectItem><SelectItem value="Seat">Seat</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="bathroom" render={({ field }) => (
                  <FormItem><FormLabel>Bathroom</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Attached">Attached</SelectItem><SelectItem value="Common">Common</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="rent" render={({ field }) => (
                  <FormItem><FormLabel>Rent (৳/month)</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="isNegotiable" render={({ field }) => (
                  <FormItem className="flex flex-col justify-end pb-1"><FormLabel>&nbsp;</FormLabel><div className="flex items-center gap-2 h-9"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><Label className="cursor-pointer font-normal">Rent is negotiable</Label></div></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="roommates" render={({ field }) => (
                  <FormItem><FormLabel>Roommates (optional)</FormLabel><FormControl><Input type="number" min={0} placeholder="e.g. 3" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="distance" render={({ field }) => (
                  <FormItem><FormLabel>Distance (optional)</FormLabel><FormControl><Input placeholder="e.g. 5 min walk" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="googleMapUrl" render={({ field }) => (
                <FormItem><FormLabel>Google Map URL (optional)</FormLabel><FormControl><Input placeholder="https://maps.google.com/..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </section>

            <section className="bg-card border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Property Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="floor" render={({ field }) => (
                  <FormItem><FormLabel>Floor / Level (optional)</FormLabel><FormControl><Input type="number" min={0} placeholder="e.g. 3" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="serviceCharge" render={({ field }) => (
                  <FormItem><FormLabel>Service Charge (optional)</FormLabel><FormControl><Input type="number" min={0} placeholder="e.g. 2000" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="furnished" render={({ field }) => (
                  <FormItem><FormLabel>Furnished Status</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ""}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Unfurnished">Unfurnished</SelectItem><SelectItem value="Semi-furnished">Semi-furnished</SelectItem><SelectItem value="Fully furnished">Fully furnished</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="timeLimit" render={({ field }) => (
                  <FormItem><FormLabel>Time Limit (optional)</FormLabel><FormControl><Input placeholder="e.g. 11 PM" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6">
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
                  <FormField key={item.name} control={form.control} name={item.name as any} render={({ field }) => (
                    <FormItem className="flex items-center gap-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="!mt-0 cursor-pointer font-normal">{item.label}</FormLabel></FormItem>
                  )} />
                ))}
              </div>
            </section>

            <section className="bg-card border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Bills (optional)</h2>
              <div className="grid grid-cols-2 gap-4">
                {["Electricity", "Wifi", "Gas", "Water", "Maid", "Waste"].map((bill) => (
                  <FormField key={bill} control={form.control} name={`bills${bill}` as any} render={({ field }) => (
                    <FormItem><FormLabel>{bill} (৳)</FormLabel><FormControl><Input type="number" min={0} placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                ))}
              </div>
            </section>

            <section className="bg-card border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Pros & Cons</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-green-600 mb-2 block">Pros</Label>
                  <div className="flex gap-2 mb-2">
                    <Input value={newPro} onChange={(e) => setNewPro(e.target.value)} placeholder="Add a pro..." onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPro(); } }} />
                    <Button type="button" size="sm" variant="outline" onClick={addPro}><Plus className="w-4 h-4" /></Button>
                  </div>
                  <div className="space-y-1.5">{pros.map((p, i) => <div key={i} className="flex items-center gap-2 text-sm bg-green-50 text-green-800 rounded-lg px-3 py-1.5"><span className="flex-1">{p}</span><button type="button" onClick={() => setPros(pros.filter((_, j) => j !== i))}><X className="w-3.5 h-3.5" /></button></div>)}</div>
                </div>
                <div>
                  <Label className="text-red-500 mb-2 block">Cons</Label>
                  <div className="flex gap-2 mb-2">
                    <Input value={newCon} onChange={(e) => setNewCon(e.target.value)} placeholder="Add a con..." onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCon(); } }} />
                    <Button type="button" size="sm" variant="outline" onClick={addCon}><Plus className="w-4 h-4" /></Button>
                  </div>
                  <div className="space-y-1.5">{cons.map((c, i) => <div key={i} className="flex items-center gap-2 text-sm bg-red-50 text-red-700 rounded-lg px-3 py-1.5"><span className="flex-1">{c}</span><button type="button" onClick={() => setCons(cons.filter((_, j) => j !== i))}><X className="w-3.5 h-3.5" /></button></div>)}</div>
                </div>
              </div>
            </section>

            <section className="bg-card border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Contact Info</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="contactName" render={({ field }) => (
                  <FormItem><FormLabel>Name (optional)</FormLabel><FormControl><Input placeholder="Contact name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="contactMobile" render={({ field }) => (
                  <FormItem><FormLabel>Mobile</FormLabel><FormControl><Input placeholder="+880..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </section>

            <section className="bg-card border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Media (optional)</h2>
              <p className="text-xs text-muted-foreground mt-[-10px]">Tip: Drag & drop or paste images/videos anywhere!</p>
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragging ? "border-primary bg-primary/5" : "hover:border-primary"}`}
                onClick={() => fileInputRef.current?.click()} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}
              >
                {uploadingCount > 0 ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="text-sm">Uploading {uploadingCount} files...</p></div>
                ) : isDragging ? (
                  <div className="flex flex-col items-center gap-2 text-primary"><Upload className="w-8 h-8 animate-bounce" /><p className="text-sm font-bold">Drop files here</p></div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImagePlus className="w-8 h-8 opacity-50" />
                    <Film className="w-8 h-8 opacity-50 absolute mt-4 ml-4" />
                    <p className="text-sm font-medium">Click to upload, or drag & drop</p>
                    <p className="text-xs">JPG, PNG, WEBP, MP4, WebM</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} />

              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase">Photos</h3>
                  <div className="flex flex-wrap gap-3">
                    {uploadedImages.map((path, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                        <img src={`/api/storage${path}`} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setUploadedImages(prev => prev.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadedVideos.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase">Videos</h3>
                  <div className="flex flex-wrap gap-3">
                    {uploadedVideos.map((path, i) => (
                      <div key={i} className="relative w-32 h-20 rounded-lg overflow-hidden bg-muted">
                        <video src={`/api/storage${path}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setUploadedVideos(prev => prev.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending || uploadingCount > 0}>
              {(createMutation.isPending || updateMutation.isPending) ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Upload className="w-4 h-4 mr-2" /> {isEditing ? "Update Listing" : "Save Listing"}</>}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
