"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, Save, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
  maxGuests: string
  guestType: "Family" | "Bachelors" | "Girls" | "Boys"
  rules: string[]
  isAvailable: boolean
}

interface ImageData {
  url: string
  public_id: string
}

export default function EditPropertyPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const params = useParams()
  const propertyId = params.id as string
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
    maxGuests: "",
    guestType: "Family",
    rules: [],
    isAvailable: true,
  })

  // ✅ Fixed: Separate tracking for existing and new images
  const [existingImages, setExistingImages] = useState<ImageData[]>([])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([])

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      if (!user || user.role !== "landlord") return

      try {
        const token = localStorage.getItem("auth-token")
        if (!token) throw new Error("Authentication required")

        console.log("Fetching property:", propertyId)

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/property/${propertyId}`,
          {
            headers: { "auth-token": token },
          }
        )

        if (!response.ok) throw new Error("Failed to fetch property")

        const property = await response.json()
        if (property.success) {
          const data = property.data
          console.log("Property data:", data)

          setPropertyData({
            title: data.title || "",
            description: data.description || "",
            price: data.price?.toString() || "",
            propertyType: data.propertyType || "apartment",
            bedrooms: data.bedrooms?.toString() || "",
            bathrooms: data.bathrooms?.toString() || "",
            area: data.area?.toString() || "",
            address: data.location?.address || "",
            city: data.location?.city || "",
            state: data.location?.state || "",
            zipCode: data.location?.zipCode || "",
            amenities: data.amenities || [],
            maxGuests: data.maxGuests?.toString() || "",
            guestType: data.guestType || "Family",
            rules: data.rules || [],
            isAvailable: data.availability?.isAvailable ?? true,
          })

          // ✅ Set existing images properly
          setExistingImages(data.images || [])
          console.log("Existing images:", data.images)
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching property:", error)
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          })
        }
        router.push("/dashboard/properties")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperty()
  }, [propertyId, user, router, toast])

  // Redirect non-landlords
  useEffect(() => {
    if (!loading && (!user || user.role !== "landlord")) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newFiles = Array.from(files)
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))

    setNewImageFiles((prev) => [...prev, ...newFiles])
    setNewImagePreviews((prev) => [...prev, ...newPreviews])

    toast({
      title: "Images uploaded",
      description: `${newFiles.length} image(s) added.`,
    })
  }

  // ✅ Fixed: Proper image removal handling
  const removeExistingImage = (imageToRemove: ImageData) => {
    console.log("Removing existing image:", imageToRemove)
    
    // Add to deleted list
    setDeletedImageIds(prev => [...prev, imageToRemove.public_id])
    
    // Remove from existing images
    setExistingImages(prev => prev.filter(img => img.public_id !== imageToRemove.public_id))
  }

  const removeNewImage = (index: number) => {
    console.log("Removing new image at index:", index)
    
    // Clean up preview URL
    URL.revokeObjectURL(newImagePreviews[index])
    
    // Remove from arrays
    setNewImageFiles(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const validateFields = () => {
    const required: (keyof PropertyData)[] = [
      "title",
      "description",
      "price",
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
          title: "Missing required field",
          description: `Please fill in the "${field}" field.`,
          variant: "destructive",
        })
        return false
      }
    }

    // Check if at least one image remains
    if (existingImages.length + newImageFiles.length === 0) {
      toast({
        title: "No images",
        description: "Please keep at least one image for your property.",
        variant: "destructive",
      })
      return false
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

      console.log("Submitting update with:", {
        existingImages: existingImages.length,
        newImages: newImageFiles.length,
        deletedImages: deletedImageIds.length
      })

      const formData = new FormData()

      // ✅ Add property fields directly (not as JSON)
      formData.append("title", propertyData.title.trim())
      formData.append("description", propertyData.description.trim())
      formData.append("price", propertyData.price)
      formData.append("propertyType", propertyData.propertyType)
      formData.append("bedrooms", propertyData.bedrooms)
      formData.append("bathrooms", propertyData.bathrooms)
      formData.append("area", propertyData.area)
      formData.append("maxGuests", propertyData.maxGuests)
      formData.append("guestType", propertyData.guestType)
      formData.append("availability", JSON.stringify({
        isAvailable: propertyData.isAvailable,
      }))
      formData.append("location", JSON.stringify({
        address: propertyData.address.trim(),
        city: propertyData.city.trim(),
        state: propertyData.state.trim(),
        zipCode: propertyData.zipCode.trim(),
      }))

      // ✅ Add arrays in FormData format
      propertyData.amenities.forEach((a) => formData.append("amenities[]", a))
      propertyData.rules.forEach((r) => formData.append("rules[]", r))

      // ✅ Add new image files
      newImageFiles.forEach((file) => {
        console.log("Adding new image file:", file.name)
        formData.append("images", file)
      })

      // ✅ Add images to delete (public_ids)
      deletedImageIds.forEach((publicId) => {
        console.log("Marking image for deletion:", publicId)
        formData.append("deleteImages", publicId)
      })

      // ✅ Add existing images to keep
      existingImages.forEach((img) => {
        formData.append("keepImages", JSON.stringify(img))
      })

      // Debug: Log FormData contents
      console.log("FormData entries:")
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name})`)
        } else {
          console.log(`${key}:`, value)
        }
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/property/update/${propertyId}`,
        {
          method: "PUT",
          headers: { "auth-token": token },
          body: formData,
        }
      )

      console.log("Update response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Update error response:", errorData)
        throw new Error(errorData.error || errorData.message || response.statusText)
      }

      const result = await response.json()
      console.log("Update result:", result)

      toast({
        title: "Property updated successfully",
        description: "Your property has been updated.",
      })

      // Clean up preview URLs
      newImagePreviews.forEach(url => URL.revokeObjectURL(url))

      router.push("/dashboard/properties")
    } catch (error: unknown) {
      console.error("Submit error:", error)
      toast({
        title: "Error updating property",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ✅ Combined image display
  const allImages = [
    ...existingImages.map((img, index) => ({ ...img, type: 'existing' as const, index })),
    ...newImagePreviews.map((url, index) => ({ url, public_id: '', type: 'new' as const, index }))
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard/properties">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
            <p className="text-gray-600">Update your property details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
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
                    <Label>Price (₹) *</Label>
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
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
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
                  <div>
                    <Label>Bedrooms *</Label>
                    <Input
                      type="number"
                      value={propertyData.bedrooms}
                      onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Bathrooms *</Label>
                    <Input
                      type="number"
                      value={propertyData.bathrooms}
                      onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                      step="0.5"
                      required
                    />
                  </div>
                  <div>
                    <Label>Max Guests *</Label>
                    <Input
                      type="number"
                      value={propertyData.maxGuests}
                      onChange={(e) => handleInputChange("maxGuests", e.target.value)}
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
                <p className="text-sm text-gray-600">
                  Current images: {existingImages.length}, New images: {newImageFiles.length}
                  {deletedImageIds.length > 0 && `, To delete: ${deletedImageIds.length}`}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {/* Existing Images */}
                  {existingImages.map((img, idx) => (
                    <div key={`existing-${img.public_id}`} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200">
                      <Image
                        src={img.url}
                        alt="Existing property image"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          Current
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* New Images */}
                  {newImagePreviews.map((preview, idx) => (
                    <div key={`new-${idx}`} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-green-200">
                      <Image
                        src={preview}
                        alt="New property image"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                          New
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* Upload Button */}
                  <Button
                    type="button"
                    variant="outline"
                    className="aspect-square border-dashed border-2 hover:border-blue-500 hover:bg-blue-50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm text-gray-600">Add Images</span>
                    </div>
                  </Button>
                </div>

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
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Updating..." : "Update Property"}
              </Button>
              <Link href="/dashboard/properties">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
