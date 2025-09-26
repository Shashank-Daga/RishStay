"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Home, Users } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-[#FFE9D6] to-[#E9E6F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* For Tenants */}
          <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-md">
            <div className="flex items-center mb-6">
              <div className="bg-[#FFC107] rounded-full w-12 h-12 flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-[#003366]" />
              </div>
              <h3 className="text-2xl font-bold text-[#003366]">For Tenants</h3>
            </div>
            <p className="text-[#6B7280] mb-6 text-lg">
              Find your dream rental home with our extensive collection of verified properties. Connect directly with
              property owners and move in with confidence.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-[#6B7280]">
                <div className="w-2 h-2 bg-[#FFC107] rounded-full mr-3"></div>
                Browse thousands of verified properties
              </li>
              <li className="flex items-center text-[#6B7280]">
                <div className="w-2 h-2 bg-[#FFC107] rounded-full mr-3"></div>
                Advanced search and filtering options
              </li>
              <li className="flex items-center text-[#6B7280]">
                <div className="w-2 h-2 bg-[#FFC107] rounded-full mr-3"></div>
                Direct communication with property owners
              </li>
              <li className="flex items-center text-[#6B7280]">
                <div className="w-2 h-2 bg-[#FFC107] rounded-full mr-3"></div>
                Secure and transparent rental process
              </li>
            </ul>
            <Link href="/properties">
              <Button size="lg" className="w-full bg-[#FFC107] hover:bg-yellow-600 text-[#003366] rounded-xl shadow-md hover:shadow-lg transform hover:scale-105">
                Start Searching
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* For Property Owners */}
          <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-md">
            <div className="flex items-center mb-6">
              <div className="bg-[#FFC107] rounded-full w-12 h-12 flex items-center justify-center mr-4">
                <Home className="h-6 w-6 text-[#003366]" />
              </div>
              <h3 className="text-2xl font-bold text-[#003366]">For Property Owners</h3>
            </div>
            <p className="text-[#6B7280] mb-6 text-lg">
              List your properties and connect with quality tenants. Our platform makes property management simple and
              efficient with powerful tools and insights.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-[#6B7280]">
                <div className="w-2 h-2 bg-[#FFC107] rounded-full mr-3"></div>
                Easy property listing and management
              </li>
              <li className="flex items-center text-[#6B7280]">
                <div className="w-2 h-2 bg-[#FFC107] rounded-full mr-3"></div>
                Reach thousands of potential tenants
              </li>
              <li className="flex items-center text-[#6B7280]">
                <div className="w-2 h-2 bg-[#FFC107] rounded-full mr-3"></div>
                Tenant screening and verification tools
              </li>
              <li className="flex items-center text-[#6B7280]">
                <div className="w-2 h-2 bg-[#FFC107] rounded-full mr-3"></div>
                Analytics and performance insights
              </li>
            </ul>
            <Link href="/list-property">
              <Button size="lg" className="w-full bg-[#FFC107] hover:bg-yellow-600 text-[#003366] rounded-xl shadow-md hover:shadow-lg transform hover:scale-105">
                List Your Property
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
