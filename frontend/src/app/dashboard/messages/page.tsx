"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-provider"
import { useApi } from "@/lib/api"
import { MessageSquare, Eye, Trash2, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import type { Message } from "@/lib/types"

export default function MessagesPage() {
  const { messageApi } = useApi()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const isTenant = user?.role === "tenant"
  const [filter] = useState<"received" | "sent">(isTenant ? "sent" : "received")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("auth-token")
        if (!token) {
          setError("Authentication token not found")
          return
        }

        const fetchedMessages = await messageApi.getMyMessages(token)
        setMessages(fetchedMessages)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch messages")
        console.error("Error fetching messages:", err)
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchMessages()
  }, [user])

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const token = localStorage.getItem("auth-token")
      if (!token) return

      await messageApi.markAsRead(messageId, token)
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, status: "read" } : msg
        )
      )
      // update selectedMessage if it's the current one
      if (selectedMessage?._id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, status: "read" } : prev)
      }
    } catch (err) {
      console.error("Error marking message as read:", err)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const token = localStorage.getItem("auth-token")
      if (!token) return

      await messageApi.delete(messageId, token)
      setMessages(prev => prev.filter(msg => msg._id !== messageId))
      if (selectedMessage?._id === messageId) setSelectedMessage(null)
    } catch (err) {
      console.error("Error deleting message:", err)
    }
  }

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <MessageSquare className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Messages
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </DashboardLayout>
    )
  }

  const filteredMessages = messages.filter(message =>
    filter === "received"
      ? message.recipient._id === user._id
      : message.sender._id === user._id
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">
              {isTenant
                ? "View your sent inquiries to property owners"
                : "View and respond to tenant inquiries about your properties"}
            </p>
          </div>
        </div>

        {/* Messages List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {isTenant
                    ? `Your Inquiries (${filteredMessages.length})`
                    : `Received Messages (${filteredMessages.length})`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No messages yet
                    </h3>
                    <p className="text-gray-600">
                      {isTenant
                        ? "Send inquiries to property owners to start conversations"
                        : "Messages from tenants will appear here"}
                    </p>
                  </div>
                ) : (
                  filteredMessages.map(message => (
                    <div
                      key={message._id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedMessage?._id === message._id
                          ? "bg-blue-50 border-blue-200"
                          : message.status === "unread"
                          ? "bg-gray-50 border-gray-300" // slightly lighter for unread
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setSelectedMessage(message)
                        if (message.status === "unread") {
                          handleMarkAsRead(message._id)
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {message.subject}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {message.property?.title || "Property"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(message.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {message.status === "unread" && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation()
                              handleDeleteMessage(message._id)
                            }}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {selectedMessage.subject}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Property:{" "}
                        {selectedMessage.property?.title || "Unknown Property"}
                      </p>
                      <p className="text-xs text-gray-500">
                        From: {selectedMessage.sender.name} (
                        {selectedMessage.sender.email})
                      </p>
                      <p className="text-xs text-gray-500">
                        Sent:{" "}
                        {format(
                          new Date(selectedMessage.createdAt),
                          "PPP 'at' p"
                        )}
                      </p>
                      {selectedMessage.inquiryType && (
                        <Badge variant="outline" className="mt-2">
                          {selectedMessage.inquiryType}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!isTenant && (
                        <Button
                          variant={
                            selectedMessage.status === "read"
                              ? "secondary"
                              : "outline"
                          }
                          size="sm"
                          disabled={selectedMessage.status === "read"}
                          onClick={() =>
                            handleMarkAsRead(selectedMessage._id)
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {selectedMessage.status === "read"
                            ? "Read"
                            : "Mark as Read"}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDeleteMessage(selectedMessage._id)
                        }
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Message:
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedMessage.message}
                        </p>
                      </div>
                    </div>

                    {selectedMessage.preferredDate && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Preferred Date:
                        </h4>
                        <p className="text-gray-700">
                          {format(
                            new Date(selectedMessage.preferredDate),
                            "PPP"
                          )}
                        </p>
                      </div>
                    )}

                    {selectedMessage.phone && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Phone:
                        </h4>
                        <p className="text-gray-700">{selectedMessage.phone}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a message
                    </h3>
                    <p className="text-gray-600">
                      Choose a message from the list to view its details
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
