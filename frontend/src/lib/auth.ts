"use client"

import { useState, useCallback } from "react"
import type { User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface AuthResponse {
  data: {
    authtoken: string
    user: User
  }
  error?: string
}

export function useAuthService() {
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  // Restore user from localStorage AND validate with backend
  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth-token")
      if (!token) {
        setUser(null)
        return null
      }

      const res = await fetch(`${API_BASE_URL}/auth/getuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      })

      if (!res.ok) {
        setUser(null)
        localStorage.removeItem("auth-token")
        localStorage.removeItem("rental-user")
        return null
      }

      const data = await res.json()
      setUser(data.data)
      localStorage.setItem("rental-user", JSON.stringify(data.data))
      return data.data
    } catch (error) {
      console.error("Error restoring user:", error)
      setUser(null)
      localStorage.removeItem("auth-token")
      localStorage.removeItem("rental-user")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const raw = await res.text()

      if (!res.ok) {
        let message = "Login failed"
        try {
          const errData = JSON.parse(raw)
          message = errData.error || JSON.stringify(errData)
        } catch {
          message = raw || message
        }
        throw new Error(message)
      }

      let data: AuthResponse
      try {
        data = JSON.parse(raw)
      } catch {
        throw new Error("Invalid response from server")
      }

      localStorage.setItem("auth-token", data.data.authtoken)
      localStorage.setItem("rental-user", JSON.stringify(data.data.user))
      setUser(data.data.user)

      return true
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(
    async (
      name: string,
      phoneNo: string,
      email: string,
      password: string,
      role: "landlord" | "tenant"
    ): Promise<boolean> => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE_URL}/auth/createUser`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phoneNo, email, password, role }),
        })

        const raw = await res.text()

        if (!res.ok) {
          let message = "Signup failed"
          try {
            const errData = JSON.parse(raw)
            message = errData.error || JSON.stringify(errData)
          } catch {
            message = raw || message
          }
          throw new Error(message)
        }

        let data: AuthResponse
        try {
          data = JSON.parse(raw)
        } catch {
          throw new Error("Invalid response from server")
        }

        localStorage.setItem("auth-token", data.data.authtoken)
        localStorage.setItem("rental-user", JSON.stringify(data.data.user))
        setUser(data.data.user)

        return true
      } catch (error) {
        console.error("Signup error:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const logout = useCallback((): void => {
    localStorage.removeItem("auth-token")
    localStorage.removeItem("rental-user")
    setUser(null)
  }, [])

  const toggleFavorite = async (propertyId: string): Promise<void> => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to save favorites.",
        variant: "destructive",
      })
      return
    }

    const token = localStorage.getItem("auth-token")
    if (!token) {
      toast({
        title: "Authentication error",
        description: "Please log in again.",
        variant: "destructive",
      })
      return
    }

    const isFavorite = user.favorites?.includes(propertyId)
    
    try {
      let res;
      
      if (isFavorite) {
        // Remove from favorites
        res = await fetch(`${API_BASE_URL}/favorites/${user._id}/remove/${propertyId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token, // Remove "Bearer " prefix
          },
        })
      } else {
        // Add to favorites
        res = await fetch(`${API_BASE_URL}/favorites/${user._id}/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token, // Remove "Bearer " prefix
          },
          body: JSON.stringify({ propertyId }),
        })
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Failed to update favorites")
      }

      const data = await res.json()
      
      if (data.success) {
        // Update user state with the returned favorites
        const updatedUser = { ...user, favorites: data.favorites }
        setUser(updatedUser)
        localStorage.setItem("rental-user", JSON.stringify(updatedUser))

        toast({
          title: isFavorite ? "Removed from favorites" : "Added to favorites",
          description: isFavorite
            ? "This property was removed from your favorites list."
            : "This property was added to your favorites list.",
        })
      } else {
        throw new Error(data.error || "Failed to update favorites")
      }
    } catch (err) {
      console.error("Failed to update favorites:", err)
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "Could not update favorites. Please try again later.",
        variant: "destructive",
      })
    }
  }

  return {
    user,
    setUser, // ✅ for AuthProvider's updateUser
    login,
    signup,
    logout,
    loading,
    getCurrentUser,
    toggleFavorite,
  }
}
