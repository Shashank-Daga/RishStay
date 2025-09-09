import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { MapPin, Filter, X } from "lucide-react"

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

export function PropertyFilters({ onFiltersChange, initialFilters }: PropertyFiltersProps) {
  const [filters, setFilters] = useState<PropertyFilters>(
    initialFilters || {
      location: "",
      propertyType: "any",
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
    onFiltersChange(updated)
  }

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value)
    updateFilters({ minPrice: value[0], maxPrice: value[1] })
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const newAmenities = checked
      ? [...filters.amenities, amenity]
      : filters.amenities.filter((a) => a !== amenity)
    updateFilters({ amenities: newAmenities })
  }

  const clearFilters = () => {
    const cleared: PropertyFilters = {
      location: "",
      propertyType: "any",
      minPrice: 0,
      maxPrice: 10000,
      bedrooms: 1,
      bathrooms: 1,
      amenities: [],
      sortBy: "newest",
    }
    setFilters(cleared)
    setPriceRange([0, 10000])
    onFiltersChange(cleared)
  }

  return (
    <div className="space-y-6">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full justify-center">
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {/* Filters */}
      <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Enter city, state, or zip code"
                value={filters.location}
                onChange={(e) => updateFilters({ location: e.target.value })}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Property Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Property Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={filters.propertyType}
              onValueChange={(value) => updateFilters({ propertyType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Price Range */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Price Range</CardTitle>
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
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>${priceRange[0].toLocaleString()}</span>
              <span>${priceRange[1].toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Bedrooms & Bathrooms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bedrooms & Bathrooms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Bedrooms</Label>
              <Select
                value={filters.bedrooms.toString()}
                onValueChange={(value: string) => updateFilters({ bedrooms: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Bathrooms</Label>
              <Select
                value={filters.bathrooms.toString()}
                onValueChange={(value: string) => updateFilters({ bathrooms: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {amenitiesList.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={filters.amenities.includes(amenity)}
                    onCheckedChange={(checked: boolean) => handleAmenityChange(amenity, checked)}
                  />
                  <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sort By */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sort By</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Clear Filters */}
        <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      </div>
    </div>
  )
}
