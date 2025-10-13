"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useApi } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"

export function FeaturedProperties() {
  const { propertyApi } = useApi()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, toggleFavorite } = useAuth()

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        // console.log("Fetching properties...") // Debug log
        
        const all = await propertyApi.getAll()
        // console.log("All properties:", all) // Debug log

        // Filter available only
        const available = all.filter((p) => p.availability?.isAvailable)
        // console.log("Available properties:", available) // Debug log

        // Sort newest first
        available.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        // Take top 3
        setProperties(available.slice(0, 3))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch properties")
        console.error("Error fetching properties:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [propertyApi])

  // Helper: check if property is new (within 7 days)
  const isNewProperty = (date) => {
    const created = new Date(date)
    const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }

  // Helper: check if user can favorite (tenant only)
  const canFavorite = user && user.role === "tenant"

  // Helper: get image URL from property
  const getPropertyImageUrl = (property) => {
    // console.log("Property images:", property.images) // Debug log
    
    if (!property.images || property.images.length === 0) {
      return "/placeholder.svg"
    }

    const firstImage = property.images[0]
    
    // Handle both object format {url, public_id} and string format
    if (typeof firstImage === "object" && firstImage.url) {
      return firstImage.url
    } else if (typeof firstImage === "string") {
      return firstImage
    }
    
    return "/placeholder.svg"
  }

  // Helper: check if property is favorited
  const isPropertyFavorited = (propertyId) => {
    if (!user || !user.favorites) return false
    
    // Handle both _id and id formats
    const userId = user._id || user.id
    // console.log("Checking favorite for:", { propertyId, userFavorites: user.favorites, userId }) // Debug log
    
    return user.favorites.includes(propertyId)
  }

  const handleToggleFavorite = async (propertyId) => {
    // console.log("Toggle favorite clicked for property:", propertyId) // Debug log
    // console.log("Current user:", user) // Debug log
    
    if (!user) {
      // console.log("No user logged in")
      return
    }

    try {
      await toggleFavorite(propertyId)
      // console.log("Favorite toggled successfully")
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-[#FFE9D6] to-[#E9E6F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#003366] mb-4">
            Browse Properties
          </h2>
          <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
            Discover the latest available rental properties in your city
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-[#6B7280]">Loading properties...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {properties.length === 0 ? (
              <div className="text-center py-12 text-[#6B7280]">
                No available properties at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {properties.map((property) => (
                  <Card
                    key={property._id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-white rounded-2xl shadow-md"
                  >
                    <div className="relative">
                      <Image
                        src={getPropertyImageUrl(property)}
                        alt={property.title || "Property image"}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          // console.log("Image failed to load:", getPropertyImageUrl(property))
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-white/90 text-gray-900 capitalize"
                        >
                          {property.propertyType}
                        </Badge>
                        {isNewProperty(property.createdAt) && (
                          <Badge className="bg-red-600 text-white font-semibold shadow-md">
                            New
                          </Badge>
                        )}
                      </div>

                      {/* Favorite Button - Only show for tenants */}
                      {canFavorite && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full ${
                            isPropertyFavorited(property._id)
                              ? "text-red-500"
                              : "text-[#6B7280]"
                          }`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleToggleFavorite(property._id)
                          }}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              isPropertyFavorited(property._id) ? "fill-red-500" : ""
                            }`}
                          />
                        </Button>
                      )}

                      {/* Status Badge */}
                      <div className="absolute bottom-4 left-4">
                        <Badge
                          className={
                            property.availability?.isAvailable
                              ? "bg-green-600 text-white"
                              : "bg-gray-600 text-white"
                          }
                        >
                          {property.availability?.isAvailable ? "Available" : "Rented"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-[#003366] line-clamp-2 group-hover:text-[#FFC107] transition-colors">
                          {property.title}
                        </h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#003366]">
                            ₹{property.price.toLocaleString()}
                          </div>
                          <div className="text-sm text-[#6B7280]">per month</div>
                        </div>
                      </div>

                      <div className="flex items-center text-[#6B7280] mb-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {property.location.address}, {property.location.city}
                        </span>
                      </div>

                      <p className="text-[#6B7280] text-sm mb-4 line-clamp-2">
                        {property.description}
                      </p>

                      <Link href={`/properties/${property._id}`}>
                        <Button className="w-full bg-[#FFC107] hover:bg-yellow-600 text-[#003366] rounded-xl shadow-md hover:shadow-lg transform hover:scale-105">
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        <div className="text-center">
          <Link href="/properties">
            <Button variant="outline" size="lg" className="border-[#FFC107] text-[#003366] hover:bg-[#FFC107] rounded-xl">
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
