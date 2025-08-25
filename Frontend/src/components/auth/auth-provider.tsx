"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/lib/types"
import { authService } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, phoneNo: string, email: string, password: string, role: "owner" | "tenant") => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for stored user session
        const storedUser = localStorage.getItem("rental-user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        } else {
          // Try to get user from token
          const user = await authService.getCurrentUser()
          if (user) {
            setUser(user)
            localStorage.setItem("rental-user", JSON.stringify(user))
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      const loggedInUser = await authService.login(email, password)
      if (loggedInUser) {
        setUser(loggedInUser)
        localStorage.setItem("rental-user", JSON.stringify(loggedInUser))
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const signup = async ( name: string, phoneNo: string, email: string, password: string, role: "owner" | "tenant") => {
    setLoading(true)
    try {
      const newUser = await authService.signup(name, phoneNo, email, password, role)
      if (newUser) {
        setUser(newUser)
        localStorage.setItem("rental-user", JSON.stringify(newUser))
        return true
      }
      return false
    } catch (error) {
      console.error("Signup error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("rental-user")
    authService.logout()
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
