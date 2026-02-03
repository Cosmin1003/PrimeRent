export interface Property {
  id: string;
  title: string;
  description: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  price_per_night: number;
  max_guests: number;
  main_image: string;
  host_full_name: string;
  avg_rating: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  is_active: boolean;

  property_images?: {
    url: string;
  }[];
}