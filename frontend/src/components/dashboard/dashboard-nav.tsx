"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { Home, Heart, User, Settings, PlusCircle, FileText, Menu, X } from "lucide-react"

export function DashboardNav() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const tenantNavItems = [
    { href: "/dashboard", icon: Home, label: "Overview" },
    { href: "/dashboard/favorites", icon: Heart, label: "Favorites" },
    { href: "/dashboard/applications", icon: FileText, label: "Applications" },
    { href: "/dashboard/profile", icon: User, label: "Profile" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ]

const ownerNavItems = [
    { href: "/dashboard", icon: Home, label: "Overview" },
    { href: "/dashboard/properties", icon: Home, label: "My Properties" },
    { href: "/dashboard/add-property", icon: PlusCircle, label: "Add Property" },
    { href: "/dashboard/profile", icon: User, label: "Profile" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ]

  const navItems = user?.role === "landlord" ? ownerNavItems : tenantNavItems

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-lg"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <nav
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.role === "landlord" ? "Owner Dashboard" : "Tenant Dashboard"}
            </h2>
            <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
          </div>

          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
