"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Plus } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useApi } from "@/lib/api"
import type { Review } from "@/lib/types"
import { ReviewForm } from "./review-form"

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const { user } = useAuth()
  const { reviewApi } = useApi()

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true)
      const fetchedReviews = await reviewApi.getAll()
      // Reverse to show oldest first (left) to newest last (right)
      setReviews(fetchedReviews)
    } catch (error) {
      console.error("Failed to load reviews:", error)
    } finally {
      setLoading(false)
    }
  }, [reviewApi])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const handleReviewAdded = async () => {
    await loadReviews()
    setShowReviewForm(false)
  }



  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#FFE9D6] to-[#E9E6F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC107] mx-auto"></div>
            <p className="mt-4 text-[#6B7280]">Loading reviews...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-[#FFE9D6] to-[#E9E6F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#003366] mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
            Read reviews from our community of tenants and landlords who have found their perfect rental match through RishStay.
          </p>
        </div>

        {/* Add Review Button - Only for logged in users */}
        {user && (
          <div className="text-center mb-8">
            <Button
              onClick={() => setShowReviewForm(true)}
              className="bg-[#FFC107] hover:bg-yellow-600 text-[#003366] px-6 py-2 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              Share Your Experience
            </Button>
          </div>
        )}

        {/* Reviews Slider */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-[#6B7280] mb-4">
              <User className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-[#003366] mb-2">
              No reviews yet
            </h3>
            <p className="text-[#6B7280]">
              Be the first to share your experience with RishStay!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar pb-4">
            <div className="flex space-x-6 min-w-max">
              {reviews.map((review) => (
                <Card key={review._id} className="w-80 flex-shrink-0 bg-white shadow-md hover:shadow-lg transition-shadow border-0 rounded-2xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#FFC107] rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-[#003366]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#003366]">
                            {review.userName}
                          </p>
                          <Badge
                            variant={review.userRole === "landlord" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {review.userRole}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-[#6B7280] mb-4 overflow-hidden text-ellipsis" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 6,
                      WebkitBoxOrient: 'vertical' as const,
                      lineHeight: '1.5'
                    }}>
                      &ldquo;{review.comment}&rdquo;
                    </p>
                    <div className="flex items-center text-sm text-[#6B7280]">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(review.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Review Form Modal */}
        {showReviewForm && (
          <ReviewForm
            onClose={() => setShowReviewForm(false)}
            onReviewAdded={handleReviewAdded}
          />
        )}
      </div>
    </section>
  )
}
