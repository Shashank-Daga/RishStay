"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-provider"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, DollarSign, Users, TrendingUp, Shield, Clock, Star } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ListPropertyPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user?.role === "landlord") {
      // If user is already logged in as landlord, redirect to dashboard
      router.push("/dashboard/add-property")
    }
  }, [user, loading, router])

  const benefits = [
    {
      icon: DollarSign,
      title: "Maximize Rental Income",
      description: "Reach qualified tenants quickly and get the best rental rates for your property."
    },
    {
      icon: Users,
      title: "Qualified Tenants",
      description: "Connect with verified tenants who are serious about renting your property."
    },
    {
      icon: TrendingUp,
      title: "Marketing & Exposure",
      description: "Your property gets maximum visibility through our extensive network and marketing."
    },
    {
      icon: Shield,
      title: "Secure & Trusted",
      description: "All transactions are secure and we verify both landlords and tenants."
    },
    {
      icon: Clock,
      title: "Quick Process",
      description: "List your property in minutes and start receiving inquiries immediately."
    },
    {
      icon: Star,
      title: "Premium Support",
      description: "Get dedicated support throughout the rental process from listing to move-in."
    }
  ]

  const steps = [
    "Create your landlord account",
    "Add your property details and photos",
    "Set your rental terms and pricing",
    "Review tenant applications",
    "Complete the rental agreement"
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFE9D6] to-[#E9E6F7]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (user?.role === "landlord") {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE9D6] to-[#E9E6F7]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#FFC107] text-[#003366]">For Property Owners</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-[#003366] mb-6">
            List Your Property on RishStay
          </h1>
          <p className="text-xl text-[#6B7280] max-w-3xl mx-auto mb-8">
            Join thousands of property owners who trust RishStay to find qualified tenants and maximize their rental income.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-[#FFC107] hover:bg-yellow-600 text-[#003366] rounded-xl shadow-md hover:shadow-lg transform hover:scale-105">
                Get Started as Landlord
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="border-[#FFC107] text-[#003366] hover:bg-[#FFC107] rounded-xl">
                Learn How It Works
              </Button>
            </Link>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-[#003366] mb-12">
            Why Choose RishStay for Your Property?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow rounded-2xl">
                <CardHeader>
                  <div className="w-12 h-12 bg-[#FFC107] rounded-xl flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-[#003366]" />
                  </div>
                  <CardTitle className="text-lg text-[#003366]">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#6B7280]">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Process */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-[#003366] mb-12">
            Simple 5-Step Process
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-[#FFC107] text-[#003366] rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {index + 1}
                  </div>
                  <p className="text-[#6B7280] font-medium">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#003366] mb-4">
            Ready to List Your Property?
          </h2>
          <p className="text-xl text-[#6B7280] mb-8 max-w-2xl mx-auto">
            Start earning rental income today. Create your free landlord account and list your first property.
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-[#FFC107] hover:bg-yellow-600 text-[#003366] rounded-xl shadow-md hover:shadow-lg transform hover:scale-105">
              <CheckCircle className="h-5 w-5 mr-2" />
              Start Listing Today
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
