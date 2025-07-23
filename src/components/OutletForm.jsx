"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { outletService } from "../api/services"

const OutletForm = ({ outlet, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
      name: "",
      address: "",
      phone: "",
    })
  
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
  
    // ✅ Update form saat outlet berubah (edit mode)
    useEffect(() => {
      if (outlet) {
        setFormData({
          name: outlet.name || "",
          address: outlet.address || "",
          phone: outlet.phone || "",
        })
      } else {
        setFormData({ name: "", address: "", phone: "" })
      }
    }, [outlet])
  
    const handleChange = (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  
    const handleSubmit = async (e) => {
      e.preventDefault()
      setError("")
      setLoading(true)
  
      try {
        if (outlet) {
          // Edit mode
          await outletService.updateOutlet(outlet.id, formData)
        } else {
          // Create mode
          await outletService.createOutlet(formData)
        }
        onSuccess()
      } catch (err) {
        setError(err.response?.data?.message || "Failed to save outlet")
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
          <Label htmlFor="name">Outlet Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>
  
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            required
          />
        </div>
  
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            required
          />
        </div>
  
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {outlet ? "Update" : "Submit"}
          </Button>
        </div>
      </form>
    )
  }

export default OutletForm
