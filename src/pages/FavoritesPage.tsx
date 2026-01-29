"use client";

import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "./ExplorePage";
import type { Property } from "../types/property";

export default function FavoritesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id);

      if (user) {
        // Query favorites and join with property details
        const { data } = await supabase
          .from("favorites")
          .select(
            `
            property_id,
            properties (
              *,
              profiles (full_name),
              reviews (rating)
            )
          `,
          )
          .eq("profile_id", user.id);

        if (data) {
          const formatted = data.map((f: any) => {
            const prop = f.properties;
            const reviews = prop.reviews || [];

            // Calculate average rating manually
            const avgRating =
              reviews.length > 0
                ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
                  reviews.length
                : 0;

            return {
              ...prop,
              host_full_name: prop.profiles?.full_name || "Host",
              avg_rating: avgRating, // Now the PropertyCard will receive the correct number
            };
          });
          setProperties(formatted);
        }
      }
      setLoading(false);
    };

    fetchFavorites();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-20">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="fill-red-500 text-red-500 size-8" />
            Your Favorites
          </h1>
          <p className="text-gray-500 mt-2">
            The properties you've saved for your next trip.
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Use your existing skeleton loaders here */}
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} userId={userId} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <Heart className="size-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">
              No favorites yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start exploring to save properties you love.
            </p>
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-8"
            >
              <Link to="/explore">Go Exploring</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
