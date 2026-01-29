"use client";

import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, MapPin, CreditCard, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "../types/booking";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
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
        `,
        )
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

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      // Update local state so the UI refreshes immediately
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "cancelled" } : b,
        ),
      );
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  return (
    <div className="bg-white min-h-screen pt-28 pb-20">
      <div className="container max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-black tracking-tight text-black mb-2">
          Trips
        </h1>
        <p className="text-gray-500 mb-10">
          Manage your upcoming and past stays.
        </p>

        {bookings.length > 0 ? (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={cancelBooking}
              />
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-3xl p-20 text-center">
            <div className="bg-emerald-50 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-emerald-600 size-8" />
            </div>
            <h3 className="text-xl font-bold">No trips booked... yet!</h3>
            <p className="text-gray-500 mb-6">
              Time to dust off your bags and start exploring.
            </p>
            <Button
              asChild
              className="bg-black hover:bg-emerald-600 rounded-full px-8"
            >
              <Link to="/explore">Start Searching</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  onCancel,
}: {
  booking: Booking;
  onCancel: (id: string) => void;
}) {
  const statusColors: Record<string, string> = {
    confirmed: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-gray-100 text-gray-700",
  };

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isCancellable = !["cancelled", "completed"].includes(booking.status);
  const isCompletable = booking.status === "completed";

  const handleSubmitReview = async () => {
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("reviews").insert({
        property_id: booking.property_id,
        guest_id: user.id,
        rating: rating,
        comment: comment,
      });

      if (error) throw error;

      setIsReviewOpen(false);
      alert("Review submitted successfully!");
    } catch (error) {
      console.error(error);
      alert("Error submitting review.");
    } finally {
      setSubmitting(false);
    }
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
        {/* TOP SECTION: Title and Status */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="secondary"
                className={cn(
                  "capitalize font-bold",
                  statusColors[booking.status] || "bg-gray-100",
                )}
              >
                {booking.status}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
              {booking.properties.title}
            </h3>
            <p className="text-gray-500 flex items-center gap-1 text-sm">
              <MapPin className="size-3" /> {booking.properties.city},{" "}
              {booking.properties.address}
            </p>
          </div>
          <Link to={`/explore/${booking.property_id}`}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronRight className="size-5" />
            </Button>
          </Link>
        </div>

        {/* BOTTOM SECTION: Dates and Cancel Button */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col md:flex-row md:items-end justify-between gap-4">
          {/* Trip Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-gray-400">
                Check-in
              </span>
              <span className="font-bold text-sm">
                {format(new Date(booking.check_in), "MMM dd, yyyy")}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-gray-400">
                Check-out
              </span>
              <span className="font-bold text-sm">
                {format(new Date(booking.check_out), "MMM dd, yyyy")}
              </span>
            </div>
            <div className="flex flex-col col-span-2 md:col-span-1">
              <span className="text-[10px] uppercase font-black text-gray-400 text-emerald-600">
                Total Paid
              </span>
              <span className="font-bold text-sm flex items-center gap-1">
                <CreditCard className="size-3" /> ${booking.total_price}
              </span>
            </div>
          </div>

          {/* Cancel Button - Positioned Bottom Right */}
          {isCancellable && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold text-xs"
              onClick={() => {
                if (confirm("Are you sure you want to cancel this trip?")) {
                  onCancel(booking.id);
                }
              }}
            >
              Cancel Trip
            </Button>
          )}

          {isCompletable && (
            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs"
                >
                  Add Review
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    Review your stay at {booking.properties.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      How was your experience?
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "size-8 cursor-pointer transition-colors",
                            star <= rating
                              ? "fill-emerald-600 text-emerald-600"
                              : "text-gray-300",
                          )}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        Your comments
                      </span>
                      {/* Character Counter */}
                      <span
                        className={`text-xs ${comment.length >= 500 ? "text-red-500" : "text-gray-400"}`}
                      >
                        {comment.length}/500
                      </span>
                    </div>
                    <Textarea
                      placeholder="Share details of your stay..."
                      className="rounded-xl resize-none max-h-[150px] overflow-y-auto break-all whitespace-pre-wrap"
                      rows={4}
                      value={comment}
                      maxLength={500}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="w-full bg-black hover:bg-emerald-600 rounded-full"
                  >
                    {submitting ? "Submitting..." : "Post Review"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
