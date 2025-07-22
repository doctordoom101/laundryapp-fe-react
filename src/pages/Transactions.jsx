"use client"

import { useState, useEffect } from "react"
import { Plus, Search, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { transactionService } from "../api/services"
import useAuthStore from "../stores/authStore"

const Transactions = () => {
  const { user } = useAuthStore()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await transactionService.getTransactions()
      setTransactions(response.data.data || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMethodBadge = (method) => {
    const methodConfig = {
      cash: { label: "Cash", variant: "success" },
      transfer: { label: "Transfer", variant: "default" },
      qris: { label: "QRIS", variant: "secondary" },
      lainnya: { label: "Other", variant: "outline" },
    }

    const config = methodConfig[method] || { label: method, variant: "secondary" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.laundry_item?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.laundry_item?.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const canCreateTransactions = user?.role === "admin" || user?.role === "petugas"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage payment transactions</p>
        </div>
        {canCreateTransactions && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by laundry code or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions List</CardTitle>
          <CardDescription>{filteredTransactions.length} transactions found</CardDescription>
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
                  <TableHead>Laundry Code</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Outlet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.laundry_item?.code}</TableCell>
                      <TableCell>{transaction.laundry_item?.customer_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Rp {transaction.amount?.toLocaleString("id-ID")}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getMethodBadge(transaction.method)}</TableCell>
                      <TableCell>{new Date(transaction.paid_at).toLocaleDateString("id-ID")}</TableCell>
                      <TableCell>{transaction.laundry_item?.outlet?.name}</TableCell>
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

export default Transactions
