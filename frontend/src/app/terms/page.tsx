import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Shield, AlertTriangle, Scale } from "lucide-react"

export default function TermsPage() {
  const sections = [
    {
      icon: Users,
      title: "User Accounts",
      content: [
        "You must be at least 18 years old to use RishStay",
        "You are responsible for maintaining account security",
        "Provide accurate and complete information",
        "One account per user is permitted",
        "Account suspension may occur for violations"
      ]
    },
    {
      icon: FileText,
      title: "Property Listings",
      content: [
        "Landlords must provide accurate property information",
        "All listings must comply with local laws and regulations",
        "Prohibited content includes discriminatory language",
        "Property owners are responsible for listing accuracy",
        "RishStay reserves the right to remove inappropriate listings"
      ]
    },
    {
      icon: Shield,
      title: "Platform Usage",
      content: [
        "Use the platform only for lawful rental purposes",
        "Respect other users' privacy and rights",
        "Do not attempt to circumvent platform fees",
        "Report suspicious or fraudulent activity",
        "Maintain professional communication standards"
      ]
    },
    {
      icon: Scale,
      title: "Rental Agreements",
      content: [
        "RishStay facilitates but does not guarantee rental agreements",
        "Users are responsible for their own rental contracts",
        "Disputes between users are handled independently",
        "Platform does not provide legal advice",
        "Users should consult professionals for legal matters"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Liability & Disclaimers",
      content: [
        "RishStay is not responsible for user-generated content",
        "Platform availability is provided as-is",
        "We do not guarantee rental outcomes",
        "Users assume responsibility for their interactions",
        "Service interruptions may occur without notice"
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
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to RishStay. These Terms of Service ("Terms") govern your use of our rental platform and services.
              By accessing or using RishStay, you agree to be bound by these Terms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Please read these Terms carefully. If you do not agree to these Terms, please do not use our platform.
            </p>
          </CardContent>
        </Card>

        {/* Terms Sections */}
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

        {/* Termination */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Account Termination</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              We reserve the right to terminate or suspend your account and access to our services at our sole discretion,
              without prior notice, for conduct that we believe violates these Terms or is harmful to other users,
              us, or third parties, or for any other reason.
            </p>
          </CardContent>
        </Card>

        {/* Changes */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              We may modify these Terms at any time. We will notify users of material changes by posting the updated
              Terms on our platform and updating the "Last updated" date. Your continued use of RishStay after such
              modifications constitutes acceptance of the updated Terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="space-y-2 text-gray-600">
              <p><strong>Email:</strong> legal@rishstay.com</p>
              <p><strong>Phone:</strong> +91 9767663123</p>
              <p><strong>Address:</strong> Laxman Nagar, Baner, Pune, Maharashtra 411045</p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
