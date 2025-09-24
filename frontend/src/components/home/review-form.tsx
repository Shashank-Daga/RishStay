"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { useApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ReviewFormProps {
  onClose: () => void
  onReviewAdded: () => void
}

export function ReviewForm({ onClose, onReviewAdded }: ReviewFormProps) {
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { reviewApi } = useApi()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a review.",
        variant: "destructive",
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please write a comment.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await reviewApi.create(
        {
          comment: comment.trim(),
        },
        localStorage.getItem("auth-token") || ""
      )

      toast({
        title: "Review submitted!",
        description: "Thank you for sharing your experience.",
      })

      onReviewAdded()
    } catch (error) {
      console.error("Failed to submit review:", error)
      toast({
        title: "Failed to submit review",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">Share Your Experience</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Comment */}
            <div>
              <Label htmlFor="comment" className="text-sm font-medium text-gray-700">
                Your Review *
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with RishStay platform..."
                className="mt-1 min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length}/1000 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
