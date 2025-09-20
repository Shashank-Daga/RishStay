"use client"

import { useState, useCallback } from "react"
import type { User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/lib/api"

export function useAuthService() {
  const { toast } = useToast()
  const { authApi, favoritesApi } = useApi()
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
      const fetchedUser = await authApi.getCurrentUser(token)
      setUser(fetchedUser)
      localStorage.setItem("rental-user", JSON.stringify(fetchedUser))
      return fetchedUser
    } catch (error) {
      console.error("Error restoring user:", error)
      setUser(null)
      localStorage.removeItem("auth-token")
      localStorage.removeItem("rental-user")
      return null
    } finally {
      setLoading(false)
    }
  }, [authApi])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      const { authtoken, user } = await authApi.login(email, password)
      localStorage.setItem("auth-token", authtoken)
      localStorage.setItem("rental-user", JSON.stringify(user))
      setUser(user)
      return true
    } finally {
      setLoading(false)
    }
  }, [authApi])

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
        const { authtoken, user } = await authApi.signup({
          name,
          phoneNo,
          email,
          password,
          role,
        })
        localStorage.setItem("auth-token", authtoken)
        localStorage.setItem("rental-user", JSON.stringify(user))
        setUser(user)
        return true
      } finally {
        setLoading(false)
      }
    },
    [authApi]
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
    if (!token) return

    const isFavorite = user.favorites?.includes(propertyId)

    try {
      const favorites = isFavorite
        ? await favoritesApi.remove(user._id, propertyId, token)
        : await favoritesApi.add(user._id, propertyId, token)

      const updatedUser = { ...user, favorites }
      setUser(updatedUser)
      localStorage.setItem("rental-user", JSON.stringify(updatedUser))

      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
      })
    } catch (err) {
      console.error("Failed to update favorites:", err)
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Could not update favorites.",
        variant: "destructive",
      })
    }
  }

  return {
    user,
    setUser,
    login,
    signup,
    logout,
    loading,
    getCurrentUser,
    toggleFavorite,
  }
}
