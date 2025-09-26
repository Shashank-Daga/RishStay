"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "./auth-provider"
import { useToast } from "@/hooks/use-toast"

interface SignupFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const [name, setName] = useState("")
  const [phoneNo, setPhoneNo] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"landlord" | "tenant">("tenant")
  const { signup, loading } = useAuth()
  const { toast } = useToast()
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    try {
      await signup(name, phoneNo, email, password, role)
      toast({
        title: "Account created!",
        description: "Welcome to the platform. You can now start browsing properties.",
      })

      // ✅ Reset form fields
      setName("")
      setPhoneNo("")
      setEmail("")
      setPassword("")
      setRole("tenant")

      onSuccess?.()
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrors([error.message])
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setErrors(["Signup failed. Please try again."])
        toast({
          title: "Signup failed",
          description: "An error occurred during signup. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Card className="w-full max-w-md bg-white shadow-xl rounded-2xl">
      <CardHeader>
        <CardTitle className="text-[#003366]">Create Account</CardTitle>
        <CardDescription className="text-[#6B7280]">Join our platform to find or list rental properties</CardDescription>
      </CardHeader>
      <CardContent>
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <ul className="text-sm text-red-600 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#6B7280]">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="focus:ring-[#FFC107] focus:border-[#FFC107]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNo" className="text-[#6B7280]">Phone Number</Label>
            <Input
              id="phoneNo"
              type="tel"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              placeholder="Enter your phone number"
              pattern="[0-9]{10}"
              title="Phone number must be 10 digits"
              required
              className="focus:ring-[#FFC107] focus:border-[#FFC107]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#6B7280]">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="focus:ring-[#FFC107] focus:border-[#FFC107]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#6B7280]">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              className="focus:ring-[#FFC107] focus:border-[#FFC107]"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-[#6B7280]">I am a:</Label>
            <RadioGroup value={role} onValueChange={(value) => setRole(value as "landlord" | "tenant")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tenant" id="tenant" />
                <Label htmlFor="tenant" className="text-[#6B7280]">Tenant (Looking for a place)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="landlord" id="landlord" />
                <Label htmlFor="landlord" className="text-[#6B7280]">Property Owner (Listing properties)</Label>
              </div>
            </RadioGroup>
          </div>
          <Button type="submit" className="w-full bg-[#FFC107] hover:bg-yellow-600 text-[#003366] rounded-xl shadow-md hover:shadow-lg transform hover:scale-105" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
          <div className="text-center">
            <Button type="button" variant="link" onClick={onSwitchToLogin} className="text-sm text-[#6B7280] hover:text-[#FFC107]">
              Already have an account? Log in
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
