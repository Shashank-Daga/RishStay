import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import type { Room } from "../addpropertyform"

type Props = {
  rooms: Room[]
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: <K extends keyof Room>(index: number, field: K, value: Room[K]) => void
}

const amenitiesList = [
  "Air Conditioned",
  "Study Table plus Chair",
  "TV",
  "Attached Bath",
  "Shared Bath",
  "Electric Plate",
  "Tea/Coffee Maker",
]

export function RoomsSection({ rooms, onAdd, onRemove, onUpdate }: Props) {
  return (
    <Card className="rounded-2xl border-2 border-[#003366]/20 shadow-lg bg-white/95 backdrop-blur">
      <CardHeader className="border-b border-[#003366]/10 bg-gradient-to-r from-[#FFE9D6]/30 to-[#E9E6F7]/30">
        <CardTitle className="text-[#003366] text-xl flex items-center gap-2">
          <div className="w-1 h-6 bg-[#FFC107] rounded-full"></div>
          Property Rooms
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {rooms.map((room, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Room {index + 1}</h4>
              <Button type="button" variant="destructive" size="sm" onClick={() => onRemove(index)}>
                Remove Room
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Room Name"
                value={room.roomName}
                onChange={(e) => onUpdate(index, "roomName", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Monthly Rent (₹)"
                value={room.rent}
                onChange={(e) => onUpdate(index, "rent", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="number"
                placeholder="Size (sq ft)"
                value={room.size}
                onChange={(e) => onUpdate(index, "size", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max Guests"
                value={room.maxGuests}
                onChange={(e) => onUpdate(index, "maxGuests", e.target.value)}
              />
              <Select
                value={room.status}
                onValueChange={(v) => {
                  const newStatus = v as "available" | "booked"
                  onUpdate(index, "status", newStatus)
                  if (newStatus === "available") {
                    onUpdate(index, "tenants", [])
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-[#003366]/20 shadow-xl rounded-lg">
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="booked">Not Available</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {room.status === "booked" && (
              <div className="space-y-4 border-t pt-4">
                <h5 className="font-medium text-[#003366]">Tenant Information</h5>
                {Array.from({ length: parseInt(room.maxGuests) || 1 }, (_, tenantIndex) => (
                  <div key={tenantIndex} className="space-y-2 border rounded p-3">
                    <h6 className="text-sm font-medium">Tenant {tenantIndex + 1}</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Profession"
                        value={room.tenants?.[tenantIndex]?.profession || ""}
                        onChange={(e) => {
                          const newTenants = [...(room.tenants || [])]
                          if (!newTenants[tenantIndex]) newTenants[tenantIndex] = { profession: "", foodPreference: "Vegetarian" }
                          newTenants[tenantIndex].profession = e.target.value
                          onUpdate(index, "tenants", newTenants)
                        }}
                      />
                      <Select
                        value={room.tenants?.[tenantIndex]?.foodPreference || "Vegetarian"}
                        onValueChange={(v) => {
                          const newTenants = [...(room.tenants || [])]
                          if (!newTenants[tenantIndex]) newTenants[tenantIndex] = { profession: "", foodPreference: "Vegetarian" }
                          newTenants[tenantIndex].foodPreference = v as "Vegetarian" | "Non-Vegetarian" | "Eggetarian"
                          onUpdate(index, "tenants", newTenants)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Food Preference" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-2 border-[#003366]/20 shadow-xl rounded-lg">
                          <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                          <SelectItem value="Eggetarian">Eggetarian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Textarea
              placeholder="Room description"
              value={room.description}
              onChange={(e) => onUpdate(index, "description", e.target.value)}
              rows={2}
            />

            <div className="space-y-2">
              <Label>Room Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {amenitiesList.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <Checkbox
                      checked={room.amenities.includes(amenity)}
                      onCheckedChange={(checked) => {
                        const newAmenities = checked
                          ? [...room.amenities, amenity]
                          : room.amenities.filter(a => a !== amenity)
                        onUpdate(index, "amenities", newAmenities)
                      }}
                    />
                    <Label className="text-sm">{amenity}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={onAdd} className="w-full">
          + Add Room
        </Button>
      </CardContent>
    </Card>
  )
}
