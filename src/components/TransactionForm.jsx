"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { transactionService, laundryService } from "../api/services"

export const TransactionForm = ({ onSuccess, onCancel }) => {
  const [laundryItems, setLaundryItems] = useState([])
  const [formData, setFormData] = useState({
    laundry_item_id: "",
    method: "cash",
    amount: "",
    paid_at: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
  })
  const [isLunas, setIsLunas] = useState(false)
  const [loading, setLoading] = useState(false)

  const selectedItem = laundryItems.find((item) => item.id === parseInt(formData.laundry_item_id))

  useEffect(() => {
    const fetchLaundryItems = async () => {
      try {
        const res = await laundryService.getLaundryItems({ per_page: 1000 })
        setLaundryItems(res.data.data || [])
      } catch (error) {
        console.error("Error fetching laundry items:", error)
      }
    }

    fetchLaundryItems()
  }, [])

  useEffect(() => {
    if (isLunas && selectedItem) {
      setFormData((prev) => ({
        ...prev,
        amount: selectedItem.total_price,
      }))
    }
  }, [isLunas, selectedItem])

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await transactionService.createTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
        laundry_item_id: parseInt(formData.laundry_item_id),
        paid_at: new Date(formData.paid_at).toISOString(),
      })
      onSuccess()
    } catch (error) {
      console.error("Failed to create transaction:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Laundry Item</Label>
        <Select
          value={formData.laundry_item_id}
          onValueChange={(val) => handleChange("laundry_item_id", val)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select laundry item" />
          </SelectTrigger>
          <SelectContent>
            {laundryItems.map((item) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.code} - {item.customer_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Payment Method</Label>
        <Select value={formData.method} onValueChange={(val) => handleChange("method", val)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="qris">QRIS</SelectItem>
            <SelectItem value="lainnya">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Mark as Paid in Full</Label>
        <div className="flex items-center gap-2">
          <Switch checked={isLunas} onCheckedChange={setIsLunas} />
          {isLunas && selectedItem && (
            <span className="text-sm text-muted-foreground">
              Amount set to Rp {selectedItem.total_price.toLocaleString("id-ID")}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Amount</Label>
        <Input
          type="number"
          value={formData.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          disabled={isLunas}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Paid At</Label>
        <Input
          type="datetime-local"
          value={formData.paid_at}
          onChange={(e) => handleChange("paid_at", e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit
        </Button>
      </div>
    </form>
  )
}
