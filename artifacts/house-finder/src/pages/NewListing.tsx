import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateListing,
  useRequestUploadUrl,
  getListListingsQueryKey,
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
} from "lucide-react";

const formSchema = z.object({
  location: z.string().min(1, "Location is required"),
  category: z.enum(["Sublet", "Mess", "Flat", "Seat"]),
  rent: z.coerce.number().min(0, "Rent must be a positive number"),
  isNegotiable: z.boolean().default(false),
  bathroom: z.enum(["Attached", "Common"]),
  roommates: z.coerce.number().int().optional().or(z.literal("")),
  distance: z.string().optional(),
  billsElectricity: z.coerce.number().optional().or(z.literal("")),
  billsWifi: z.coerce.number().optional().or(z.literal("")),
  billsMaid: z.coerce.number().optional().or(z.literal("")),
  billsWaste: z.coerce.number().optional().or(z.literal("")),
  contactName: z.string().min(1, "Contact name is required"),
  contactMobile: z.string().min(1, "Contact mobile is required"),
  googleMapUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewListing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [newPro, setNewPro] = useState("");
  const [newCon, setNewCon] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      billsElectricity: "",
      billsWifi: "",
      billsMaid: "",
      billsWaste: "",
      contactName: "",
      contactMobile: "",
      googleMapUrl: "",
    },
  });

  const createMutation = useCreateListing({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListListingsQueryKey() });
        toast({ title: "Listing added successfully" });
        setLocation("/");
      },
      onError: () => {
        toast({ title: "Failed to create listing", variant: "destructive" });
      },
    },
  });

  const requestUploadUrlMutation = useRequestUploadUrl();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploadingCount((c) => c + files.length);

    const paths: string[] = [];
    for (const file of files) {
      try {
        const result = await new Promise<{ uploadURL: string; objectPath: string }>(
          (resolve, reject) => {
            requestUploadUrlMutation.mutate(
              {
                data: {
                  name: file.name,
                  size: file.size,
                  contentType: file.type,
                },
              },
              {
                onSuccess: (data) => resolve(data),
                onError: (err) => reject(err),
              }
            );
          }
        );

        await fetch(result.uploadURL, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        paths.push(result.objectPath);
      } catch {
        toast({ title: `Failed to upload ${file.name}`, variant: "destructive" });
      } finally {
        setUploadingCount((c) => c - 1);
      }
    }

    setUploadedImages((prev) => [...prev, ...paths]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

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
    if (values.billsElectricity !== "" && values.billsElectricity != null)
      bills.electricity = Number(values.billsElectricity);
    if (values.billsWifi !== "" && values.billsWifi != null)
      bills.wifi = Number(values.billsWifi);
    if (values.billsMaid !== "" && values.billsMaid != null)
      bills.maid = Number(values.billsMaid);
    if (values.billsWaste !== "" && values.billsWaste != null)
      bills.waste = Number(values.billsWaste);

    createMutation.mutate({
      data: {
        location: values.location,
        category: values.category,
        rent: values.rent,
        isNegotiable: values.isNegotiable,
        bills,
        bathroom: values.bathroom,
        roommates: values.roommates !== "" && values.roommates != null
          ? Number(values.roommates) : null,
        distance: values.distance || null,
        pros,
        cons,
        images: uploadedImages,
        contactInfo: {
          name: values.contactName,
          mobile: values.contactMobile,
        },
        googleMapUrl: values.googleMapUrl || null,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} data-testid="button-back-new">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h1 className="text-lg font-bold text-foreground">Add New Listing</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <section className="bg-card border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Basic Info</h2>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Mohakhali Wireless" data-testid="input-location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Sublet">Sublet</SelectItem>
                          <SelectItem value="Mess">Mess</SelectItem>
                          <SelectItem value="Flat">Flat</SelectItem>
                          <SelectItem value="Seat">Seat</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathroom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathroom</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-bathroom">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Attached">Attached</SelectItem>
                          <SelectItem value="Common">Common</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rent (৳/month)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} data-testid="input-rent" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roommates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roommates (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="e.g. 3" data-testid="input-roommates" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="distance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 5 min walk" data-testid="input-distance" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="googleMapUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Map URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://maps.google.com/..." data-testid="input-map-url" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isNegotiable"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-negotiable"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">Rent is negotiable</FormLabel>
                  </FormItem>
                )}
              />
            </section>

            {/* Bills */}
            <section className="bg-card border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Bills (optional)</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="billsElectricity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Electricity (৳)</FormLabel>
                    <FormControl><Input type="number" min={0} placeholder="0" data-testid="input-electricity" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="billsWifi" render={({ field }) => (
                  <FormItem>
                    <FormLabel>WiFi (৳)</FormLabel>
                    <FormControl><Input type="number" min={0} placeholder="0" data-testid="input-wifi" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="billsMaid" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maid (৳)</FormLabel>
                    <FormControl><Input type="number" min={0} placeholder="0" data-testid="input-maid" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="billsWaste" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waste (৳)</FormLabel>
                    <FormControl><Input type="number" min={0} placeholder="0" data-testid="input-waste" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </section>

            {/* Pros & Cons */}
            <section className="bg-card border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Pros & Cons</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-green-600 mb-2 block">Pros</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newPro}
                      onChange={(e) => setNewPro(e.target.value)}
                      placeholder="Add a pro..."
                      data-testid="input-new-pro"
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPro(); } }}
                    />
                    <Button type="button" size="sm" variant="outline" onClick={addPro} data-testid="button-add-pro">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    {pros.map((pro, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm bg-green-50 text-green-800 rounded-lg px-3 py-1.5">
                        <span className="flex-1">{pro}</span>
                        <button type="button" onClick={() => setPros(pros.filter((_, j) => j !== i))} data-testid={`button-remove-pro-${i}`}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-red-500 mb-2 block">Cons</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newCon}
                      onChange={(e) => setNewCon(e.target.value)}
                      placeholder="Add a con..."
                      data-testid="input-new-con"
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCon(); } }}
                    />
                    <Button type="button" size="sm" variant="outline" onClick={addCon} data-testid="button-add-con">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    {cons.map((con, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm bg-red-50 text-red-700 rounded-lg px-3 py-1.5">
                        <span className="flex-1">{con}</span>
                        <button type="button" onClick={() => setCons(cons.filter((_, j) => j !== i))} data-testid={`button-remove-con-${i}`}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-card border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Contact Info</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="contactName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input placeholder="Contact name" data-testid="input-contact-name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="contactMobile" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl><Input placeholder="+880..." data-testid="input-contact-mobile" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </section>

            {/* Images */}
            <section className="bg-card border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Photos (optional)</h2>
              <div
                className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
                data-testid="dropzone-images"
              >
                {uploadingCount > 0 ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm">Uploading {uploadingCount} file{uploadingCount > 1 ? "s" : ""}...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImagePlus className="w-8 h-8 opacity-50" />
                    <p className="text-sm font-medium">Click to upload photos</p>
                    <p className="text-xs">JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                data-testid="input-file-images"
              />
              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {uploadedImages.map((path, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted" data-testid={`image-uploaded-${i}`}>
                      <img
                        src={`/api/storage${path}`}
                        alt={`Upload ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                        data-testid={`button-remove-image-${i}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending || uploadingCount > 0}
              data-testid="button-submit"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Save Listing
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
