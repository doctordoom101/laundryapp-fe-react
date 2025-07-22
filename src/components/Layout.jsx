"use client"

import { Outlet, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import useAuthStore from "../stores/authStore"

const Layout = () => {
  const navigate = useNavigate()
  const { initializeAuth, isAuthenticated } = useAuthStore()

  useEffect(() => {
    initializeAuth()
    if (!isAuthenticated) {
      navigate("/login")
    }
  }, [initializeAuth, isAuthenticated, navigate])

  if (!isAuthenticated) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Laundry Management System</h1>
          </div>
        </header>
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Layout
