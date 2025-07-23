"use client"

import { useState, useEffect } from "react"
import { Plus, Search, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import OutletForm from "@/components/OutletForm" 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { outletService } from "../api/services"
import useAuthStore from "../stores/authStore"

const Outlets = () => {
  const { user } = useAuthStore()
  const [outlets, setOutlets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [open, setOpen] = useState(false)
  const [editingOutlet, setEditingOutlet] = useState(null)

  useEffect(() => {
    fetchOutlets()
  }, [])

  const fetchOutlets = async () => {
    try {
      setLoading(true)
      const response = await outletService.getOutlets()
      setOutlets(response.data.data || [])
    } catch (error) {
      console.error("Error fetching outlets:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (outlet) => {
    setEditingOutlet(outlet)
  }
  
  const handleDelete = async (outletId) => {
    if (!confirm("Are you sure you want to delete this outlet?")) return
    try {
      await outletService.deleteOutlet(outletId)
      fetchOutlets()
    } catch (error) {
      console.error("Error deleting outlet:", error)
    }
  }  

  const filteredOutlets = outlets.filter(
    (outlet) =>
      outlet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      outlet.address?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const canManageOutlets = user?.role === "admin"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Outlets</h1>
          <p className="text-muted-foreground">Manage laundry outlet locations</p>
        </div>
        {/* create */}
        {canManageOutlets && (
          <Button
            onClick={() => {
              setEditingOutlet(null)
              setOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Outlet
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingOutlet ? "Edit Outlet" : "Add New Outlet"}</DialogTitle>
          </DialogHeader>
          <OutletForm
            outlet={editingOutlet}
            onSuccess={() => {
              setOpen(false)
              fetchOutlets()
              setEditingOutlet(null)
            }}
            onCancel={() => {
              setOpen(false)
              setEditingOutlet(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Outlets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Outlets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Outlets List</CardTitle>
          <CardDescription>{filteredOutlets.length} outlets found</CardDescription>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Created</TableHead>
                  {canManageOutlets && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOutlets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManageOutlets ? 5 : 4} className="text-center py-8">
                      No outlets found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOutlets.map((outlet) => (
                    <TableRow key={outlet.id}>
                      <TableCell className="font-medium">{outlet.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{outlet.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{outlet.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(outlet.created_at).toLocaleDateString("id-ID")}</TableCell>
                      {canManageOutlets && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" onClick={() => {
                              setEditingOutlet(outlet)
                              setOpen(true)
                              }}>
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(outlet.id)}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      )}
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

export default Outlets
