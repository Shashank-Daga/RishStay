"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "info@rishstay.com",
      description: "Send us an email and we'll respond within 24 hours"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+91 9767663123",
      description: "Mon-Fri from 8am to 6pm"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: "Laxman Nagar, Baner, Pune",
      description: "Maharashtra 411045, India"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Mon - Fri: 8am - 6pm",
      description: "Weekend support available via email"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE9D6] to-[#E9E6F7]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#003366] mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-[#6B7280] max-w-3xl mx-auto">
            Have questions about RishStay? We are here to help! Reach out to us through any of the channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-[#003366]">Send us a Message</CardTitle>
                <p className="text-[#6B7280]">
                  Fill out the form below and we will get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help you?" />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                    />
                  </div>

                  <Button className="w-full bg-[#FFC107] hover:bg-yellow-600 text-[#003366] rounded-xl shadow-md hover:shadow-lg transform hover:scale-105">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-[#003366] mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#FFC107] rounded-xl flex items-center justify-center flex-shrink-0">
                      <info.icon className="h-6 w-6 text-[#003366]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#003366]">{info.title}</h3>
                      <p className="text-[#FFC107] font-medium">{info.details}</p>
                      <p className="text-[#6B7280] text-sm">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-[#003366]">Quick Help</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-[#003366] mb-2">
                      How do I list my property?
                    </h4>
                    <p className="text-[#6B7280] text-sm">
                      Create a landlord account and use our simple property listing form to add your rental property.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#003366] mb-2">
                      How do I apply for a property?
                    </h4>
                    <p className="text-[#6B7280] text-sm">
                      Browse properties, save your favorites, and submit applications directly through our platform.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#003366] mb-2">
                      Is RishStay free to use?
                    </h4>
                    <p className="text-[#6B7280] text-sm">
                      Yes! Browsing and applying for properties is completely free for tenants.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-[#003366]">Find Us</CardTitle>
              <p className="text-[#6B7280]">
                Visit our office location in Pune, Maharashtra
              </p>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-4" />
                  <p className="font-medium">Interactive Map</p>
                  <p className="text-sm">Laxman Nagar, Baner, Pune, Maharashtra 411045</p>
                  <p className="text-sm mt-2">
                    <a
                      href="https://www.google.com/maps/place/Laxman+Nagar,+Baner,+Pune,+Maharashtra+411045/@18.5705908,73.7665306,16z/data=!3m1!4b1!4m6!3m5!1s0x3bc2b94ab6ff4d3b:0x8af90967675eaea9!8m2!3d18.5700156!4d73.7727908!16s%2Fg%2F1tmphz6_?entry=ttu&g_ep=EgoyMDI1MDgxOS4wIKXMDSoASAFQAw%3D%3D"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FFC107] hover:underline"
                    >
                      View on Google Maps
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
