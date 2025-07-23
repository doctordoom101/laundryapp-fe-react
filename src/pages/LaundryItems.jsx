"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"
import { LaundryItemForm } from "../components/LaundryItemForm"
import { laundryService } from "../api/services"
import useAuthStore from "../stores/authStore"

const LaundryItems = () => {
  const { user } = useAuthStore()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all") // "all" | "today" | "yesterday" | "custom"
  const [customDate, setCustomDate] = useState(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await laundryService.getLaundryItems()
      setItems(response.data.data || [])
    } catch (error) {
      console.error("Error fetching laundry items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (itemId, newStatus) => {
    try {
      await laundryService.updateLaundryItemStatus(itemId, newStatus)
      fetchItems() // Refresh the list
    } catch (error) {
      console.error("Error updating status:", error)
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

  // const filteredItems = items.filter(
  //   (item) =>
  //     item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     item.service?.toLowerCase().includes(searchTerm.toLowerCase()),
  // )

  const filteredItems = items.filter((item) => {
    const statusMatch = statusFilter === "all" || item.process_status === statusFilter
    const paymentMatch = paymentFilter === "all" || item.payment_status === paymentFilter
  
    const createdDate = new Date(item.created_at)
    let dateMatch = true
  
    if (dateFilter === "today") {
      const today = new Date()
      dateMatch =
        createdDate.toDateString() === today.toDateString()
    } else if (dateFilter === "yesterday") {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      dateMatch =
        createdDate.toDateString() === yesterday.toDateString()
    } else if (dateFilter === "custom" && customDate) {
      dateMatch =
        createdDate.toISOString().split("T")[0] === customDate
    }
  
    return statusMatch && paymentMatch && dateMatch
  })
  
  const canCreateItems = user?.role === "admin" || user?.role === "petugas"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laundry Items</h1>
          <p className="text-muted-foreground">Manage all laundry items and their status</p>
        </div>
        {canCreateItems && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Laundry Item</DialogTitle>
                <DialogDescription>Create a new laundry item for a customer</DialogDescription>
              </DialogHeader>
              <LaundryItemForm
                onSuccess={() => {
                  setShowForm(false)
                  fetchItems()
                }}
                onCancel={() => setShowForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <Card>

        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by code, customer name, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            {/* <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button> */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Filter Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="antri">Antri</SelectItem>
                  <SelectItem value="proses">Proses</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger><SelectValue placeholder="Filter Payment" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment</SelectItem>
                  <SelectItem value="belum_bayar">Belum Bayar</SelectItem>
                  <SelectItem value="dp">DP</SelectItem>
                  <SelectItem value="lunas">Lunas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger><SelectValue placeholder="Filter Date" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="custom">Custome Date</SelectItem>
                </SelectContent>
              </Select>

              {dateFilter === "custom" && (
                <Input
                  type="date"
                  value={customDate || ""}
                  onChange={(e) => setCustomDate(e.target.value)}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Items List</CardTitle>
          <CardDescription>{filteredItems.length} items found</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{item.customer_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.service}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>Rp {item.total_price?.toLocaleString("id-ID")}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="cursor-pointer inline-block">
                              {getStatusBadge(item.process_status)}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {["antri", "proses", "selesai"].map((status) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={() => handleStatusUpdate(item.id, status)}
                              >
                                {getStatusBadge(status)}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        {getPaymentBadge(item.payment_status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedItem(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>

                          <DialogContent className="max-w-3xl">
                            {selectedItem && (
                              <Card>
                                <CardHeader>
                                  <CardTitle>Laundry Status</CardTitle>
                                  <CardDescription>Status for code: {selectedItem.code}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h3 className="font-semibold mb-2">Customer Information</h3>
                                      <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Name:</span> {selectedItem.customer_name}</p>
                                        <p><span className="font-medium">Service:</span> {selectedItem.service}</p>
                                        <p><span className="font-medium">Date:</span> {new Date(selectedItem.created_at).toLocaleDateString("id-ID")}</p>
                                      
                                        {selectedItem.notes && (
                                          <p><span className="font-medium">Notes:</span> {selectedItem.notes}</p>
                                        )}
                                      </div>
                                    </div>

                                    <div>
                                      <h3 className="font-semibold mb-2">Status Information</h3>
                                      <div className="space-y-3">
                                        <div>
                                          <p className="text-sm font-medium mb-1">Process Status:</p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {getStatusBadge(selectedItem.process_status)}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium mb-1">Payment Status:</p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {getPaymentBadge(selectedItem.payment_status)}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </DialogContent>
                        </Dialog>

                          {canCreateItems && (
                            <>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {user?.role === "admin" && (
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(item.created_at).toISOString().split("T")[0]}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default LaundryItems
