"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import useAuthStore from "@/stores/authStore"

const ButtonLogout = ({ className = "", icon = true, children = "Logout" }) => {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className={`w-full justify-start gap-2 ${className}`}
    >
      {icon && <LogOut className="h-4 w-4" />}
      {children}
    </Button>
  )
}

export default ButtonLogout
