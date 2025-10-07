"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PropertyData } from "../addpropertyform"

type Props = {
  propertyData: PropertyData
  onChange: <K extends keyof PropertyData>(field: K, value: PropertyData[K]) => void
  onAmenityChange?: (amenity: string, checked: boolean) => void
  onShowRooms?: () => void
  showRooms?: boolean
}

export function BasicInfoSection({ propertyData, onChange }: Props) {
  return (
    <Card className="rounded-2xl border-2 border-[#003366]/20 shadow-lg bg-white/95 backdrop-blur">
      <CardHeader className="border-b border-[#003366]/10 bg-gradient-to-r from-[#FFE9D6]/30 to-[#E9E6F7]/30">
        <CardTitle className="text-[#003366] text-xl flex items-center gap-2">
          <div className="w-1 h-6 bg-[#FFC107] rounded-full"></div>
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Property Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-[#003366] font-semibold text-sm">Property Title *</Label>
          <Input
            id="title"
            value={propertyData.title}
            onChange={(e) => onChange("title", e.target.value)}
            required
            placeholder="e.g., Cozy 2BHK near City Center"
            className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-[#003366] font-semibold text-sm">Description *</Label>
          <Textarea
            id="description"
            value={propertyData.description}
            onChange={(e) => onChange("description", e.target.value)}
            rows={4}
            required
            placeholder="Describe your property's key features and amenities..."
            className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all resize-none bg-white"
          />
        </div>

        {/* Rent, Type, Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-[#003366] font-semibold text-sm">Monthly Rent (₹) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] font-medium">₹</span>
              <Input
                type="number"
                value={propertyData.price}
                onChange={(e) => onChange("price", e.target.value)}
                required
                placeholder="15000"
                className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 pl-8 bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#003366] font-semibold text-sm">Property Type *</Label>
            <Select
              value={propertyData.propertyType}
              onValueChange={(v) => onChange("propertyType", v as "apartment" | "studio")}
            >
              <SelectTrigger className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white hover:bg-[#FFE9D6]/30">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-[#003366]/20 shadow-xl rounded-lg">
                <SelectItem value="apartment" className="cursor-pointer py-3 text-[#003366] font-medium">🏢 Apartment</SelectItem>
                <SelectItem value="studio" className="cursor-pointer py-3 text-[#003366] font-medium">🏠 Studio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[#003366] font-semibold text-sm">Area (sq ft) *</Label>
            <Input
              type="number"
              value={propertyData.area}
              onChange={(e) => onChange("area", e.target.value)}
              required
              placeholder="1200"
              className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
            />
          </div>
        </div>

        {/* Bedrooms, Bathrooms, Max Guests */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-[#003366] font-semibold text-sm">Bedrooms *</Label>
            <Input
              type="number"
              value={propertyData.bedrooms}
              onChange={(e) => onChange("bedrooms", e.target.value)}
              required
              placeholder="2"
              className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#003366] font-semibold text-sm">Bathrooms *</Label>
            <Input
              type="number"
              value={propertyData.bathrooms}
              onChange={(e) => onChange("bathrooms", e.target.value)}
              step="0.5"
              required
              placeholder="2"
              className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#003366] font-semibold text-sm">Max Guests *</Label>
            <Input
              type="number"
              value={propertyData.maxGuests}
              onChange={(e) => onChange("maxGuests", e.target.value)}
              required
              placeholder="4"
              className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
            />
          </div>
        </div>

        {/* Guest Type & Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-[#003366] font-semibold text-sm">Preferred Guest Type *</Label>
            <Select
              value={propertyData.guestType}
              onValueChange={(v) => onChange("guestType", v as "Family" | "Bachelors" | "Girls" | "Boys")}
            >
              <SelectTrigger className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white hover:bg-[#FFE9D6]/30">
                <SelectValue placeholder="Select guest type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-[#003366]/20 shadow-xl rounded-lg">
                {["Family", "Bachelors", "Girls", "Boys"].map((type) => (
                  <SelectItem key={type} value={type} className="cursor-pointer py-3 text-[#003366] font-medium">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[#003366] font-semibold text-sm">Availability Status *</Label>
            <Select
              value={propertyData.isAvailable.toString()}
              onValueChange={(v) => onChange("isAvailable", v === "true")}
            >
              <SelectTrigger className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white hover:bg-[#FFE9D6]/30">
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-[#003366]/20 shadow-xl rounded-lg">
                <SelectItem value="true" className="cursor-pointer py-3 text-[#003366] font-medium">✅ Available</SelectItem>
                <SelectItem value="false" className="cursor-pointer py-3 text-[#003366] font-medium">❌ Not Available</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
