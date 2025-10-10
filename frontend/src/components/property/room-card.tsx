"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Square, Check } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/lib/api"
import { Room } from "@/lib/types"

type RoomCardProps = {
  room: Room
  propertyId: string
  propertyTitle: string
  onInquirySent?: () => void
  isLandlord?: boolean
  onRoomUpdate?: (updatedRoom: Room) => void
}

export function RoomCard({
  room,
  propertyId,
  propertyTitle,
  onInquirySent,
  isLandlord = false,
  onRoomUpdate,
}: RoomCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const { messageApi } = useApi()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTenantDialogOpen, setIsTenantDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [tenantForm, setTenantForm] = useState({
    profession: "",
    foodPreference:
      undefined as "Vegetarian" | "Non-Vegetarian" | "Eggetarian" | undefined,
  })

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    message: "",
    preferredDate: "",
  })

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("auth-token")
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please sign in to send inquiries.",
          variant: "destructive",
        })
        return
      }

      await messageApi.send(
        {
          propertyId,
          subject: `Inquiry about ${room.roomName} in ${propertyTitle}`,
          message: `Room: ${room.roomName}\nRent: ₹${room.rent}/month\n\n${formData.message}`,
          inquiryType: "viewing",
          phone: formData.phone,
          preferredDate: formData.preferredDate
            ? new Date(formData.preferredDate)
            : undefined,
        },
        token
      )

      toast({
        title: "Inquiry sent successfully",
        description: "The property owner will contact you soon.",
      })

      setIsDialogOpen(false)
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        message: "",
        preferredDate: "",
      })
      onInquirySent?.()
    } catch (error) {
      toast({
        title: "Failed to send inquiry",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMakeAvailable = () => {
    const updatedRoom = { ...room, status: "available" as const, tenant: undefined }
    onRoomUpdate?.(updatedRoom)
    toast({
      title: "Room Updated",
      description: `${room.roomName} is now available.`,
    })
  }

  const handleBookRoom = () => {
    if (!tenantForm.profession || !tenantForm.foodPreference) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const updatedRoom = {
      ...room,
      status: "booked" as const,
      tenant: {
        profession: tenantForm.profession,
        foodPreference: tenantForm.foodPreference!,
      },
    }
    onRoomUpdate?.(updatedRoom)
    setIsTenantDialogOpen(false)
    setTenantForm({ profession: "", foodPreference: undefined })
    toast({
      title: "Room Booked",
      description: `${room.roomName} has been marked as booked.`,
    })
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 rounded-2xl border border-[#003366]/20 bg-white">
      <CardHeader className="bg-gradient-to-r from-[#FFE9D6]/40 to-[#E9E6F7]/40 border-b border-[#003366]/10">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-[#003366]">
            {room.roomName}
          </CardTitle>
          <Badge
            className={`text-white px-3 py-1 rounded-full text-xs font-medium ${
              room.status === "available" ? "bg-green-600" : "bg-gray-600"
            }`}
          >
            {room.status === "available" ? "Available" : "Booked"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-[#FFC107] leading-tight">
              ₹{room.rent.toLocaleString()}
            </div>
            <p className="text-sm text-[#6B7280]">per month</p>
          </div>
          <div className="flex items-center text-[#6B7280]">
            <Square className="h-4 w-4 mr-2" />
            <span>{room.size} sq ft</span>
          </div>
        </div>

        {room.description && (
          <p className="text-sm text-[#6B7280] line-clamp-2 leading-relaxed">
            {room.description}
          </p>
        )}

        {room.amenities?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[#003366]">
              Room Amenities
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {room.amenities.slice(0, 4).map((amenity, i) => (
                <div
                  key={i}
                  className="flex items-center text-xs text-[#6B7280]"
                >
                  <Check className="h-3 w-3 mr-1 text-green-600" />
                  {amenity}
                </div>
              ))}
            </div>
            {room.amenities.length > 4 && (
              <p className="text-xs text-[#6B7280] italic">
                +{room.amenities.length - 4} more amenities
              </p>
            )}
          </div>
        )}

        {room.status === "booked" && room.tenant && (
          <div className="space-y-2 border-t border-[#003366]/10 pt-4">
            <h4 className="text-sm font-semibold text-[#003366]">
              Current Tenant
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Profession:</span>
                <span className="font-medium text-[#003366]">
                  {room.tenant.profession}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Food Preference:</span>
                <span className="font-medium text-[#003366]">
                  {room.tenant.foodPreference}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isLandlord ? (
          <>
            {room.status === "available" ? (
              <Dialog open={isTenantDialogOpen} onOpenChange={setIsTenantDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-[#FFC107] text-[#003366] hover:bg-[#FFC107] hover:text-[#003366] rounded-xl transition-all duration-200"
                  >
                    Mark as Booked
                  </Button>
                </DialogTrigger>

                {/* 🟡 Restyled Booking Dialog */}
                <DialogContent className="sm:max-w-md rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-[#FFC107]/40 p-6 animate-in fade-in-0 zoom-in-95">
                  <DialogHeader>
                    <DialogTitle className="text-[#003366] text-xl font-semibold">
                      Book {room.roomName}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="profession" className="text-[#003366] font-medium">
                        Tenant Profession *
                      </Label>
                      <Input
                        id="profession"
                        value={tenantForm.profession}
                        onChange={(e) =>
                          setTenantForm({ ...tenantForm, profession: e.target.value })
                        }
                        placeholder="e.g., Software Engineer"
                        required
                        className="border-[#FFC107]/60 focus:border-[#FFC107] focus:ring-[#FFC107]/60 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="foodPreference" className="text-[#003366] font-medium">
                        Food Preference *
                      </Label>
                      <Select
                        value={tenantForm.foodPreference || undefined}
                        onValueChange={(val) =>
                          setTenantForm({ ...tenantForm, foodPreference: val as "Vegetarian" | "Non-Vegetarian" | "Eggetarian" })
                        }
                      >
                        <SelectTrigger className="border-[#FFC107]/60 focus:border-[#FFC107] focus:ring-[#FFC107]/60 rounded-lg">
                          <SelectValue placeholder="Select food preference" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-[#FFC107]/40 shadow-md">
                          <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                          <SelectItem value="Eggetarian">Eggetarian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleBookRoom}
                      className="w-full bg-[#FFC107] hover:bg-yellow-500 text-[#003366] font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Confirm Booking
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                onClick={handleMakeAvailable}
                variant="outline"
                className="w-full border-2 border-[#FFC107] text-[#003366] hover:bg-[#FFC107] hover:text-[#003366] rounded-xl transition-all duration-200"
              >
                Mark as Available
              </Button>
            )}
          </>
        ) : room.status === "available" ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-[#FFC107] hover:bg-yellow-500 text-[#003366] font-medium rounded-xl shadow-md transition-all duration-200">
                Send Inquiry
              </Button>
            </DialogTrigger>

            {/* 🟡 Restyled Inquiry Dialog */}
            <DialogContent className="sm:max-w-md rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-[#FFC107]/40 p-6 animate-in fade-in-0 zoom-in-95">
              <DialogHeader>
                <DialogTitle className="text-[#003366] text-xl font-semibold">
                  Inquire about {room.roomName}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[#003366] font-medium">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="border-[#FFC107]/60 focus:border-[#FFC107] focus:ring-[#FFC107]/60 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#003366] font-medium">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="border-[#FFC107]/60 focus:border-[#FFC107] focus:ring-[#FFC107]/60 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#003366] font-medium">
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                    className="border-[#FFC107]/60 focus:border-[#FFC107] focus:ring-[#FFC107]/60 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="preferredDate"
                    className="text-[#003366] font-medium"
                  >
                    Preferred Viewing Date
                  </Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) =>
                      setFormData({ ...formData, preferredDate: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="border-[#FFC107]/60 focus:border-[#FFC107] focus:ring-[#FFC107]/60 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-[#003366] font-medium">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Tell the owner about your requirements..."
                    rows={4}
                    required
                    className="border-[#FFC107]/60 focus:border-[#FFC107] focus:ring-[#FFC107]/60 rounded-lg"
                  />
                </div>

                <Button
                  onClick={handleInquiry}
                  className="w-full bg-[#FFC107] hover:bg-yellow-500 text-[#003366] rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Inquiry"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            disabled
            className="w-full bg-gray-400 text-white rounded-xl cursor-not-allowed"
          >
            Currently Unavailable
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
