"use client";

import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import {
  Search,
  Users,
  Calendar as CalendarIcon,
  MapPin,
  Star,
  Check,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Property, Amenity } from "../types/property";
import { Link } from "react-router-dom";

export default function ExplorePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]); // Final applied IDs
  const [tempSelectedAmenities, setTempSelectedAmenities] = useState<string[]>(
    [],
  ); // Staging IDs
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [sortBy, setSortBy] = useState<string>("default");

  // --- Search States ---
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState(1);
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data } = await supabase
        .from("amenities")
        .select("id, name, icon_name")
        .order("name", { ascending: true });

      if (data) setAllAmenities(data as Amenity[]);
    };
    fetchInitialData();
    fetchProperties();
  }, []);

  // --- Data Fetching ---
  const fetchProperties = async () => {
    setLoading(true);
    try {
      // 1. Prepare dates. If the user only picked one date, treat as null
      // so the backend doesn't try to filter an invalid range.
      const startDate =
        date?.from && date?.to ? format(date.from, "yyyy-MM-dd") : null;

      const endDate =
        date?.from && date?.to ? format(date.to, "yyyy-MM-dd") : null;

      // 2. Call the RPC
      const { data, error } = await supabase.rpc("search_properties", {
        p_city: location.trim() === "" ? null : location,
        p_guests: guests || 1,
        p_start_date: startDate,
        p_end_date: endDate,
        p_amenities: selectedAmenities.length > 0 ? selectedAmenities : null,
      });

      if (error) throw error;

      // 3. Map the flat SQL response back to your React Component's expected structure
      const formattedData = data.map((item: any) => ({
        ...item,
      }));

      setProperties(formattedData);
    } catch (error) {
      console.error("Error fetching properties:", error);
      // Optional: add a toast or alert for the user here
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [selectedAmenities]);

  const handleApplyFilters = () => {
    setSelectedAmenities(tempSelectedAmenities);
    setIsFilterOpen(false);
  };

  const toggleTempAmenity = (id: string) => {
    setTempSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const resetFilters = () => {
    setLocation("");
    setGuests(1);
    setDate({ from: undefined, to: undefined });

    // Optionally refetch properties immediately
    // fetchProperties();
  };

  // Check if any filter is currently active
  const isFiltered = location !== "" || guests > 1 || date?.from !== undefined;

  const sortedProperties = [...properties].sort((a, b) => {
    if (sortBy === "price-asc") return a.price_per_night - b.price_per_night;
    if (sortBy === "price-desc") return b.price_per_night - a.price_per_night;
    // If you add a rating column to your Property type later:
    // if (sortBy === "rating") return b.rating - a.rating;
    return 0; // default
  });

  return (
    <div className="bg-white md:bg-gray-50 pt-15 pb-20">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        {/* --- DESKTOP TOP BAR (Search + Filter Separated) --- */}
        <div className="hidden md:flex items-center justify-center gap-4 mb-12">
          {/* --- SORT BUTTON --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="hidden md:flex rounded-full h-14 px-6! border-gray-200 bg-white hover:bg-gray-50 shadow-md gap-2"
              >
                <ArrowUpDown className="size-4" />
                <span className="font-bold">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-2xl w-48 p-2">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setSortBy("default")}
              >
                Default
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setSortBy("price-asc")}
              >
                Price: Low to High
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setSortBy("price-desc")}
              >
                Price: High to Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 1. SEARCH BAR (The Pill) - your existing code follows... */}

          {/* 1. SEARCH BAR (The Pill) */}
          <div className="flex flex-1 bg-white p-2 rounded-full shadow-lg border border-gray-200 items-center max-w-4xl">
            {/* Location */}
            <div className="flex flex-[1.2] items-center gap-3 px-6 py-2 border-r border-gray-200 group">
              <MapPin className="text-emerald-600 size-5" />
              <div className="flex flex-col w-full relative">
                <span className="text-[10px] font-extrabold uppercase text-gray-500">
                  Where
                </span>
                <div className="flex items-center group">
                  <input
                    placeholder="Search destinations"
                    className="bg-transparent border-none focus:outline-none text-sm font-semibold placeholder:text-gray-400 w-full"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  {location && (
                    <button
                      onClick={() => setLocation("")}
                      className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <Plus className="rotate-45 size-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Date Range Picker */}
            <div className="flex-1 border-r border-gray-200">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-3 px-6 py-2 w-full text-left hover:bg-gray-50/50 rounded-none transition-colors cursor-pointer">
                    <CalendarIcon className="text-emerald-600 size-5" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[10px] font-extrabold uppercase text-gray-500">
                        When
                      </span>
                      <span
                        className={cn(
                          "text-sm font-semibold truncate",
                          !date?.from && "text-gray-400 font-normal",
                        )}
                      >
                        {date?.from
                          ? date.to
                            ? `${format(date.from, "MMM dd")} - ${format(date.to, "MMM dd")}`
                            : format(date.from, "MMM dd")
                          : "Add dates"}
                      </span>
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 rounded-3xl"
                  align="center"
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
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    classNames={{
                      day: cn(
                        "[&_[data-range-start=true]]:!bg-emerald-600 [&_[data-range-start=true]]:!text-white",
                        "[&_[data-range-end=true]]:!bg-emerald-600 [&_[data-range-end=true]]:!text-white",
                        "[&_[data-range-middle=true]]:!bg-emerald-100 [&_[data-range-middle=true]]:!text-emerald-900",
                        "[&_[data-selected-single=true]]:!bg-emerald-600 [&_[data-selected-single=true]]:!text-white",
                      ),
                      range_start: "!bg-emerald-600 !rounded-l-md",
                      range_end: "!bg-emerald-600 !rounded-r-md",
                      range_middle: "!bg-emerald-100",
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Guests */}
            <div className="flex flex-1 items-center gap-3 px-6 py-2">
              <Users className="text-emerald-600 size-5" />
              <div className="flex flex-col w-full">
                <span className="text-[10px] font-extrabold uppercase text-gray-500">
                  Who
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-sm font-semibold text-left hover:text-emerald-600 transition-colors cursor-pointer">
                      {guests === 1 ? "1 guest" : `${guests} guests`}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-6 rounded-3xl" align="end">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">
                          Number of Guests
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          disabled={guests <= 1}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-black disabled:opacity-30 transition-all enabled:cursor-pointer disabled:cursor-not-allowed"
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="w-4 text-center font-semibold tabular-nums">
                          {guests}
                        </span>
                        <button
                          onClick={() => setGuests(guests + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-black transition-all cursor-pointer"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="relative flex items-center pr-2">
              {/* Absolute "Clear all" button */}
              {isFiltered && (
                <button
                  onClick={resetFilters}
                  className="absolute py-2 -left-20 text-xs font-bold text-gray-500 hover:text-black underline underline-offset-4 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Clear all
                </button>
              )}

              <Button
                onClick={fetchProperties}
                className="bg-emerald-600 hover:bg-emerald-700 rounded-full h-12 px-6 transition-all active:scale-95"
              >
                <Search className="size-5 mr-2" />
                <span className="font-bold">Search</span>
              </Button>
            </div>
          </div>

          {/* 2. FILTER BUTTON */}
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setTempSelectedAmenities(selectedAmenities)}
                className="rounded-full h-14 !px-6 border-gray-200 bg-white hover:bg-gray-50 shadow-md flex gap-2"
              >
                <SlidersHorizontal className="size-4" />
                <span className="font-bold">Filters</span>
                {selectedAmenities.length > 0 && (
                  <span className="bg-black text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedAmenities.length}
                  </span>
                )}
              </Button>
            </DialogTrigger>

            {/* DIALOG CONTENT: This must be rendered in a Portal to center on screen */}
            <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-0 shadow-lg duration-200 sm:rounded-3xl overflow-hidden">
              <DialogHeader className="p-6 border-b">
                <DialogTitle className="text-xl font-bold text-center">
                  Filters
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-6 max-h-[60vh]">
                <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                <div className="grid grid-cols-2 gap-4">
                  {allAmenities.map((amenity) => (
                    <div
                      key={amenity.id}
                      className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-lg"
                      onClick={() => toggleTempAmenity(amenity.id)}
                    >
                      <label className="text-sm font-medium cursor-pointer">
                        {amenity.name}
                      </label>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-md border flex items-center justify-center transition-colors",
                          tempSelectedAmenities.includes(amenity.id)
                            ? "bg-emerald-600 border-emerald-600"
                            : "border-gray-300",
                        )}
                      >
                        {tempSelectedAmenities.includes(amenity.id) && (
                          <Check className="text-white size-4" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t bg-white flex items-center justify-between px-6">
                <button
                  onClick={() => setTempSelectedAmenities([])}
                  className="text-sm font-bold underline cursor-pointer"
                >
                  Clear all
                </button>
                <Button
                  onClick={handleApplyFilters}
                  className="bg-black text-white px-8 rounded-xl h-12"
                >
                  Show results
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* --- MOBILE SEARCH TRIGGER --- */}
        <div className="md:hidden mb-8">
          <Button className="w-full bg-white border border-gray-200 text-black shadow-md rounded-full py-6 flex justify-start px-6 gap-4 hover:bg-white">
            <Search className="text-emerald-600" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold">Where to?</span>
              <span className="text-[11px] text-gray-500">
                Anywhere • Any week • Add guests
              </span>
            </div>
          </Button>
        </div>

        {/* --- PROPERTY GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-2xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))
          ) : sortedProperties.length > 0 ? (
            sortedProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-xl font-semibold text-gray-900">
                No properties found
              </p>
              <p className="text-gray-500">
                Try adjusting your filters or search area.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sub-component: PropertyCard ---
function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      to={`/explore/${property.id}`}
      className="group cursor-pointer flex flex-col"
    >
      <div className="group cursor-pointer flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-xl mb-3 shadow-sm">
          <img
            src={
              property.main_image ||
              "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop"
            }
            alt={property.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          <button className="absolute top-3 right-3 p-2 rounded-full bg-black/10 backdrop-blur-md hover:bg-black/20 transition">
            <Star className="size-4 text-white fill-white/20" />
          </button>
        </div>

        {/* Info */}
        <div className="flex justify-between items-start leading-tight">
          <h3 className="font-bold text-[15px] text-gray-900 truncate">
            {property.city}, {property.address}
          </h3>
          <div className="flex items-center gap-1 text-sm font-medium">
            <Star className="size-3 fill-black" />
            <span>
              {property.avg_rating > 0 ? property.avg_rating.toFixed(2) : "New"}
            </span>
          </div>
        </div>

        <p className="text-gray-500 text-[14px] mt-0.5 truncate">
          {property.title}
        </p>
        <p className="text-gray-400 text-[14px]">
          Hosted by {property.host_full_name || "Host"}
        </p>

        <p className="mt-2 text-[15px]">
          <span className="font-bold">${property.price_per_night}</span>
          <span className="text-gray-600 font-normal"> night</span>
        </p>
      </div>
    </Link>
  );
}
