"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { PropertyCard } from "@/components/properties/property-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-provider"
import { useApi } from "@/lib/api"
import { Heart, Home, Eye, PlusCircle } from "lucide-react"
import Link from "next/link"
import { Property } from "@/lib/types"

export default function DashboardPage() {
  const { propertyApi } = useApi()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<string[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [userProperties, setUserProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role === "tenant") {
      const savedFavorites = localStorage.getItem(`favorites-${user._id}`)
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }
    }
  }, [user])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("auth-token")
        
        if (user?.role === "landlord" && token) {
          const myProperties = await propertyApi.getMyProperties(token)
          setUserProperties(myProperties)
        } else {
          const allProperties = await propertyApi.getAll()
          setProperties(allProperties)
        }
        
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch properties")
        console.error("Error fetching properties:", err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <Home className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </DashboardLayout>
    )
  }

  const recentActivities: [] = []

  const favoriteProperties = properties.filter((p: Property) => favorites.includes(p._id))

  const handleFavoriteToggle = (propertyId: string) => {
    const newFavorites = favorites.includes(propertyId)
      ? favorites.filter((id) => id !== propertyId)
      : [...favorites, propertyId]
    setFavorites(newFavorites)
    localStorage.setItem(`favorites-${user._id}`, JSON.stringify(newFavorites))
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">
            {user.role === "landlord"
              ? "Manage your properties and connect with potential tenants."
              : "Find your perfect rental home and manage your applications."}
          </p>
        </div>

        {/* Welcome Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Welcome to RishStay Dashboard</h2>
          <p className="text-blue-700">
            {user.role === "landlord"
              ? "Manage your rental properties and connect with potential tenants."
              : "Browse properties, save favorites, and submit rental applications."}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <RecentActivity activities={recentActivities} />
          </div>

          {/* Properties Section */}
          <div className="lg:col-span-2">
            {user.role === "landlord" ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Your Properties</CardTitle>
                  <Link href="/dashboard/add-property">
                    <Button size="sm">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Property
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {userProperties.length === 0 ? (
                    <div className="text-center py-8">
                      <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No properties listed yet</h3>
                      <p className="text-gray-600 mb-4">Start by adding your first rental property.</p>
                      <Link href="/dashboard/add-property">
                        <Button>
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Your First Property
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {userProperties.slice(0, 4).map((property) => (
                        <PropertyCard key={property._id} property={property} />
                      ))}
                    </div>
                  )}
                  {userProperties.length > 4 && (
                    <div className="mt-6 text-center">
                      <Link href="/dashboard/properties">
                        <Button variant="outline">View All Properties</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Your Favorites</CardTitle>
                  <Link href="/properties">
                    <Button size="sm" variant="outline">
                      Browse More
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {favoriteProperties.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                      <p className="text-gray-600 mb-4">Start browsing properties and save your favorites.</p>
                      <Link href="/properties">
                        <Button>
                          <Home className="h-4 w-4 mr-2" />
                          Browse Properties
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {favoriteProperties.slice(0, 4).map((property) => (
                        <PropertyCard
                          key={property._id}
                          property={property}
                          onFavoriteToggle={handleFavoriteToggle}
                          isFavorited={true}
                        />
                      ))}
                    </div>
                  )}
                  {favoriteProperties.length > 4 && (
                    <div className="mt-6 text-center">
                      <Link href="/dashboard/favorites">
                        <Button variant="outline">View All Favorites</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {user.role === "landlord" ? (
                <>
                  <Link href="/dashboard/add-property">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add New Property
                    </Button>
                  </Link>

                  <Link href="/dashboard/profile">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Home className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/properties">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Home className="h-4 w-4 mr-2" />
                      Browse Properties
                    </Button>
                  </Link>
                  <Link href="/dashboard/favorites">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Heart className="h-4 w-4 mr-2" />
                      View Favorites
                    </Button>
                  </Link>
                  <Link href="/dashboard/applications">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Eye className="h-4 w-4 mr-2" />
                      My Applications
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
