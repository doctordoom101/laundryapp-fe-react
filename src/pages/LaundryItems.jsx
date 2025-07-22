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
      antri: { label: "Queue", variant: "secondary" },
      proses: { label: "Processing", variant: "default" },
      selesai: { label: "Completed", variant: "success" },
    }

    const config = statusConfig[status] || { label: status, variant: "secondary" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPaymentBadge = (status) => {
    const statusConfig = {
      belum_bayar: { label: "Unpaid", variant: "destructive" },
      dp: { label: "Partial", variant: "secondary" },
      lunas: { label: "Paid", variant: "success" },
    }

    const config = statusConfig[status] || { label: status, variant: "secondary" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const filteredItems = items.filter(
    (item) =>
      item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.service?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
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
                      <TableCell>{getStatusBadge(item.process_status)}</TableCell>
                      <TableCell>{getPaymentBadge(item.payment_status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
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
