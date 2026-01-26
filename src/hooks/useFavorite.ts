import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export function useFavorite(propertyId: string, userId: string | undefined) {
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkStatus() {
      if (!userId || !propertyId) {
        if (isMounted) setIsFavorited(false);
        return;
      }

      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("property_id", propertyId)
        .eq("profile_id", userId)
        .maybeSingle();
      
      if (isMounted) {
        setIsFavorited(!!data);
      }
    }

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, [propertyId, userId]);

  const toggleFavorite = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!userId) {
      alert("Please log in to save favorites!");
      return;
    }

    if (isFavorited) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("property_id", propertyId)
        .eq("profile_id", userId);
      
      if (!error) setIsFavorited(false);
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ property_id: propertyId, profile_id: userId });
      
      if (!error) setIsFavorited(true);
    }
  };

  return { isFavorited, toggleFavorite };
}