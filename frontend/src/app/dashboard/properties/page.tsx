"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/components/auth/auth-provider"
import { useApi, getImageUrls } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, Home, Edit, Eye, Building } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Property, Room } from "@/lib/types"
import { RoomCard } from "@/components/property/room-card"

export default function PropertiesPage() {
  const { propertyApi } = useApi()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isRoomsDialogOpen, setIsRoomsDialogOpen] = useState(false)

  // Redirect non-landlord users
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "landlord")) {
      router.push("/dashboard")
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
        setProperties(userProperties ?? [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch properties")
        console.error("Error fetching user properties:", err)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "landlord") fetchUserProperties()
  }, [user, propertyApi])

  // Update room
  const handleRoomUpdate = async (propertyId: string, roomIndex: number, updatedRoom: Room) => {
    try {
      const token = localStorage.getItem("auth-token")
      if (!token) throw new Error("Authentication required")

      const property = properties.find(p => p._id === propertyId)
      if (!property) return

      const updatedRooms = [...(property.rooms || [])]
      updatedRooms[roomIndex] = updatedRoom

      // Send update to backend
      const formData = new FormData()
      formData.append("rooms", JSON.stringify(updatedRooms))

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/property/update/${propertyId}`,
        {
          method: "PUT",
          headers: { "auth-token": token },
          body: formData,
        }
      )

      if (!response.ok) throw new Error("Failed to update room")

      const result = await response.json()
      
      // Update local state
      setProperties(prev => prev.map(p => 
        p._id === propertyId ? { ...p, rooms: updatedRooms } : p
      ))

      if (selectedProperty?._id === propertyId) {
        setSelectedProperty({ ...selectedProperty, rooms: updatedRooms })
      }

      toast({
        title: "Room updated",
        description: `${updatedRoom.roomName} is now ${updatedRoom.status}`,
      })
    } catch (error) {
      console.error("Error updating room:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update room",
        variant: "destructive",
      })
    }
  }

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
          <h3 className="text-xl font-semibold text-[#003366] mb-2">Error Loading Properties</h3>
          <p className="text-[#6B7280] mb-4">{error}</p>
          <Button className="bg-[#FFC107] hover:bg-[#FFB300] text-[#003366]" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </DashboardLayout>
    )
  }

  const userProperties = properties
  const availableProperties = userProperties.filter((p) => p.availability?.isAvailable)
  const rentedProperties = userProperties.filter((p) => !p.availability?.isAvailable)

  const PropertyCardWithActions = ({ property }: { property: Property }) => {
    const mainImage = getImageUrls(property)[0] || "/placeholder.svg?height=250&width=400"
    const totalRooms = property.rooms?.length || 0
    const availableRooms = property.rooms?.filter(r => r.status === "available").length || 0

    return (
      <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative">
          <Image
            src={mainImage}
            alt={property.title}
            width={400}
            height={250}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            {property.featured && <Badge className="bg-blue-600 text-white">Featured</Badge>}
            <Badge
              variant={property.availability?.isAvailable ? "default" : "secondary"}
              className={
                property.availability?.isAvailable
                  ? "bg-green-600 text-white"
                  : "bg-gray-600 text-white"
              }
            >
              {property.availability?.isAvailable ? "Available" : "Rented"}
            </Badge>
          </div>
          {totalRooms > 0 && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-[#FFC107] text-[#003366]">
                {availableRooms}/{totalRooms} Rooms
              </Badge>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-semibold text-[#003366] line-clamp-2">{property.title}</h3>
            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-[#FFC107]">Rs {property.price.toLocaleString()}</div>
              <div className="text-sm text-[#6B7280]">per month</div>
            </div>
          </div>

          <p className="text-[#6B7280] text-sm mb-4 line-clamp-2">{property.description}</p>

          <div className="grid grid-cols-2 gap-2">
            <Link href={`/properties/${property._id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </Link>
            <Link href={`/properties/update/${property._id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>

          {totalRooms > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 border-[#FFC107] text-[#003366] hover:bg-[#FFC107]"
              onClick={() => {
                setSelectedProperty(property)
                setIsRoomsDialogOpen(true)
              }}
            >
              <Building className="h-4 w-4 mr-2" />
              Manage Rooms
            </Button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#003366]">My Properties</h1>
            <p className="text-[#6B7280]">Manage your rental property listings</p>
          </div>
          <Link href="/dashboard/add-property">
            <Button className="bg-[#FFC107] hover:bg-[#FFB300] text-[#003366]">
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
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {userProperties.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-16 w-16 text-[#6B7280] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#003366] mb-2">No properties listed yet</h3>
                <p className="text-[#6B7280] mb-6">
                  Start by adding your first rental property to connect with tenants.
                </p>
                <Link href="/dashboard/add-property">
                  <Button size="lg" className="bg-[#FFC107] hover:bg-[#FFB300] text-[#003366]">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Your First Property
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProperties.map((property) => (
                  <PropertyCardWithActions key={property._id} property={property} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-6">
            {availableProperties.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-16 w-16 text-[#6B7280] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#003366] mb-2">No available properties</h3>
                <p className="text-[#6B7280]">All your properties are currently rented.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableProperties.map((property) => (
                  <PropertyCardWithActions key={property._id} property={property} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rented" className="space-y-6">
            {rentedProperties.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-16 w-16 text-[#6B7280] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#003366] mb-2">No rented properties</h3>
                <p className="text-[#6B7280]">None of your properties are currently rented.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rentedProperties.map((property) => (
                  <PropertyCardWithActions key={property._id} property={property} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Room Management Dialog */}
      <Dialog open={isRoomsDialogOpen} onOpenChange={setIsRoomsDialogOpen}>
        <DialogContent className="max-w-2xl sm:max-w-4xl max-h-[80vh] overflow-y-auto rounded-xl bg-white shadow-xl border border-gray-200 p-6">
          <DialogHeader>
            <DialogTitle className="text-[#003366] text-2xl font-bold mb-4">
              Manage Rooms - {selectedProperty?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedProperty && selectedProperty.rooms && selectedProperty.rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-6">
              {selectedProperty.rooms.map((room, index) => (
                <RoomCard
                  key={index}
                  room={room}
                  propertyId={selectedProperty._id}
                  propertyTitle={selectedProperty.title}
                  isLandlord={true}
                  onRoomUpdate={(updatedRoom) => handleRoomUpdate(selectedProperty._id, index, updatedRoom)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#6B7280] px-4">
              <p>No rooms configured for this property</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
