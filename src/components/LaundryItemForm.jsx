"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { laundryService, productService } from "../api/services"

export const LaundryItemForm = ({ onSuccess, onCancel, item = null }) => {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    service_id: "",
    quantity: "",
    notes: "",
  })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProducts()
    if (item) {
      setFormData({
        customer_name: item.customer_name || "",
        customer_phone: item.customer_phone || "",
        service_id: item.service_id?.toString() || "",
        quantity: item.quantity?.toString() || "",
        notes: item.notes || "",
      })
    }
  }, [item])

  const fetchProducts = async () => {
    try {
      const response = await productService.getProducts()
      setProducts(response.data.data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        quantity: Number.parseFloat(formData.quantity),
        service_id: Number.parseInt(formData.service_id),
      }

      if (item) {
        // Update existing item (if needed)
        // await laundryService.updateLaundryItem(item.id, submitData)
      } else {
        // Create new item
        await laundryService.createLaundryItem(submitData)
      }

      onSuccess()
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save item")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer_name">Customer Name</Label>
          <Input
            id="customer_name"
            value={formData.customer_name}
            onChange={(e) => handleChange("customer_name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer_phone">Customer Phone</Label>
          <Input
            id="customer_phone"
            value={formData.customer_phone}
            onChange={(e) => handleChange("customer_phone", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="service_id">Service</Label>
          <Select value={formData.service_id} onValueChange={(value) => handleChange("service_id", value)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name} - Rp {product.price.toLocaleString("id-ID")} ({product.type}) | {product.outlet}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.quantity}
            onChange={(e) => handleChange("quantity", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Any special instructions..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {item ? "Update" : "Create"} Item
        </Button>
      </div>
    </form>
  )
}
