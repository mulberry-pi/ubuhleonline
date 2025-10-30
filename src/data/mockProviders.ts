export interface MockProvider {
  id: string;
  user_id: string;
  business_name: string;
  business_description: string;
  business_logo_url: string;
  rating: number;
  review_count: number;
  city: string;
  suburb: string;
  price_range: string;
  is_public: boolean;
  gallery_images: string[];
  availability_status: string;
  business_address?: string;
}

export const mockProviders: MockProvider[] = [
  {
    id: '1',
    user_id: 'mock-user-1',
    business_name: 'Sea Point Beauty Studio',
    business_description: 'Professional hair styling, braiding, and color services. Specializing in modern cuts and creative color transformations.',
    business_logo_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=250&fit=crop',
    rating: 4.8,
    review_count: 127,
    city: 'Cape Town',
    suburb: 'Sea Point',
    price_range: 'R250 - R1200',
    is_public: true,
    gallery_images: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800'
    ],
    availability_status: 'available',
    business_address: '123 Main Rd, Sea Point, Cape Town'
  },
  {
    id: '2',
    user_id: 'mock-user-2',
    business_name: 'V&A Waterfront Glam',
    business_description: 'Luxury makeup, nails, and lash extensions. Perfect for special occasions and everyday glamour.',
    business_logo_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=250&fit=crop',
    rating: 4.9,
    review_count: 203,
    city: 'Cape Town',
    suburb: 'V&A Waterfront',
    price_range: 'R300 - R1500',
    is_public: true,
    gallery_images: [
      'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800',
      'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800'
    ],
    availability_status: 'available',
    business_address: 'Shop 205, V&A Waterfront, Cape Town'
  },
  {
    id: '3',
    user_id: 'mock-user-3',
    business_name: 'Observatory Natural Touch',
    business_description: 'Natural hair care specialists. Locs, treatments, and protective styles for natural beauty.',
    business_logo_url: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400&h=250&fit=crop',
    rating: 4.6,
    review_count: 89,
    city: 'Cape Town',
    suburb: 'Observatory',
    price_range: 'R200 - R800',
    is_public: true,
    gallery_images: [
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800'
    ],
    availability_status: 'available',
    business_address: '45 Lower Main Rd, Observatory, Cape Town'
  },
  {
    id: '4',
    user_id: 'mock-user-4',
    business_name: 'Camps Bay Elite Salon',
    business_description: 'Full-service luxury salon and spa. Hair styling, makeup, and rejuvenating spa treatments.',
    business_logo_url: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&h=250&fit=crop',
    rating: 4.7,
    review_count: 156,
    city: 'Cape Town',
    suburb: 'Camps Bay',
    price_range: 'R400 - R2000',
    is_public: true,
    gallery_images: [
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800',
      'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800'
    ],
    availability_status: 'available',
    business_address: '78 Victoria Rd, Camps Bay, Cape Town'
  },
  {
    id: '5',
    user_id: 'mock-user-5',
    business_name: 'Claremont Urban Chic',
    business_description: 'Braiding, weaves, and wig installations. Creating stunning protective styles and transformations.',
    business_logo_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=250&fit=crop',
    rating: 4.5,
    review_count: 112,
    city: 'Cape Town',
    suburb: 'Claremont',
    price_range: 'R350 - R1800',
    is_public: true,
    gallery_images: [
      'https://images.unsplash.com/photo-1595475884562-073c0c371c09?w=800',
      'https://images.unsplash.com/photo-1583001809356-6d9b1c5b3f8f?w=800'
    ],
    availability_status: 'available',
    business_address: '23 Vineyard Rd, Claremont, Cape Town'
  },
  {
    id: '6',
    user_id: 'mock-user-6',
    business_name: 'Constantia Radiance Spa',
    business_description: 'Premium spa treatments, facials, and therapeutic massages in a tranquil setting.',
    business_logo_url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=250&fit=crop',
    rating: 4.9,
    review_count: 178,
    city: 'Cape Town',
    suburb: 'Constantia',
    price_range: 'R450 - R2200',
    is_public: true,
    gallery_images: [
      'https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=800',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'
    ],
    availability_status: 'available',
    business_address: '90 Constantia Main Rd, Constantia, Cape Town'
  },
  {
    id: '7',
    user_id: 'mock-user-7',
    business_name: 'Gardens Trendy Cuts',
    business_description: 'Modern barbering and styling. Sharp cuts, clean shaves, and contemporary grooming.',
    business_logo_url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=250&fit=crop',
    rating: 4.4,
    review_count: 94,
    city: 'Cape Town',
    suburb: 'Gardens',
    price_range: 'R180 - R600',
    is_public: true,
    gallery_images: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800'
    ],
    availability_status: 'available',
    business_address: '12 Kloof St, Gardens, Cape Town'
  },
  {
    id: '8',
    user_id: 'mock-user-8',
    business_name: 'Green Point Beauty Lounge',
    business_description: 'Nail art specialists. Manicures, pedicures, and creative nail designs.',
    business_logo_url: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&h=250&fit=crop',
    rating: 4.8,
    review_count: 145,
    city: 'Cape Town',
    suburb: 'Green Point',
    price_range: 'R220 - R800',
    is_public: true,
    gallery_images: [
      'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800',
      'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800'
    ],
    availability_status: 'available',
    business_address: '56 Somerset Rd, Green Point, Cape Town'
  },
  {
    id: '9',
    user_id: 'mock-user-9',
    business_name: 'Woodstock Afro Essence',
    business_description: 'Afro hair specialists. Twists, natural styling, and authentic African hair artistry.',
    business_logo_url: 'https://images.unsplash.com/photo-1595475884562-073c0c371c09?w=400&h=250&fit=crop',
    rating: 4.7,
    review_count: 134,
    city: 'Cape Town',
    suburb: 'Woodstock',
    price_range: 'R280 - R1000',
    is_public: true,
    gallery_images: [
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800'
    ],
    availability_status: 'available',
    business_address: '34 Albert Rd, Woodstock, Cape Town'
  },
  {
    id: '10',
    user_id: 'mock-user-10',
    business_name: 'Century City Glamour House',
    business_description: 'Bridal specialists and full glam services. Makeup, hair, and complete bridal packages.',
    business_logo_url: 'https://images.unsplash.com/photo-1583001809356-6d9b1c5b3f8f?w=400&h=250&fit=crop',
    rating: 4.6,
    review_count: 167,
    city: 'Cape Town',
    suburb: 'Century City',
    price_range: 'R500 - R3500',
    is_public: true,
    gallery_images: [
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800',
      'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800'
    ],
    availability_status: 'available',
    business_address: 'Canal Walk, Century City, Cape Town'
  }
];
