"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    } else if (user) {
      const redirectPath = user.role === "landlord" ? "/dashboard/properties" : "/dashboard/favorites"
      router.replace(redirectPath)
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return <div>Loading...</div>
  }

  return null
}
