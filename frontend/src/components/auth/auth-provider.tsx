"use client"

import React, { createContext, useContext, useEffect } from "react"
import type { User } from "@/lib/types"
import { useAuthService } from "@/lib/auth" // 👈 adjust path if needed

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
  const { user, setUser, login, signup, logout, loading, getCurrentUser } = useAuthService()

  // Restore user when app mounts
  useEffect(() => {
    getCurrentUser()
  }, [getCurrentUser])

  // Keep React state + localStorage in sync
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem("rental-user", JSON.stringify(updatedUser))
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
