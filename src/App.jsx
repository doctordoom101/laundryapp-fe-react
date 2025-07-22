"use client"

import { useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "./router"
import useAuthStore from "./stores/authStore"

function App() {
  const { initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return <RouterProvider router={router} />
}

export default App
