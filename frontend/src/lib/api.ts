import type { Property, User } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  errors?: Array<{ msg: string; param: string }>
}

// Safe fetch function to handle non-JSON responses
const safeFetchJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, options)
  const text = await response.text() // get raw text first
  let data: T | null = null
  try {
    data = JSON.parse(text) // try parsing JSON
  } catch {
    // ignore parsing error
  }

  if (!response.ok) {
    throw new Error((data as any)?.error || text || `Request failed with status ${response.status}`)
  }

  return data as T
}

// Property API functions
export const propertyApi = {
  // Get all properties with optional filters
  getAll: async (filters?: {
    city?: string
    propertyType?: string
    minPrice?: number
    maxPrice?: number
    bedrooms?: number
    guests?: number
    guestType?: string
  }): Promise<Property[]> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    return safeFetchJson<Property[]>(`${API_BASE_URL}/property/all?${params.toString()}`)
  },

  // Get single property by ID
  getById: async (id: string): Promise<Property> => {
    return safeFetchJson<Property>(`${API_BASE_URL}/property/${id}`)
  },

  // Get properties owned by current user
  getMyProperties: async (token: string): Promise<Property[]> => {
    return safeFetchJson<Property[]>(`${API_BASE_URL}/property/myproperties`, {
      headers: { "auth-token": token },
    })
  },

  // Create new property
  create: async (propertyData: Partial<Property>, token: string): Promise<Property> => {
    const result = await safeFetchJson<{ success: boolean; property?: Property; error?: string }>(
      `${API_BASE_URL}/property/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify(propertyData),
      }
    )
    if (!result.success || !result.property) {
      throw new Error(result.error || "Failed to create property")
    }
    return result.property
  },

  // Update property
  update: async (id: string, propertyData: Partial<Property>, token: string): Promise<Property> => {
    const result = await safeFetchJson<{ success: boolean; property?: Property; error?: string }>(
      `${API_BASE_URL}/property/update/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify(propertyData),
      }
    )
    if (!result.success || !result.property) {
      throw new Error(result.error || "Failed to update property")
    }
    return result.property
  },

  // Delete property
  delete: async (id: string, token: string): Promise<void> => {
    const result = await safeFetchJson<{ success: boolean; error?: string }>(
      `${API_BASE_URL}/property/delete/${id}`,
      {
        method: "DELETE",
        headers: { "auth-token": token },
      }
    )
    if (!result.success) {
      throw new Error(result.error || "Failed to delete property")
    }
  },

  // Toggle property availability
  toggleAvailability: async (id: string, token: string): Promise<Property> => {
    const result = await safeFetchJson<{ success: boolean; property?: Property; error?: string }>(
      `${API_BASE_URL}/property/toggle-availability/${id}`,
      {
        method: "PUT",
        headers: { "auth-token": token },
      }
    )
    if (!result.success || !result.property) {
      throw new Error(result.error || "Failed to toggle availability")
    }
    return result.property
  },
}

// Auth API functions
export const authApi = {
  // Login user
  login: async (
    email: string,
    password: string
  ): Promise<{ success: boolean; authtoken?: string; error?: string }> => {
    return safeFetchJson(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
  },

  // Create new user
  signup: async (userData: {
    name: string
    phoneNo: string
    email: string
    password: string
    role: "landlord" | "tenant"
  }): Promise<{ success: boolean; authtoken?: string; error?: string; errors?: Array<{ msg: string; param: string }> }> => {
    return safeFetchJson(`${API_BASE_URL}/auth/createUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
  },

  // Get current user
  getCurrentUser: async (token: string): Promise<User> => {
    return safeFetchJson<User>(`${API_BASE_URL}/auth/getuser`, {
      method: "POST",
      headers: { "auth-token": token },
    })
  },
}
// Message API functions
export const messageApi = {
  // Send a message/inquiry
  send: async (
    messageData: {
      propertyId: string
      subject: string
      message: string
      inquiryType?: "general" | "viewing" | "application" | "availability"
      preferredDate?: Date
      phone?: string
    },
    token: string
  ): Promise<{ success: boolean; message?: any; error?: string }> => {
    return safeFetchJson(`${API_BASE_URL}/message/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": token,
      },
      body: JSON.stringify(messageData),
    })
  },

  // Get messages for current user
  getMyMessages: async (token: string): Promise<any[]> => {
    return safeFetchJson<any[]>(`${API_BASE_URL}/message/my-messages`, {
      headers: { "auth-token": token },
    })
  },

  // Get messages for a specific property
  getPropertyMessages: async (propertyId: string, token: string): Promise<any[]> => {
    return safeFetchJson<any[]>(`${API_BASE_URL}/message/property/${propertyId}`, {
      headers: { "auth-token": token },
    })
  },

  // Mark message as read
  markAsRead: async (messageId: string, token: string): Promise<{ success: boolean; message?: any; error?: string }> => {
    return safeFetchJson(`${API_BASE_URL}/message/mark-read/${messageId}`, {
      method: "PUT",
      headers: { "auth-token": token },
    })
  },

  // Delete message
  delete: async (messageId: string, token: string): Promise<{ success: boolean; error?: string }> => {
    return safeFetchJson(`${API_BASE_URL}/message/delete/${messageId}`, {
      method: "DELETE",
      headers: { "auth-token": token },
    })
  },
}
