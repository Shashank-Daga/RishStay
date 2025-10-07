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
  "Air Conditioning",
  "Dishwasher",
  "Gym",
  "Parking",
  "Pet Friendly",
  "Laundry",
  "Garden",
  "WiFi",
  "Pool",
  "Balcony",
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Size (sq ft)"
                value={room.size}
                onChange={(e) => onUpdate(index, "size", e.target.value)}
              />
              <Select
                value={room.status}
                onValueChange={(v) => onUpdate(index, "status", v as "available" | "booked")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
