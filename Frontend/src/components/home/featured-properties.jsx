"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Bed, Bath, Square, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { propertyApi } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"

export function FeaturedProperties() {
  const [featuredProperties, setFeaturedProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true)
        const properties = await propertyApi.getAll()
        // Filter for featured properties (you might want to add a featured field to backend)
        const featured = properties.filter(prop => prop.featured).slice(0, 3)
        setFeaturedProperties(featured)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch properties")
        console.error("Error fetching properties:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProperties()
  }, [])

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Featured Properties</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium rental properties in prime locations
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <Image
                  src={property.images[0] || "/placeholder.svg"}
                  alt={property.title}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-blue-600 text-white">Featured</Badge>
                </div>
                <Button variant="ghost" size="sm" className="absolute top-4 right-4 bg-white/80 hover:bg-white">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{property.title}</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">${property.price.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">per month</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {property.location.city}, {property.location.state}
                  </span>
                </div>

                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    <span>
                      {property.bedrooms} bed{property.bedrooms !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    <span>
                      {property.bathrooms} bath{property.bathrooms !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Square className="h-4 w-4 mr-1" />
                    <span>{property.squareFeet} sqft</span>
                  </div>
                  <div className="flex items-center">
                    <span>Max {property.maxGuests} guests</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>

                <Link href={`/properties/${property.id}`}>
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
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
