export interface User {
  id: string
  email: string
  name: string
  phoneNo: string
  role: "landlord" | "tenant"
  avatar?: string
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
  propertyType: "apartment" |  "studio" 
  bedrooms: number
  bathrooms: number
  area: number
  availableFrom: Date
  landlordId: string
  landlord: User
  featured: boolean
  isAvailable: boolean
  status: "available" | "rented" | "pending"
  createdAt: Date
  maxGuests: number
  guestType: "Family" | "Bachelors" | "Girls" | "Boys" | null
  rules: string[]
  checkInTime: string
  checkOutTime: string
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
