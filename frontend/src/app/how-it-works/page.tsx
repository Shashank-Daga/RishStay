"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Search, MessageSquare, Key, Home, Users, Shield, Heart } from "lucide-react"
import Link from "next/link"

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Search,
      title: "Browse Properties",
      description: "Search through our extensive collection of rental properties with advanced filters to find your perfect home."
    },
    {
      icon: Heart,
      title: "Save Favorites",
      description: "Save properties you're interested in and create a personalized list of your favorite rentals."
    },
    {
      icon: MessageSquare,
      title: "Contact Owners",
      description: "Reach out directly to property owners through our secure messaging system to ask questions and schedule viewings."
    },
    {
      icon: CheckCircle,
      title: "Submit Application",
      description: "Apply for properties you're interested in and track the status of your rental applications."
    },
    {
      icon: Key,
      title: "Get Approved",
      description: "Once approved, complete the necessary paperwork and get ready to move into your new home."
    }
  ]

  const features = [
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your personal information and rental applications are protected with enterprise-grade security."
    },
    {
      icon: Users,
      title: "Verified Owners",
      description: "All property owners on our platform are verified to ensure a trustworthy rental experience."
    },
    {
      icon: Home,
      title: "Quality Properties",
      description: "We partner with property owners to ensure all listings meet our quality standards."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            How RishStay Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Finding your perfect rental home has never been easier. Follow these simple steps to get started with RishStay.
          </p>
        </div>

        {/* Steps */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Your Rental Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{step.description}</p>
                  <div className="mt-4 text-2xl font-bold text-blue-600">
                    {index + 1}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose RishStay?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-600 text-white rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Home?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of tenants who have found their perfect rental through RishStay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Browse Properties
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
