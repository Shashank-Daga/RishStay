"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Bed, Bath, Square, Heart, Calendar, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Property } from "@/lib/types"
import { useAuth } from "@/components/auth/auth-provider"

interface PropertyCardProps {
  property: Property
  onFavoriteToggle?: (propertyId: string) => void
  isFavorited?: boolean
}

export function PropertyCard({ property, onFavoriteToggle, isFavorited = false }: PropertyCardProps) {
  const { user } = useAuth()
  const [isImageLoading, setIsImageLoading] = useState(true)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (user && onFavoriteToggle) {
      onFavoriteToggle(property.id)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative">
        <div className="relative h-48 overflow-hidden">
          {isImageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400">Loading...</div>
            </div>
          )}
          <Image
            src={property.images[0] || "/placeholder.svg?height=250&width=400"}
            alt={property.title}
            width={400}
            height={250}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              isImageLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setIsImageLoading(false)}
          />
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {property.featured && <Badge className="bg-blue-600 text-white">Featured</Badge>}
          <Badge variant="secondary" className="bg-white/90 text-gray-900 capitalize">
            {property.propertyType}
          </Badge>
        </div>

        {/* Favorite Button */}
        {user?.role === "tenant" && (
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-4 right-4 bg-white/80 hover:bg-white ${
              isFavorited ? "text-red-500" : "text-gray-600"
            }`}
            onClick={handleFavoriteClick}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
          </Button>
        )}

        {/* Status Badge */}
        <div className="absolute bottom-4 left-4">
          <Badge
            variant={property.status === "available" ? "default" : "secondary"}
            className={
              property.status === "available"
                ? "bg-green-600 text-white"
                : property.status === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-600 text-white"
            }
          >
            {property.status === "available" ? "Available" : property.status === "pending" ? "Pending" : "Rented"}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-blue-600">${property.price.toLocaleString()}</div>
            <div className="text-sm text-gray-500">per month</div>
          </div>
        </div>

        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm truncate">
            {property.location.address}, {property.location.city}, {property.location.state}
          </span>
        </div>

        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>
                {property.bedrooms === 0 ? "Studio" : `${property.bedrooms} bed${property.bedrooms !== 1 ? "s" : ""}`}
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
              <span>{property.area} sqft</span>
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>

        {/* Amenities */}
        {property.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 3).map((amenity) => (
                <Badge key={amenity} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {property.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{property.amenities.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Property Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Available {formatDate(property.availableFrom)}</span>
          </div>
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              <span>By Owner</span>
            </div>
        </div>

        <Link href={`/properties/${property.id}`}>
          <Button className="w-full group-hover:bg-blue-700 transition-colors">View Details</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
