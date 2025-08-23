export interface User {
  id: string
  email: string
  name: string
  role: "owner" | "tenant"
  avatar?: string
  phone?: string
  createdAt: Date
}

export interface Property {
  id: string
  title: string
  description: string
  price: number
  location: {
    address: string
    city: string
    state: string
    zipCode: string
    coordinates?: { lat: number; lng: number }
  }
  images: string[]
  amenities: string[]
  propertyType: "apartment" | "house" | "condo" | "studio"
  bedrooms: number
  bathrooms: number
  squareFeet: number
  availableFrom: Date
  ownerId: string
  owner: User
  featured: boolean
  status: "available" | "rented" | "pending"
  createdAt: Date
}

export interface Favorite {
  id: string
  userId: string
  propertyId: string
  createdAt: Date
}

export interface Message {
  id: string
  fromUserId: string
  toUserId: string
  propertyId?: string
  content: string
  read: boolean
  createdAt: Date
}

export interface Review {
  id: string
  propertyId: string
  userId: string
  rating: number
  comment: string
  createdAt: Date
}
