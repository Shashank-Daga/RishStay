"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { messageApi } from "@/lib/api"
import type { Property } from "@/lib/types"
import { FileText, Calendar, MapPin, DollarSign, Eye, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface Application {
  _id: string
  propertyId: string
  property: Property
  status: "unread" | "read" | "replied"
  createdAt: Date
  subject: string
  message: string
  inquiryType: string
  preferredDate?: Date
  phone?: string
}

export default function ApplicationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoadingApplications, setIsLoadingApplications] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== "tenant")) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user || user.role !== "tenant") return

      try {
        setIsLoadingApplications(true)
        const token = localStorage.getItem("auth-token")
        if (!token) return

        const messages = await messageApi.getMyMessages(token)

        // Filter messages that are applications (inquiryType: "application")
        const applicationMessages = messages.filter((msg: any) => msg.inquiryType === "application")

        // Transform messages to applications format
        const transformedApplications: Application[] = applicationMessages.map((msg: any) => ({
          _id: msg._id,
          propertyId: msg.property._id || msg.propertyId,
          property: msg.property,
          status: msg.status,
          createdAt: new Date(msg.createdAt),
          subject: msg.subject,
          message: msg.message,
          inquiryType: msg.inquiryType,
          preferredDate: msg.preferredDate ? new Date(msg.preferredDate) : undefined,
          phone: msg.phone,
        }))

        setApplications(transformedApplications)
      } catch (error) {
        console.error("Error fetching applications:", error)
      } finally {
        setIsLoadingApplications(false)
      }
    }

    fetchApplications()
  }, [user])

  if (loading || isLoadingApplications) {
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

  const getStatusIcon = (status: Application["status"]) => {
    switch (status) {
      case "unread":
        return <Clock className="h-4 w-4" />
      case "read":
        return <Eye className="h-4 w-4" />
      case "replied":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "unread":
        return "bg-yellow-100 text-yellow-800"
      case "read":
        return "bg-blue-100 text-blue-800"
      case "replied":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const pendingApplications = applications.filter(
    (app) => app.status === "unread" || app.status === "read",
  )
  const approvedApplications = applications.filter((app) => app.status === "replied")
  const rejectedApplications: Application[] = [] // No rejected status in messages

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
              <p>{formatDate(application.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <div>
              <p className="font-medium">Preferred Date</p>
              <p>{application.preferredDate ? formatDate(new Date(application.preferredDate)) : "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            <div>
              <p className="font-medium">Phone</p>
              <p>{application.phone || "N/A"}</p>
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
          {application.status === "replied" && <Button size="sm">Complete Rental Agreement</Button>}
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
            <TabsTrigger value="all">All Applications ({applications.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingApplications.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedApplications.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedApplications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-600 mb-6">Start browsing properties and submit your first application.</p>
                <Link href="/properties">
                  <Button size="lg">Browse Properties</Button>
                </Link>
              </div>
            ) : (
              applications.map((application) => <ApplicationCard key={application._id} application={application} />)
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
                <ApplicationCard key={application._id} application={application} />
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
                <ApplicationCard key={application._id} application={application} />
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
                <ApplicationCard key={application._id} application={application} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
