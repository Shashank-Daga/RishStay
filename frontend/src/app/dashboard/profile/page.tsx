"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/lib/api"
import { Save, User } from "lucide-react"

export default function ProfilePage() {
  const { authApi } = useApi()
  const { user, loading, updateUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const [profileData, setProfileData] = useState({
    name: "",
    phoneNo: "",
    email: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        phoneNo: user.phoneNo || "",
        email: user.email || "",
      })
    }
  }, [user])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="max-w-2xl space-y-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setIsSubmitting(true)

    // Basic validation
    if (!profileData.name.trim()) {
      setErrors(["Name is required"])
      setIsSubmitting(false)
      return
    }

    if (!profileData.phoneNo.trim()) {
      setErrors(["Phone number is required"])
      setIsSubmitting(false)
      return
    }

    if (!profileData.email.trim()) {
      setErrors(["Email is required"])
      setIsSubmitting(false)
      return
    }

    try {
      const token = localStorage.getItem("auth-token")
      if (!token) throw new Error("Authentication token not found")
      await authApi.updateUser(
        {
          name: profileData.name,
          phoneNo: profileData.phoneNo,
          email: profileData.email,
        },
        token
      )

      toast({
        title: "Profile updated!",
        description: "Your profile information has been updated successfully.",
      })

      updateUser({
        ...user,
        name: profileData.name,
        phoneNo: profileData.phoneNo,
        email: profileData.email,
      })

      router.push("/dashboard")
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setErrors(["Failed to update profile. Please try again."])
        toast({
          title: "Update failed",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#003366]">Edit Profile</h1>
          <p className="text-gray-600">Update your personal information</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="rounded-2xl border-2 border-[#003366]/20 shadow-lg bg-white/95 backdrop-blur">
            <CardHeader className="border-b border-[#003366]/10 bg-gradient-to-r from-[#FFE9D6]/30 to-[#E9E6F7]/30">
              <CardTitle className="text-[#003366] text-xl flex items-center gap-2">
                <div className="w-1 h-6 bg-[#FFC107] rounded-full"></div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {errors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <ul className="text-sm text-red-600 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#003366] font-semibold text-sm">Full Name *</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNo" className="text-[#003366] font-semibold text-sm">Phone Number *</Label>
                  <Input
                    id="phoneNo"
                    type="tel"
                    value={profileData.phoneNo}
                    onChange={(e) => handleInputChange("phoneNo", e.target.value)}
                    placeholder="Enter your phone number"
                    required
                    className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#003366] font-semibold text-sm">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#003366] font-semibold text-sm">Account Type</Label>
                  <Input
                    value={user.role === "landlord" ? "Property Owner" : "Tenant"}
                    disabled
                    className="bg-gray-50 border-2 border-[#003366]/20"
                  />
                  <p className="text-sm text-gray-500">
                    Account type cannot be changed. Contact support if you need to change your account type.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#003366] hover:bg-[#FFC107] text-white hover:text-[#003366] transition-all rounded-2xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Updating..." : "Update Profile"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="rounded-2xl px-6 py-3"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
