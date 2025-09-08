"use client"

import { useState, useMemo } from "react"
import { PropertyCard } from "./property-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Grid, List, ChevronLeft, ChevronRight } from "lucide-react"
import type { Property } from "@/lib/types"
import type { PropertyFilters } from "./property-filters"

interface PropertyListProps {
  properties: Property[]
  filters: PropertyFilters
  favorites?: string[]
  onFavoriteToggle?: (propertyId: string) => void
  loading?: boolean
  error?: string | null
}

export function PropertyList({ properties, filters, favorites = [], onFavoriteToggle, loading = false, error = null }: PropertyListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    const filtered = properties.filter((property) => {
      // Location filter
      if (filters.location) {
        const locationMatch =
          property.location.city.toLowerCase().includes(filters.location.toLowerCase()) ||
          property.location.state.toLowerCase().includes(filters.location.toLowerCase()) ||
          property.location.address.toLowerCase().includes(filters.location.toLowerCase()) ||
          property.location.zipCode.toString().includes(filters.location)
        if (!locationMatch) return false
      }

      // Property type filter
      if (filters.propertyType && property.propertyType !== filters.propertyType) {
        return false
      }

      // Price range filter
      if (property.price < filters.minPrice || property.price > filters.maxPrice) {
        return false
      }

      // Bedrooms filter
      if (filters.bedrooms) {
        const minBedrooms = filters.bedrooms
        if (property.bedrooms < minBedrooms) return false
      }

      // Bathrooms filter
      if (filters.bathrooms) {
        const minBathrooms = filters.bathrooms
        if (property.bathrooms < minBathrooms) return false
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every((amenity) => property.amenities.includes(amenity))
        if (!hasAllAmenities) return false
      }

      return true
    })

    // Sort properties
    switch (filters.sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "bedrooms":
        filtered.sort((a, b) => b.bedrooms - a.bedrooms)
        break
      case "area":
        filtered.sort((a, b) => b.area - a.area)
        break
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return filtered
  }, [properties, filters])

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Loading Properties...</h2>
            <p className="text-gray-600">Please wait while we fetch the latest properties</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
              <div className="space-y-3">
                <div className="bg-gray-200 h-4 rounded"></div>
                <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <Grid className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Properties</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{filteredProperties.length} Properties Found</h2>
          <p className="text-gray-600">
            {filteredProperties.length === 0
              ? "No properties match your criteria"
              : `Showing ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredProperties.length)} of ${
                  filteredProperties.length
                } results`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Items per page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number.parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Properties Grid/List */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Grid className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters to find more properties.</p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-6"}>
          {paginatedProperties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onFavoriteToggle={onFavoriteToggle}
              isFavorited={favorites.includes(property._id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber
              if (totalPages <= 5) {
                pageNumber = i + 1
              } else if (currentPage <= 3) {
                pageNumber = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i
              } else {
                pageNumber = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                  className="w-10"
                >
                  {pageNumber}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
