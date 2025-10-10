"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin } from "lucide-react"

export function HeroSection() {
    const [location, setLocation] = useState("")
    const [propertyType, setPropertyType] = useState("")
    const [priceRange, setPriceRange] = useState("")

    const handleSearch = () => {
        // Build search query and redirect to properties page
        const params = new URLSearchParams()
        if (location) params.set("location", location)
        if (propertyType) params.set("type", propertyType)
        if (priceRange) params.set("price", priceRange)

        window.location.href = `/properties?${params.toString()}`
    }

    return (
        <section className="relative bg-gradient-to-br from-[#FFE9D6] to-[#E9E6F7] min-h-screen flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="text-center mb-16">
                    <h1 className="text-4xl lg:text-6xl font-extrabold text-[#003366] mb-6 leading-tight tracking-tight">
                        RISH STAY - Quality Combined with Convenience
                        <span className="text-[#FFC107] block">Luxury Executive Stay</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-[#6B7280] max-w-3xl mx-auto mb-8 leading-relaxed">
                        RISH STAY is your trusted gateway to premium, hassle-free rentals in metro cities. Designed for today’s professionals, our executive homes offer not just a place to live but a luxurious lifestyle—complete with modern comforts, thoughtful amenities, and convenience tailored to your needs.
                    </p>
                </div>

                {/* Search Form */}
                <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 max-w-5xl mx-auto border border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-[#6B7280]">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Area"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="pl-10 text-gray-700 border-gray-300 focus:ring-2 focus:ring-[#FFC107]"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-[#6B7280]">Property Type</label>
                            <Select value={propertyType} onValueChange={setPropertyType}>
                                <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-[#FFC107]">
                                    <SelectValue placeholder="Any Type" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-2 border-[#003366]/20 shadow-xl rounded-lg">
                                    <SelectItem value="apartment" 
                                    className="hover:bg-gradient-to-r hover:from-[#FFE9D6] hover:to-[#FFE9D6]/50 focus:bg-gradient-to-r focus:from-[#FFE9D6] focus:to-[#FFE9D6]/50 cursor-pointer py-3 text-[#003366] font-medium transition-colors">Apartment</SelectItem>
                                    <SelectItem value="studio"
                                    className="hover:bg-gradient-to-r hover:from-[#FFE9D6] hover:to-[#FFE9D6]/50 focus:bg-gradient-to-r focus:from-[#FFE9D6] focus:to-[#FFE9D6]/50 cursor-pointer py-3 text-[#003366] font-medium transition-colors">Studio</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-[#6B7280]">Price Range</label>
                            <Select value={priceRange} onValueChange={setPriceRange}>
                                <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-[#FFC107]">
                                    <SelectValue placeholder="Any Price" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-2 border-[#003366]/20 shadow-xl rounded-lg">
                                    <SelectItem value="0-1500"
                                    className="hover:bg-gradient-to-r hover:from-[#FFE9D6] hover:to-[#FFE9D6]/50 focus:bg-gradient-to-r focus:from-[#FFE9D6] focus:to-[#FFE9D6]/50 cursor-pointer py-3 text-[#003366] font-medium transition-colors">Under Rs.5,500</SelectItem>
                                    <SelectItem value="1500-2500"
                                    className="hover:bg-gradient-to-r hover:from-[#FFE9D6] hover:to-[#FFE9D6]/50 focus:bg-gradient-to-r focus:from-[#FFE9D6] focus:to-[#FFE9D6]/50 cursor-pointer py-3 text-[#003366] font-medium transition-colors">Rs.5,500 - Rs.7,000</SelectItem>
                                    <SelectItem value="2500-4000"
                                    className="hover:bg-gradient-to-r hover:from-[#FFE9D6] hover:to-[#FFE9D6]/50 focus:bg-gradient-to-r focus:from-[#FFE9D6] focus:to-[#FFE9D6]/50 cursor-pointer py-3 text-[#003366] font-medium transition-colors">Rs.7,000 - Rs.8,500</SelectItem>
                                    <SelectItem value="4000+"
                                    className="hover:bg-gradient-to-r hover:from-[#FFE9D6] hover:to-[#FFE9D6]/50 focus:bg-gradient-to-r focus:from-[#FFE9D6] focus:to-[#FFE9D6]/50 cursor-pointer py-3 text-[#003366] font-medium transition-colors">Rs.8,500+</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-[#6B7280]">&nbsp;</label>
                            <Button
                                onClick={handleSearch}
                                className="w-full h-10 bg-[#FFC107] text-[#003366] font-semibold rounded-xl hover:bg-yellow-600 focus:ring-2 focus:ring-[#FFC107] transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                <Search className="h-4 w-4 mr-2" />
                                Search
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
