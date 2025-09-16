"use client"

import { useEffect, useState, useRef } from "react"
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

// ----------------------
// Types
// ----------------------
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
  images: string[] // preview URLs
  maxGuests: string
  guestType: "Family" | "Bachelors" | "Girls" | "Boys"
  rules: string[]
  checkInTime: string
  checkOutTime: string
  isAvailable: boolean
}

type PropertyAvailability = {
  isAvailable: boolean
  availableFrom?: string
  availableTo?: string
}

type EditingPropertyData = PropertyData & {
  id: string
  availability?: PropertyAvailability
}

// ----------------------
// Props
// ----------------------
export function AddPropertyForm({ editingId }: { editingId?: string }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [editingProperty, setEditingProperty] = useState<EditingPropertyData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // ----------------------
  // Initial State
  // ----------------------
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

  const [imageFiles, setImageFiles] = useState<File[]>([]) // new uploads
  const [existingImages, setExistingImages] = useState<string[]>([]) // URLs of existing images
  const [deletedImages, setDeletedImages] = useState<string[]>([]) // images removed by user

  // ----------------------
  // Load property if editing
  // ----------------------
  useEffect(() => {
    if (editingId) {
      ;(async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/property/${editingId}`)
          const data = await res.json()
          if (res.ok) {
            setEditingProperty(data)
            setPropertyData({ ...data, images: [...data.images] })
            setExistingImages([...data.images])
          }
        } catch (err) {
          console.error("Failed to load property:", err)
        }
      })()
    }
  }, [editingId])

  // ----------------------
  // Redirect non-landlords
  // ----------------------
  useEffect(() => {
    if (!loading && (!user || user.role !== "landlord")) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) return <DashboardLayout>Loading...</DashboardLayout>
  if (!user || user.role !== "landlord") return null

  // ----------------------
  // Handlers (same as before)
  // ----------------------
  const handleInputChange = (field: keyof PropertyData, value: string | boolean | string[]) => {
    setPropertyData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const newAmenities = checked
      ? [...propertyData.amenities, amenity]
      : propertyData.amenities.filter((a) => a !== amenity)
    setPropertyData((prev) => ({ ...prev, amenities: newAmenities }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newFiles = Array.from(files)
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))

    setImageFiles((prev) => [...prev, ...newFiles])
    setPropertyData((prev) => ({
      ...prev,
      images: [...prev.images, ...newPreviews],
    }))

    toast({
      title: "Images uploaded",
      description: `${newFiles.length} image(s) added.`,
    })
  }

  const removeImage = (index: number) => {
    const imgToRemove = propertyData.images[index]
    if (existingImages.includes(imgToRemove)) {
      setDeletedImages((prev) => [...prev, imgToRemove])
      setExistingImages((prev) => prev.filter((img) => img !== imgToRemove))
    } else {
      setImageFiles((prev) => prev.filter((_, i) => i !== index))
    }
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

      const formData = new FormData()
      formData.append("title", propertyData.title.trim())
      formData.append("description", propertyData.description.trim())
      formData.append("price", propertyData.price)
      formData.append("propertyType", propertyData.propertyType)
      formData.append("bedrooms", propertyData.bedrooms)
      formData.append("bathrooms", propertyData.bathrooms)
      formData.append("area", propertyData.area)
      formData.append("maxGuests", propertyData.maxGuests)
      formData.append("guestType", propertyData.guestType)
      formData.append(
        "availability",
        JSON.stringify({
          isAvailable: propertyData.isAvailable,
          availableFrom: propertyData.checkInTime,
          availableTo: propertyData.checkOutTime,
        })
      )

      formData.append("address", propertyData.address.trim())
      formData.append("city", propertyData.city.trim())
      formData.append("state", propertyData.state.trim())
      formData.append("zipCode", propertyData.zipCode.trim())

      propertyData.amenities.forEach((a) => formData.append("amenities[]", a))
      propertyData.rules.forEach((r) => formData.append("rules[]", r))

      imageFiles.forEach((file) => formData.append("images", file))
      deletedImages.forEach((img) => formData.append("deletedImages[]", img))

      const endpoint = editingProperty
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/property/update/${editingProperty.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/property/create`

      await fetch(endpoint, {
        method: editingProperty ? "PUT" : "POST",
        headers: { "auth-token": token },
        body: formData,
      })

      toast({
        title: `Property ${editingProperty ? "updated" : "listed"} successfully`,
        description: `Your property is now ${editingProperty ? "updated" : "live"}.`,
      })
      router.push("/dashboard/properties")
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ----------------------
  // Render
  // ----------------------
  return (
    <DashboardLayout>
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {editingProperty ? "Edit Property" : "Add New Property"}
            </h1>
            <p className="text-gray-600">
              {editingProperty
                ? "Update your property details"
                : "List your property and connect with potential tenants"}
            </p>
    
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
                      placeholder="Name your property"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={propertyData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe your property"
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
                        placeholder="Monthly Rent per person"
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
                        placeholder="Area in square feet"
                        required
                      />
                    </div>
                  </div>
    
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                    <Label>Bedroom*</Label>
                    <Input
                      type="number"
                      value={propertyData.bedrooms}
                      onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                      placeholder="Bedrooms"
                      required
                    />
                    </div>
                    <div>
                    <Label>Bathroom*</Label>
                    <Input
                      type="number"
                      value={propertyData.bathrooms}
                      onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                      placeholder="Bathrooms"
                      step="0.5"
                      required
                    />
                    </div>
                    <div>
                    <Label>Maximum Guest*</Label>
                    <Input
                      type="number"
                      value={propertyData.maxGuests}
                      onChange={(e) => handleInputChange("maxGuests", e.target.value)}
                      placeholder="Max Guests"
                      required
                    />
                    </div>
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
                      <Label htmlFor={amenity} className="text-sm">
                        {amenity}
                      </Label>
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
                  <Button
                    type="button"
                    variant="outline"
                    className="aspect-square border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm text-gray-600">Add Image</span>
                    </div>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleImageUpload}
                  />
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
                  {isSubmitting ? (editingProperty ? "Updating..." : "Publishing...") : editingProperty ? "Update Property" : "Publish Property"}
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
