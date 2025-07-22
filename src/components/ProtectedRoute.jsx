import { Navigate, useLocation } from "react-router-dom"
import useAuthStore from "../stores/authStore"

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute
