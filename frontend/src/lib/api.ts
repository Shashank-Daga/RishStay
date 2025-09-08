"use client"

import { useMemo, useCallback } from "react"
import type { Message, Property, User } from "./types"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  errors?: Array<{ msg: string; param?: string }>
}

// -------- SendMessageResponse --------
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

// Utility: Convert ISO date strings to Date objects
const reviveDates = <T extends Record<string, any>>(obj: T): T => {
  const isISODate = (val: any) =>
    typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)

  const recurse = (input: any): any => {
    if (Array.isArray(input)) return input.map(recurse)
    if (input && typeof input === "object") {
      return Object.fromEntries(
        Object.entries(input).map(([k, v]) => [k, recurse(v)])
      )
    }
    return isISODate(input) ? new Date(input) : input
  }

  return recurse(obj)
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

  const getMyProperties = useCallback(async (token: string): Promise<Property[]> => {
    const res = await safeFetchJson<Property[]>(
      `${API_BASE_URL}/property/myproperties`,
      { headers: withAuth(token) }
    )
    return res.data ? reviveDates(res.data) : []
  }, [])

  const createProperty = useCallback(
    async (propertyData: Partial<Property>, token: string) => {
      const payload: Partial<Property> = {
        title: propertyData.title?.trim() || "",
        description: propertyData.description?.trim() || "",
        price: Number(propertyData.price) || 0,
        bedrooms: Number(propertyData.bedrooms) || 0,
        bathrooms: Number(propertyData.bathrooms) || 0,
        area: Number(propertyData.area) || 0,
        maxGuests: Number(propertyData.maxGuests) || 1,
        propertyType: propertyData.propertyType || "apartment",
        guestType: propertyData.guestType || "Family",
        isAvailable:
          typeof propertyData.isAvailable === "boolean"
            ? propertyData.isAvailable
            : true,
        location: {
          address: propertyData.location?.address?.trim() || "",
          city: propertyData.location?.city?.trim() || "",
          state: propertyData.location?.state?.trim() || "",
          zipCode: propertyData.location?.zipCode?.trim() || "",
        },
        amenities: propertyData.amenities || [],
        images: propertyData.images || [],
        rules: propertyData.rules || [],
      }

      const res = await safeFetchJson<Property>(`${API_BASE_URL}/property/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...withAuth(token) },
        body: JSON.stringify(payload),
      })

      if (!res.success || !res.data) {
        if (res.errors?.length) {
          throw new Error(res.errors.map((e) => `${e.param}: ${e.msg}`).join("\n"))
        }
        throw new Error(res.error || "Failed to create property")
      }

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
    const res = await safeFetchJson<{ authtoken: string }>(
      `${API_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    )
    if (!res.data) throw new Error(res.error || "Login failed")
    return res.data
  }, [])

  const signup = useCallback(
    async (userData: {
      name: string
      phoneNo: string
      email: string
      password: string
      role: "landlord" | "tenant"
    }) => {
      const res = await safeFetchJson<{ authtoken: string }>(
        `${API_BASE_URL}/auth/createUser`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      )
      if (!res.data) throw new Error(res.error || "Signup failed")
      return res.data
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

  const authApi = useMemo(
    () => ({ login, signup, getCurrentUser, updateUser }),
    [login, signup, getCurrentUser, updateUser]
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

  const getMyMessages = useCallback(async (token: string, options?: { signal?: AbortSignal }) => {
    const res = await safeFetchJson<Message[]>(
      `${API_BASE_URL}/message/my-messages`,
      {
        headers: withAuth(token),
        signal: options?.signal,
      }
    )
    return res.data ? reviveDates(res.data) : []
  }, [])

  const getPropertyMessages = useCallback(async (propertyId: string, token: string) => {
    const res = await safeFetchJson<Message[]>(
      `${API_BASE_URL}/message/property/${propertyId}`,
      { headers: withAuth(token) }
    )
    return res.data ? reviveDates(res.data) : []
  }, [])

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
      getMyMessages,
      getPropertyMessages,
      markAsRead,
      delete: deleteMessage,
    }),
    [sendMessage, getMyMessages, getPropertyMessages, markAsRead, deleteMessage]
  )

  return { propertyApi, authApi, messageApi }
}
