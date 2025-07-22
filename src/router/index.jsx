import { createBrowserRouter, Navigate } from "react-router-dom"
import Layout from "../components/Layout"
import ProtectedRoute from "../components/ProtectedRoute"
import Login from "../pages/Login"
import Dashboard from "../pages/Dashboard"
import LaundryItems from "../pages/LaundryItems"
import CheckStatus from "../pages/CheckStatus"
import Users from "../pages/Users"
import Products from "../pages/Products"
import Outlets from "../pages/Outlets"
import Transactions from "../pages/Transactions"
import Reports from "../pages/Reports"
import Unauthorized from "../pages/Unauthorized"

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/check-status",
    element: <CheckStatus />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "laundry-items",
        element: (
          <ProtectedRoute roles={["admin", "petugas"]}>
            <LaundryItems />
          </ProtectedRoute>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "outlets",
        element: (
          <ProtectedRoute roles={["admin", "owner"]}>
            <Outlets />
          </ProtectedRoute>
        ),
      },
      {
        path: "transactions",
        element: (
          <ProtectedRoute roles={["admin", "petugas"]}>
            <Transactions />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute roles={["admin", "owner"]}>
            <Reports />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])
