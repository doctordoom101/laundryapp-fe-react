"use client"
import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShirtIcon, Loader2, Search } from "lucide-react"
import useAuthStore from "../stores/authStore"

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      await login(credentials)
      navigate(from, { replace: true })
    } catch (error) {
      setError(error.response?.data?.message || "Login failed")
    }
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShirtIcon className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Sign in Laundry Staffs</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the laundry management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={credentials.username}
                onChange={handleChange}
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>

          {/* Status Check Link */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            <Link to="/check-status" className="mt-4 block">
              <Button variant="outline" className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Check Your Laundry Status
              </Button>
            </Link>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Demo accounts:</p>
            <p>Admin: admin / password</p>
            <p>Petugas: petugas / password</p>
            <p>Owner: owner / password</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login