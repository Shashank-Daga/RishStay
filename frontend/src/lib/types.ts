"use client"

export interface User {
 _id: string
  email: string
  name: string
  phoneNo: string
  role: "landlord" | "tenant"
  avatar?: string
  createdAt: Date
  favorites?: string[] // Array of Property IDs
}

export interface Property {
  _id: string
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
 _id: string
  userId: string
  propertyId: string
  createdAt: Date
}

export interface Message {
 _id: string
  fromUserId: string
  toUserId: string
  propertyId?: string
  property?: Property
  subject: string
  message: string
  inquiryType?: "general" | "viewing" | "application" | "availability"
  preferredDate?: Date
  phone?: string
  status: "unread" | "read" | "replied"
  createdAt: Date
  updatedAt? : Date
}

// API response type for sending messages
export interface SendMessageResponse {
  success: boolean
  error?: string
  data?: Message
}

export interface Review {
 _id: string
  propertyId: string
  userId: string
  rating: number
  comment: string
  createdAt: Date
}
