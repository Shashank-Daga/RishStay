import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { Heart, LogIn, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function FavoritesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // If user is logged in, redirect to dashboard favorites
      router.push("/dashboard/favorites")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Heart className="h-12 w-12 text-red-500" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Save Your Favorite Properties
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Create an account to save properties you're interested in and keep track of your favorites in one place.
          </p>

          <div className="space-y-4">
            <Link href="/auth">
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                <LogIn className="h-5 w-5 mr-2" />
                Sign In to View Favorites
              </Button>
            </Link>

            <Link href="/auth">
              <Button size="lg" variant="outline" className="w-full">
                <UserPlus className="h-5 w-5 mr-2" />
                Create Account
              </Button>
            </Link>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Benefits of Creating an Account
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <Heart className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Save Favorites</h3>
                  <p className="text-gray-600">Keep track of properties you love</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Heart className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Get Alerts</h3>
                  <p className="text-gray-600">Receive notifications about new listings</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Heart className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Apply Easily</h3>
                  <p className="text-gray-600">Quick application process for saved properties</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Heart className="h-6 w-6 text-purple-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Message Owners</h3>
                  <p className="text-gray-600">Direct communication with property owners</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <Link href="/properties">
              <Button variant="outline" size="lg">
                Browse Properties Without Account
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
