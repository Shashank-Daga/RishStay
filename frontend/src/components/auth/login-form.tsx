"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "./auth-provider"
import { useToast } from "@/hooks/use-toast"

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToSignup?: () => void
}

export function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, loading } = useAuth()
  const { toast } = useToast()

  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    try {
      await login(email, password)

      // ✅ Reset form fields after success
      setEmail("")
      setPassword("")
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      })
      onSuccess?.()
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrors([error.message])
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setErrors(["Login failed. Please try again."])
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Card className="w-full max-w-md bg-white shadow-xl rounded-2xl">
      <CardHeader>
        <CardTitle className="text-[#003366]">Log In</CardTitle>
        <CardDescription className="text-[#6B7280]">Enter your credentials to access your account</CardDescription>
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
              placeholder="Enter your password"
              required
              className="focus:ring-[#FFC107] focus:border-[#FFC107]"
            />
          </div>
          <Button type="submit" className="w-full bg-[#FFC107] hover:bg-yellow-600 text-[#003366] rounded-xl shadow-md hover:shadow-lg transform hover:scale-105" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>
          <div className="text-center">
            <Button type="button" variant="link" onClick={onSwitchToSignup} className="text-sm text-[#6B7280] hover:text-[#FFC107]">
              Don&apos;t have an account? Sign up
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
