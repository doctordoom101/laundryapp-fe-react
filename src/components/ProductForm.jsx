"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { productService, outletService } from "../api/services"

const ProductForm = ({ product = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "kiloan",
    price: "",
    outlet_id: "",
  })
  const [outlets, setOutlets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchOutlets()
  }, [])

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        type: product.type || "kiloan",
        price: product.price || "",
        outlet_id: product.outlet_id || "",
      })
    }
  }, [product])

  const fetchOutlets = async () => {
    try {
      const res = await outletService.getOutlets()
      setOutlets(res.data.data || [])
    } catch (err) {
      console.error("Failed to fetch outlets", err)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (product) {
        await productService.updateProduct(product.id, formData)
      } else {
        await productService.createProduct(formData)
      }
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={formData.type}
          onValueChange={(val) => handleChange("type", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kiloan">Per Kg</SelectItem>
            <SelectItem value="satuan">Per Item</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price (Rp)</Label>
        <Input
          id="price"
          type="number"
          value={formData.price}
          onChange={(e) => handleChange("price", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="outlet">Outlet</Label>
        <Select
          value={formData.outlet_id}
          onValueChange={(val) => handleChange("outlet_id", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select outlet" />
          </SelectTrigger>
          <SelectContent>
            {outlets.map((outlet) => (
              <SelectItem key={outlet.id} value={String(outlet.id)}>
                {outlet.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  )
}

export default ProductForm
