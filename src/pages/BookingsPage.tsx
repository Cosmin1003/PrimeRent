"use client";

import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, MapPin, CreditCard, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "../types/booking";
import { cn } from "@/lib/utils";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          check_in,
          check_out,
          total_price,
          status,
          property_id,
          properties (
            title,
            city,
            main_image,
            address
          )
        `)
        .eq("guest_id", user.id)
        .order("check_in", { ascending: false });

      if (error) throw error;
      setBookings(data as any);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto px-6 pt-32 text-center">
        <p className="text-gray-500 animate-pulse">Retrieving your trips...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-28 pb-20">
      <div className="container max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-black tracking-tight text-black mb-2">Trips</h1>
        <p className="text-gray-500 mb-10">Manage your upcoming and past stays.</p>

        {bookings.length > 0 ? (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-3xl p-20 text-center">
            <div className="bg-emerald-50 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-emerald-600 size-8" />
            </div>
            <h3 className="text-xl font-bold">No trips booked... yet!</h3>
            <p className="text-gray-500 mb-6">Time to dust off your bags and start exploring.</p>
            <Button asChild className="bg-black hover:bg-emerald-600 rounded-full px-8">
              <Link to="/explore">Start Searching</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const statusColors: Record<string, string> = {
    confirmed: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex flex-col md:flex-row border border-gray-200 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Property Image */}
      <div className="md:w-64 h-48 md:h-auto overflow-hidden">
        <img 
          src={booking.properties.main_image} 
          alt={booking.properties.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Booking Content */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className={cn("capitalize font-bold", statusColors[booking.status] || "bg-gray-100")}>
                {booking.status}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
              {booking.properties.title}
            </h3>
            <p className="text-gray-500 flex items-center gap-1 text-sm">
              <MapPin className="size-3" /> {booking.properties.city}, {booking.properties.address}
            </p>
          </div>
          <Link to={`/explore/${booking.property_id}`}>
             <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronRight className="size-5" />
             </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-gray-400">Check-in</span>
            <span className="font-bold text-sm">{format(new Date(booking.check_in), "MMM dd, yyyy")}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-gray-400">Check-out</span>
            <span className="font-bold text-sm">{format(new Date(booking.check_out), "MMM dd, yyyy")}</span>
          </div>
          <div className="flex flex-col col-span-2 md:col-span-1">
            <span className="text-[10px] uppercase font-black text-gray-400 text-emerald-600">Total Paid</span>
            <span className="font-bold text-sm flex items-center gap-1">
              <CreditCard className="size-3" /> ${booking.total_price}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}