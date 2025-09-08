"use client"

import Link from "next/link"
import { Home, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">RishStay</span>
            </div>
            <p className="text-gray-400 text-sm">
              Connecting property owners with tenants through a seamless, modern rental platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/properties" className="block text-gray-400 hover:text-white text-sm">
                Browse Properties
              </Link>
              <Link href="/how-it-works" className="block text-gray-400 hover:text-white text-sm">
                How It Works
              </Link>
              <Link href="/about" className="block text-gray-400 hover:text-white text-sm">
                About Us
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <div className="space-y-2">
              <Link href="/contact" className="block text-gray-400 hover:text-white text-sm">
                Contact Us
              </Link>
              <Link href="/privacy" className="block text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-gray-400 hover:text-white text-sm">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@rishstay.com" className="hover:underline">info@rishstay.com</a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Phone className="h-4 w-4" />
                <a href="tel:+91 9767663123" className="hover:underline">+91 9767663123</a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4" />
                <a href="https://www.google.com/maps/place/Laxman+Nagar,+Baner,+Pune,+Maharashtra+411045/@18.5705908,73.7665306,16z/data=!3m1!4b1!4m6!3m5!1s0x3bc2b94ab6ff4d3b:0x8af90967675eaea9!8m2!3d18.5700156!4d73.7727908!16s%2Fg%2F1tmphz6_?entry=ttu&g_ep=EgoyMDI1MDgxOS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="hover:underline">Laxman Nagar, Baner, Pune</a>
                {/* <span>Laxman Nagar, Baner</span> */}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            {/* © 2024 RentEase. All rights reserved. Built with modern technology for seamless rental experiences. */}
            © RishStay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
