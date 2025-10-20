export interface Stylist {
  id: string;
  name: string;
  businessName: string;
  avatar: string;
  bannerImage: string;
  rating: number;
  reviewCount: number;
  location: string;
  bio: string;
  specialties: string[];
  verified: boolean;
  services: Service[];
  availability: string[];
  portfolioImages: string[];
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description?: string;
}

export interface BookingDetails {
  stylistId: string;
  serviceId: string;
  date: Date;
  time: string;
  locationType: "salon" | "home";
  depositAmount?: number;
  fullPrice: number;
}

export interface BookingFormData {
  service: string;
  date: Date;
  time: string;
  location: "salon" | "home";
  name: string;
  email: string;
  phone: string;
  payDeposit: boolean;
}
