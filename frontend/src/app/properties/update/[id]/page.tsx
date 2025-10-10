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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, X, Save, ArrowLeft, Trash2 } from "lucide-react"
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
  "WiFi",
  "Pool",
  "Balcony",
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
  youtubeUrl: string
  googleMapsUrl: string
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
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
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
    youtubeUrl: "",
    googleMapsUrl: "",
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
            youtubeUrl: data.youtubeUrl || "",
            googleMapsUrl: data.googleMapsUrl || "",
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
      <div className="min-h-screen bg-gradient-to-br from-[#FFE9D6] to-[#E9E6F7] flex items-center justify-center">
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

  // Replace the handleSubmit function in page.tsx with this fixed version:

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

      // âœ… Add property fields directly (not as JSON)
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

      // âœ… Add arrays in FormData format
      propertyData.amenities.forEach((a) => formData.append("amenities[]", a))
      propertyData.rules.forEach((r) => formData.append("rules[]", r))

      // âœ… Add URLs if present
      if (propertyData.youtubeUrl) {
        formData.append("youtubeUrl", propertyData.youtubeUrl.trim())
      }
      if (propertyData.googleMapsUrl) {
        formData.append("googleMapsUrl", propertyData.googleMapsUrl.trim())
      }

      // âœ… Add new image files
      newImageFiles.forEach((file) => {
        console.log("Adding new image file:", file.name)
        formData.append("images", file)
      })

      // âœ… FIX: Only send images to delete that exist in the original images
      deletedImageIds.forEach((publicId) => {
        console.log("Marking image for deletion:", publicId)
        formData.append("deleteImages", publicId)
      })

      // âœ… FIX: Only send existing images that weren't deleted
      // Filter out any images that are in the deletedImageIds array
      const imagesToKeep = existingImages.filter(
        img => !deletedImageIds.includes(img.public_id)
      )

      console.log("Images to keep:", imagesToKeep.length)
      imagesToKeep.forEach((img) => {
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

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const token = localStorage.getItem("auth-token")
      if (!token) throw new Error("Authentication required")

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/property/delete/${propertyId}`,
        {
          method: "DELETE",
          headers: { "auth-token": token },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.message || response.statusText)
      }

      toast({
        title: "Property deleted successfully",
        description: "Your property has been permanently deleted.",
      })

      router.push("/dashboard/properties")
    } catch (error: unknown) {
      console.error("Delete error:", error)
      toast({
        title: "Error deleting property",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // ✅ Combined image display
  const allImages = [
    ...existingImages.map((img, index) => ({ ...img, type: 'existing' as const, index })),
    ...newImagePreviews.map((url, index) => ({ url, public_id: '', type: 'new' as const, index }))
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE9D6] to-[#E9E6F7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard/properties">
            <Button variant="ghost" className="text-[#6B7280] hover:text-[#003366]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-[#003366]">Edit Property</h1>
            <p className="text-[#6B7280]">Update your property details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* BASIC INFO */}
            <Card className="rounded-2xl border-2 border-[#003366]/20 shadow-lg bg-white/95 backdrop-blur">
              <CardHeader className="border-b border-[#003366]/10 bg-gradient-to-r from-[#FFE9D6]/30 to-[#E9E6F7]/30">
                <CardTitle className="text-[#003366] text-xl flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#FFC107] rounded-full"></div>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[#003366] font-semibold text-sm">
                    Property Title *
                  </Label>
                  <Input
                    id="title"
                    value={propertyData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                    placeholder="e.g., Cozy 2BHK near City Center"
                    className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#003366] font-semibold text-sm">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={propertyData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    required
                    placeholder="Describe your property's key features and amenities..."
                    className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all resize-none bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label className="text-[#003366] font-semibold text-sm">Monthly Rent (₹) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] font-medium">₹</span>
                      <Input
                        type="number"
                        value={propertyData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        required
                        placeholder="15000"
                        className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 pl-8 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#003366] font-semibold text-sm">Property Type *</Label>
                    <Select
                      value={propertyData.propertyType}
                      onValueChange={(v) => handleInputChange("propertyType", v)}
                    >
                      <SelectTrigger className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white hover:bg-[#FFE9D6]/30">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-[#003366]/20 shadow-xl rounded-lg">
                        <SelectItem
                          value="apartment"
                          className="hover:bg-gradient-to-r hover:from-[#FFE9D6] hover:to-[#FFE9D6]/50 focus:bg-gradient-to-r focus:from-[#FFE9D6] focus:to-[#FFE9D6]/50 cursor-pointer py-3 text-[#003366] font-medium transition-colors"
                        >
                          🏢 Apartment
                        </SelectItem>
                        <SelectItem
                          value="studio"
                          className="hover:bg-gradient-to-r hover:from-[#E9E6F7] hover:to-[#E9E6F7]/50 focus:bg-gradient-to-r focus:from-[#E9E6F7] focus:to-[#E9E6F7]/50 cursor-pointer py-3 text-[#003366] font-medium transition-colors"
                        >
                          🏠 Studio
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#003366] font-semibold text-sm">Area (sq ft) *</Label>
                    <Input
                      type="number"
                      value={propertyData.area}
                      onChange={(e) => handleInputChange("area", e.target.value)}
                      required
                      placeholder="1200"
                      className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label className="text-[#003366] font-semibold text-sm">Bedrooms *</Label>
                    <Input
                      type="number"
                      value={propertyData.bedrooms}
                      onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                      required
                      placeholder="2"
                      className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#003366] font-semibold text-sm">Bathrooms *</Label>
                    <Input
                      type="number"
                      value={propertyData.bathrooms}
                      onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                      step="0.5"
                      required
                      placeholder="2"
                      className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#003366] font-semibold text-sm">Max Guests *</Label>
                    <Input
                      type="number"
                      value={propertyData.maxGuests}
                      onChange={(e) => handleInputChange("maxGuests", e.target.value)}
                      required
                      placeholder="4"
                      className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-[#003366] font-semibold text-sm">Preferred Guest Type *</Label>
                    <Select
                      value={propertyData.guestType}
                      onValueChange={(v) => handleInputChange("guestType", v)}
                    >
                      <SelectTrigger className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white hover:bg-[#FFE9D6]/30">
                        <SelectValue placeholder="Select guest type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-[#003366]/20 shadow-xl rounded-lg">
                        <SelectItem
                          value="Family"
                          className="hover:bg-gradient-to-r hover:from-[#FFE9D6] hover:to-[#FFE9D6]/50 focus:bg-gradient-to-r focus:from-[#FFE9D6] focus:to-[#FFE9D6]/50 cursor-pointer py-3 text-[#003366] font-medium transition-colors"
                        >
                          👨‍👩‍👧‍👦 Family
                        </SelectItem>
                        <SelectItem
                          value="Bachelors"
                          className="hover:bg-gradient-to-r hover:from-[#E9E6F7] hover:to-[#E9E6F7]/50 focus:bg-gradient-to-r focus:from-[#E9E6F7] focus:to-[#E9E6F7]/50 cursor-pointer py-3 text-[#003366] font-medium transition-colors"
                        >
                          👥 Bachelors
                        </SelectItem>
                        <SelectItem
                          value="Girls"
                          className="hover:bg-gradient-to-r hover:from-[#FFE9D6] hover:to-[#FFE9D6]/50 focus:bg-gradient-to-r focus:from-[#FFE9D6] focus:to-[#FFE9D6]/50 cursor-pointer py-3 text-[#003366] font-medium transition-colors"
                        >
                          👩 Girls Only
                        </SelectItem>
                        <SelectItem
                          value="Boys"
                          className="hover:bg-gradient-to-r hover:from-[#E9E6F7] hover:to-[#E9E6F7]/50 focus:bg-gradient-to-r focus:from-[#E9E6F7] focus:to-[#E9E6F7]/50 cursor-pointer py-3 text-[#003366] font-medium transition-colors"
                        >
                          👨 Boys Only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#003366] font-semibold text-sm">Availability Status *</Label>
                    <Select
                      value={propertyData.isAvailable.toString()}
                      onValueChange={(v) => handleInputChange("isAvailable", v === "true")}
                    >
                      <SelectTrigger className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white hover:bg-[#FFE9D6]/30">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-[#003366]/20 shadow-xl rounded-lg">
                        <SelectItem
                          value="true"
                          className="hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 focus:bg-gradient-to-r focus:from-green-50 focus:to-green-100/50 cursor-pointer py-3 text-[#003366] font-medium transition-colors"
                        >
                          ✅ Available
                        </SelectItem>
                        <SelectItem
                          value="false"
                          className="hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 focus:bg-gradient-to-r focus:from-red-50 focus:to-red-100/50 cursor-pointer py-3 text-[#003366] font-medium transition-colors"
                        >
                          ❌ Not Available
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LOCATION */}
            <Card className="rounded-2xl border-2 border-[#003366]/20 shadow-lg bg-white/95 backdrop-blur">
              <CardHeader className="border-b border-[#003366]/10 bg-gradient-to-r from-[#E9E6F7]/30 to-[#FFE9D6]/30">
                <CardTitle className="text-[#003366] text-xl flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#FFC107] rounded-full"></div>
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-2">
                  <Label className="text-[#003366] font-semibold text-sm">Street Address *</Label>
                  <Input
                    value={propertyData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="123 Main Street, Landmark Area"
                    required
                    className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label className="text-[#003366] font-semibold text-sm">City *</Label>
                    <Input
                      value={propertyData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Pune"
                      required
                      className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#003366] font-semibold text-sm">State *</Label>
                    <Input
                      value={propertyData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="Maharashtra"
                      required
                      className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#003366] font-semibold text-sm">PIN Code *</Label>
                    <Input
                      value={propertyData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      placeholder="411001"
                      required
                      className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AMENITIES */}
            <Card className="rounded-2xl border-2 border-[#003366]/20 shadow-lg bg-white/95 backdrop-blur">
              <CardHeader className="border-b border-[#003366]/10 bg-gradient-to-r from-[#FFE9D6]/30 to-[#E9E6F7]/30">
                <CardTitle className="text-[#003366] text-xl flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#FFC107] rounded-full"></div>
                  Amenities & Features
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {amenitiesList.map((amenity) => (
                    <label
                      key={amenity}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${propertyData.amenities.includes(amenity)
                        ? 'border-[#FFC107] bg-gradient-to-br from-[#FFE9D6]/50 to-[#E9E6F7]/30'
                        : 'border-[#003366]/10 hover:border-[#FFC107]/50 hover:bg-[#FFE9D6]/20'
                        }`}
                    >
                      <Checkbox
                        id={amenity}
                        checked={propertyData.amenities.includes(amenity)}
                        onCheckedChange={(checked) => handleAmenityChange(amenity, Boolean(checked))}
                        className="border-2 border-[#003366]/30 data-[state=checked]:bg-[#FFC107] data-[state=checked]:border-[#FFC107]"
                      />
                      <span className="text-sm font-medium text-[#003366]">{amenity}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* IMAGES */}
            <Card className="rounded-2xl border-2 border-[#003366]/20 shadow-lg bg-white/95 backdrop-blur">
              <CardHeader className="border-b border-[#003366]/10 bg-gradient-to-r from-[#E9E6F7]/30 to-[#FFE9D6]/30">
                <CardTitle className="text-[#003366] text-xl flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#FFC107] rounded-full"></div>
                  Property Images
                </CardTitle>
                <p className="text-sm text-[#6B7280] mt-2">
                  Current: {existingImages.length} | New: {newImageFiles.length}
                  {deletedImageIds.length > 0 && ` | To delete: ${deletedImageIds.length}`}
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Existing Images */}
                  {existingImages.map((img) => (
                    <div key={`existing-${img.public_id}`} className="group relative aspect-square bg-gradient-to-br from-[#FFE9D6]/20 to-[#E9E6F7]/20 rounded-xl overflow-hidden border-2 border-[#003366]/10 hover:border-[#FFC107] transition-all">
                      <Image
                        src={img.url}
                        alt="Property"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium shadow-lg">
                          Current
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {/* New Images */}
                  {newImagePreviews.map((preview, idx) => (
                    <div key={`new-${idx}`} className="group relative aspect-square bg-gradient-to-br from-[#FFE9D6]/20 to-[#E9E6F7]/20 rounded-xl overflow-hidden border-2 border-green-200 hover:border-green-400 transition-all">
                      <Image
                        src={preview}
                        alt="New property"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-medium shadow-lg">
                          New
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {/* Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-[#003366]/30 rounded-xl hover:border-[#FFC107] hover:bg-gradient-to-br hover:from-[#FFE9D6]/30 hover:to-[#E9E6F7]/30 transition-all group"
                  >
                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                      <Upload className="h-8 w-8 text-[#6B7280] group-hover:text-[#FFC107] transition-colors" />
                      <span className="text-sm font-medium text-[#003366]">Add Images</span>
                    </div>
                  </button>
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
            <Card className="rounded-2xl border-2 border-[#003366]/20 shadow-lg bg-white/95 backdrop-blur">
              <CardHeader className="border-b border-[#003366]/10 bg-gradient-to-r from-[#FFE9D6]/30 to-[#E9E6F7]/30">
                <CardTitle className="text-[#003366] text-xl flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#FFC107] rounded-full"></div>
                  House Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Textarea
                  value={propertyData.rules.join("\n")}
                  onChange={(e) =>
                    handleInputChange(
                      "rules",
                      e.target.value.split("\n").filter((r) => r.trim() !== "")
                    )
                  }
                  placeholder="Enter each rule on a new line:&#10;• No smoking&#10;• No pets&#10;• No loud music after 10 PM"
                  rows={6}
                  className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all resize-none bg-white"
                />
              </CardContent>
            </Card>

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 pb-8">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 h-12 bg-gradient-to-r from-[#FFC107] to-[#FFB300] hover:from-[#FFB300] hover:to-[#FFC107] text-[#003366] font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                <Save className="h-5 w-5 mr-2" />
                {isSubmitting ? "Updating..." : "Update Property"}
              </Button>
              <Link href="/dashboard/properties">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  className="h-12 border-2 border-[#003366]/20 hover:border-[#003366] hover:bg-[#003366]/5 text-[#003366] font-semibold"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="button"
                variant="destructive"
                disabled={isSubmitting || isDeleting}
                onClick={() => setShowDeleteDialog(true)}
                className="h-12 px-6 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 ml-auto"
              >
                <Trash2 className="h-5 w-5" />
                Delete Property
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl border-2 border-red-200 bg-gradient-to-br from-white via-red-50 to-red-100 shadow-xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-red-700 flex items-center gap-2">
              <Trash2 className="h-6 w-6 text-red-600" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="text-sm text-[#6B7280] leading-relaxed">
              Are you sure you want to delete this property?{" "}
              <span className="font-semibold text-red-600">This action cannot be undone.</span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="rounded-xl border-2 border-[#003366]/20 text-[#003366] hover:bg-[#E9E6F7] hover:text-[#003366] transition-all"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md px-6"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
