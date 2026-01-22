export interface Property {
  id: string;
  title: string;
  city: string;
  address: string;
  price_per_night: number;
  max_guests: number;
  main_image: string;
  host_full_name: string;
  avg_rating: number;
}

export interface Amenity {
  id: string;
  name: string;
  icon_name: string | null;
}