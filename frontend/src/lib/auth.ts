"use client"

import { useState, useCallback } from "react"
import type { User } from "@/lib/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface AuthResponse {
  data: {
    authtoken: string
    user: User
  }
  error?: string
}

export function useAuthService() {
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

  const toggleFavorite = useCallback(
    (propertyId: string) => {
      if (!user) return

      const updatedFavorites = user.favorites?.includes(propertyId)
        ? user.favorites.filter((id) => id !== propertyId)
        : [...(user.favorites || []), propertyId]

      const updatedUser = { ...user, favorites: updatedFavorites }
      setUser(updatedUser)
      localStorage.setItem("rental-user", JSON.stringify(updatedUser))

      // Sync with backend
      fetch(`${API_BASE_URL}/users/${user._id}/favorites`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({ favorites: updatedFavorites }),
      }).catch((err) => console.error("Failed to update favorites:", err))
    },
    [user]
  )

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
