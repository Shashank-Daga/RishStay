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
type Room = {
  roomName: string
  rent: string
  size: string
  amenities: string[]
  status: "available" | "booked"
  description: string
}

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
  isAvailable: boolean
  rooms: Room[]
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
  const [rooms, setRooms] = useState<Room[]>([])

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
    isAvailable: true,
    rooms: [],
  })

  const [imageFiles, setImageFiles] = useState<File[]>([]) // new uploads
  const [existingImages, setExistingImages] = useState<string[]>([]) // URLs of existing images
  const [deletedImages, setDeletedImages] = useState<string[]>([]) // images removed by user

  // ----------------------
  // Load property if editing
  // ----------------------
  useEffect(() => {
    if (editingId) {
      (async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/property/${editingId}`)
          const data = await res.json()
          if (res.ok) {
            setEditingProperty(data)
            setPropertyData({ ...data, images: [...data.images] })
            setExistingImages([...data.images])
            setRooms(data.rooms || [])
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
      setDeletedImages((prev) => [...prev, imgToRemove.split('/').pop() || 'temp_id'])
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

  const safeParseInt = (value: string, fallback = 0) => {
    const parsed = parseInt(value)
    return isNaN(parsed) ? fallback : parsed
  }

  const safeParseFloat = (value: string, fallback = 0) => {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? fallback : parsed
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateFields()) return

    if (
      safeParseFloat(propertyData.price) <= 0 ||
      safeParseInt(propertyData.bedrooms) < 0 ||
      safeParseFloat(propertyData.bathrooms) < 0 ||
      safeParseFloat(propertyData.area) <= 0 ||
      safeParseInt(propertyData.maxGuests) < 1
    ) {
      toast({
        title: "Invalid number fields",
        description: "Please enter valid positive numbers for price, bedrooms, bathrooms, area, and max guests.",
        variant: "destructive",
      })
      return
    }

    if (!editingProperty && imageFiles.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image for the property.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("auth-token")
      if (!token) throw new Error("Authentication required")

      // Prepare property data to send
      const propertyDataToSend = {
        title: propertyData.title.trim(),
        description: propertyData.description.trim(),
        price: safeParseFloat(propertyData.price),
        propertyType: propertyData.propertyType,
        bedrooms: safeParseInt(propertyData.bedrooms),
        bathrooms: safeParseFloat(propertyData.bathrooms),
        area: safeParseFloat(propertyData.area),
        maxGuests: safeParseInt(propertyData.maxGuests),
        guestType: propertyData.guestType,
        location: {
          address: propertyData.address.trim(),
          city: propertyData.city.trim(),
          state: propertyData.state.trim(),
          zipCode: propertyData.zipCode.trim(),
        },
        amenities: propertyData.amenities,
        rules: propertyData.rules,
        availability: {
          isAvailable: propertyData.isAvailable,
        },
        // Rooms with validation and trimming
        rooms: rooms
          .map(room => ({
            roomName: room.roomName.trim(),
            rent: parseFloat(room.rent) || 0,
            size: parseFloat(room.size) || 0,
            amenities: room.amenities,
            status: room.status,
            description: room.description.trim()
          }))
          .filter(room => room.roomName && room.rent > 0 && room.size > 0)
      }

      const formData = new FormData()
      formData.append("propertyData", JSON.stringify(propertyDataToSend))

      // Add actual image files
      imageFiles.forEach((file) => {
        formData.append("images", file)
      })

      if (editingProperty) {
        if (deletedImages.length > 0) {
          deletedImages.forEach((public_id) => {
            formData.append("deleteImages", public_id)
          })
        }
        const keepImages = existingImages.map((url) => ({
          url,
          public_id: url.split("/").pop() || "temp_id",
        }))
        formData.append("keepImages", JSON.stringify(keepImages))
      }

      const endpoint = editingProperty
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/property/update/${editingProperty.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/property/create`

      const response = await fetch(endpoint, {
        method: editingProperty ? "PUT" : "POST",
        headers: {
          "auth-token": token,
        },
        body: formData,
      })

      let result;
      if (response.ok) {
        result = await response.json();
      } else {
        try {
          result = await response.json();
        } catch (e) {
          result = { success: false, error: "Server returned an error" };
        }
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save property")
      }

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

  const addRoom = () => {
    setRooms([...rooms, {
      roomName: "",
      rent: "",
      size: "",
      amenities: [],
      status: "available",
      description: ""
    }])
  }

  const updateRoom = (index: number, field: keyof Room, value: string | string[]) => {
    const updatedRooms = [...rooms]
    updatedRooms[index] = { ...updatedRooms[index], [field]: value }
    setRooms(updatedRooms)
  }

  const removeRoom = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index))
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

        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">

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
                      <SelectItem value="apartment" className="hover:bg-gradient-to-r hover:from-[#FFE9D6] hover:to-[#FFE9D6]/50 cursor-pointer py-3 text-[#003366] font-medium transition-colors">
                        🏢 Apartment
                      </SelectItem>
                      <SelectItem value="studio" className="hover:bg-gradient-to-r hover:from-[#E9E6F7] hover:to-[#E9E6F7]/50 cursor-pointer py-3 text-[#003366] font-medium transition-colors">
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
                      {["Family", "Bachelors", "Girls", "Boys"].map((type) => (
                        <SelectItem key={type} value={type} className="hover:bg-gradient-to-r hover:from-[#FFE9D6] hover:to-[#E9E6F7]/30 cursor-pointer py-3 text-[#003366] font-medium transition-colors">
                          {type}
                        </SelectItem>
                      ))}
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
                      <SelectItem value="true" className="hover:bg-green-50 focus:bg-green-100 cursor-pointer py-3 text-[#003366] font-medium">✅ Available</SelectItem>
                      <SelectItem value="false" className="hover:bg-red-50 focus:bg-red-100 cursor-pointer py-3 text-[#003366] font-medium">❌ Not Available</SelectItem>
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
                Amenities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {amenitiesList.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <Checkbox
                      id={amenity}
                      checked={propertyData.amenities.includes(amenity)}
                      onCheckedChange={(checked) => handleAmenityChange(amenity, Boolean(checked))}
                      className="border-2 border-[#003366]/20 rounded-md w-5 h-5 checked:bg-[#FFC107] checked:border-[#FFC107] transition-all"
                    />
                    <Label htmlFor={amenity} className="text-[#003366] font-medium">
                      {amenity}
                    </Label>
                  </div>
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
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
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
          <Card className="rounded-2xl border-2 border-[#003366]/20 shadow-lg bg-white/95 backdrop-blur">
            <CardHeader className="border-b border-[#003366]/10 bg-gradient-to-r from-[#FFE9D6]/30 to-[#E9E6F7]/30">
              <CardTitle className="text-[#003366] text-xl flex items-center gap-2">
                <div className="w-1 h-6 bg-[#FFC107] rounded-full"></div>
                House Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-6">
              <Textarea
                value={propertyData.rules.join("\n")}
                onChange={(e) =>
                  handleInputChange(
                    "rules",
                    e.target.value.split("\n").filter((r) => r.trim() !== "")
                  )
                }
                placeholder="No smoking,&#10;No pets"
                rows={4}
              />
            </CardContent>
          </Card>

          {/* ROOMS */}
          <Card className="rounded-2xl border-2 border-[#003366]/20 shadow-lg bg-white/95 backdrop-blur">
            <CardHeader className="border-b border-[#003366]/10 bg-gradient-to-r from-[#FFE9D6]/30 to-[#E9E6F7]/30">
              <CardTitle className="text-[#003366] text-xl flex items-center gap-2">
                <div className="w-1 h-6 bg-[#FFC107] rounded-full"></div>
                Property Rooms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {rooms.map((room, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Room {index + 1}</h4>
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeRoom(index)}>
                      Remove Room
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Room Name"
                      value={room.roomName}
                      onChange={(e) => updateRoom(index, "roomName", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Monthly Rent (₹)"
                      value={room.rent}
                      onChange={(e) => updateRoom(index, "rent", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="Size (sq ft)"
                      value={room.size}
                      onChange={(e) => updateRoom(index, "size", e.target.value)}
                    />
                    <Select
                      value={room.status}
                      onValueChange={(v) => updateRoom(index, "status", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="booked">Booked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Textarea
                    placeholder="Room description"
                    value={room.description}
                    onChange={(e) => updateRoom(index, "description", e.target.value)}
                    rows={2}
                  />

                  <div className="space-y-2">
                    <Label>Room Amenities</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {amenitiesList.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-2">
                          <Checkbox
                            checked={room.amenities.includes(amenity)}
                            onCheckedChange={(checked) => {
                              const newAmenities = checked
                                ? [...room.amenities, amenity]
                                : room.amenities.filter(a => a !== amenity)
                              updateRoom(index, "amenities", newAmenities)
                            }}
                          />
                          <Label className="text-sm">{amenity}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addRoom} className="w-full">
                + Add Room
              </Button>
            </CardContent>
          </Card>

          {/* SUBMIT */}
          <div className="flex gap-4 pb-8">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 h-12 bg-gradient-to-r from-[#FFC107] to-[#FFB300] hover:from-[#FFB300] hover:to-[#FFC107] text-[#003366] font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
              <Save className="h-5 w-5 mr-2" />
              {isSubmitting ? (editingProperty ? "Updating..." : "Publishing...") : editingProperty ? "Update Property" : "Publish Property"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="h-12 border-2 border-[#003366]/20 hover:border-[#003366] hover:bg-[#003366]/5 text-[#003366] font-semibold"
              onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
