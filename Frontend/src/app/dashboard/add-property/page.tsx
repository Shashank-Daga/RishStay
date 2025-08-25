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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
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
    squareFeet: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    amenities: [] as string[],
    images: [] as string[],
    featured: false,
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
    if (!propertyData.title || !propertyData.price || !propertyData.propertyType || !availableFrom) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Property listed successfully!",
      description: "Your property has been added and is now live on the platform.",
    })

    router.push("/dashboard/properties")
    setIsSubmitting(false)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
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
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="squareFeet">Square Feet</Label>
                  <Input
                    id="squareFeet"
                    type="number"
                    value={propertyData.squareFeet}
                    onChange={(e) => handleInputChange("squareFeet", e.target.value)}
                    placeholder="1200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Select value={propertyData.bedrooms} onValueChange={(value) => handleInputChange("bedrooms", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bedrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Studio</SelectItem>
                      <SelectItem value="1">1 Bedroom</SelectItem>
                      <SelectItem value="2">2 Bedrooms</SelectItem>
                      <SelectItem value="3">3 Bedrooms</SelectItem>
                      <SelectItem value="4">4 Bedrooms</SelectItem>
                      <SelectItem value="5">5+ Bedrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Select
                    value={propertyData.bathrooms}
                    onValueChange={(value) => handleInputChange("bathrooms", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bathrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Bathroom</SelectItem>
                      <SelectItem value="1.5">1.5 Bathrooms</SelectItem>
                      <SelectItem value="2">2 Bathrooms</SelectItem>
                      <SelectItem value="2.5">2.5 Bathrooms</SelectItem>
                      <SelectItem value="3">3 Bathrooms</SelectItem>
                      <SelectItem value="3.5">3.5+ Bathrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Available From *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {availableFrom ? format(availableFrom, "PPP") : "Select availability date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={availableFrom}
                      onSelect={setAvailableFrom}
                      disabled={(date: Date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={propertyData.featured}
                  onCheckedChange={(checked: boolean) => handleInputChange("featured", checked as boolean)}
                />
                <Label htmlFor="featured">Mark as featured property (additional visibility)</Label>
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
