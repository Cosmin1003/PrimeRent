"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import {
  Star,
  MapPin,
  Share,
  Heart,
  ChevronLeft,
  Minus,
  Plus,
} from "lucide-react";

import { Button as ShadButton } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Types
import type { Property, Amenity } from "../types/property";

import {
  Wifi,
  Tv,
  Wind,
  Car,
  Coffee,
  Utensils,
  ShieldCheck,
  Waves,
  Dumbbell,
  Flame,
  Baby,
  PawPrint,
  Laptop,
  Bath,
  WashingMachine,
  Refrigerator,
  Microwave,
  Key,
  PocketKnife,
  Flower2,
  Thermometer,
} from "lucide-react";

const getAmenityDetails = (name: string) => {
  const map: Record<string, { icon: any; desc: string }> = {
    // Basic Essentials
    Wifi: { icon: Wifi, desc: "High-speed internet throughout the property." },
    TV: { icon: Tv, desc: "Smart TV with access to popular streaming apps." },
    "Air conditioning": {
      icon: Wind,
      desc: "Central or unit cooling for your comfort.",
    },
    Heating: { icon: Thermometer, desc: "Keep warm during the cooler months." },
    Kitchen: {
      icon: Utensils,
      desc: "Fully equipped space for meal preparation.",
    },

    // Parking & Entry
    "Free parking": {
      icon: Car,
      desc: "On-site parking available at no extra cost.",
    },
    "Self check-in": {
      icon: Key,
      desc: "Check yourself in using a secure keypad or lockbox.",
    },

    // Laundry & Cleaning
    Washer: {
      icon: WashingMachine,
      desc: "In-unit laundry facilities for long-term stays.",
    },
    Dryer: {
      icon: WashingMachine,
      desc: "Standard drying machine available for guest use.",
    },
    Iron: { icon: PocketKnife, desc: "Professional iron and board provided." },

    // Cooking & Appliances
    "Coffee maker": {
      icon: Coffee,
      desc: "Brew your favorite beans every morning.",
    },
    Refrigerator: {
      icon: Refrigerator,
      desc: "Full-sized fridge to keep your groceries fresh.",
    },
    Microwave: { icon: Microwave, desc: "For quick meal heating and snacks." },

    // Lifestyle & Facilities
    "Dedicated workspace": {
      icon: Laptop,
      desc: "A desk or table with comfortable seating for work.",
    },
    Pool: { icon: Waves, desc: "Access to a private or shared swimming pool." },
    Gym: {
      icon: Dumbbell,
      desc: "On-site fitness equipment for your workouts.",
    },
    Backyard: {
      icon: Flower2,
      desc: "Private outdoor space with greenery or seating.",
    },

    // Policies & Safety
    "Pet friendly": {
      icon: PawPrint,
      desc: "Your furry friends are welcome to join you.",
    },
    "Family friendly": {
      icon: Baby,
      desc: "Equipment and layout suitable for children.",
    },
    "Fire extinguisher": {
      icon: Flame,
      desc: "Safety equipment located in an accessible area.",
    },
  };

  // Default fallback if amenity name doesn't match the map
  return (
    map[name] || {
      icon: ShieldCheck,
      desc: "Quality amenity verified and provided by the host.",
    }
  );
};

