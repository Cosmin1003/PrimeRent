"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { supabase } from "../supabaseClient";
import {
  Building2,
  MapPin,
  DollarSign,
  Users,
  Bed,
  Bath,
  Info,
  ChevronLeft,
  PlusCircle,
  AlertCircle,
  Check,
  Sparkles,
  X,
  UploadCloud,
  ImageIcon,
} from "lucide-react";

// --- Leaflet Imports ---
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import type { Amenity } from "@/types/amenity";
import { cn } from "@/lib/utils";

// --- Leaflet Icon Fix ---
// This is necessary because Vite/Webpack messes up the default paths for Leaflet marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// --- Map Interaction Helper ---
function LocationPicker({
  lat,
  lng,
  setPosition,
}: {
  lat: number;
  lng: number;
  setPosition: (lat: number, lng: number) => void;
}) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return <Marker position={[lat, lng]} />;
}

export default function CreateListingPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const isEditMode = !!id;

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);

  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    price_per_night: "",
    max_guests: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    lat: 40.7128, // Default to NYC
    lng: -74.006,
    main_image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // reader.result looks like "data:image/jpeg;base64,/9j/4AAQSkZ..."
        // We only want the raw data part after the comma
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    try {
      const amenityNames = selectedAmenities
        .map((id) => allAmenities.find((a) => a.id === id)?.name)
        .filter(Boolean)
        .join(", ");

      const facts = `
        Location: ${formData.address ? formData.address + ', ' : ''}${formData.city}
        Price: $${formData.price_per_night} per night
        Capacity: ${formData.max_guests} guests
        Layout: ${formData.bedrooms} bedrooms, ${formData.beds} beds, ${formData.bathrooms} baths.
        Amenities included: ${amenityNames || "Basic amenities"}
      `;

      // --- NEW: Grab the first image if the user uploaded one! ---
      let base64Data = null;
      let mimeType = null;
      
      if (images.length > 0) {
        // Grab the very first file they uploaded
        const coverImage = images[0]; 
        base64Data = await fileToBase64(coverImage);
        mimeType = coverImage.type; // e.g., "image/jpeg" or "image/png"
      }

      // Call your secure Supabase Edge Function, now with image data!
      const { data, error } = await supabase.functions.invoke('generate-listing', {
        body: { 
          formData: facts,
          imageBase64: base64Data,
          mimeType: mimeType
        }
      });

      if (error) throw error;

      setFormData((prev) => ({ 
        ...prev, 
        title: data.title,
        description: data.description
      }));
      
    } catch (error: any) {
      console.error("AI Generation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate description";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Add raw files to state
      setImages((prev) => [...prev, ...newFiles]);

      // Generate preview URLs
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = async (index: number) => {
    const urlToRemove = previews[index];

    // 1. If we are in Edit Mode and the URL is a remote Supabase URL
    if (isEditMode && urlToRemove.includes("supabase.co")) {
      const confirmDelete = window.confirm(
        t('createListing.deletePhotoConfirm'),
      );
      if (!confirmDelete) return;

      try {
        // A. Extract file path from URL (e.g., "propertyId/filename.jpg")
        const filePath = urlToRemove.split("properties/").pop();
        if (filePath) {
          await supabase.storage.from("properties").remove([filePath]);
        }

        // B. Delete record from database
        await supabase.from("property_images").delete().eq("url", urlToRemove);

        // C. If this was the main_image, reset it in properties table
        if (formData.main_image === urlToRemove) {
          await supabase
            .from("properties")
            .update({ main_image: null })
            .eq("id", id);
        }
      } catch (error) {
        console.error("Error deleting image:", error);
        alert(t('createListing.errorDeleteImage'));
        return;
      }
    }

    // 2. Handle Local State Cleanup (Existing Logic)
    setImages((prev) => prev.filter((_, i) => i !== index));

    // Only revoke if it's a blob URL (not a remote Supabase URL)
    if (urlToRemove.startsWith("blob:")) {
      URL.revokeObjectURL(urlToRemove);
    }

    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (isEditMode) {
      fetchPropertyDetails();
    }
  }, [id]);

  async function fetchPropertyDetails() {
    setLoading(true);
    try {
      // Fetch property, images, and amenities
      const { data: property, error } = await supabase
        .from("properties")
        .select(`*, property_images(url), property_amenities(amenity_id)`)
        .eq("id", id)
        .single();

      if (error) throw error;

      // Map DB data to your Form State
      setFormData({
        title: property.title,
        description: property.description,
        address: property.address,
        city: property.city,
        price_per_night: property.price_per_night.toString(),
        max_guests: property.max_guests,
        bedrooms: property.bedrooms,
        beds: property.beds,
        bathrooms: property.bathrooms,
        lat: property.lat,
        lng: property.lng,
        main_image: property.main_image,
      });

      // Map existing amenities
      setSelectedAmenities(
        property.property_amenities.map((a: any) => a.amenity_id),
      );

      // Set existing image previews
      setPreviews(property.property_images.map((img: any) => img.url));
    } catch (error) {
      console.error("Error loading property:", error);
      alert(t('createListing.errorLoadProperty'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    checkHostRole();
    fetchAmenities();
  }, []);

  async function checkHostRole() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "host") {
        setIsHost(true);
      }
    } catch (error) {
      console.error("Error checking role:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAmenities() {
    const { data } = await supabase.from("amenities").select("*").order("name");
    if (data) setAllAmenities(data);
  }

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
    const map = useMapEvents({});
    useEffect(() => {
      map.setView([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Auth Check
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");

      // 2. Validation
      if (images.length === 0 && previews.length === 0) {
        throw new Error("Please upload at least one image for your property.");
      }

      let propertyId = id;

      if (isEditMode) {
        // 1. Update basic property info
        const { error: updateError } = await supabase
          .from("properties")
          .update({
            ...formData,
            price_per_night: parseFloat(formData.price_per_night),
          })
          .eq("id", id);

        if (updateError) throw updateError;

        // 2. Upload NEW images if any were added
        if (images.length > 0) {
          const uploadPromises = images.map(async (image) => {
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
            const filePath = `${id}/${fileName}`;
            await supabase.storage.from("properties").upload(filePath, image);
            const {
              data: { publicUrl },
            } = supabase.storage.from("properties").getPublicUrl(filePath);
            return publicUrl;
          });

          const newUrls = await Promise.all(uploadPromises);

          // 3. Add new image records to the table
          const imageRecords = newUrls.map((url) => ({
            property_id: id,
            url: url,
          }));
          await supabase.from("property_images").insert(imageRecords);

          // 4. Update main_image if it was empty
          if (!formData.main_image && newUrls.length > 0) {
            await supabase
              .from("properties")
              .update({ main_image: newUrls[0] })
              .eq("id", id);
          }
        }

        // 5. Update Amenities (Sync approach: delete all and re-insert)
        await supabase
          .from("property_amenities")
          .delete()
          .eq("property_id", id);
        if (selectedAmenities.length > 0) {
          const amenityRelations = selectedAmenities.map((amId) => ({
            property_id: id,
            amenity_id: amId,
          }));
          await supabase.from("property_amenities").insert(amenityRelations);
        }
      } else {
        const { data: property, error: propError } = await supabase
          .from("properties")
          .insert([
            {
              ...formData,
              host_id: user.id,
              price_per_night: parseFloat(formData.price_per_night),
              // We set the main_image temporarily to null or a placeholder
              // We will update it after uploading the images
              main_image: null,
              is_active: true,
            },
          ])
          .select()
          .single();

        if (propError) throw propError;

        const propertyId = property.id;
        const uploadedImageUrls: string[] = [];

        // 4. Upload Images to Supabase Storage
        // Folder structure: properties/{propertyId}/{fileName}
        const uploadPromises = images.map(async (image) => {
          const fileExt = image.name.split(".").pop();
          // Create unique filename to prevent overwrites
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${propertyId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("properties")
            .upload(filePath, image);

          if (uploadError) throw uploadError;

          // Get Public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("properties").getPublicUrl(filePath);

          return publicUrl;
        });

        // Wait for all uploads to finish
        const urls = await Promise.all(uploadPromises);
        uploadedImageUrls.push(...urls);

        // 5. Insert into property_images table
        const imageRecords = uploadedImageUrls.map((url, index) => ({
          property_id: propertyId,
          url: url,
          display_order: index,
        }));

        const { error: imgTableError } = await supabase
          .from("property_images")
          .insert(imageRecords);

        if (imgTableError) throw imgTableError;

        // 6. Update the main 'properties' table with the first image as the cover
        if (uploadedImageUrls.length > 0) {
          const { error: updateError } = await supabase
            .from("properties")
            .update({ main_image: uploadedImageUrls[0] })
            .eq("id", propertyId);

          if (updateError) throw updateError;
        }

        // 7. Insert Amenities (Existing Logic)
        if (selectedAmenities.length > 0) {
          const amenityRelations = selectedAmenities.map((amenityId) => ({
            property_id: propertyId,
            amenity_id: amenityId,
          }));

          const { error: amenityError } = await supabase
            .from("property_amenities")
            .insert(amenityRelations);

          if (amenityError) throw amenityError;
        }
      }

      if (isEditMode) alert(t('createListing.successEdit'));
      else alert(t('createListing.successCreate'));

      navigate("/host/manage-listings"); // or wherever you want to go
    } catch (error: any) {
      console.error("Submission Error:", error);
      alert(error.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-emerald-600 font-medium">
          {t('createListing.loading')}
        </div>
      </div>
    );
  }

  if (!isHost) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-rose-50 text-rose-600 p-4 rounded-full mb-4">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{t('createListing.accessDenied')}</h2>
        <p className="text-slate-500 mt-2 max-w-sm">
          {t('createListing.accessDeniedDesc')}
        </p>
        <Button className="mt-6" onClick={() => navigate("/profile")}>
          {t('createListing.goToProfile')}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-20">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 group cursor-pointer"
        >
          <ChevronLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-medium">{t('createListing.back')}</span>
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              {isEditMode ? t('createListing.titleEdit') : t('createListing.titleCreate')}
            </h1>
            <p className="text-slate-500 mt-2">
              {t('createListing.subtitle')}
            </p>
          </div>
          <div className="hidden md:block">
            <PlusCircle size={48} className="text-emerald-600" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* --- BASIC INFO --- */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
            
            {/* Header and Button Container */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Building2 className="text-emerald-600" size={20} /> {t('createListing.generalInfo')}
              </h3>
              
              {/* AI MAGIC BUTTON (Moved to the top!) */}
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleGenerateDescription}
                disabled={isGenerating || !formData.city} 
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 transition-colors w-full sm:w-auto cursor-pointer"
              >
                <Sparkles size={16} className="mr-2" />
                {isGenerating ? t('createListing.aiGenerating') : t('createListing.aiGenerate')}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">{t('createListing.propertyTitle')}</Label>
              <Input
                id="title"
                placeholder={t('createListing.titlePlaceholder')}
                required
                className="rounded-xl border-slate-200"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('createListing.description')}</Label>
              <Textarea
                id="description"
                placeholder={t('createListing.descriptionPlaceholder')}
                rows={5}
                className="rounded-xl border-slate-200 resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          {/* --- IMAGE UPLOAD SECTION --- */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ImageIcon className="text-emerald-600" size={20} /> {t('createListing.photos')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="bg-emerald-100 p-4 rounded-full mb-4">
                  <UploadCloud className="text-emerald-600" size={24} />
                </div>
                <h4 className="font-semibold text-slate-900">
                  {t('createListing.uploadPhotos')}
                </h4>
                <p className="text-sm text-slate-500 mt-1">
                  {t('createListing.uploadHint')}
                </p>
              </div>

              {/* Previews */}
              <div className="grid grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                {previews.map((url, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200"
                  >
                    <img
                      src={url}
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded">
                        {t('createListing.mainCover')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- LOCATION & MAP --- */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="text-emerald-600" size={20} /> {t('createListing.location')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">{t('createListing.city')}</Label>
                <Input
                  id="city"
                  placeholder={t('createListing.cityPlaceholder')}
                  required
                  className="rounded-xl border-slate-200"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t('createListing.fullAddress')}</Label>
                <Input
                  id="address"
                  placeholder={t('createListing.addressPlaceholder')}
                  required
                  className="rounded-xl border-slate-200"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>

            {/* MAP SECTION */}
            <div className="space-y-4">
              <Label>{t('createListing.setLocation')}</Label>
              <div className="h-72 w-full rounded-2xl overflow-hidden border border-slate-200 relative z-10">
                <MapContainer
                  center={[formData.lat, formData.lng]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
                  />
                  <RecenterMap lat={formData.lat} lng={formData.lng} />
                  <LocationPicker
                    lat={formData.lat}
                    lng={formData.lng}
                    setPosition={(lat, lng) =>
                      setFormData((prev) => ({ ...prev, lat, lng }))
                    }
                  />
                </MapContainer>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label
                    htmlFor="lat"
                    className="text-[10px] text-slate-400 uppercase font-bold"
                  >
                    {t('createListing.latitude')}
                  </Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any" // Allows any decimal precision
                    value={formData.lat}
                    className="bg-white text-xs rounded-xl"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val))
                        setFormData((prev) => ({ ...prev, lat: val }));
                    }}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label
                    htmlFor="lng"
                    className="text-[10px] text-slate-400 uppercase font-bold"
                  >
                    {t('createListing.longitude')}
                  </Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={formData.lng}
                    className="bg-white text-xs rounded-xl"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val))
                        setFormData((prev) => ({ ...prev, lng: val }));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- PRICING & CAPACITY --- */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Info className="text-emerald-600" size={20} /> {t('createListing.pricingCapacity')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-2">
                  <DollarSign size={14} /> {t('createListing.pricePerNight')}
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  required
                  className="rounded-xl border-slate-200"
                  value={formData.price_per_night}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price_per_night: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests" className="flex items-center gap-2">
                  <Users size={14} /> {t('createListing.maxGuests')}
                </Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  className="rounded-xl border-slate-200"
                  value={formData.max_guests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_guests: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Bed size={12} /> {t('createListing.bedrooms')}
                </Label>
                <Input
                  type="number"
                  min="0"
                  className="rounded-xl"
                  value={formData.bedrooms}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bedrooms: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1">
                  {t('createListing.beds')}
                </Label>
                <Input
                  type="number"
                  min="0"
                  className="rounded-xl"
                  value={formData.beds}
                  onChange={(e) =>
                    setFormData({ ...formData, beds: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Bath size={12} /> {t('createListing.baths')}
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  className="rounded-xl"
                  value={formData.bathrooms}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bathrooms: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* --- AMENITIES SECTION --- */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="text-emerald-600" size={20} /> {t('createListing.amenities')}
            </h3>
            <p className="text-sm text-slate-500">
              {t('createListing.amenitiesHint')}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allAmenities.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all text-left cursor-pointer",
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-emerald-900" : "text-slate-600",
                      )}
                    >
                      {amenity.name}
                    </span>
                    {isSelected && (
                      <Check size={16} className="text-emerald-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* --- SUBMIT --- */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
              className="px-8 rounded-xl"
            >
              {t('createListing.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-6 rounded-xl text-lg font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
            >
              {submitting
                ? t('createListing.saving')
                : isEditMode
                  ? t('createListing.saveChanges')
                  : t('createListing.listProperty')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
