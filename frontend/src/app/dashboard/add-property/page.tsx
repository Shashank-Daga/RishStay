"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { propertyApi } from "@/lib/api"
import { CalendarIcon, Upload, X, Save } from "lucide-react"
import { format } from "date-fns"

const amenitiesList = [
  "Air Conditioning",
  "Dishwasher",
  "Gym",
  "Parking",
  "Pet Friendly",
  "Laundry",
  "Garden",
  "Internet Included",
  "Pool",
  "Balcony",
  "Fireplace",
  "Hardwood Floors",
]

export default function AddPropertyPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableFrom, setAvailableFrom] = useState<Date>()

  const [propertyData, setPropertyData] = useState({
    title: "",
    description: "",
    price: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    amenities: [] as string[],
    images: [] as string[],
    maxGuests: "",
    guestType: "",
    rules: [] as string[],
    checkInTime: "15:00",
    checkOutTime: "11:00",
    isAvailable: true,
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== "landlord")) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="max-w-4xl space-y-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user || user.role !== "landlord") return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate required fields
    if (!propertyData.title || !propertyData.description || !propertyData.price ||
        !propertyData.propertyType || !propertyData.area || !propertyData.address ||
        !propertyData.city || !propertyData.state || !propertyData.zipCode ||
        !propertyData.bedrooms || !propertyData.bathrooms || !propertyData.maxGuests) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to add a property.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const propertyPayload = {
        title: propertyData.title,
        description: propertyData.description,
        price: parseFloat(propertyData.price),
        location: {
          address: propertyData.address,
          city: propertyData.city,
          state: propertyData.state,
          zipCode: propertyData.zipCode,
        },
        propertyType: propertyData.propertyType as "apartment" | "studio",
        bedrooms: parseInt(propertyData.bedrooms),
        bathrooms: parseFloat(propertyData.bathrooms),
        area: parseInt(propertyData.area),
        maxGuests: parseInt(propertyData.maxGuests),
        guestType: propertyData.guestType as "Family" | "Bachelors" | "Girls" | "Boys" | null,
        amenities: propertyData.amenities,
        images: propertyData.images,
        rules: propertyData.rules,
        isAvailable: propertyData.isAvailable,
      }

      await propertyApi.create(propertyPayload, token)

      toast({
        title: "Property listed successfully!",
        description: "Your property has been added and is now live on the platform.",
      })

      router.push("/dashboard/properties")
    } catch (error) {
      console.error("Error creating property:", error)
      toast({
        title: "Error creating property",
        description: error instanceof Error ? error.message : "An error occurred while creating the property.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setPropertyData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const newAmenities = checked
      ? [...propertyData.amenities, amenity]
      : propertyData.amenities.filter((a) => a !== amenity)
    setPropertyData((prev) => ({ ...prev, amenities: newAmenities }))
  }

  const handleImageUpload = () => {
    // In a real app, this would handle file upload
    const mockImageUrl = `/placeholder.svg?height=300&width=400&query=modern apartment interior`
    setPropertyData((prev) => ({ ...prev, images: [...prev.images, mockImageUrl] }))
    toast({
      title: "Image uploaded",
      description: "Your image has been added to the property gallery.",
    })
  }

  const removeImage = (index: number) => {
    setPropertyData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-gray-600">List your property and connect with potential tenants</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  value={propertyData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Modern 2BR Apartment in Downtown"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={propertyData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your property, its features, and what makes it special..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Monthly Rent ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={propertyData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="2500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select
                    value={propertyData.propertyType}
                    onValueChange={(value) => handleInputChange("propertyType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Area (sq ft) *</Label>
                  <Input
                    id="area"
                    type="number"
                    value={propertyData.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    placeholder="1200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms *</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={propertyData.bedrooms}
                    onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                    placeholder="2"
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms *</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={propertyData.bathrooms}
                    onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                    placeholder="1"
                    min="0"
                    step="0.5"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxGuests">Max Guests *</Label>
                  <Input
                    id="maxGuests"
                    type="number"
                    value={propertyData.maxGuests}
                    onChange={(e) => handleInputChange("maxGuests", e.target.value)}
                    placeholder="4"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guestType">Guest Type</Label>
                  <Select
                    value={propertyData.guestType}
                    onValueChange={(value) => handleInputChange("guestType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select guest type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Family">Family</SelectItem>
                      <SelectItem value="Bachelors">Bachelors</SelectItem>
                      <SelectItem value="Girls">Girls</SelectItem>
                      <SelectItem value="Boys">Boys</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isAvailable">Availability</Label>
                  <Select
                    value={propertyData.isAvailable.toString()}
                    onValueChange={(value) => handleInputChange("isAvailable", value === "true")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Available</SelectItem>
                      <SelectItem value="false">Not Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={propertyData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={propertyData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="San Francisco"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={propertyData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="CA"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={propertyData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    placeholder="94105"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {amenitiesList.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={propertyData.amenities.includes(amenity)}
                      onCheckedChange={(checked: boolean) => handleAmenityChange(amenity, checked as boolean)}
                    />
                    <Label htmlFor={amenity} className="text-sm">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Property Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {propertyData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Property ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="aspect-square border-dashed bg-transparent"
                  onClick={handleImageUpload}
                >
                  <div className="text-center">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    <span className="text-sm text-gray-600">Add Image</span>
                  </div>
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Upload high-quality images to attract more tenants. First image will be the main photo.
              </p>
            </CardContent>
          </Card>

          {/* Rules */}
          <Card>
            <CardHeader>
              <CardTitle>House Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rules">Add house rules (one per line)</Label>
                <Textarea
                  id="rules"
                  value={propertyData.rules.join('\n')}
                  onChange={(e) => handleInputChange("rules", e.target.value.split('\n').filter(rule => rule.trim() !== ''))}
                  placeholder="No smoking&#10;No pets&#10;Quiet hours after 10 PM"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1 md:flex-none">
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Publishing..." : "Publish Property"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
