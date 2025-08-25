import type { User } from "./types"
import { authApi } from "./api"

export interface AuthContextType {
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
}

export const authService = {
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await authApi.login(email, password)

      if (response.success && response.authtoken) {
        localStorage.setItem("auth-token", response.authtoken)
        const user = await authApi.getCurrentUser(response.authtoken)
        return user
      }
      return null
    } catch (error) {
      console.error("Login error:", error)
      return null
    }
  },

  signup: async (
    name: string,
    phoneNo: string,
    email: string,
    password: string,
    role: "landlord" | "tenant"
  ): Promise<User | null> => {
    try {
      const response = await authApi.signup({
        name,
        phoneNo,
        email,
        password,
        role,
      })

      if (response.success && response.authtoken) {
        localStorage.setItem("auth-token", response.authtoken)
        const user = await authApi.getCurrentUser(response.authtoken)
        return user
      }
      return null
    } catch (error) {
      console.error("Signup error:", error)
      return null
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem("auth-token")
      if (!token) return null
      const user = await authApi.getCurrentUser(token)
      return user
    } catch (error) {
      console.error("Get current user error:", error)
      localStorage.removeItem("auth-token")
      return null
    }
  },

  logout: (): void => {
    localStorage.removeItem("auth-token")
    localStorage.removeItem("rental-user")
  },
}
