"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Bed, Bath, Square, Heart, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Property } from "@/lib/types"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { getImageUrls } from "@/lib/api"

interface PropertyCardProps {
  property: Property
  onFavoriteToggle?: (propertyId: string) => void
  isFavorited?: boolean
}

export function PropertyCard({ property, onFavoriteToggle, isFavorited = false }: PropertyCardProps) {
  const { user } = useAuth()
  const [isImageLoading, setIsImageLoading] = useState(true)
  const router = useRouter()

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (user && onFavoriteToggle) {
      onFavoriteToggle(property._id)
    }
  }

  const formatDate = (date?: string | Date) => {
    const parsedDate = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsedDate)
  }

  // ✅ Check if property is "New" (created within last 7 days)
  const isNew =
    property.createdAt &&
    new Date().getTime() - new Date(property.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group rounded-2xl bg-white">
      <div className="relative">
        <div className="relative h-48 overflow-hidden">
          {isImageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-[#6B7280]">Loading...</div>
            </div>
          )}
          <Image
            src={getImageUrls(property)[0] || "/placeholder.svg?height=250&width=400"}
            alt={property.title || "Property image"}
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
          {property.featured && (
            <Badge className="bg-blue-600 text-white">Featured</Badge>
          )}
          <Badge
            variant="secondary"
            className="bg-white/90 text-gray-900 capitalize"
          >
            {property.propertyType}
          </Badge>
          {isNew && (
            <Badge className="bg-red-600 text-white font-semibold shadow-md">New</Badge>
          )}
        </div>

        {/* Favorite Button */}
        {user?.role === "tenant" && (
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full ${
              isFavorited ? "text-red-500" : "text-[#6B7280]"
            }`}
            onClick={handleFavoriteClick}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
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
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-[#003366]">
              Rs {property.price.toLocaleString()}
            </div>
            <div className="text-sm text-[#6B7280]">per month</div>
          </div>
        </div>

        {/* Property Info - Only show available from date if property is available */}
        <div className={`flex items-center justify-between text-xs text-[#6B7280] mb-4 ${property.availability?.isAvailable ? "" : "min-h-[20px]"}`}>
          {property.availability?.isAvailable ? (
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>
                Available {formatDate(property.availability?.availableFrom)}
              </span>
            </div>
          ) : (
            <div className="invisible">Placeholder</div>
          )}
        </div>

        <Link href={`/properties/${property._id}`}>
          <Button className="w-full bg-[#FFC107] hover:bg-yellow-600 text-[#003366] rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
