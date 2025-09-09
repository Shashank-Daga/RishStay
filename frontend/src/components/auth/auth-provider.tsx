"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/lib/types"
import { useAuthService } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (
    name: string,
    phoneNo: string,
    email: string,
    password: string,
    role: "landlord" | "tenant"
  ) => Promise<boolean>
  logout: () => void
  loading: boolean
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, login, signup, logout, getCurrentUser } = useAuthService()
  const [loading, setLoading] = useState(true) // loading while restoring user

  // Restore user on app mount
  useEffect(() => {
    const restoreUser = async () => {
      setLoading(true)
      try {
        await getCurrentUser()
      } catch (error) {
        console.error("Failed to restore user:", error)
      } finally {
        setLoading(false)
      }
    }
    restoreUser()
  }, [getCurrentUser])

  // Keep React state + localStorage in sync
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem("rental-user", JSON.stringify(updatedUser))

    // Optional: sync favorites to backend
    if (updatedUser.favorites) {
      fetch(`/api/users/${updatedUser._id}/favorites`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({ favorites: updatedUser.favorites }),
      }).catch((err) => console.error("Failed to update favorites:", err))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        loading,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ✅ Public hook for components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider")
  }
  return context
}
