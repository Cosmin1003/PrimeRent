export interface Review {
  id: string;
  property_id: string;
  guest_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}