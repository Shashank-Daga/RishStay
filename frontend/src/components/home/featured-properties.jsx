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
        const all = await propertyApi.getAll()

        // ✅ Filter available only
        const available = all.filter((p) => p.availability?.isAvailable)

        // ✅ Sort newest first
        available.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        // ✅ Take top 3
        setProperties(available.slice(0, 3))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch properties")
        console.error("Error fetching properties:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  // ✅ Helper: check if property is new (within 7 days)
  const isNewProperty = (date) => {
    const created = new Date(date)
    const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }

  // ✅ Helper: check if user can favorite (tenant only)
  const canFavorite = user && user.role === "tenant"

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Browse Properties
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the latest available rental properties in your city
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading properties...</p>
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
              <div className="text-center py-12 text-gray-600">
                No available properties at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {properties.map((property) => (
                  <Card
                    key={property._id}
                    className="overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="relative">
                      <Image
                        src={
                          property.images?.[0] && typeof property.images[0] === "string" && property.images[0].trim() !== ""
                            ? property.images[0]
                            : "/placeholder.svg"
                        }
                        alt={property.title || "Property image"}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover"
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
                          className={`absolute top-4 right-4 bg-white/80 hover:bg-white ${user?.favorites?.includes(property._id)
                              ? "text-red-500"
                              : "text-gray-400"
                            }`}
                          onClick={(e) => {
                            e.preventDefault()
                            toggleFavorite(property._id)
                          }}
                        >
                          <Heart
                            className={`h-4 w-4 ${user?.favorites?.includes(property._id) ? "fill-red-500" : ""
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
                        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                          {property.title}
                        </h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            Rs {property.price.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">per month</div>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {property.location.address}, {property.location.city}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {property.description}
                      </p>

                      <Link href={`/properties/${property._id}`}>
                        <Button className="w-full">View Details</Button>
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
            <Button variant="outline" size="lg">
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
