"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PropertyFilters, type PropertyFilters as PropertyFiltersType } from "@/components/properties/property-filters"
import { PropertyList } from "@/components/properties/property-list"
import { useApi } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"
import type { Property } from "@/lib/types"

export default function PropertiesPage() {
  const { propertyApi } = useApi()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<string[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize filters from URL params
  const [filters, setFilters] = useState<PropertyFiltersType>({
    location: searchParams.get("location") || "",
    propertyType: searchParams.get("type") || "",
    minPrice: Number(searchParams.get("minPrice") || 0),
    maxPrice: Number(searchParams.get("maxPrice") || 10000),
    bedrooms: Number(searchParams.get("bedrooms") || 1),
    bathrooms: Number(searchParams.get("bathrooms") || 1),
    amenities: searchParams.get("amenities")?.split(",").filter(Boolean) || [],
    sortBy: searchParams.get("sortBy") || "newest",
  })

  // Load properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const data = await propertyApi.getAll({
          city: filters.location,
          propertyType: (["apartment", "studio"].includes(filters.propertyType) ? filters.propertyType as "apartment" | "studio" : undefined),
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          bedrooms: filters.bedrooms,
          bathrooms: filters.bathrooms,
        })
        setProperties(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch properties")
        console.error("Error fetching properties:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [filters])

  // Load favorites from localStorage
  useEffect(() => {
    if (user?.role === "tenant") {
      const savedFavorites = localStorage.getItem(`favorites-${user._id}`)
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }
    }
  }, [user])

  const handleFiltersChange = (newFilters: PropertyFiltersType) => {
    setFilters(newFilters)

    // Update URL params
    const params = new URLSearchParams()
    if (newFilters.location) params.set("location", newFilters.location)
    if (newFilters.propertyType) params.set("type", newFilters.propertyType)
    if (newFilters.minPrice > 0) params.set("minPrice", newFilters.minPrice.toString())
    if (newFilters.maxPrice < 10000) params.set("maxPrice", newFilters.maxPrice.toString())
    if (newFilters.bedrooms) params.set("bedrooms", newFilters.bedrooms.toString())
    if (newFilters.bathrooms) params.set("bathrooms", newFilters.bathrooms.toString())
    if (newFilters.amenities.length > 0) params.set("amenities", newFilters.amenities.join(","))
    if (newFilters.sortBy !== "newest") params.set("sortBy", newFilters.sortBy)

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`
    window.history.replaceState({}, "", newUrl)
  }

  const handleFavoriteToggle = (propertyId: string) => {
    if (!user) return

    const newFavorites = favorites.includes(propertyId)
      ? favorites.filter((id) => id !== propertyId)
      : [...favorites, propertyId]

    setFavorites(newFavorites)
    localStorage.setItem(`favorites-${user._id}`, JSON.stringify(newFavorites))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <PropertyFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />
            </div>
          </div>

          {/* Properties List */}
          <div className="lg:col-span-3 mt-8 lg:mt-0">
            <PropertyList
              properties={properties}
              filters={filters}
              favorites={favorites}
              onFavoriteToggle={handleFavoriteToggle}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