export default function PropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestCount, setGuestCount] = useState(1);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  useEffect(() => {
    async function fetchPropertyData() {
      setLoading(true);
      try {
        // 1. Fetch main property data
        const { data: propData, error: propError } = await supabase
          .from("properties")
          .select(
            `
            *,
            profiles (
              full_name
            )
          `,
          )
          .eq("id", id)
          .single();

        if (propError) throw propError;

        // 2. Fetch linked amenities
        const { data: amData } = await supabase
          .from("property_amenities")
          .select(
            `
            amenities (
              id,
              name
            )
          `,
          )
          .eq("property_id", id);

        const formattedProperty = {
          ...propData,
          host_full_name: propData.profiles?.full_name || "Host",
        };

        setProperty(formattedProperty);
        if (amData) {
          setAmenities(amData.map((item: any) => item.amenities));
        }
      } catch (err) {
        console.error("Error fetching property:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchPropertyData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-400 font-medium">
          Loading luxury stays...
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-bold">Property not found</h2>
        <ShadButton onClick={() => navigate("/explore")} variant="link">
          Go back to explore
        </ShadButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 sticky top-0 bg-white z-50 border-b">
        <ShadButton variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="size-5" />
        </ShadButton>
        <div className="flex gap-2">
          <ShadButton variant="ghost" size="icon">
            <Share className="size-5" />
          </ShadButton>
          <ShadButton variant="ghost" size="icon">
            <Heart className="size-5" />
          </ShadButton>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 md:px-6 pt-6 mt-4">
        {/* Desktop Header */}
        <div className="hidden md:block mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-4 text-sm font-semibold underline">
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-black" />
                <span>
                  {property.avg_rating > 0
                    ? property.avg_rating.toFixed(2)
                    : "New"}
                </span>
              </div>
              <span>
                {property.city}, {property.address}
              </span>
            </div>
            <div className="flex gap-4">
              <ShadButton
                variant="ghost"
                className="underline font-bold text-sm"
              >
                <Share className="size-4 mr-2" /> Share
              </ShadButton>
              <ShadButton
                variant="ghost"
                className="underline font-bold text-sm"
              >
                <Heart className="size-4 mr-2" /> Save
              </ShadButton>
            </div>
          </div>
        </div>

        {/* Image Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-xl overflow-hidden aspect-video md:aspect-[2/1] relative">
          <div className="md:col-span-2 relative">
            <img
              src={property.main_image}
              className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer"
              alt="Main"
            />
          </div>
          {/* Grid Placeholders for Airbnb aesthetic */}
          <div className="hidden md:block relative space-y-2">
            <div className="h-1/2 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800"
                className="w-full h-full object-cover hover:brightness-90 transition"
              />
            </div>
            <div className="h-1/2 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=800"
                className="w-full h-full object-cover hover:brightness-90 transition"
              />
            </div>
          </div>
          <div className="hidden md:block relative space-y-2">
            <div className="h-1/2 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800"
                className="w-full h-full object-cover hover:brightness-90 transition"
              />
            </div>
            <div className="h-1/2 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800"
                className="w-full h-full object-cover hover:brightness-90 transition"
              />
            </div>
          </div>
          <ShadButton
            variant="outline"
            className="absolute bottom-6 right-6 bg-white border-black text-xs font-bold shadow-md"
          >
            Show all photos
          </ShadButton>
        </div>

        {/* Layout: Info + Booking Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8">
          {/* Main Info */}
          <div className="md:col-span-2">
            {/* 1. Host & Room Info */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">
                  Hosted by {property.host_full_name || "a local host"}
                </h2>
                <p className="text-gray-600">
                  {property.max_guests}{" "}
                  {property.max_guests === 1 ? "guest" : "guests"} •{" "}
                  {property.bedrooms}{" "}
                  {property.bedrooms === 1 ? "bedroom" : "bedrooms"} •{" "}
                  {property.beds} {property.beds === 1 ? "bed" : "beds"} •{" "}
                  {property.bathrooms}{" "}
                  {property.bathrooms === 1 ? "bath" : "baths"}
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border">
                <img
                  src={`https://ui-avatars.com/api/?name=${property.host_full_name}&background=10b981&color=fff`}
                  alt="host"
                />
              </div>
            </div>

            <Separator className="my-8" />

            {/* 2. Description (Now moved directly under Info) */}
            <div>
              <h3 className="text-xl font-bold mb-4">About this space</h3>
              <p className="text-gray-700 leading-relaxed">
                {property.description ||
                  "Experience the perfect blend of comfort and style in this beautiful home. Located in a prime area, you'll be minutes away from the best local attractions while enjoying a quiet, private retreat."}
              </p>
            </div>

            <Separator className="my-8" />

            {/* 3. High-Detail Amenities List */}
            <div className="space-y-6">
              {/* Dynamic Amenities from DB with Hardcoded Details */}
              {amenities.map((am) => {
                const details = getAmenityDetails(am.name);
                return (
                  <div key={am.id} className="flex gap-4">
                    <details.icon className="size-6 mt-1 text-gray-700" />
                    <div>
                      <h4 className="font-bold">{am.name}</h4>
                      <p className="text-sm text-gray-500">{details.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="relative">
            <div className="sticky top-24 border border-gray-200 rounded-2xl p-6 shadow-xl bg-gray-50">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-2xl font-bold">
                    ${property.price_per_night}
                  </span>
                  <span className="text-gray-600 font-normal"> night</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold">
                  <Star className="size-3 fill-black" />
                  <span>
                    {property.avg_rating > 0
                      ? property.avg_rating.toFixed(1)
                      : "New"}
                  </span>
                </div>
              </div>

              {/* Selector Logic */}
              <div className="border border-gray-400 rounded-xl overflow-hidden mb-4">
                <div className="grid grid-cols-2 border-b border-gray-400">
                  <div className="p-3 border-r border-gray-400 cursor-pointer hover:bg-gray-50">
                    <label className="block text-[10px] font-extrabold uppercase">
                      Check-in
                    </label>
                    <span className="text-sm">Add date</span>
                  </div>
                  <div className="p-3 cursor-pointer hover:bg-gray-50">
                    <label className="block text-[10px] font-extrabold uppercase">
                      Checkout
                    </label>
                    <span className="text-sm">Add date</span>
                  </div>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase">
                      Guests
                    </label>
                    <span className="text-sm">{guestCount} guest</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      className="size-7 rounded-full border border-gray-300 flex items-center justify-center"
                    >
                      <Minus className="size-3" />
                    </button>
                    <button
                      onClick={() => setGuestCount(guestCount + 1)}
                      className="size-7 rounded-full border border-gray-300 flex items-center justify-center"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
              </div>

              <ShadButton className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 text-lg rounded-xl transition-all active:scale-[0.98]">
                Reserve
              </ShadButton>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-gray-600 underline">
                  <span>${property.price_per_night} x 5 nights</span>
                  <span>${property.price_per_night * 5}</span>
                </div>
                <div className="flex justify-between text-gray-600 underline">
                  <span>Cleaning fee</span>
                  <span>$85</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total before taxes</span>
                  <span>${property.price_per_night * 5 + 85}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
