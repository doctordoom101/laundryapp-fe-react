"use client"

import { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { productService } from "../api/services"
import useAuthStore from "../stores/authStore"

const Products = () => {
  const { user } = useAuthStore()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productService.getProducts()
      setProducts(response.data.data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeBadge = (type) => {
    const typeConfig = {
      kiloan: { label: "Per Kg", variant: "default" },
      satuan: { label: "Per Item", variant: "secondary" },
    }

    const config = typeConfig[type] || { label: type, variant: "secondary" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const canManageProducts = user?.role === "admin"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage laundry services and pricing</p>
        </div>
        {canManageProducts && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products List</CardTitle>
          <CardDescription>{filteredProducts.length} products found</CardDescription>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Outlet</TableHead>
                  <TableHead>Created</TableHead>
                  {canManageProducts && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManageProducts ? 6 : 5} className="text-center py-8">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{getTypeBadge(product.type)}</TableCell>
                      <TableCell>Rp {product.price?.toLocaleString("id-ID")}</TableCell>
                      <TableCell>{product.outlet}</TableCell>
                      <TableCell>{new Date(product.created_at).toLocaleDateString("id-ID")}</TableCell>
                      {canManageProducts && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm">
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

export default Products
