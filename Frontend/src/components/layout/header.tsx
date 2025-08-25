"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { Menu, X, Home, User, Heart } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">RishStay</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/properties" className="text-gray-700 hover:text-blue-600 font-medium">
              Browse Properties
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-blue-600 font-medium">
              How It Works
            </Link>
            {user?.role === "landlord" && (
              <Link href="/list-property" className="text-gray-700 hover:text-blue-600 font-medium">
                List Property
              </Link>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === "tenant" && (
                  <Link href="/favorites">
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      Favorites
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {user.name}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="/properties"
                className="text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Properties
              </Link>
              <Link
                href="/how-it-works"
                className="text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              {user?.role === "landlord" && (
                <Link
                  href="/list-property"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  List Property
                </Link>
              )}
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <div className="flex flex-col space-y-3">
                    <span className="text-sm text-gray-600">Welcome, {user.name}</span>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={logout} className="justify-start bg-transparent">
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="justify-start">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button size="sm" className="justify-start">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
