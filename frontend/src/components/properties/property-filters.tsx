"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { MapPin, Filter, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PropertyFiltersProps {
  onFiltersChange: (filters: PropertyFilters) => void
  initialFilters?: PropertyFilters
}

export interface PropertyFilters {
  location: string
  propertyType: string
  minPrice: number
  maxPrice: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  sortBy: string
}

const amenitiesList = [
  "Air Conditioning",
  "Dishwasher",
  "Gym",
  "Parking",
  "Pet Friendly",
  "Laundry",
  "Garden",
  "Internet Included",
]

const propertyTypes = [
  { value: "all", label: "Any" },  // ← Fixed: use "all" instead of empty string
  { value: "apartment", label: "Apartment" },
  { value: "studio", label: "Studio" }
]

export function PropertyFilters({ onFiltersChange, initialFilters }: PropertyFiltersProps) {
  const [filters, setFilters] = useState<PropertyFilters>(
    initialFilters || {
      location: "",
      propertyType: "all", // ← Fixed: use "all" instead of empty string
      minPrice: 0,
      maxPrice: 10000,
      bedrooms: 1,
      bathrooms: 1,
      amenities: [],
      sortBy: "newest",
    }
  )

  const [priceRange, setPriceRange] = useState<number[]>([filters.minPrice, filters.maxPrice])
  const [showFilters, setShowFilters] = useState(false)

  const updateFilters = (newFilters: Partial<PropertyFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    
    // ✅ Process the filters before sending to parent
    const processedFilters = processFiltersForAPI(updated)
    onFiltersChange(processedFilters)
  }

  // ✅ Helper function to process filters for API consumption
  const processFiltersForAPI = (filters: PropertyFilters): PropertyFilters => {
    return {
      ...filters,
      // Convert "all" propertyType to empty string so API shows all types
      propertyType: filters.propertyType === "all" ? "" : filters.propertyType,
    }
  }

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value)
    updateFilters({ minPrice: value[0], maxPrice: value[1] })
  }

  const handleAmenityChange = (amenity: string, checked: boolean | "indeterminate") => {
    const isChecked = Boolean(checked)
    const newAmenities = isChecked
      ? [...filters.amenities, amenity]
      : filters.amenities.filter((a) => a !== amenity)
    updateFilters({ amenities: newAmenities })
  }

  const clearFilters = () => {
    const cleared: PropertyFilters = {
      location: "",
      propertyType: "all", // ← Fixed: use "all" instead of empty string
      minPrice: 0,
      maxPrice: 10000,
      bedrooms: 1,
      bathrooms: 1,
      amenities: [],
      sortBy: "newest",
    }
    setFilters(cleared)
    setPriceRange([0, 10000])
    
    // ✅ Process and send cleared filters
    const processedFilters = processFiltersForAPI(cleared)
    onFiltersChange(processedFilters)
  }

  const maxBedrooms = 6
  const maxBathrooms = 4

  return (
    <div className="space-y-6">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full justify-center border-[#FFC107] text-[#003366] hover:bg-[#FFC107] rounded-xl"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {(showFilters || true) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 overflow-hidden"
          >
            {/* Location */}
            <Card className="bg-white shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-[#003366]">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2 h-4 w-4 text-[#6B7280]" />
                  <Input
                    placeholder="Enter Area"
                    value={filters.location}
                    onChange={(e) => updateFilters({ location: e.target.value })}
                    className="pl-10 focus:ring-[#FFC107] focus:border-[#FFC107]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Property Type */}
            <Card className="bg-white shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-[#003366]">Property Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={filters.propertyType}
                  onValueChange={(value) => updateFilters({ propertyType: value })}
                >
                  <SelectTrigger className="focus:ring-[#FFC107] focus:border-[#FFC107]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Price Range */}
            <Card className="bg-white shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-[#003366]">Price Range</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-[#6B7280]">
                  <span>₹{priceRange[0].toLocaleString()}</span>
                  <span>₹{priceRange[1].toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Bedrooms & Bathrooms */}
            <Card className="bg-white shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-[#003366]">Bedrooms & Bathrooms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-[#6B7280]">Bedrooms</Label>
                  <Select
                    value={filters.bedrooms.toString()}
                    onValueChange={(value: string) => updateFilters({ bedrooms: Number(value) })}
                  >
                    <SelectTrigger className="focus:ring-[#FFC107] focus:border-[#FFC107]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: maxBedrooms }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-[#6B7280]">Bathrooms</Label>
                  <Select
                    value={filters.bathrooms.toString()}
                    onValueChange={(value: string) => updateFilters({ bathrooms: Number(value) })}
                  >
                    <SelectTrigger className="focus:ring-[#FFC107] focus:border-[#FFC107]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: maxBathrooms }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="bg-white shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-[#003366]">Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {amenitiesList.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={filters.amenities.includes(amenity)}
                        onCheckedChange={(checked) => handleAmenityChange(amenity, checked)}
                      />
                      <Label htmlFor={amenity} className="text-sm text-[#6B7280]">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sort By */}
            <Card className="bg-white shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-[#003366]">Sort By</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilters({ sortBy: value })}
                >
                  <SelectTrigger className="focus:ring-[#FFC107] focus:border-[#FFC107]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Clear Filters */}
            <Button variant="outline" onClick={clearFilters} className="w-full border-[#FFC107] text-[#003366] hover:bg-[#FFC107] rounded-xl">
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
