"use client"

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
import { useApi } from "@/lib/api"
import { Upload, X, Save } from "lucide-react"
import Image from "next/image"

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

type PropertyData = {
  title: string
  description: string
  price: string
  propertyType: "apartment" | "studio"
  bedrooms: string
  bathrooms: string
  area: string
  address: string
  city: string
  state: string
  zipCode: string
  amenities: string[]
  images: string[]
  maxGuests: string
  guestType: "Family" | "Bachelors" | "Girls" | "Boys"
  rules: string[]
  checkInTime: string
  checkOutTime: string
  isAvailable: boolean
}

export default function AddPropertyPage() {
  const { propertyApi } = useApi()
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [propertyData, setPropertyData] = useState<PropertyData>({
    title: "",
    description: "",
    price: "",
    propertyType: "apartment",
    bedrooms: "",
    bathrooms: "",
    area: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    amenities: [],
    images: [],
    maxGuests: "",
    guestType: "Family",
    rules: [],
    checkInTime: "15:00",
    checkOutTime: "11:00",
    isAvailable: true,
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== "landlord")) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) return <DashboardLayout>Loading...</DashboardLayout>
  if (!user || user.role !== "landlord") return null

  const handleInputChange = (field: keyof PropertyData, value: string | boolean | string[]) => {
    setPropertyData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const newAmenities = checked
      ? [...propertyData.amenities, amenity]
      : propertyData.amenities.filter((a) => a !== amenity)
    setPropertyData((prev) => ({ ...prev, amenities: newAmenities }))
  }

  const handleImageUpload = () => {
    const mockImageUrl = `/placeholder.svg?height=300&width=400&query=modern apartment interior`
    setPropertyData((prev) => ({ ...prev, images: [...prev.images, mockImageUrl] }))
    toast({ title: "Image uploaded", description: "Your image has been added." })
  }

  const removeImage = (index: number) => {
    setPropertyData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const validateFields = () => {
    const required: (keyof PropertyData)[] = [
      "title",
      "description",
      "price",
      "propertyType",
      "area",
      "address",
      "city",
      "state",
      "zipCode",
      "bedrooms",
      "bathrooms",
      "maxGuests",
    ]

    for (const field of required) {
      if (!propertyData[field]) {
        toast({
          title: "Missing required fields",
          description: `Please fill in the "${field}" field.`,
          variant: "destructive",
        })
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateFields()) return

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("auth-token")
      if (!token) throw new Error("Authentication required")

      // Normalize payload
      const payload = {
        title: propertyData.title.trim(),
        description: propertyData.description.trim(),
        price: parseFloat(propertyData.price),
        location: {
          address: propertyData.address.trim(),
          city: propertyData.city.trim(),
          state: propertyData.state.trim(),
          zipCode: propertyData.zipCode.trim(),
        },
        propertyType: propertyData.propertyType,
        bedrooms: parseInt(propertyData.bedrooms, 10),
        bathrooms: parseFloat(propertyData.bathrooms),
        area: parseFloat(propertyData.area),
        maxGuests: parseInt(propertyData.maxGuests, 10),
        guestType: propertyData.guestType,
        amenities: propertyData.amenities,
        images: propertyData.images,
        rules: propertyData.rules,
        isAvailable: !!propertyData.isAvailable,
        checkInTime: propertyData.checkInTime,
        checkOutTime: propertyData.checkOutTime,
      }

      await propertyApi.create(payload, token)

      toast({
        title: "Property listed successfully",
        description: "Your property is now live.",
      })
      router.push("/dashboard/properties")
    } catch (error: unknown) {
      console.error(error)
      if (
        error &&
        typeof error === "object" &&
        "errors" in error &&
        Array.isArray((error as any).errors)
      ) {
        ;(error as { errors: { msg: string }[] }).errors.forEach((err) =>
          toast({ title: "Validation Error", description: err.msg, variant: "destructive" })
        )
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
        <p className="text-gray-600">List your property and connect with potential tenants</p>

        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
          {/* BASIC INFO */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={propertyData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={propertyData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Price (Rs) *</Label>
                  <Input
                    type="number"
                    value={propertyData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Property Type *</Label>
                  <Select
                    value={propertyData.propertyType}
                    onValueChange={(v) => handleInputChange("propertyType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">apartment</SelectItem>
                      <SelectItem value="studio">studio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Area (sq ft) *</Label>
                  <Input
                    type="number"
                    value={propertyData.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="number"
                  value={propertyData.bedrooms}
                  onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                  placeholder="Bedrooms"
                  required
                />
                <Input
                  type="number"
                  value={propertyData.bathrooms}
                  onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                  placeholder="Bathrooms"
                  step="0.5"
                  required
                />
                <Input
                  type="number"
                  value={propertyData.maxGuests}
                  onChange={(e) => handleInputChange("maxGuests", e.target.value)}
                  placeholder="Max Guests"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Guest Type *</Label>
                  <Select
                    value={propertyData.guestType}
                    onValueChange={(v) => handleInputChange("guestType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Family">Family</SelectItem>
                      <SelectItem value="Bachelors">Bachelors</SelectItem>
                      <SelectItem value="Girls">Girls</SelectItem>
                      <SelectItem value="Boys">Boys</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Availability *</Label>
                  <Select
                    value={propertyData.isAvailable.toString()}
                    onValueChange={(v) => handleInputChange("isAvailable", v === "true")}
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

          {/* LOCATION */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={propertyData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Street Address"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  value={propertyData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="City"
                  required
                />
                <Input
                  value={propertyData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="State"
                  required
                />
                <Input
                  value={propertyData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  placeholder="ZIP Code"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* AMENITIES */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {amenitiesList.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={propertyData.amenities.includes(amenity)}
                    onCheckedChange={(checked) => handleAmenityChange(amenity, Boolean(checked))}
                  />
                  <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* IMAGES */}
          <Card>
            <CardHeader>
              <CardTitle>Property Images</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {propertyData.images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                    <Image
                      src={img || "/placeholder.svg"}
                      alt="Property image"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                    onClick={() => removeImage(idx)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" className="aspect-square border-dashed" onClick={handleImageUpload}>
                <div className="text-center">
                  <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Add Image</span>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* RULES */}
          <Card>
            <CardHeader>
              <CardTitle>House Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={propertyData.rules.join("\n")}
                onChange={(e) =>
                  handleInputChange(
                    "rules",
                    e.target.value.split("\n").filter((r) => r.trim() !== "")
                  )
                }
                placeholder="No smoking&#10;No pets"
                rows={4}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Publishing..." : "Publish Property"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
