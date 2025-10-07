import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PropertyData } from "../addpropertyform"

type Props = {
  propertyData: PropertyData
  onChange: (field: keyof PropertyData, value: any) => void
}

export function LocationSection({ propertyData, onChange }: Props) {
  return (
    <Card className="rounded-2xl border-2 border-[#003366]/20 shadow-lg bg-white/95 backdrop-blur">
      <CardHeader className="border-b border-[#003366]/10 bg-gradient-to-r from-[#E9E6F7]/30 to-[#FFE9D6]/30">
        <CardTitle className="text-[#003366] text-xl flex items-center gap-2">
          <div className="w-1 h-6 bg-[#FFC107] rounded-full"></div>
          Location Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <div className="space-y-2">
          <Label className="text-[#003366] font-semibold text-sm">Street Address *</Label>
          <Input
            value={propertyData.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="123 Main Street, Landmark Area"
            required
            className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-[#003366] font-semibold text-sm">City *</Label>
            <Input
              value={propertyData.city}
              onChange={(e) => onChange("city", e.target.value)}
              placeholder="Pune"
              required
              className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#003366] font-semibold text-sm">State *</Label>
            <Input
              value={propertyData.state}
              onChange={(e) => onChange("state", e.target.value)}
              placeholder="Maharashtra"
              required
              className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#003366] font-semibold text-sm">PIN Code *</Label>
            <Input
              value={propertyData.zipCode}
              onChange={(e) => onChange("zipCode", e.target.value)}
              placeholder="411001"
              required
              className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
