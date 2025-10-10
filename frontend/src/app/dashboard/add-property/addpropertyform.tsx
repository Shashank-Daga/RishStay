"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"

import { BackendImage } from "@/lib/types"

import { BasicInfoSection } from "./sections/BasicInfoSection"
import { LocationSection } from "./sections/LocationSection"
import { AmenitiesSection } from "./sections/AmenitiesSection"
import { ImagesSection } from "./sections/ImagesSection"
import { RulesSection } from "./sections/RulesSection"
import { RoomsSection } from "./sections/RoomsSection"
import MediaSection from "./sections/MediaSection"

// ----------------------
// Types
// ----------------------
export type Room = {
  roomName: string
  rent: string
  size: string
  amenities: string[]
  status: "available" | "booked"
  description: string
  tenant?: {
    profession: string
    foodPreference: "Vegetarian" | "Non-Vegetarian" | "Eggetarian"
  }
}

export type PropertyData = {
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
  isAvailable: boolean
  rooms: Room[]
  youtubeUrl: string
  googleMapsUrl: string
}

type PropertyAvailability = {
  isAvailable: boolean
  availableFrom?: string
  availableTo?: string
}

export type EditingPropertyData = Omit<PropertyData, 'images'> & {
  id: string
  images: BackendImage[]
  availability?: PropertyAvailability
}

