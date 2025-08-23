import type { User } from "./types"
import { mockUsers } from "./mock-data"

// Mock authentication context
export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string, role: "owner" | "tenant") => Promise<boolean>
  logout: () => void
  loading: boolean
}

// Mock authentication functions
export const mockAuth = {
  login: async (email: string, password: string): Promise<User | null> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Find user by email (mock authentication)
    const user = mockUsers.find((u) => u.email === email)
    if (user && password === "password") {
      return user
    }
    return null
  },

  signup: async (email: string, password: string, name: string, role: "owner" | "tenant"): Promise<User | null> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
      createdAt: new Date(),
    }

    mockUsers.push(newUser)
    return newUser
  },
}
