"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShirtIcon, DollarSign, Clock, CheckCircle } from "lucide-react"
import useAuthStore from "../stores/authStore"
import { laundryService } from "../api/services"
import { transactionService } from "../api/services"

const Dashboard = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    totalItems: 0,
    totalRevenue: 0,
    pendingItems: 0,
    completedItems: 0,
  })
  const [recentItems, setRecentItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
  
      // Fetch recent laundry items
      const itemsResponse = await laundryService.getLaundryItems({
        page: 1,
        per_page: 5,
      })
      setRecentItems(itemsResponse.data.data || [])
  
      // Fetch all laundry items
      const allItemsResponse = await laundryService.getLaundryItems({
        per_page: 1000,
      })
      const items = allItemsResponse.data.data || []
  
      // ✅ Fetch transactions (baru)
      const transactionResponse = await transactionService.getTransactions()
      const transactions = transactionResponse.data.data || []
  
      // Hitung statistik
      const totalItems = items.length
      const totalRevenue = transactions.reduce((sum, trx) => sum + Number(trx.amount || 0), 0)
      const pendingItems = items.filter(
        (item) => item.process_status === "antri" || item.process_status === "proses"
      ).length
      const completedItems = items.filter((item) => item.process_status === "selesai").length
  
      setStats({
        totalItems,
        totalRevenue,
        pendingItems,
        completedItems,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }
  

  const getStatusBadge = (status) => {
    const statusConfig = {
      antri: {
        label: "Queue",
        base: "bg-yellow-100 text-yellow-700 border-yellow-300",
        hover: "hover:bg-yellow-200 hover:text-yellow-800",
      },
      proses: {
        label: "Processing",
        base: "bg-blue-100 text-blue-700 border-blue-300",
        hover: "hover:bg-blue-200 hover:text-blue-800",
      },
      selesai: {
        label: "Completed",
        base: "bg-green-100 text-green-700 border-green-300",
        hover: "hover:bg-green-200 hover:text-green-800",
      },
    }
  
    const config = statusConfig[status] || {
      label: status,
      base: "bg-gray-100 text-gray-700 border-gray-300",
      hover: "hover:bg-gray-200 hover:text-gray-800",
    }
  
    return (
      <button
        type="button"
        className={`text-xs font-semibold px-2.5 py-1 border rounded-full transition-colors duration-150 ${config.base} ${config.hover}`}
      >
        {config.label}
      </button>
    )
  }

  const getPaymentBadge = (status) => {
    const statusConfig = {
      belum_bayar: { label: "Unpaid", color: "text-red-600" },
      dp: { label: "Partial", color: "text-yellow-600" },
      lunas: { label: "Paid", color: "text-green-600" },
    }

    const config = statusConfig[status] || { label: status, color: "text-gray-500" }

    return (
      <span className={`font-semibold text-sm ${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}! Here's what's happening at your laundry.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <ShirtIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">All time laundry items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {stats.totalRevenue.toLocaleString("id-ID")}</div>
            <p className="text-xs text-muted-foreground">Total earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Items</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingItems}</div>
            <p className="text-xs text-muted-foreground">In queue or processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedItems}</div>
            <p className="text-xs text-muted-foreground">Finished items</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Items */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Laundry Items</CardTitle>
          <CardDescription>Latest items added to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent items found</p>
            ) : (
              recentItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{item.code}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.customer_name} - {item.service}
                    </p>
                    <p className="text-sm font-medium">Rp {item.total_price?.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getStatusBadge(item.process_status)}
                    {getPaymentBadge(item.payment_status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
