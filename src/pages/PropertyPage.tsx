"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import { Star, Share, Heart, ChevronLeft, Minus, Plus } from "lucide-react";

import { Button, Button as ShadButton } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Types
import type { Property } from "../types/property";
import type { Amenity } from "@/types/amenity";
import { getAmenityDetails } from "@/types/amenity";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Review } from "@/types/review";
import { cn } from "@/lib/utils";
import { useFavorite } from "@/hooks/useFavorite";
import type { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { differenceInDays, format } from "date-fns";

export default function PropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string | undefined>();
  const { isFavorited, toggleFavorite } = useFavorite(id!, userId);

  const [property, setProperty] = useState<Property | null>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestCount, setGuestCount] = useState(1);

  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const reviewsRef = useRef<HTMLDivElement>(null);
  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const galleryImages = property?.property_images || [];

  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const [bookedDates, setBookedDates] = useState<DateRange[]>([]);

  useEffect(() => {
    async function fetchPropertyData() {
      setLoading(true);
      try {
        // 1. Fetch Property + Host Info
        const { data: propData, error: propError } = await supabase
          .from("properties")
          .select(`*, profiles ( full_name ), property_images ( url )`)
          .eq("id", id)
          .single();

        if (propError) throw propError;

        // 2. Fetch Amenities
        const { data: amData } = await supabase
          .from("property_amenities")
          .select(`amenities ( id, name )`)
          .eq("property_id", id);

        // 3. Fetch Reviews + Reviewer Profile info
        const { data: revData, error: revError } = await supabase
          .from("reviews")
          .select(
            `
          *,
          profiles (
            full_name,
            avatar_url
          )
        `,
          )
          .eq("property_id", id)
          .order("created_at", { ascending: false });

        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("check_in, check_out")
          .eq("property_id", id)
          .neq("status", "cancelled");

        if (bookingsData) {
          const ranges = bookingsData.map((b) => ({
            from: new Date(b.check_in),
            to: new Date(b.check_out),
          }));
          setBookedDates(ranges);
        }

        if (revError) throw revError;

        // Calculate average rating
        const avgRating =
          revData && revData.length > 0
            ? revData.reduce((acc, item) => acc + item.rating, 0) /
              revData.length
            : 0;

        setProperty({
          ...propData,
          host_full_name: propData.profiles?.full_name || "Host",
          property_images: propData.property_images,
          avg_rating: avgRating, // Override with calculated rating
        });

        setReviews(revData || []);
        if (amData) setAmenities(amData.map((item: any) => item.amenities));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchPropertyData();
  }, [id]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeImageIndex === null) return;
      if (e.key === "ArrowLeft") {
        setActiveImageIndex((prev) =>
          prev! > 0 ? prev! - 1 : galleryImages.length - 1,
        );
      } else if (e.key === "ArrowRight") {
        setActiveImageIndex((prev) =>
          prev! < galleryImages.length - 1 ? prev! + 1 : 0,
        );
      } else if (e.key === "Escape") {
        setActiveImageIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImageIndex, galleryImages.length]);

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

  const calculateNights = () => {
    if (date?.from && date?.to) {
      const nights = differenceInDays(date.to, date.from);
      return nights > 0 ? nights : 0;
    }
    return 0;
  };

  const nights = calculateNights();
  const cleaningFee = 85;
  const basePrice = Math.round(property.price_per_night * nights);
  const totalPrice = basePrice + cleaningFee;

  const handleShare = async () => {
    const shareData = {
      title: property?.title || "Check out this stay!",
      text: `Take a look at ${property?.title} in ${property?.city}`,
      url: window.location.href, // Current page URL
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const isRangeAvailable = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) return true;

    return !bookedDates.some((booked) => {
      // Check if any booked date falls between the user's selected from/to
      return (
        (booked.from! >= range.from! && booked.from! <= range.to!) ||
        (booked.to! >= range.from! && booked.to! <= range.to!)
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-00">
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
            <div className="flex items-center gap-4 text-sm font-semibold">
              <div
                onClick={scrollToReviews}
                className="flex items-center gap-1 cursor-pointer text-emerald-600"
              >
                <Star className="size-4 fill-emerald-600" />
                <span>
                  {property.avg_rating > 0
                    ? `${property.avg_rating.toFixed(2)} (${reviews.length})`
                    : "New"}
                </span>
              </div>
              <span>
                {property.city}, {property.address}
              </span>
            </div>
            <div className="flex gap-6">
              <ShadButton
                variant="ghost"
                className="font-bold text-sm"
                onClick={handleShare}
              >
                <Share className="size-4 mr-1" /> Share
              </ShadButton>
              <ShadButton
                variant="ghost"
                className="font-bold text-sm transition-all"
                onClick={toggleFavorite}
              >
                <Heart
                  className={cn(
                    "size-4 mr-1 transition-colors",
                    isFavorited ? "fill-red-500 text-red-500" : "text-gray-600",
                  )}
                />
                {isFavorited ? "Saved" : "Save"}
              </ShadButton>
            </div>
          </div>
        </div>

        {/* Image Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-xl overflow-hidden aspect-video md:aspect-[2/1] relative">
          <div className="md:col-span-2 relative">
            <img
              src={property.main_image}
              onClick={() => setActiveImageIndex(0)}
              className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer"
              alt="Main"
            />
          </div>
          {/* Grid Placeholders for Airbnb aesthetic */}
          <div className="hidden md:block relative space-y-2">
            <div className="h-1/2 overflow-hidden bg-gray-200">
              {property.property_images?.[1] && (
                <img
                  src={property.property_images[1].url}
                  onClick={() => setActiveImageIndex(1)}
                  className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer"
                />
              )}
            </div>
            <div className="h-1/2 overflow-hidden bg-gray-200">
              {property.property_images?.[2] && (
                <img
                  src={property.property_images[2].url}
                  onClick={() => setActiveImageIndex(2)}
                  className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer"
                />
              )}
            </div>
          </div>
          <div className="hidden md:block relative space-y-2">
            <div className="h-1/2 overflow-hidden bg-gray-200">
              {property.property_images?.[3] && (
                <img
                  src={property.property_images[3].url}
                  onClick={() => setActiveImageIndex(3)}
                  className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer"
                />
              )}
            </div>
            <div className="h-1/2 overflow-hidden bg-gray-200">
              {property.property_images?.[4] && (
                <img
                  src={property.property_images[4].url}
                  onClick={() => setActiveImageIndex(4)}
                  className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer"
                />
              )}
            </div>
          </div>
          {(property.property_images?.length ?? 0) > 5 && (
            <ShadButton
              variant="outline"
              className="absolute bottom-6 right-6 bg-white border-black text-xs font-bold shadow-md hover:bg-gray-200"
            >
              Show all photos
            </ShadButton>
          )}
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
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-6">What this place offers</h3>

              {/* 2-Column Grid for first 6 items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                {amenities.slice(0, 6).map((am) => {
                  const details = getAmenityDetails(am.name);
                  return (
                    <div key={am.id} className="flex gap-4">
                      <details.icon className="size-6 mt-1 text-[#0bad7b]" />
                      <div>
                        <h4 className="font-bold">{am.name}</h4>
                        <p className="text-sm text-gray-500">{details.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* "Show All" Button Trigger */}
              {amenities.length > 6 && (
                <Dialog
                  open={showAllAmenities}
                  onOpenChange={setShowAllAmenities}
                >
                  <DialogTrigger asChild>
                    <ShadButton
                      variant="outline"
                      className="mt-5 border-black font-bold px-6 h-12 rounded-xl hover:bg-gray-50"
                    >
                      Show all {amenities.length} amenities
                    </ShadButton>
                  </DialogTrigger>

                  {/* Updated Dialog: p-0 and overflow-hidden are key here */}
                  <DialogContent className="max-w-2xl h-[75vh] p-0 overflow-hidden rounded-3xl flex flex-col border-none shadow-2xl">
                    {/* 1. Sticky Header - stays at the top while you scroll the list */}
                    <DialogHeader className="p-8 pb-6 border-b flex-shrink-0 bg-white">
                      <DialogTitle className="text-2xl font-bold text-gray-900">
                        What this place offers
                      </DialogTitle>
                    </DialogHeader>

                    {/* 2. Scrollable Body - This is the only part that scrolls */}
                    <div className="flex-1 overflow-y-auto pl-6 pt-2 mb-4">
                      <div className="space-y-8">
                        {amenities.map((am) => {
                          const details = getAmenityDetails(am.name);
                          return (
                            <div
                              key={am.id}
                              className="flex gap-6 items-start pb-6 border-b border-gray-100 last:border-0"
                            >
                              <details.icon className="size-7 text-[#0bad7b] flex-shrink-0" />
                              <div>
                                <h4 className="text-m font-medium text-gray-900">
                                  {am.name}
                                </h4>
                                <p className="text-gray-500 leading-relaxed">
                                  {details.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
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
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="grid grid-cols-2 border-b border-gray-400 divide-x divide-gray-400 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="p-3">
                        <label className="block text-[10px] font-extrabold uppercase text-gray-500">
                          Check-in
                        </label>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            !date?.from && "text-gray-400 font-normal",
                          )}
                        >
                          {date?.from
                            ? format(date.from, "MM/dd/yyyy")
                            : "Add date"}
                        </span>
                      </div>
                      <div className="p-3">
                        <label className="block text-[10px] font-extrabold uppercase text-gray-500">
                          Checkout
                        </label>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            !date?.to && "text-gray-400 font-normal",
                          )}
                        >
                          {date?.to
                            ? format(date.to, "MM/dd/yyyy")
                            : "Add date"}
                        </span>
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 rounded-3xl"
                    align="end"
                  >
                    <div className="p-4 border-b flex justify-between items-center">
                      <span className="text-sm font-bold">Select Dates</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDate({ from: undefined, to: undefined })
                        }
                        className="text-xs underline"
                      >
                        Clear dates
                      </Button>
                    </div>
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                      disabled={[
                        // 1. Disable past dates
                        { before: new Date(new Date().setHours(0, 0, 0, 0)) },
                        // 2. Disable existing booking ranges
                        ...bookedDates.map((range) => ({
                          from: range.from!,
                          to: range.to!,
                        })),
                      ]}
                      classNames={{
                        day: cn(
                          "[&_[data-range-start=true]]:!bg-emerald-600 [&_[data-range-start=true]]:!text-white",
                          "[&_[data-range-end=true]]:!bg-emerald-600 [&_[data-range-end=true]]:!text-white",
                          "[&_[data-range-middle=true]]:!bg-emerald-100 [&_[data-range-middle=true]]:!text-emerald-900",
                        ),
                        range_start: "!bg-emerald-600 !rounded-l-md",
                        range_end: "!bg-emerald-600 !rounded-r-md",
                        range_middle: "!bg-emerald-100",
                      }}
                    />
                  </PopoverContent>
                </Popover>
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
                      disabled={guestCount <= 1}
                      className="size-7 rounded-full border border-gray-300 flex items-center justify-center enabled:hover:border-black disabled:opacity-30 transition-all enabled:cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Minus className="size-3" />
                    </button>
                    <button
                      onClick={() => setGuestCount(guestCount + 1)}
                      disabled={guestCount >= property.max_guests}
                      className="size-7 rounded-full border border-gray-300 flex items-center justify-center enabled:hover:border-black disabled:opacity-30 transition-all enabled:cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <ShadButton
                  disabled={nights === 0 || !isRangeAvailable(date)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 text-lg rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reserve
                </ShadButton>

                {nights > 0 && !isRangeAvailable(date) && (
                  <p className="text-destructive text-xs text-center font-medium animate-in fade-in slide-in-from-top-1">
                    Some dates in this range are already booked.
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {nights > 0 ? (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>
                        ${property.price_per_night} x {nights}{" "}
                        {nights === 1 ? "night" : "nights"}
                      </span>
                      <span>${basePrice}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Cleaning fee</span>
                      <span>${cleaningFee}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg pt-2">
                      <span>Total before taxes</span>
                      <span>${totalPrice}</span>
                    </div>
                  </>
                ) : (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Select dates to see total price
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div
        className="container max-w-6xl mx-auto px-4 md:px-6 scroll-mt-20"
        ref={reviewsRef}
      >
        <Separator className="my-12" />

        <section className="pb-12">
          {/* Header with Star and Total Count */}
          <div className="flex items-center gap-2 text-2xl font-bold mb-8 text-emerald-700">
            <Star className="size-6 fill-emerald-600 text-emerald-600" />
            <span>
              {property.avg_rating > 0 ? property.avg_rating.toFixed(2) : "New"}
            </span>
            <span className="text-emerald-600">•</span>
            <span>
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </div>

          {/* 2x2 Grid for the first 4 reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {reviews.length > 0 ? (
              reviews.slice(0, 4).map((review) => (
                <div key={review.id} className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={
                          review.profiles.avatar_url ||
                          `https://ui-avatars.com/api/?name=${review.profiles.full_name}`
                        }
                        alt={review.profiles.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold">{review.profiles.full_name}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString(
                          "en-US",
                          { month: "long", year: "numeric" },
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3 ${i < review.rating ? "fill-emerald-600 text-emerald-600" : "text-gray-300"}`}
                      />
                    ))}
                  </div>

                  <p className="text-gray-700 leading-relaxed line-clamp-3">
                    {review.comment}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">
                No reviews yet for this property.
              </p>
            )}
          </div>

          {/* "Show All Reviews" Dialog Logic */}
          {reviews.length > 4 && (
            <Dialog open={showAllReviews} onOpenChange={setShowAllReviews}>
              <DialogTrigger asChild>
                <ShadButton
                  variant="outline"
                  className="mt-5 border-black font-bold px-6 h-12 rounded-xl hover:bg-gray-50"
                >
                  Show all {reviews.length} reviews
                </ShadButton>
              </DialogTrigger>

              <DialogContent className="max-w-3xl! h-[75vh] p-0 overflow-hidden rounded-3xl flex flex-col border-none shadow-2xl">
                {/* Sticky Header with Average Rating */}
                <DialogHeader className="p-8 pb-6 border-b flex-shrink-0 bg-white text-emerald-700">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <Star className="size-6 fill-emerald-600 text-emerald-600" />
                    {property.avg_rating > 0
                      ? property.avg_rating.toFixed(2)
                      : "New"}{" "}
                    <span className="text-emerald-600">·</span> {reviews.length}{" "}
                    reviews
                  </DialogTitle>
                </DialogHeader>

                {/* Scrollable Review List */}
                <div className="flex-1 overflow-y-auto p-8 pt-4 mb-5">
                  <div className="space-y-10">
                    {reviews.map((review) => (
                      <div key={review.id} className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            <img
                              src={
                                review.profiles.avatar_url ||
                                `https://ui-avatars.com/api/?name=${review.profiles.full_name}`
                              }
                              alt={review.profiles.full_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">
                              {review.profiles.full_name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString(
                                "en-US",
                                { month: "long", year: "numeric" },
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3 ${i < review.rating ? "fill-emerald-600 text-emerald-600" : "text-gray-300"}`}
                            />
                          ))}
                        </div>

                        <p className="text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                        <Separator className="mt-8" />
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </section>
      </div>

      <Dialog
        open={activeImageIndex !== null}
        onOpenChange={(open) => !open && setActiveImageIndex(null)}
      >
        <DialogContent className="h-[90vh] p-0 bg-gray-50 border-none flex items-center justify-center outline-none lg:max-w-3xl xl:max-w-5xl  2xl:max-w-7xl">
          <DialogTitle className="sr-only">Image Gallery</DialogTitle>

          {/* Navigation - Previous */}
          <button
            onClick={() =>
              setActiveImageIndex((prev) =>
                prev! > 0 ? prev! - 1 : galleryImages.length - 1,
              )
            }
            className="absolute left-4 z-50 p-3 rounded-full border-gray-200 bg-white text-gray-900 shadow-md hover:bg-gray-50 transition-all active:scale-90 cursor-pointer"
          >
            <ChevronLeft className="size-8" />
          </button>

          {/* The Image Container */}
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
            <img
              src={galleryImages[activeImageIndex ?? 0]?.url}
              className="max-w-full max-h-full object-contain animate-in fade-in zoom-in duration-300"
              alt="Property"
            />

            {/* Counter Label */}
            <div className="absolute bottom-6 px-4 py-1.5 rounded-full bg-black/80 text-white text-sm font-boldfont-medium">
              {activeImageIndex! + 1} / {galleryImages.length}
            </div>
          </div>

          {/* Navigation - Next */}
          <button
            onClick={() =>
              setActiveImageIndex((prev) =>
                prev! < galleryImages.length - 1 ? prev! + 1 : 0,
              )
            }
            className="absolute right-4 z-50 p-3 rounded-full border-gray-200 bg-white text-gray-900 shadow-md hover:bg-gray-50 transition-all active:scale-90 cursor-pointer"
          >
            <ChevronLeft className="size-8 rotate-180" />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
