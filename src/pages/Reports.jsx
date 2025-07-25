"use client"

import { useState, useEffect } from "react"
import { Download, TrendingUp, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { reportService, outletService } from "../api/services"
import html2pdf from "html2pdf.js"

const Reports = () => {
  const [outlets, setOutlets] = useState([])
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: "daily",
    date: new Date().toISOString().split("T")[0],
    outlet_id: "all", // Updated default value to 'all'
  })

  const fetchOutlets = async () => {
    try {
      const response = await outletService.getOutlets()
      const outletData = response.data.data || response.data || []  // handle berbagai kemungkinan
      setOutlets(Array.isArray(outletData) ? outletData : [])
    } catch (error) {
      console.error("Failed to fetch outlets:", error)
      setOutlets([]) // fallback ke array kosong agar tidak error .map
    }
  }

  const fetchReport = async () => {
    try {
      setLoading(true)
      console.log('Filters being sent:', filters) // Debug
      const response = await reportService.getReports({
        ...filters,
        outlet_id: filters.outlet_id === 'all' ? undefined : filters.outlet_id,
      })
      console.log('API Response:', response) // Debug
      setReportData(response.data)
    } catch (error) {
      console.error("Error fetching report:", error)
      setReportData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
    fetchOutlets()
  }, [filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleGenerateReport = () => {
    fetchReport()
  }

  const handleExportPdf = () => {
    const element = document.getElementById("report-section")
    if (!element) return
  
  const options = {
      margin:       0.5,
      filename:     `report-${filters.type}-${filters.date}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
    }
  
    html2pdf().set(options).from(element).save()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate and view business reports</p>
        </div>
        <Button variant="outline" onClick={handleExportPdf}>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Configure your report parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Report Type</Label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outlet">Outlet (Optional)</Label>
              <Select value={filters.outlet_id} onValueChange={(value) => handleFilterChange("outlet_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All outlets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outlets</SelectItem>
                  {outlets.map((outlet) => (
                    <SelectItem key={outlet.id} value={String(outlet.id)}>
                      {outlet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleGenerateReport} disabled={loading}>
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <div id="report-section" className="space-y-6 mt-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.statistics?.total_items || 0}</div>
                <p className="text-xs text-muted-foreground">Items processed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Rp {reportData.statistics?.total_revenue?.toLocaleString("id-ID") || 0}
                </div>
                <p className="text-xs text-muted-foreground">Total earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Rp {reportData.statistics?.total_paid?.toLocaleString("id-ID") || 0}
                </div>
                <p className="text-xs text-muted-foreground">Payments received</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <DollarSign className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Rp {reportData.statistics?.outstanding?.toLocaleString("id-ID") || 0}
                </div>
                <p className="text-xs text-muted-foreground">Pending payments</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Report */}
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
              <CardDescription>
                {reportData.period} report for {reportData.date}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.items?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No data found for the selected period</p>
                ) : (
                  <div className="space-y-2">
                    {reportData.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.code}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.customer_name} - {item.service}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Rp {Number(item.total_price).toLocaleString("id-ID")}</p>
                          <p className="text-sm text-muted-foreground">
                            Paid: Rp {Number(item.paid_amount).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Reports
