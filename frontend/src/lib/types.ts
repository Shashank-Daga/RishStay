"use client"

// ✅ User type
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

// ✅ Backend Image type
export interface BackendImage {
  url: string
  public_id: string
}

// ✅ Property type
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
  images: BackendImage[] // ✅ Updated to match backend
  amenities: string[]
  propertyType: "apartment" | "studio"
  bedrooms: number
  bathrooms: number
  area: number
  availability: {
    isAvailable: boolean
    availableFrom?: Date
    availableTo?: Date
  }
  landlordId: string
  landlord: User
  featured: boolean
  createdAt: Date
  maxGuests: number
  guestType: "Family" | "Bachelors" | "Girls" | "Boys" | null
  rules: string[]
}

// ✅ Favorites type
export interface Favorite {
  _id: string
  userId: string
  propertyId: string
  createdAt: Date
}

// ✅ Messages type
export interface Message {
  _id: string
  sender: User
  recipient: User
  property: Property
  subject: string
  message: string
  inquiryType?: "general" | "viewing" | "application" | "availability"
  preferredDate?: Date
  phone?: string
  status: "unread" | "read"
  createdAt: Date
  updatedAt?: Date
}

// ✅ API response for sending a single message
export interface SendMessageResponse {
  success: boolean
  error?: string
  data?: Message
}

// ✅ Review type
export interface Review {
  _id: string
  userId: string
  comment: string
  userName: string
  userRole: "landlord" | "tenant"
  createdAt: Date
  updatedAt?: Date
  user?: User
}

// ✅ Shared pagination types
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

// ------------------ API Helpers ------------------

// Transform backend property to frontend-friendly format
export const transformPropertyImages = (property: Property): Property => ({
  ...property,
  images: property.images?.map(img =>
    typeof img === "string" ? { url: img, public_id: "" } : img
  ) || [],
})

// Helper to extract just URLs from BackendImage[]
export const getImageUrls = (property: Property): string[] =>
  property.images?.map(img => img.url) || []
