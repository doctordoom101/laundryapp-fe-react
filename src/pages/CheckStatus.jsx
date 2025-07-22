"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { laundryService } from "../api/services"

const CheckStatus = () => {
  const [code, setCode] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await laundryService.checkStatus(code.trim())
      setResult(response.data)
    } catch (error) {
      setError(error.response?.data?.message || "Item not found")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      antri: { label: "In Queue", variant: "secondary", description: "Your item is waiting to be processed" },
      proses: { label: "Processing", variant: "default", description: "Your item is currently being processed" },
      selesai: { label: "Completed", variant: "success", description: "Your item is ready for pickup" },
    }

    return statusConfig[status] || { label: status, variant: "secondary", description: "Status unknown" }
  }

  const getPaymentBadge = (status) => {
    const statusConfig = {
      belum_bayar: { label: "Unpaid", variant: "destructive", description: "Payment is required" },
      dp: { label: "Partial Payment", variant: "secondary", description: "Partial payment received" },
      lunas: { label: "Paid", variant: "success", description: "Payment completed" },
    }

    return statusConfig[status] || { label: status, variant: "secondary", description: "Payment status unknown" }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted px-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Check Laundry Status</h1>
          <p className="text-muted-foreground mt-2">Enter your laundry code to check the current status</p>
        </div>
  
        <Card>
          <CardHeader>
            <CardTitle>Enter Laundry Code</CardTitle>
            <CardDescription>Your laundry code should look like: LND250115001</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter your laundry code..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="text-center text-lg font-mono"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
  
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
  
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Laundry Status</CardTitle>
              <CardDescription>Status for code: {result.code}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {result.customer_name}</p>
                    <p><span className="font-medium">Service:</span> {result.service}</p>
                    <p><span className="font-medium">Date:</span> {new Date(result.created_at).toLocaleDateString("id-ID")}</p>
                  </div>
                </div>
  
                <div>
                  <h3 className="font-semibold mb-2">Status Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Process Status:</p>
                      <Badge variant={getStatusBadge(result.process_status).variant}>
                        {getStatusBadge(result.process_status).label}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getStatusBadge(result.process_status).description}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Payment Status:</p>
                      <Badge variant={getPaymentBadge(result.payment_status).variant}>
                        {getPaymentBadge(result.payment_status).label}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getPaymentBadge(result.payment_status).description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
  
              {result.process_status === "selesai" && (
                <Alert>
                  <AlertDescription>
                    🎉 Great news! Your laundry is ready for pickup. Please bring this code when collecting your items.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )  
}

export default CheckStatus
