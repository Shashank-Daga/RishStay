"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth/auth-provider"
import { useApi } from "@/lib/api"
import { PlusCircle, Home, Edit, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Property } from "@/lib/types"

export default function PropertiesPage() {
  const { propertyApi } = useApi()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect non-landlord users
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "landlord")) {
      router.push("/dashboard") // ✅ Fixed: removed second argument
    }
  }, [user, authLoading, router])

  // Fetch properties
  useEffect(() => {
    const fetchUserProperties = async () => {
      if (!user || user.role !== "landlord") return

      try {
        setLoading(true)
        const token = localStorage.getItem("auth-token")
        if (!token) throw new Error("Authentication token not found")

        const userProperties = await propertyApi.getMyProperties(token)
        setProperties(userProperties ?? []) // Ensure array, avoid undefined
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch properties")
        console.error("Error fetching user properties:", err)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "landlord") fetchUserProperties()
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

  if (!user || user.role !== "landlord") return null

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <Home className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Properties</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </DashboardLayout>
    )
  }



  const userProperties = properties
  const availableProperties = userProperties.filter(
    (p: Property) => p.isAvailable && p.status === "available"
  )
  const rentedProperties = userProperties.filter((p: Property) => p.status === "rented")
  const pendingProperties = userProperties.filter((p: Property) => p.status === "pending")

  const PropertyCardWithActions = ({ property }: { property: Property }) => (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <Image
          src={property.images?.[0] || "/placeholder.svg?height=250&width=400"}
          alt={property.title}
          width={400}
          height={250}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {property.featured && <Badge className="bg-blue-600 text-white">Featured</Badge>}
          <Badge
            className={
              property.status === "available"
                ? "bg-green-600 text-white"
                : property.status === "pending"
                ? "bg-yellow-600 text-white"
                : "bg-gray-600 text-white"
            }
          >
            {property.status === "available"
              ? "Available"
              : property.status === "pending"
              ? "Pending"
              : "Rented"}
          </Badge>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{property.title}</h3>
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-blue-600">${property.price.toLocaleString()}</div>
            <div className="text-sm text-gray-500">per month</div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>

        <div className="flex gap-2">
          <Link href={`/properties/${property._id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </Link>
          <Link href={`/property/update/${property._id}`} className="flex-1">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
            <p className="text-gray-600">Manage your rental property listings</p>
          </div>
          <Link href="/dashboard/add-property">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Properties ({userProperties.length})</TabsTrigger>
            <TabsTrigger value="available">Available ({availableProperties.length})</TabsTrigger>
            <TabsTrigger value="rented">Rented ({rentedProperties.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingProperties.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {userProperties.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties listed yet</h3>
                <p className="text-gray-600 mb-6">
                  Start by adding your first rental property to connect with tenants.
                </p>
                <Link href="/dashboard/add-property">
                  <Button size="lg">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Your First Property
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProperties.map((property: Property) => (
                  <PropertyCardWithActions key={property._id} property={property} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-6">
            {availableProperties.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No available properties</h3>
                <p className="text-gray-600">All your properties are currently rented or pending.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableProperties.map((property: Property) => (
                  <PropertyCardWithActions key={property._id} property={property} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rented" className="space-y-6">
            {rentedProperties.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No rented properties</h3>
                <p className="text-gray-600">None of your properties are currently rented.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rentedProperties.map((property: Property) => (
                  <PropertyCardWithActions key={property._id} property={property} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            {pendingProperties.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending properties</h3>
                <p className="text-gray-600">No properties are currently pending approval or review.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingProperties.map((property: Property) => (
                  <PropertyCardWithActions key={property._id} property={property} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
