export interface Booking {
  id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status: string;
  property_id: string;
  properties: {
    title: string;
    city: string;
    main_image: string;
    address: string;
  };
}