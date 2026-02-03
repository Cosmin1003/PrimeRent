"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { 
  Loader2, 
  Plus, 
  MapPin, 
  BedDouble, 
  Users, 
  ExternalLink, 
  Pencil, 
  Trash2,
  AlertTriangle 
} from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Types
import type { Property } from "../types/property";

export default function ManageListingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Property[]>([]);
  
  // State for Delete Confirmation Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      // 1. Get User
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      // 2. Fetch Properties where host_id = user.id
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("host_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setListings(data || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setPropertyToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!propertyToDelete) return;

    try {
      // Delete from Supabase
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyToDelete);

      if (error) throw error;

      // Update Local State
      setListings((prev) => prev.filter((item) => item.id !== propertyToDelete));
      setIsDeleteDialogOpen(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Failed to delete property. Check console for details.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-600 size-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12 px-6">
      <div className="container max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              My Listings
            </h1>
            <p className="text-slate-500 mt-2">
              Manage your properties, update details, or remove listings.
            </p>
          </div>
          <Button 
            onClick={() => navigate("/host/create-listing")}
            className="bg-emerald-600 hover:bg-emerald-700 h-12 rounded-xl font-bold px-6 shadow-md transition-transform active:scale-95"
          >
            <Plus className="mr-2 size-5" /> Add New Property
          </Button>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-slate-200 p-16 text-center shadow-sm">
            <div className="mx-auto bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
              <HomeIcon className="size-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No listings yet</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              You haven't listed any properties yet. Create your first listing to start hosting guests.
            </p>
            <Button 
              onClick={() => navigate("/host/create-listing")}
              variant="outline"
              className="border-slate-300 hover:bg-slate-50 font-bold"
            >
              Create Listing
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((property) => (
              <div 
                key={property.id} 
                className="bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/3] bg-slate-200">
                  <img 
                    src={property.main_image || "https://placehold.co/600x400?text=No+Image"} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={property.is_active ? "bg-white/90 text-emerald-700 hover:bg-white" : "bg-gray-900 text-white"}>
                      {property.is_active ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-emerald-600/85 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-bold">
                    ${property.price_per_night}/night
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-slate-500 text-sm mb-4">
                    <MapPin className="size-3.5 mr-1" />
                    {property.city}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-6">
                    <div className="flex items-center gap-1.5">
                      <Users className="size-4" />
                      <span>{property.max_guests} Guests</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BedDouble className="size-4" />
                      <span>{property.bedrooms} Beds</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-slate-100">
                    {/* View Button */}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex flex-col h-auto py-2 hover:bg-emerald-50 hover:text-emerald-700 gap-1"
                      onClick={() => navigate(`/explore/${property.id}`)}
                    >
                      <ExternalLink className="size-4" />
                      <span className="text-[10px] font-bold uppercase">View</span>
                    </Button>

                    {/* Edit Button */}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex flex-col h-auto py-2 hover:bg-blue-50 hover:text-blue-600 gap-1"
                      onClick={() => navigate(`/host/edit-listing/${property.id}`)}
                    >
                      <Pencil className="size-4" />
                      <span className="text-[10px] font-bold uppercase">Edit</span>
                    </Button>

                    {/* Delete Button */}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex flex-col h-auto py-2 hover:bg-red-50 hover:text-red-600 gap-1 text-slate-400"
                      onClick={() => confirmDelete(property.id)}
                    >
                      <Trash2 className="size-4" />
                      <span className="text-[10px] font-bold uppercase">Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border-none">
          <DialogHeader>
            <div className="mx-auto bg-red-100 size-12 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="size-6 text-red-600" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">
              Delete this property?
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 pt-2">
              This action cannot be undone. This will permanently remove the 
              listing and all associated data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-xl h-12 px-6 border-slate-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 rounded-xl h-12 px-6"
            >
              Delete Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple Icon for empty state
function HomeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}