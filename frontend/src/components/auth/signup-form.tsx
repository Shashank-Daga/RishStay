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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Join our platform to find or list rental properties</CardDescription>
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
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNo">Phone Number</Label>
            <Input
              id="phoneNo"
              type="tel"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              placeholder="Enter your phone number"
              pattern="[0-9]{10}"
              title="Phone number must be 10 digits"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />
          </div>
          <div className="space-y-3">
            <Label>I am a:</Label>
            <RadioGroup value={role} onValueChange={(value) => setRole(value as "landlord" | "tenant")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tenant" id="tenant" />
                <Label htmlFor="tenant">Tenant (Looking for a place)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="landlord" id="landlord" />
                <Label htmlFor="landlord">Property Owner (Listing properties)</Label>
              </div>
            </RadioGroup>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
          <div className="text-center">
            <Button type="button" variant="link" onClick={onSwitchToLogin} className="text-sm">
              Already have an account? Log in
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
