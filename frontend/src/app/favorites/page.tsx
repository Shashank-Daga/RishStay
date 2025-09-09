"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PropertyCard } from "@/components/properties/property-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/lib/api"
import type { Property } from "@/lib/types"
import { Heart, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function FavoritesPage() {
  const { propertyApi } = useApi()
  const { user } = useAuth()
  const { toast } = useToast()
  const [favorites, setFavorites] = useState<string[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const loadFavorites = async () => {
      try {
        setLoading(true)

        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem(`favorites-${user._id}`)
        if (savedFavorites) {
          const favoriteIds = JSON.parse(savedFavorites)
          setFavorites(favoriteIds)

          if (favoriteIds.length > 0) {
            // Load all properties and filter by favorites
            const allProperties = await propertyApi.getAll()
            const favoriteProperties = allProperties.filter(property =>
              favoriteIds.includes(property._id)
            )
            setProperties(favoriteProperties)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load favorites")
        console.error("Error loading favorites:", err)
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [user])

  const handleFavoriteToggle = (propertyId: string) => {
    if (!user) return

    const newFavorites = favorites.includes(propertyId)
      ? favorites.filter((id) => id !== propertyId)
      : [...favorites, propertyId]

    setFavorites(newFavorites)
    localStorage.setItem(`favorites-${user._id}`, JSON.stringify(newFavorites))

    // Update properties list
    if (newFavorites.includes(propertyId)) {
      // Property was added to favorites, but we already have it
    } else {
      // Property was removed from favorites
      setProperties(properties.filter(p => p._id !== propertyId))
    }

    toast({
      title: newFavorites.includes(propertyId) ? "Added to favorites" : "Removed from favorites",
      description: newFavorites.includes(propertyId)
        ? "Property saved to your favorites list."
        : "Property removed from your favorites list.",
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Sign In Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Please sign in to view your favorite properties.
              </p>
              <Button asChild>
                <Link href="/auth">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-gray-200 h-64 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <Heart className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Favorites</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" asChild>
              <Link href="/properties">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorite Properties</h1>
          <p className="text-gray-600">
            {properties.length === 0
              ? "You haven't saved any properties to your favorites yet."
              : `You have ${properties.length} favorite${properties.length !== 1 ? 's' : ''} saved.`
            }
          </p>
        </div>

        {/* Favorites List */}
        {properties.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Heart className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Favorites Yet</h3>
              <p className="text-gray-600 mb-6">
                Start browsing properties and save your favorites for easy access later.
              </p>
              <Button asChild>
                <Link href="/properties">Browse Properties</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onFavoriteToggle={handleFavoriteToggle}
                isFavorited={true}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
