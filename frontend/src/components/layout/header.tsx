"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { Menu, X, Home, User, Heart, MessageSquare } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <header className="bg-gradient-to-r from-[#FFE9D6] to-[#E9E6F7] border-b border-gray-200 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-[#FFC107]" />
            <span className="text-xl font-bold text-[#003366]">RishStay</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/properties" className="text-[#6B7280] hover:text-[#003366] font-medium transition-colors">
              Browse Properties
            </Link>
            <Link href="/how-it-works" className="text-[#6B7280] hover:text-[#003366] font-medium transition-colors">
              How It Works
            </Link>
            {user?.role === "landlord" && (
              <Link href="/list-property" className="text-[#6B7280] hover:text-[#003366] font-medium transition-colors">
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
                    <Button variant="ghost" size="sm" className="text-[#6B7280] hover:text-[#003366]">
                      <Heart className="h-4 w-4 mr-2" />
                      Favorites
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard/messages">
                  <Button variant="ghost" size="sm" className="text-[#6B7280] hover:text-[#003366]">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </Button>
                </Link>
                <Link href={user.role === "landlord" ? "/dashboard/properties" : "/dashboard/favorites"}>
                  <Button variant="ghost" size="sm" className="text-[#6B7280] hover:text-[#003366]">
                    <User className="h-4 w-4 mr-2" />
                    {user.name}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout} className="border-[#FFC107] text-[#003366] hover:bg-[#FFC107] rounded-xl">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth">
                  <Button variant="ghost" size="sm" className="text-[#6B7280] hover:text-[#FFC107]">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm" className="bg-[#FFC107] hover:bg-yellow-600 text-[#003366] rounded-xl shadow-md hover:shadow-lg transform hover:scale-105">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-[#003366]" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-gradient-to-r from-[#FFE9D6] to-[#E9E6F7]">
            <div className="flex flex-col space-y-4">
              <Link
                href="/properties"
                className="text-[#6B7280] hover:text-[#003366] font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Properties
              </Link>
              <Link
                href="/how-it-works"
                className="text-[#6B7280] hover:text-[#003366] font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              {user?.role === "landlord" && (
                <Link
                  href="/list-property"
                  className="text-[#6B7280] hover:text-[#003366] font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  List Property
                </Link>
              )}
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <div className="flex flex-col space-y-3">
                    <span className="text-sm text-[#6B7280]">Welcome, {user.name}</span>
                    <Link href={user.role === "landlord" ? "/dashboard/properties" : "/dashboard/favorites"} onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="justify-start text-[#6B7280] hover:text-[#003366]">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/dashboard/messages" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="justify-start text-[#6B7280] hover:text-[#003366]">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Messages
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={logout} className="justify-start bg-transparent border-[#FFC107] text-[#003366] hover:bg-[#FFC107] rounded-xl">
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="justify-start text-[#6B7280] hover:text-[#FFC107]">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button size="sm" className="justify-start bg-[#FFC107] hover:bg-yellow-600 text-[#003366] rounded-xl shadow-md hover:shadow-lg transform hover:scale-105">
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
