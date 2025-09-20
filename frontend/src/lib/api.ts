"use client"

import { useMemo, useCallback } from "react"
import type { Message, Property, User, PaginatedResponse } from "./types"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  errors?: Array<{ msg: string; param?: string }>
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface SendMessageResponse {
  success: boolean
  data?: Message
  error?: string
}

// ---------- Helpers ----------
const withAuth = (token: string): HeadersInit => ({
  "auth-token": token,
})

const safeFetchJson = async <T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> => {
  let response: Response
  try {
    response = await fetch(url, options)
  } catch (err) {
    throw new Error(
      `Network error while calling ${url}: ${(err as Error).message}`
    )
  }

  const text = await response.text()
  let json: ApiResponse<T>

  try {
    json = JSON.parse(text) as ApiResponse<T>
  } catch {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}: ${text}`)
    }
    throw new Error(`Invalid JSON response: ${text}`)
  }

  if (!response.ok || !json.success) {
    const details =
      json.error || (json.errors ? JSON.stringify(json.errors) : text)
    throw new Error(`Request failed (${response.status}): ${details}`)
  }

  return json
}

// Utility: revive ISO dates
const reviveDates = <T>(input: T): T => {
  const isISODate = (val: unknown): val is string =>
    typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)

  const recurse = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(recurse)
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, recurse(v)])
      )
    }
    return isISODate(value) ? new Date(value) : value
  }

  return recurse(input) as T
}

// ================== useApi Hook ==================
export const useApi = () => {
  // -------- Property API --------
  const getAllProperties = useCallback(
    async (filters?: {
      city?: string
      propertyType?: "apartment" | "studio"
      minPrice?: number
      maxPrice?: number
      bedrooms?: number
      bathrooms?: number
      guests?: number
      guestType?: "Family" | "Bachelors" | "Girls" | "Boys"
    }): Promise<Property[]> => {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString())
          }
        })
      }
      const res = await safeFetchJson<Property[]>(
        `${API_BASE_URL}/property/all?${params.toString()}`
      )
      return res.data ? reviveDates(res.data) : []
    },
    []
  )

  const getPropertyById = useCallback(async (id: string): Promise<Property> => {
    const res = await safeFetchJson<Property>(`${API_BASE_URL}/property/${id}`)
    if (!res.data) throw new Error("Property not found")
    return reviveDates(res.data)
  }, [])

  const getMyProperties = useCallback(
    async (token: string): Promise<Property[]> => {
      const res = await safeFetchJson<Property[]>(
        `${API_BASE_URL}/property/myproperties`,
        { headers: withAuth(token) }
      )
      return res.data ? reviveDates(res.data) : []
    },
    []
  )

  const createProperty = useCallback(
    async (propertyData: Partial<Property>, token: string) => {
      const res = await safeFetchJson<Property>(
        `${API_BASE_URL}/property/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...withAuth(token) },
          body: JSON.stringify(propertyData),
        }
      )
      if (!res.data) throw new Error(res.error || "Failed to create property")
      return reviveDates(res.data)
    },
    []
  )

  const updateProperty = useCallback(
    async (id: string, propertyData: Partial<Property>, token: string) => {
      const res = await safeFetchJson<Property>(
        `${API_BASE_URL}/property/update/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...withAuth(token) },
          body: JSON.stringify(propertyData),
        }
      )
      if (!res.data) throw new Error(res.error || "Failed to update property")
      return reviveDates(res.data)
    },
    []
  )

  const deleteProperty = useCallback(async (id: string, token: string) => {
    const res = await safeFetchJson<null>(
      `${API_BASE_URL}/property/delete/${id}`,
      { method: "DELETE", headers: withAuth(token) }
    )
    if (!res.success) throw new Error(res.error || "Failed to delete property")
  }, [])

  const toggleAvailability = useCallback(async (id: string, token: string) => {
    const res = await safeFetchJson<Property>(
      `${API_BASE_URL}/property/toggle-availability/${id}`,
      { method: "PUT", headers: withAuth(token) }
    )
    if (!res.data) throw new Error(res.error || "Failed to toggle availability")
    return reviveDates(res.data)
  }, [])

  const propertyApi = useMemo(
    () => ({
      getAll: getAllProperties,
      getById: getPropertyById,
      getMyProperties,
      create: createProperty,
      update: updateProperty,
      delete: deleteProperty,
      toggleAvailability,
    }),
    [
      getAllProperties,
      getPropertyById,
      getMyProperties,
      createProperty,
      updateProperty,
      deleteProperty,
      toggleAvailability,
    ]
  )

  // -------- Auth API --------
  const login = useCallback(async (email: string, password: string) => {
    const res = await safeFetchJson<{ authtoken: string; user: User }>(
      `${API_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    )
    if (!res.data) throw new Error(res.error || "Login failed")
    return reviveDates(res.data)
  }, [])

  const signup = useCallback(
    async (userData: {
      name: string
      phoneNo: string
      email: string
      password: string
      role: "landlord" | "tenant"
    }) => {
      const res = await safeFetchJson<{ authtoken: string; user: User }>(
        `${API_BASE_URL}/auth/createUser`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      )
      if (!res.data) throw new Error(res.error || "Signup failed")
      return reviveDates(res.data)
    },
    []
  )

  const getCurrentUser = useCallback(async (token: string) => {
    const res = await safeFetchJson<User>(`${API_BASE_URL}/auth/getuser`, {
      method: "POST",
      headers: withAuth(token),
    })
    if (!res.data) throw new Error("User not found")
    return reviveDates(res.data)
  }, [])

  const updateUser = useCallback(
    async (userData: { name: string; phoneNo: string; email: string }, token: string) => {
      const res = await safeFetchJson<User>(`${API_BASE_URL}/auth/updateuser`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...withAuth(token) },
        body: JSON.stringify(userData),
      })
      if (!res.data) throw new Error("Failed to update user")
      return reviveDates(res.data)
    },
    []
  )

  const changePassword = useCallback(
    async (
      oldPassword: string,
      newPassword: string,
      token: string
    ): Promise<void> => {
      const res = await safeFetchJson<null>(
        `${API_BASE_URL}/auth/change-password`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...withAuth(token) },
          body: JSON.stringify({ oldPassword, newPassword }),
        }
      )
      if (!res.success) throw new Error(res.error || "Failed to change password")
    },
    []
  )

  const deleteAccount = useCallback(async (token: string): Promise<void> => {
    const res = await safeFetchJson<null>(
      `${API_BASE_URL}/auth/delete-account`,
      {
        method: "DELETE",
        headers: withAuth(token),
      }
    )
    if (!res.success) throw new Error(res.error || "Failed to delete account")
  }, [])

  const authApi = useMemo(
    () => ({ login, signup, getCurrentUser, updateUser, changePassword, deleteAccount }),
    [login, signup, getCurrentUser, updateUser, changePassword, deleteAccount]
  )

  // -------- Favorites API --------
  const addFavorite = useCallback(
    async (userId: string, propertyId: string, token: string) => {
      const res = await safeFetchJson<{ favorites: string[] }>(
        `${API_BASE_URL}/favorites/${userId}/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...withAuth(token) },
          body: JSON.stringify({ propertyId }),
        }
      )
      return res.data?.favorites || []
    },
    []
  )

  const removeFavorite = useCallback(
    async (userId: string, propertyId: string, token: string) => {
      const res = await safeFetchJson<{ favorites: string[] }>(
        `${API_BASE_URL}/favorites/${userId}/remove/${propertyId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json", ...withAuth(token) },
        }
      )
      return res.data?.favorites || []
    },
    []
  )

  const favoritesApi = useMemo(
    () => ({ add: addFavorite, remove: removeFavorite }),
    [addFavorite, removeFavorite]
  )

  // -------- Message API --------
  const sendMessage = useCallback(
    async (
      messageData: {
        propertyId: string
        message: string
        inquiryType?: "general" | "viewing" | "application" | "availability"
        preferredDate?: Date
        phone?: string
        subject?: string
      },
      token: string
    ): Promise<SendMessageResponse> => {
      const res = await safeFetchJson<Message>(
        `${API_BASE_URL}/message/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...withAuth(token) },
          body: JSON.stringify(messageData),
        }
      )
      if (!res.success) throw new Error(res.error || "Failed to send message")

      return {
        success: res.success,
        data: res.data ? reviveDates(res.data) : undefined,
        error: res.error,
      }
    },
    []
  )

  // -------- Message API --------
  // Corrected Message API functions - replace these in your api.ts

  const getSentMessages = useCallback(
    async (
      token: string,
      page = 1,
      limit = 10
    ): Promise<Message[]> => {
      const res = await safeFetchJson<Message[]>(  // ← Changed: expecting Message[] directly
        `${API_BASE_URL}/message/my-messages/sent?page=${page}&limit=${limit}`,
        { headers: withAuth(token) }
      )

      if (!res.data) {
        return []
      }

      // ← Fixed: res.data is the messages array directly, not res.data.data
      return reviveDates(res.data)
    },
    []
  )

  const getReceivedMessages = useCallback(
    async (
      token: string,
      page = 1,
      limit = 10
    ): Promise<Message[]> => {
      const res = await safeFetchJson<Message[]>(  // ← Changed: expecting Message[] directly
        `${API_BASE_URL}/message/my-messages/received?page=${page}&limit=${limit}`,
        { headers: withAuth(token) }
      )

      if (!res.data) {
        return []
      }

      // ← Fixed: res.data is the messages array directly, not res.data.data
      return reviveDates(res.data)
    },
    []
  )

  const getPropertyMessages = useCallback(
    async (propertyId: string, token: string) => {
      const res = await safeFetchJson<Message[]>(
        `${API_BASE_URL}/message/property/${propertyId}`,
        { headers: withAuth(token) }
      )
      return res.data ? reviveDates(res.data) : []
    },
    []
  )

  const markAsRead = useCallback(async (messageId: string, token: string) => {
    const res = await safeFetchJson<Message>(
      `${API_BASE_URL}/message/mark-read/${messageId}`,
      { method: "PUT", headers: withAuth(token) }
    )
    if (!res.data) throw new Error(res.error || "Failed to mark as read")
    return reviveDates(res.data)
  }, [])

  const deleteMessage = useCallback(async (messageId: string, token: string) => {
    const res = await safeFetchJson<null>(
      `${API_BASE_URL}/message/delete/${messageId}`,
      { method: "DELETE", headers: withAuth(token) }
    )
    if (!res.success) throw new Error(res.error || "Failed to delete message")
  }, [])

  const messageApi = useMemo(
    () => ({
      send: sendMessage,
      getSentMessages,
      getReceivedMessages,
      getPropertyMessages,
      markAsRead,
      delete: deleteMessage,
    }),
    [
      sendMessage,
      getSentMessages,
      getReceivedMessages,
      getPropertyMessages,
      markAsRead,
      deleteMessage,
    ]
  )

  return { propertyApi, authApi, favoritesApi, messageApi }
}
