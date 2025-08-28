import type { Property, User } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  errors?: Array<{ msg: string; param: string }>
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

    const response = await fetch(`${API_BASE_URL}/property/all?${params.toString()}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch properties: ${response.statusText}`)
    }
    return response.json()
  },

  // Get single property by ID
  getById: async (id: string): Promise<Property> => {
    const response = await fetch(`${API_BASE_URL}/property/${id}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch property: ${response.statusText}`)
    }
    return response.json()
  },

  // Get properties owned by current user
  getMyProperties: async (token: string): Promise<Property[]> => {
    const response = await fetch(`${API_BASE_URL}/property/myproperties`, {
      headers: {
        'auth-token': token,
      },
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch user properties: ${response.statusText}`)
    }
    return response.json()
  },

  // Create new property
  create: async (propertyData: Partial<Property>, token: string): Promise<Property> => {
    const response = await fetch(`${API_BASE_URL}/property/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token,
      },
      body: JSON.stringify(propertyData),
    })
    const result = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.error || `Failed to create property: ${response.statusText}`)
    }
    return result.property
  },

  // Update property
  update: async (id: string, propertyData: Partial<Property>, token: string): Promise<Property> => {
    const response = await fetch(`${API_BASE_URL}/property/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token,
      },
      body: JSON.stringify(propertyData),
    })
    const result = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.error || `Failed to update property: ${response.statusText}`)
    }
    return result.property
  },

  // Delete property
  delete: async (id: string, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/property/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'auth-token': token,
      },
    })
    const result = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.error || `Failed to delete property: ${response.statusText}`)
    }
  },

  // Toggle property availability
  toggleAvailability: async (id: string, token: string): Promise<Property> => {
    const response = await fetch(`${API_BASE_URL}/property/toggle-availability/${id}`, {
      method: 'PUT',
      headers: {
        'auth-token': token,
      },
    })
    const result = await response.json()
    if (!response.ok || !result.success) {
      throw new Error(result.error || `Failed to toggle availability: ${response.statusText}`)
    }
    return result.property
  },
}

// Auth API functions
export const authApi = {
  // Login user
  login: async (email: string, password: string): Promise<{ success: boolean; authtoken?: string; error?: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    return response.json()
  },

  // Create new user
  signup: async (userData: {
    name: string
    phoneNo: string
    email: string
    password: string
    role: "landlord" | "tenant"
  }): Promise<{ success: boolean; authtoken?: string; error?: string; errors?: Array<{ msg: string; param: string }> }> => {
    const response = await fetch(`${API_BASE_URL}/auth/createUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    return response.json()
  },

  // Get current user
  getCurrentUser: async (token: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/getuser`, {
      method: 'POST',
      headers: {
        'auth-token': token,
      },
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`)
    }
    return response.json()
  },
}
