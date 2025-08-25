"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth/auth-provider"
import { mockProperties } from "@/lib/mock-data"
import { FileText, Calendar, MapPin, DollarSign, Eye, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface Application {
  id: string
  propertyId: string
  property: (typeof mockProperties)[0]
  status: "pending" | "approved" | "rejected" | "under-review"
  appliedDate: Date
  moveInDate: Date
  monthlyIncome: number
  message: string
}

export default function ApplicationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "tenant")) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user || user.role !== "tenant") return null

  // Mock applications data
  const mockApplications: Application[] = [
    {
      id: "1",
      propertyId: "1",
      property: mockProperties[0],
      status: "under-review",
      appliedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      moveInDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      monthlyIncome: 8000,
      message: "I'm very interested in this property and would love to schedule a viewing.",
    },
    {
      id: "2",
      propertyId: "2",
      property: mockProperties[1],
      status: "approved",
      appliedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      moveInDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      monthlyIncome: 6000,
      message: "This studio is perfect for my needs as a graduate student.",
    },
    {
      id: "3",
      propertyId: "3",
      property: mockProperties[2],
      status: "rejected",
      appliedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      moveInDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      monthlyIncome: 12000,
      message: "Looking for a family home in a great neighborhood.",
    },
  ]

  const getStatusIcon = (status: Application["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "under-review":
        return <Eye className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "under-review":
        return "bg-blue-100 text-blue-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const pendingApplications = mockApplications.filter(
    (app) => app.status === "pending" || app.status === "under-review",
  )
  const approvedApplications = mockApplications.filter((app) => app.status === "approved")
  const rejectedApplications = mockApplications.filter((app) => app.status === "rejected")

  const ApplicationCard = ({ application }: { application: Application }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{application.property.title}</h3>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {application.property.location.city}, {application.property.location.state}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <DollarSign className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">${application.property.price.toLocaleString()}/month</span>
            </div>
          </div>
          <Badge className={`${getStatusColor(application.status)} flex items-center gap-1`}>
            {getStatusIcon(application.status)}
            <span className="capitalize">{application.status.replace("-", " ")}</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <div>
              <p className="font-medium">Applied</p>
              <p>{formatDate(application.appliedDate)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <div>
              <p className="font-medium">Move-in Date</p>
              <p>{formatDate(application.moveInDate)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            <div>
              <p className="font-medium">Monthly Income</p>
              <p>${application.monthlyIncome.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {application.message && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{application.message}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Link href={`/properties/${application.propertyId}`}>
            <Button variant="outline" size="sm">
              View Property
            </Button>
          </Link>
          {application.status === "approved" && <Button size="sm">Complete Rental Agreement</Button>}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-600">Track your rental applications and their status</p>
          </div>
          <Link href="/properties">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Apply to More Properties
            </Button>
          </Link>
        </div>

        {/* Applications Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Applications ({mockApplications.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingApplications.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedApplications.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedApplications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {mockApplications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-600 mb-6">Start browsing properties and submit your first application.</p>
                <Link href="/properties">
                  <Button size="lg">Browse Properties</Button>
                </Link>
              </div>
            ) : (
              mockApplications.map((application) => <ApplicationCard key={application.id} application={application} />)
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingApplications.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending applications</h3>
                <p className="text-gray-600">All your applications have been reviewed.</p>
              </div>
            ) : (
              pendingApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedApplications.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No approved applications</h3>
                <p className="text-gray-600">Keep applying to find your perfect home!</p>
              </div>
            ) : (
              approvedApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedApplications.length === 0 ? (
              <div className="text-center py-12">
                <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No rejected applications</h3>
                <p className="text-gray-600">Great! None of your applications have been rejected.</p>
              </div>
            ) : (
              rejectedApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
