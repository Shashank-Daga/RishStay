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
        <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                        Find Your Perfect
                        <span className="text-blue-600 block">Rental Home</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Description
                    </p>
                </div>

                {/* Search Form */}
                < div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 max-w-4xl mx-auto mb-12" >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Area"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Property Type</label>
                            <Select value={propertyType} onValueChange={setPropertyType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Any Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="apartment">apartment</SelectItem>
                                    <SelectItem value="studio">studio</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Price Range</label>
                            <Select value={priceRange} onValueChange={setPriceRange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Any Price" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0-1500">Under Rs.5,500</SelectItem>
                                    <SelectItem value="1500-2500">Rs.5,500 - Rs.7,000</SelectItem>
                                    <SelectItem value="2500-4000">Rs.7,000 - Rs.8,500</SelectItem>
                                    <SelectItem value="4000+">Rs.8,500+</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">&nbsp;</label>
                            <Button onClick={handleSearch} className="w-full h-10">
                                <Search className="h-4 w-4 mr-2" />
                                Search
                            </Button>
                        </div>
                    </div>
                </div >
            </div>
        </section >
    )
}
