import React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PropertyData } from "../addpropertyform"

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

type Props = {
  amenities: string[]
  onToggle: (amenity: string, checked: boolean) => void
}

export function AmenitiesSection({ amenities, onToggle }: Props) {
  return (
    <Card className="rounded-2xl border-2 border-[#003366]/20 shadow-lg bg-white/95 backdrop-blur">
      <CardHeader className="border-b border-[#003366]/10 bg-gradient-to-r from-[#FFE9D6]/30 to-[#E9E6F7]/30">
        <CardTitle className="text-[#003366] text-xl flex items-center gap-2">
          <div className="w-1 h-6 bg-[#FFC107] rounded-full"></div>
          Amenities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {amenitiesList.map((amenity) => (
            <div key={amenity} className="flex items-center gap-2">
              <Checkbox
                id={amenity}
                checked={amenities.includes(amenity)}
                onCheckedChange={(checked) => onToggle(amenity, Boolean(checked))}
                className="border-2 border-[#003366]/20 rounded-md w-5 h-5 checked:bg-[#FFC107] checked:border-[#FFC107] transition-all"
              />
              <Label htmlFor={amenity} className="text-[#003366] font-medium">{amenity}</Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
