"use client"

import { useState, useEffect, useRef } from "react"
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

type PropertyAvailability = {
  isAvailable: boolean
  availableFrom?: string
  availableTo?: string
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
  checkInTime: string
  checkOutTime: string
  isAvailable: boolean
}

type AddPropertyPageProps = {
  editingProperty?: PropertyData & { id: string; availability?: PropertyAvailability } // optional, for edit mode
}

export default function AddPropertyPage({ editingProperty }: AddPropertyPageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  // Load property for editing
  useEffect(() => {
    if (editingProperty) {
      setPropertyData((prev) => ({
        ...prev,
        ...editingProperty,
        images: [...editingProperty.images],
      }))
      setExistingImages([...editingProperty.images])
    }
  }, [editingProperty])

  // Fix for availability without using any
  useEffect(() => {
    if (editingProperty) {
      const availability = editingProperty.availability
      setPropertyData((prev) => ({
        ...prev,
        checkInTime: availability?.availableFrom || prev.checkInTime || "15:00",
        checkOutTime: availability?.availableTo || prev.checkOutTime || "11:00",
        isAvailable: availability?.isAvailable ?? prev.isAvailable ?? true,
      }))
    }
  }, [editingProperty])

  // Redirect non-landlords
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
          {/* ...rest of your JSX remains unchanged */}
        </form>
      </div>
    </DashboardLayout>
  )
}
