import { Stylist } from "@/types/booking";

export const mockStylists: Stylist[] = [
  {
    id: "1",
    name: "Zanele Dlamini",
    businessName: "House of Mane Studio",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=400&fit=crop",
    rating: 4.8,
    reviewCount: 122,
    location: "Woodstock, Cape Town",
    bio: "Specializing in protective styles and natural hair care for over 8 years. Passionate about celebrating African beauty through intricate braiding and loc styling.",
    specialties: ["Boho Locs", "Cornrows", "Protective Styles", "Natural Treatment"],
    verified: true,
    depositPercentage: 25, // Has service policy
    services: [
      { id: "s1", name: "Boho Locs", price: 850, duration: 240 },
      { id: "s2", name: "Cornrows", price: 600, duration: 180 },
      { id: "s3", name: "Natural Treatment", price: 350, duration: 90 },
    ],
    availability: ["2025-11-01", "2025-11-02", "2025-11-05", "2025-11-07"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1595475884562-073c30d45670?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=400&fit=crop",
    ],
  },
  {
    id: "2",
    name: "Thandi Mbatha",
    businessName: "Luxe Lashes & Beauty",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&h=400&fit=crop",
    rating: 4.9,
    reviewCount: 98,
    location: "Sandton, Johannesburg",
    bio: "Award-winning lash artist specializing in volume and hybrid techniques. Creating stunning, natural-looking extensions that enhance your beauty.",
    specialties: ["Volume Lashes", "Hybrid Lashes", "Lash Lift", "Brow Lamination"],
    verified: true,
    depositPercentage: 50, // No service policy
    services: [
      { id: "s4", name: "Classic Lash Extensions", price: 950, duration: 120 },
      { id: "s5", name: "Volume Lashes", price: 1200, duration: 150 },
      { id: "s6", name: "Lash Lift & Tint", price: 450, duration: 60 },
    ],
    availability: ["2025-11-01", "2025-11-03", "2025-11-06", "2025-11-08"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=400&h=400&fit=crop",
    ],
  },
  {
    id: "3",
    name: "Nomsa Khumalo",
    businessName: "Natural Glow Hair Bar",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&h=400&fit=crop",
    rating: 4.7,
    reviewCount: 87,
    location: "Umhlanga, Durban",
    bio: "Dedicated to natural hair health and growth. Expert in silk presses, twist-outs, and treatments that nurture your natural texture.",
    specialties: ["Silk Press", "Twist Outs", "Deep Conditioning", "Loc Maintenance"],
    verified: true,
    depositPercentage: 25, // Has service policy
    services: [
      { id: "s7", name: "Silk Press", price: 700, duration: 150 },
      { id: "s8", name: "Twist Out Styling", price: 500, duration: 120 },
      { id: "s9", name: "Deep Conditioning Treatment", price: 400, duration: 90 },
    ],
    availability: ["2025-11-02", "2025-11-04", "2025-11-07", "2025-11-09"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1598217039267-2c87e93e3dfc?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1605980413422-a4a1b3e24f33?w=400&h=400&fit=crop",
    ],
  },
];
