import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Target, Award, Heart, MapPin, TrendingUp, Shield, Star } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "We put our users at the center of everything we do, ensuring a seamless and enjoyable rental experience."
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "We maintain the highest standards of security and trust in all our interactions and transactions."
    },
    {
      icon: Target,
      title: "Innovation",
      description: "We continuously innovate to make finding and renting properties easier and more efficient."
    },
    {
      icon: Award,
      title: "Quality",
      description: "We are committed to maintaining the highest quality standards in our platform and services."
    }
  ]

  const stats = [
    { number: "10,000+", label: "Properties Listed" },
    { number: "50,000+", label: "Happy Users" },
    { number: "95%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Customer Support" }
  ]

  const team = [
    {
      name: "Shashank Daga",
      role: "Founder & CEO",
      description: "Passionate about revolutionizing the rental industry with technology."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800">About RishStay</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Connecting People with Perfect Homes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            RishStay is revolutionizing the rental industry by creating a seamless, trustworthy platform that connects property owners with qualified tenants.
          </p>
        </div>

        {/* Mission */}
        <div className="mb-20">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                To create the most trusted and efficient rental platform that empowers both property owners and tenants to find their perfect match, fostering long-term relationships built on trust and transparency.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-20">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-4xl font-bold mb-2">{stat.number}</div>
                  <div className="text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Story */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  RishStay was founded with a simple vision: to make finding and renting properties as simple and stress-free as possible. We recognized that the traditional rental process was often complicated, time-consuming, and lacked transparency.
                </p>
                <p>
                  By leveraging technology and focusing on user experience, we've created a platform that serves both property owners and tenants equally, ensuring fair practices and building lasting relationships in the rental community.
                </p>
                <p>
                  Today, RishStay serves thousands of users across the country, helping them find their perfect homes and connect with trustworthy landlords.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Serving Communities Nationwide
                </h3>
                <p className="text-gray-600">
                  From bustling cities to quiet suburbs, we're helping people find their perfect homes everywhere.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-md mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-10 w-10 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <p className="text-blue-600 font-medium">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join Our Community
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you're looking for your next home or want to list your property, RishStay is here to help you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Browse Properties
              </Button>
            </Link>
            <Link href="/list-property">
              <Button size="lg" variant="outline">
                List Your Property
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
