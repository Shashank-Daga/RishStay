"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Eye, Calendar } from "lucide-react"

interface ActivityItem {
  id: string
  type: "favorite" | "view" | "application"
  title: string
  description: string
  timestamp: Date
  status?: string
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

const activityIcons = {
  favorite: Heart,
  view: Eye,
  application: Calendar,
}

const activityColors = {
  favorite: "text-red-500",
  message: "text-blue-500",
  view: "text-green-500",
  application: "text-purple-500",
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity) => {
              const Icon = activityIcons[activity.type]
              const iconColor = activityColors[activity.type]

              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 ${iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                      {activity.status && (
                        <Badge variant="outline" className="text-xs">
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