// ----------------------
// AddPropertyForm Component
// ----------------------
export default function AddPropertyForm({ editingId }: { editingId?: string }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [editingProperty, setEditingProperty] = useState<EditingPropertyData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [showRoomsSection, setShowRoomsSection] = useState(false)

  // ----------------------
  // Property State
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
    youtubeUrl: "",
    googleMapsUrl: "",
  })

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<BackendImage[]>([])
  const [deletedImages, setDeletedImages] = useState<string[]>([])

  // ----------------------
  // Load property if editing
  // ----------------------
  useEffect(() => {
    if (editingId) {
      (async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/property/${editingId}`)
          const data: EditingPropertyData = await res.json()
          if (res.ok) {
            setEditingProperty(data)
            setPropertyData({ ...data, images: data.images.map(img => img.url) })
            setExistingImages(data.images)
            setRooms(data.rooms || [])
            if (data.rooms && data.rooms.length > 0) setShowRoomsSection(true)
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
    if (!loading && (!user || (user as { role?: string }).role !== "landlord")) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) return <DashboardLayout>Loading...</DashboardLayout>
  if (!user || (user as { role?: string }).role !== "landlord") return null

  // ----------------------
  // Handlers
  // ----------------------
  const handleInputChange = <K extends keyof PropertyData>(field: K, value: PropertyData[K]) => {
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

    // Validate file types
    for (const file of newFiles) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Only image files are allowed.",
          variant: "destructive",
        })
        return
      }
    }

    // Validate file sizes (5MB max)
    for (const file of newFiles) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Each image must be less than 5MB.",
          variant: "destructive",
        })
        return
      }
    }

    // Check total image count (max 10)
    const currentTotal = existingImages.length + imageFiles.length + newFiles.length
    if (currentTotal > 10) {
      toast({
        title: "Too many images",
        description: "Maximum 10 images allowed.",
        variant: "destructive",
      })
      return
    }

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))

    setImageFiles((prev) => [...prev, ...newFiles])
    setPropertyData((prev) => ({ ...prev, images: [...prev.images, ...newPreviews] }))

    toast({
      title: "Images uploaded",
      description: `${newFiles.length} image(s) added.`,
    })
  }

  const removeImage = (index: number) => {
    const imgToRemove = propertyData.images[index]
    const existingImg = existingImages.find(img => img.url === imgToRemove)
    if (existingImg) {
      setDeletedImages((prev) => [...prev, existingImg.public_id])
      setExistingImages((prev) => prev.filter((img) => img.url !== imgToRemove))
    } else {
      setImageFiles((prev) => {
        const newIndex = index - existingImages.length
        const copy = [...prev]
        copy.splice(newIndex, 1)
        return copy
      })
    }
    setPropertyData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const validateFields = (): boolean => {
    const required: (keyof PropertyData)[] = [
      "title", "description", "price", "propertyType", "area",
      "address", "city", "state", "zipCode", "bedrooms",
      "bathrooms", "maxGuests"
    ]
    for (const field of required) {
      const value = propertyData[field]
      if (value === "" || value === undefined || value === null) {
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
        availability: { isAvailable: propertyData.isAvailable },
        rooms: rooms
          .map((room) => ({
            roomName: room.roomName.trim(),
            rent: parseFloat(room.rent) || 0,
            size: parseFloat(room.size) || 0,
            amenities: room.amenities,
            status: room.status,
            description: room.description.trim(),
            tenant: room.tenant,
          }))
          .filter((room) => room.roomName && room.rent >= 0 && room.size >= 0),
        youtubeUrl: propertyData.youtubeUrl.trim(),
        googleMapsUrl: propertyData.googleMapsUrl.trim(),
      }

      const formData = new FormData()
      formData.append("propertyData", JSON.stringify(propertyDataToSend))
      imageFiles.forEach((file) => formData.append("images", file))

      if (editingProperty) {
        deletedImages.forEach((public_id) => formData.append("deleteImages", public_id))
        const keepImages = existingImages.map((img) => ({
          url: img.url,
          public_id: img.public_id,
        }))
        formData.append("keepImages", JSON.stringify(keepImages))
      }

      const endpoint = editingProperty
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/property/update/${editingProperty.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/property/create`

      const response = await fetch(endpoint, {
        method: editingProperty ? "PUT" : "POST",
        headers: { "auth-token": token },
        body: formData,
      })

      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || "Failed to save property")

      toast({
        title: `Property ${editingProperty ? "updated" : "listed"} successfully`,
        description: `Your property is now ${editingProperty ? "updated" : "live"}.`,
      })
      router.push("/dashboard/properties")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ----------------------
  // Room Handlers
  // ----------------------
  const addRoom = () => setRooms([...rooms, { roomName: "", rent: "", size: "", amenities: [], status: "available", description: "" }])
  const updateRoom = <K extends keyof Room>(index: number, field: K, value: Room[K]) => {
    const updatedRooms = [...rooms]
    updatedRooms[index] = { ...updatedRooms[index], [field]: value }
    setRooms(updatedRooms)
  }
  const removeRoom = (index: number) => setRooms(rooms.filter((_, i) => i !== index))

  // ----------------------
  // Render
  // ----------------------
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">{editingProperty ? "Edit Property" : "Add New Property"}</h1>
        <p className="text-gray-600">{editingProperty ? "Update your property details" : "List your property and connect with potential tenants"}</p>

        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
          <BasicInfoSection
            propertyData={propertyData}
            onChange={handleInputChange}
            onAmenityChange={handleAmenityChange}
            onShowRooms={() => setShowRoomsSection(true)}
            showRooms={showRoomsSection}
          />

          <LocationSection propertyData={propertyData} onChange={handleInputChange} />

          <AmenitiesSection amenities={propertyData.amenities} onToggle={handleAmenityChange} />

          <ImagesSection images={propertyData.images} onUpload={handleImageUpload} onRemove={removeImage} fileInputRef={fileInputRef} />

          <MediaSection
            youtubeUrl={propertyData.youtubeUrl}
            googleMapsUrl={propertyData.googleMapsUrl}
            onYoutubeUrlChange={(value) => handleInputChange("youtubeUrl", value)}
            onGoogleMapsUrlChange={(value) => handleInputChange("googleMapsUrl", value)}
          />

          <RulesSection rules={propertyData.rules} onChange={(rules) => handleInputChange("rules", rules)} />

          {!showRoomsSection && (
            <Button type="button" variant="outline" onClick={() => setShowRoomsSection(true)} className="w-full">
              + Add Rooms
            </Button>
          )}

          {showRoomsSection && <RoomsSection rooms={rooms} onAdd={addRoom} onRemove={removeRoom} onUpdate={updateRoom} />}

          <div className="flex gap-4 pb-8">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 h-12 bg-gradient-to-r from-[#FFC107] to-[#FFB300] hover:from-[#FFB300] hover:to-[#FFC107] text-[#003366] font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              <Save className="h-5 w-5 mr-2" />
              {isSubmitting ? (editingProperty ? "Updating..." : "Publishing...") : editingProperty ? "Update Property" : "Publish Property"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="h-12 border-2 border-[#003366]/20 hover:border-[#003366] hover:bg-[#003366]/5 text-[#003366] font-semibold"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
