"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Home, User, Loader2, Rocket } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function HostReservationsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);

  async function checkUserAndData() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/auth");
      return;
    }

    // 1. Fetch the user's role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setRole(profile?.role || "guest");

    // 2. If they are a host, fetch their incoming bookings
    if (profile?.role === "host") {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id, check_in, check_out, total_price, status,
          properties!inner ( title, main_image, host_id ),
          profiles:guest_id ( full_name, avatar_url, email )
        `,
        )
        .eq("properties.host_id", user.id)
        .eq("status", "pending");

      if (!error) setPendingBookings(data);
    }
    setLoading(false);
  }

  async function handleBecomeHost() {
    setUpdating(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({ role: "host" })
      .eq("id", user?.id);

    if (!error) {
      setRole("host");
      // Refresh data now that they are a host
      checkUserAndData();
    }
    setUpdating(false);
  }
  
  async function updateStatus(bookingId: string, newStatus: "confirmed" | "cancelled") {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (!error) {
      setPendingBookings(prev => prev.filter(b => b.id !== bookingId));
      alert(`Booking ${newStatus}!`);
    }
  }

  useEffect(() => {
    checkUserAndData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600 size-10" />
      </div>
    );
  }

  if (role !== "host") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-900 rounded-[2.5rem] p-10 text-center text-white shadow-2xl">
          <div className="bg-emerald-500/20 size-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Rocket className="text-emerald-500 size-10" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Start Hosting</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            You need a Host Account to access the dashboard. Join our community
            of hosts and start earning.
          </p>
          <Button
            onClick={handleBecomeHost}
            disabled={updating}
            className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 rounded-2xl text-lg font-bold"
          >
            {updating ? "Processing..." : "Become a Host Now"}
          </Button>
          <Button
            variant="link"
            className="mt-4 text-slate-500"
            onClick={() => navigate("/explore")}
          >
            Back to exploring
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto pt-24 px-6">
      <h1 className="text-3xl font-black mb-8">Host Dashboard</h1>

      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Home className="size-5" /> Reservation Requests
      </h2>

      {pendingBookings.length === 0 ? (
        <div className="bg-gray-50 rounded-3xl p-12 text-center border-2 border-dashed">
          <p className="text-gray-500">No pending requests at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingBookings.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between p-6 border rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  src={req.properties.main_image}
                  className="size-20 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-bold">{req.properties.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <User className="size-3" /> {req.profiles.full_name || req.profiles.email.split("@")[0]}
                  </p>
                  <p className="text-xs font-medium mt-1">
                    {format(new Date(req.check_in), "MMM d")} -{" "}
                    {format(new Date(req.check_out), "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <span className="font-bold text-emerald-600">
                  ${req.total_price}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-100 hover:bg-red-50"
                    onClick={() => updateStatus(req.id, "cancelled")}
                  >
                    <X className="size-4 mr-1" /> Decline
                  </Button>
                  <Button
                    size="sm"
                    className="bg-black hover:bg-emerald-600 text-white"
                    onClick={() => updateStatus(req.id, "confirmed")}
                  >
                    <Check className="size-4 mr-1" /> Confirm
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
