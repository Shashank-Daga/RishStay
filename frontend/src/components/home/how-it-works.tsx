"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Search, Key, Shield } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Search & Discover",
      description:
        "Browse thousands of verified rental properties using our advanced search filters. Find exactly what you're looking for in your preferred location.",
    },
    {
      icon: Shield,
      title: "Secure Process",
      description:
        "All properties and owners are verified. Our platform ensures secure communication and transparent rental processes for your peace of mind.",
    },
    {
      icon: Key,
      title: "Move In Easy",
      description:
        "Complete your rental application, sign agreements digitally, and get your keys. We make the entire process smooth and hassle-free.",
    },
  ]

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-[#FFE9D6] to-[#E9E6F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#003366] mb-4">How It Works</h2>
          <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
            Finding your perfect rental home has never been easier. Follow these simple steps to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 bg-white rounded-2xl shadow-md">
              <CardContent className="p-8">
                <div className="bg-[#FFC107] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <step.icon className="h-8 w-8 text-[#003366]" />
                </div>
                {/* <div className="bg-[#FFC107] text-[#003366] rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold shadow-md">
                  {index + 1}
                </div> */}
                <h3 className="text-xl font-semibold text-[#003366] mb-4">{step.title}</h3>
                <p className="text-[#6B7280]">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
