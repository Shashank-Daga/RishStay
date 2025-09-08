"use client"

import type React from "react"
import { Header } from "@/components/layout/header"
import { DashboardNav } from "./dashboard-nav"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <DashboardNav />
      <main className="lg:ml-64 pt-4 lg:pt-8">
        <div className="px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}
