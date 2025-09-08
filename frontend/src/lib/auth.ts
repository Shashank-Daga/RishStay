"use client"

import { useState, useCallback } from "react"
import type { User } from "@/lib/types"

export function useAuthService() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  // Restore user from localStorage
  const getCurrentUser = useCallback((): User | null => {
    try {
      const storedUser = localStorage.getItem("rental-user")
      if (storedUser) {
        const parsed = JSON.parse(storedUser) as User
        setUser(parsed)
        return parsed
      }
      return null
    } catch (error) {
      console.error("Error restoring user:", error)
      setUser(null)
      return null
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) throw new Error("Login failed")
      const data = await res.json()

      localStorage.setItem("auth-token", data.token)
      localStorage.setItem("rental-user", JSON.stringify(data.user))

      setUser(data.user)
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
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
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phoneNo, email, password, role }),
        })

        if (!res.ok) throw new Error("Signup failed")
        const data = await res.json()

        localStorage.setItem("auth-token", data.token)
        localStorage.setItem("rental-user", JSON.stringify(data.user))

        setUser(data.user)
        return true
      } catch (error) {
        console.error("Signup error:", error)
        return false
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

  const toggleFavorite = useCallback((propertyId: string) => {
    if (!user) return

    const updatedFavorites = user.favorites?.includes(propertyId)
      ? user.favorites.filter((id) => id !== propertyId)
      : [...(user.favorites || []), propertyId]

    const updatedUser = { ...user, favorites: updatedFavorites }

    setUser(updatedUser)
    localStorage.setItem("rental-user", JSON.stringify(updatedUser))

    // (Optional) also update backend
    fetch(`/api/users/${user._id}/favorites`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
      },
      body: JSON.stringify({ favorites: updatedFavorites }),
    }).catch((err) => console.error("Failed to update favorites:", err))
  }, [user])


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
