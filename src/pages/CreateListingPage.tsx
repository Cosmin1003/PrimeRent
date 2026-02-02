"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    checkHostRole();
  }, []);

  async function checkHostRole() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const latitude =
        typeof formData.lat === "string"
          ? parseFloat(formData.lat)
          : formData.lat;
      const longitude =
        typeof formData.lng === "string"
          ? parseFloat(formData.lng)
          : formData.lng;

      if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        throw new Error(
          "Please provide valid coordinates. Lat: -90 to 90, Lng: -180 to 180.",
        );
      }

      const { error } = await supabase.from("properties").insert([
        {
          ...formData,
          host_id: user?.id,
          price_per_night: parseFloat(formData.price_per_night),
          is_active: true,
        },
      ]);

      if (error) throw error;

      alert("Property listed successfully!");
      navigate("/explore");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-emerald-600 font-medium">
          Verifying host status...
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
        <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-slate-500 mt-2 max-w-sm">
          Only registered hosts can list new properties. Please upgrade your
          account in the profile section.
        </p>
        <Button className="mt-6" onClick={() => navigate("/profile")}>
          Go to Profile
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
          <span className="font-medium">Back</span>
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              List your space
            </h1>
            <p className="text-slate-500 mt-2">
              Fill in the details to start reaching guests.
            </p>
          </div>
          <div className="hidden md:block">
            <PlusCircle size={48} className="text-emerald-100" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* --- BASIC INFO --- */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Building2 className="text-emerald-600" size={20} /> General
              Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="title">Property Title</Label>
              <Input
                id="title"
                placeholder="e.g., Luxury Beachfront Villa"
                required
                className="rounded-xl border-slate-200"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what makes your space unique..."
                rows={5}
                className="rounded-xl border-slate-200 resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          {/* --- LOCATION & MAP --- */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="text-emerald-600" size={20} /> Location
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g., New York"
                  required
                  className="rounded-xl border-slate-200"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  placeholder="Street, Building, Apt #"
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
              <Label>Set Exact Location (Click on Map)</Label>
              <div className="h-72 w-full rounded-2xl overflow-hidden border border-slate-200 z-0">
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
                    Latitude
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
                    Longitude
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
              <Info className="text-emerald-600" size={20} /> Pricing & Capacity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-2">
                  <DollarSign size={14} /> Price per Night
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
                  <Users size={14} /> Max Guests
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
                  <Bed size={12} /> Bedrooms
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
                  Beds
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
                  <Bath size={12} /> Baths
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

          {/* --- SUBMIT --- */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
              className="px-8 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-6 rounded-xl text-lg font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
            >
              {submitting ? "Publishing..." : "List Property"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
