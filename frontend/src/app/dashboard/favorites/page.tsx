"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PropertyCard } from "@/components/properties/property-card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { propertyApi } from "@/lib/api"
import { Heart, Home } from "lucide-react"
import Link from "next/link"
import { Property } from "@/lib/types"

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<string[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "tenant")) {
      router.push("/dashboard")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      const savedFavorites = localStorage.getItem(`favorites-${user.id}`)
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }
    }
  }, [user])

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const allProperties = await propertyApi.getAll()
        setProperties(allProperties)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch properties")
        console.error("Error fetching properties:", err)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "tenant") {
      fetchProperties()
    }
  }, [user])

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user || user.role !== "tenant") return null

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <Heart className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Properties</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </DashboardLayout>
    )
  }

  const favoriteProperties = properties.filter((p: Property) => favorites.includes(p.id))

  const handleFavoriteToggle = (propertyId: string) => {
    const newFavorites = favorites.filter((id) => id !== propertyId)
    setFavorites(newFavorites)
    localStorage.setItem(`favorites-${user.id}`, JSON.stringify(newFavorites))
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Favorites</h1>
            <p className="text-gray-600">Properties you've saved for later</p>
          </div>
          <Link href="/properties">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Browse More Properties
            </Button>
          </Link>
        </div>

        {/* Favorites Grid */}
        {favoriteProperties.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start browsing properties and click the heart icon to save your favorites here.
            </p>
            <p className="text-gray-600 mb-4">You can also check out the latest listings!</p>
            <Link href="/properties">
              <Button size="lg">
                <Home className="h-4 w-4 mr-2" />
                Browse Properties
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {favoriteProperties.length} saved propert{favoriteProperties.length !== 1 ? "ies" : "y"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onFavoriteToggle={handleFavoriteToggle}
                  isFavorited={true}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
