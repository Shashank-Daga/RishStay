"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Square, Check } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/lib/api"

type Room = {
  roomName: string
  rent: number
  size: number
  amenities: string[]
  status: "available" | "booked"
  description: string
}

type RoomCardProps = {
  room: Room
  propertyId: string
  propertyTitle: string
  onInquirySent?: () => void
  isLandlord?: boolean
  onStatusToggle?: () => void
}

export function RoomCard({ 
  room, 
  propertyId, 
  propertyTitle, 
  onInquirySent,
  isLandlord = false,
  onStatusToggle
}: RoomCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const { messageApi } = useApi()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    message: "",
    preferredDate: ""
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
          preferredDate: formData.preferredDate ? new Date(formData.preferredDate) : undefined
        },
        token
      )

      toast({
        title: "Inquiry sent successfully",
        description: "The property owner will contact you soon.",
      })
      
      setIsDialogOpen(false)
      setFormData({ name: user?.name || "", email: user?.email || "", phone: "", message: "", preferredDate: "" })
      onInquirySent?.()
    } catch (error) {
      toast({
        title: "Failed to send inquiry",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 rounded-2xl border-2 border-[#003366]/10">
      <CardHeader className="bg-gradient-to-r from-[#FFE9D6]/30 to-[#E9E6F7]/30 border-b border-[#003366]/10">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg text-[#003366]">{room.roomName}</CardTitle>
          <Badge 
            className={
              room.status === "available"
                ? "bg-green-600 text-white"
                : "bg-gray-600 text-white"
            }
          >
            {room.status === "available" ? "Available" : "Booked"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-[#FFC107]">
              ₹{room.rent.toLocaleString()}
            </div>
            <div className="text-sm text-[#6B7280]">per month</div>
          </div>
          <div className="flex items-center text-[#6B7280]">
            <Square className="h-4 w-4 mr-2" />
            <span>{room.size} sq ft</span>
          </div>
        </div>

        {room.description && (
          <p className="text-sm text-[#6B7280] line-clamp-2">{room.description}</p>
        )}

        {room.amenities && room.amenities.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[#003366]">Room Amenities</h4>
            <div className="grid grid-cols-2 gap-2">
              {room.amenities.slice(0, 4).map((amenity, index) => (
                <div key={index} className="flex items-center text-xs text-[#6B7280]">
                  <Check className="h-3 w-3 mr-1 text-green-600" />
                  {amenity}
                </div>
              ))}
            </div>
            {room.amenities.length > 4 && (
              <p className="text-xs text-[#6B7280]">+{room.amenities.length - 4} more</p>
            )}
          </div>
        )}

        {isLandlord ? (
          <Button
            onClick={onStatusToggle}
            variant="outline"
            className="w-full border-2 border-[#FFC107] text-[#003366] hover:bg-[#FFC107]"
          >
            Toggle Availability
          </Button>
        ) : room.status === "available" ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-[#FFC107] hover:bg-yellow-600 text-[#003366] rounded-xl shadow-md">
                Send Inquiry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-[#003366]">
                  Inquire about {room.roomName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredDate">Preferred Viewing Date</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell the owner about your requirements..."
                    rows={4}
                    required
                  />
                </div>

                <Button 
                  onClick={handleInquiry}
                  className="w-full bg-[#FFC107] hover:bg-yellow-600 text-[#003366]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Inquiry"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button disabled className="w-full bg-gray-400 text-white cursor-not-allowed">
            Currently Unavailable
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
