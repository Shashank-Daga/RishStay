"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ImageGallery } from "@/components/property/image-gallery"
import { ContactForm } from "@/components/property/contact-form"
import { SimilarProperties } from "@/components/property/similar-properties"
import { RoomCard } from "@/components/property/room-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/lib/api"
import type { Property } from "@/lib/types"
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Heart,
  Share2,
  ArrowLeft,
  Check,
  Wifi,
  Car,
  Dumbbell,
  Waves,
  TreePine,
  Utensils,
  LucideIcon,
  Home,
} from "lucide-react"
import Link from "next/link"

const amenityIcons: Record<string, LucideIcon> = {
  "Air Conditioning": Check,
  Dishwasher: Utensils,
  Gym: Dumbbell,
  Parking: Car,
  "Pet Friendly": TreePine,
  Laundry: Check,
  Garden: TreePine,
  "Internet Included": Wifi,
  Pool: Waves,
}

export default function PropertyDetailPage() {
  const { propertyApi } = useApi()
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [property, setProperty] = useState<Property | null>(null)
  const [similarProperties, setSimilarProperties] = useState<Property[]>([])

  const propertyId = params.id as string

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setIsLoading(true)
        const propertyData = await propertyApi.getById(propertyId)
        setProperty(propertyData)

        const similarData = await propertyApi.getAll({
          city: propertyData.location.city,
          propertyType: propertyData.propertyType,
        })
        setSimilarProperties(similarData.filter((p) => p._id !== propertyId).slice(0, 6))
      } catch (error) {
        console.error("Error fetching property data:", error)
        toast({
          title: "Error",
          description: "Failed to load property details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPropertyData()
  }, [propertyId, toast])

  useEffect(() => {
    if (user?.role === "tenant") {
      const savedFavorites = localStorage.getItem(`favorites-${user._id}`)
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFE9D6] to-[#E9E6F7]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-[#FFE9D6] rounded w-1/4"></div>
            <div className="h-96 bg-[#FFE9D6] rounded-2xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-[#FFE9D6] rounded-2xl"></div>
                <div className="h-48 bg-[#FFE9D6] rounded-2xl"></div>
              </div>
              <div className="h-96 bg-[#FFE9D6] rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFE9D6] to-[#E9E6F7]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-[#003366] mb-4">Property Not Found</h1>
            <p className="text-[#6B7280] mb-6">
              The property you are looking for does not exist or has been removed.
            </p>
            <Link href="/properties">
              <Button className="bg-[#FFC107] hover:bg-yellow-600 text-[#003366] rounded-xl shadow-md hover:shadow-lg transform hover:scale-105">Browse All Properties</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleFavoriteToggle = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save properties to your favorites.",
        variant: "destructive",
      })
      return
    }

    const newFavorites = favorites.includes(property._id)
      ? favorites.filter((id) => id !== property._id)
      : [...favorites, property._id]

    setFavorites(newFavorites)
    localStorage.setItem(`favorites-${user._id}`, JSON.stringify(newFavorites))

    toast({
      title: favorites.includes(property._id)
        ? "Removed from favorites"
        : "Added to favorites",
      description: favorites.includes(property._id)
        ? "Property removed from your favorites list."
        : "Property saved to your favorites list.",
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing property:", error)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "Property link has been copied to your clipboard.",
      })
    }
  }

  const formatDate = (date?: string | Date) => {
    if (!date) return "N/A"
    const parsedDate = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsedDate)
  }

  const isFavorited = favorites.includes(property._id)
  const availableRooms = property.rooms?.filter(r => r.status === "available").length || 0
  const totalRooms = property.rooms?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE9D6] to-[#E9E6F7]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-[#003366] hover:bg-[#FFE9D6] rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </div>

        {/* Property Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#003366] mb-2">
                {property.title}
              </h1>
              <div className="flex items-center text-[#6B7280] mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                <span className="text-lg">
                  {property.location.address}, {property.location.city},{" "}
                  {property.location.state} {property.location.zipCode}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-3xl font-bold text-[#FFC107]">
                  Rs {property.price.toLocaleString()}
                </div>
                <div className="text-[#6B7280]">per month</div>
              </div>
              <div className="flex gap-2">
                {user?.role === "tenant" && (
                  <Button variant="outline" size="sm" onClick={handleFavoriteToggle} className="border-[#FFC107] text-[#003366] hover:bg-[#FFC107] rounded-xl">
                    <Heart
                      className={`h-4 w-4 ${
                        isFavorited ? "fill-current text-red-500" : ""
                      }`}
                    />
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleShare} className="border-[#FFC107] text-[#003366] hover:bg-[#FFC107] rounded-xl">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Property Stats */}
          <div className="flex flex-wrap items-center gap-6 text-[#6B7280]">
            <div className="flex items-center">
              <Bed className="h-5 w-5 mr-2" />
              <span className="font-medium">
                {property.bedrooms === 0
                  ? "studio"
                  : `${property.bedrooms} bedroom${property.bedrooms !== 1 ? "s" : ""}`}
              </span>
            </div>
            <div className="flex items-center">
              <Bath className="h-5 w-5 mr-2" />
              <span className="font-medium">
                {property.bathrooms} bathroom{property.bathrooms !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center">
              <Square className="h-5 w-5 mr-2" />
              <span className="font-medium">{property.area.toLocaleString()} sqft</span>
            </div>
            {totalRooms > 0 && (
              <div className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  {availableRooms}/{totalRooms} rooms available
                </span>
              </div>
            )}
            {property.availability?.isAvailable && (
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  Available {formatDate(property.availability?.availableFrom)}
                </span>
              </div>
            )}
          </div>

          {/* Status and Type Badges */}
          <div className="flex gap-2 mt-4">
            <Badge
              variant={property.availability?.isAvailable ? "default" : "secondary"}
              className={
                property.availability?.isAvailable
                  ? "bg-green-600 text-white"
                  : "bg-gray-600 text-white"
              }
            >
              {property.availability?.isAvailable ? "Available" : "Rented"}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {property.propertyType}
            </Badge>
            {property.featured && (
              <Badge className="bg-blue-600 text-white">Featured</Badge>
            )}
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-12">
          <ImageGallery images={property.images} title={property.title} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-[#003366]">About This Property</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#6B7280] leading-relaxed">{property.description}</p>
              </CardContent>
            </Card>

            {/* ROOMS SECTION */}
            {property.rooms && property.rooms.length > 0 && (
              <Card className="bg-white shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-[#003366] text-2xl">Property Rooms</CardTitle>
                  <p className="text-[#6B7280] text-sm mt-2">
                    This property has {totalRooms} room{totalRooms !== 1 ? 's' : ''} 
                    {availableRooms > 0 && ` - ${availableRooms} available for rent`}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {property.rooms.map((room, index) => (
                      <RoomCard
                        key={index}
                        room={room}
                        propertyId={property._id}
                        propertyTitle={property.title}
                        isLandlord={false}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-[#003366]">Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.amenities.map((amenity: string) => {
                    const IconComponent = amenityIcons[amenity] || Check
                    return (
                      <div key={amenity} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#FFE9D6] rounded-full flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-[#FFC107]" />
                        </div>
                        <span className="text-[#6B7280]">{amenity}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-[#003366]">Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Property Type:</span>
                      <span className="font-medium text-[#003366] capitalize">{property.propertyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Bedrooms:</span>
                      <span className="font-medium text-[#003366]">
                        {property.bedrooms === 0 ? "studio" : property.bedrooms}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Bathrooms:</span>
                      <span className="font-medium text-[#003366]">{property.bathrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Area:</span>
                      <span className="font-medium text-[#003366]">
                        {property.area.toLocaleString()} sqft
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Monthly Rent:</span>
                      <span className="font-medium text-[#FFC107]">Rs {property.price.toLocaleString()}</span>
                    </div>
                    {property.availability?.isAvailable && (
                      <div className="flex justify-between">
                        <span className="text-[#6B7280]">Available From:</span>
                        <span className="font-medium text-[#003366]">
                          {formatDate(property.availability?.availableFrom)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Status:</span>
                      <span className="font-medium text-[#003366] capitalize">
                        {property.availability?.isAvailable ? "Available" : "Rented"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Listed:</span>
                      <span className="font-medium text-[#003366]">{formatDate(property.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-[#003366]">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[#6B7280] mt-0.5" />
                    <div>
                      <p className="font-medium text-[#003366]">{property.location.address}</p>
                      <p className="text-[#6B7280]">
                        {property.location.city}, {property.location.state}{" "}
                        {property.location.zipCode}
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-64 bg-[#FFE9D6] rounded-2xl flex items-center justify-center shadow-md">
                    <div className="text-center text-[#6B7280]">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p>Interactive map would be displayed here</p>
                      <p className="text-sm">
                        Integration with Google Maps or similar service
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ContactForm property={property} />
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        <SimilarProperties
          currentProperty={property}
          allProperties={similarProperties}
          onFavoriteToggle={(propertyId) => {
            if (!user) return
            const newFavorites = favorites.includes(propertyId)
              ? favorites.filter((id) => id !== propertyId)
              : [...favorites, propertyId]
            setFavorites(newFavorites)
            localStorage.setItem(`favorites-${user._id}`, JSON.stringify(newFavorites))
          }}
          favorites={favorites}
        />
      </main>
      <Footer />
    </div>
  )
}
