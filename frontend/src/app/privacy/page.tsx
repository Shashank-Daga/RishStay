import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Lock, Users, Mail } from "lucide-react"

export default function PrivacyPage() {
  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: [
        "Personal information you provide (name, email, phone number)",
        "Property preferences and search history",
        "Communication records between users",
        "Device and browser information for security",
        "Usage data to improve our services"
      ]
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: [
        "To provide and maintain our rental platform services",
        "To facilitate communication between landlords and tenants",
        "To improve user experience and platform functionality",
        "To send important updates and notifications",
        "To ensure platform security and prevent fraud"
      ]
    },
    {
      icon: Shield,
      title: "Data Security",
      content: [
        "We use industry-standard encryption for data transmission",
        "All sensitive data is stored securely in encrypted databases",
        "Regular security audits and updates",
        "Limited access to personal data on a need-to-know basis",
        "Secure payment processing through trusted partners"
      ]
    },
    {
      icon: Users,
      title: "Information Sharing",
      content: [
        "We do not sell your personal information to third parties",
        "Information is shared only with your explicit consent",
        "Service providers have limited access for specific functions",
        "Legal requirements may necessitate information disclosure",
        "Aggregated, anonymized data may be used for analytics"
      ]
    },
    {
      icon: Mail,
      title: "Your Rights",
      content: [
        "Access and review your personal information",
        "Request corrections to inaccurate data",
        "Delete your account and associated data",
        "Opt-out of marketing communications",
        "Data portability upon request"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-gray-700 leading-relaxed">
              At RishStay, we are committed to protecting your privacy and ensuring the security of your personal information.
              This Privacy Policy explains how we collect, use, and safeguard your information when you use our rental platform.
            </p>
          </CardContent>
        </Card>

        {/* Policy Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <section.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Contact Us About Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-2 text-gray-600">
              <p><strong>Email:</strong> privacy@rishstay.com</p>
              <p><strong>Phone:</strong> +91 9767663123</p>
              <p><strong>Address:</strong> Laxman Nagar, Baner, Pune, Maharashtra 411045</p>
            </div>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Policy Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
