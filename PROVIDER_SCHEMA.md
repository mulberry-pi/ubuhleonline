# Provider Object JSON Schema

## TypeScript Interface

```typescript
interface Provider {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  services: string[];
  price_min: number;
  price_max: number;
  lat: number;
  lng: number;
  verified: boolean;
  distance?: number;
}
```

## JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Provider",
  "type": "object",
  "required": [
    "id",
    "name",
    "avatar",
    "rating",
    "services",
    "price_min",
    "price_max",
    "lat",
    "lng",
    "verified"
  ],
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique identifier for the provider"
    },
    "name": {
      "type": "string",
      "description": "Business or provider name"
    },
    "avatar": {
      "type": "string",
      "format": "uri",
      "description": "URL to provider's profile image (320x200px recommended)"
    },
    "rating": {
      "type": "number",
      "minimum": 0,
      "maximum": 5,
      "description": "Average rating from 0 to 5"
    },
    "services": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of services offered (e.g., 'Hair Styling', 'Braiding', 'Makeup')"
    },
    "price_min": {
      "type": "number",
      "minimum": 0,
      "description": "Minimum service price in local currency"
    },
    "price_max": {
      "type": "number",
      "minimum": 0,
      "description": "Maximum service price in local currency"
    },
    "lat": {
      "type": "number",
      "minimum": -90,
      "maximum": 90,
      "description": "Latitude coordinate for map positioning"
    },
    "lng": {
      "type": "number",
      "minimum": -180,
      "maximum": 180,
      "description": "Longitude coordinate for map positioning"
    },
    "verified": {
      "type": "boolean",
      "description": "Whether the provider is verified by the platform"
    },
    "distance": {
      "type": "number",
      "minimum": 0,
      "description": "Distance from user's location in kilometers (optional, calculated dynamically)"
    }
  }
}
```

## Example Provider Object

```json
{
  "id": "1",
  "name": "Beauty Haven Salon",
  "avatar": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=250&fit=crop",
  "rating": 4.8,
  "services": ["Hair Styling", "Braiding", "Color"],
  "price_min": 150,
  "price_max": 800,
  "lat": -26.2041,
  "lng": 28.0473,
  "verified": true,
  "distance": 2.3
}
```

## Sample Provider Card HTML/CSS

```html
<div class="provider-card">
  <div class="provider-card__image-wrapper">
    <img 
      src="https://images.unsplash.com/photo-1560066984-138dadb4c035" 
      alt="Beauty Haven Salon"
      class="provider-card__image"
    />
    <span class="provider-card__badge">Verified</span>
  </div>
  <div class="provider-card__content">
    <h3 class="provider-card__name">Beauty Haven Salon</h3>
    <div class="provider-card__rating">
      <svg class="provider-card__star" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      <span>4.8</span>
      <span class="provider-card__distance">2.3 km</span>
    </div>
    <div class="provider-card__services">
      <span class="service-tag">Hair Styling</span>
      <span class="service-tag">Braiding</span>
      <span class="service-tag">Color</span>
    </div>
    <div class="provider-card__footer">
      <span class="provider-card__price">R150 - R800</span>
      <button class="provider-card__book-btn">Book</button>
    </div>
  </div>
</div>
```

```css
/* Provider Card Styles */
.provider-card {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px -2px rgba(201, 179, 246, 0.12);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.provider-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px -4px rgba(201, 179, 246, 0.25);
}

.provider-card__image-wrapper {
  position: relative;
  height: 200px;
  width: 100%;
}

.provider-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.provider-card__badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #c9b3f6;
  color: white;
  width: 80px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
}

.provider-card__content {
  padding: 20px;
}

.provider-card__name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.provider-card__rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}

.provider-card__star {
  width: 16px;
  height: 16px;
  fill: #fbbf24;
  color: #fbbf24;
}

.provider-card__distance {
  color: #6b7280;
  margin-left: 4px;
}

.provider-card__services {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.service-tag {
  background: #f3f4f6;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #4b5563;
}

.provider-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.provider-card__price {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.provider-card__book-btn {
  background: #c9b3f6;
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.provider-card__book-btn:hover {
  background: #b89de8;
  box-shadow: 0 0 30px rgba(201, 179, 246, 0.4);
}

/* Responsive Grid */
@media (min-width: 1200px) {
  .providers-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}

@media (min-width: 900px) and (max-width: 1199px) {
  .providers-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 899px) {
  .providers-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
```

## API Response Format

```json
{
  "data": [
    {
      "id": "1",
      "name": "Beauty Haven Salon",
      "avatar": "https://images.unsplash.com/photo-1560066984-138dadb4c035",
      "rating": 4.8,
      "services": ["Hair Styling", "Braiding", "Color"],
      "price_min": 150,
      "price_max": 800,
      "lat": -26.2041,
      "lng": 28.0473,
      "verified": true,
      "distance": 2.3
    }
  ],
  "pagination": {
    "total": 312,
    "page": 1,
    "pageSize": 12,
    "totalPages": 26
  }
}
```
