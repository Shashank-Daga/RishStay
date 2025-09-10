"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { useApi } from "@/lib/api"
import { CalendarIcon, Phone, Mail } from "lucide-react"
import { format } from "date-fns"
import type { Property, SendMessageResponse } from "@/lib/types"

interface ContactFormProps {
  property: Property
}

export function ContactForm({ property }: ContactFormProps) {
  const { messageApi } = useApi()
  const { user } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inquiryType, setInquiryType] = useState<"general" | "viewing" | "application" | "availability">("general")
  const [preferredDate, setPreferredDate] = useState<Date>()

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  })

  // Prefill inquiryType from URL query
  useEffect(() => {
    const type = searchParams.get("inquiryType") as "general" | "viewing" | "application" | "availability" | null
    if (type) setInquiryType(type)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to send inquiries.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const token = localStorage.getItem("auth-token")
      if (!token) {
        toast({
          title: "Authentication error",
          description: "User token not found. Please sign in again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const result: SendMessageResponse = await messageApi.send(
        {
          propertyId: property._id,
          message: `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nInquiry: ${inquiryType}`,
          inquiryType: inquiryType,
          preferredDate,
          phone: formData.phone,
        },
        token
      )

      if (result.success) {
        toast({
          title: "Inquiry sent!",
          description: "The property owner will respond soon.",
        })
        if (!user) {
          setFormData({ name: "", email: "", phone: "" })
        } else {
          setFormData({ ...formData, phone: "" })
        }
        setPreferredDate(undefined)
      } else {
        toast({
          title: "Failed to send inquiry",
          description: result.error || "Please try again later.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Contact form error:", error)

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Owner</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Inquiry Type */}
            <div className="space-y-2">
              <Label>I am interested in:</Label>
              <Select 
                value={inquiryType} 
                onValueChange={(value) => setInquiryType(value as "general" | "viewing" | "application" | "availability")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Information</SelectItem>
                  <SelectItem value="viewing">Schedule a Viewing</SelectItem>
                  <SelectItem value="application">Rental Application</SelectItem>
                  <SelectItem value="availability">Availability</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Preferred Date for Viewing */}
            {inquiryType === "viewing" && (
              <div className="space-y-2">
                <Label>Preferred Viewing Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {preferredDate ? format(preferredDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={preferredDate}
                      onSelect={setPreferredDate}
                      disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Inquiry"}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              By contacting the owner, you agree to our terms of service and privacy policy.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
