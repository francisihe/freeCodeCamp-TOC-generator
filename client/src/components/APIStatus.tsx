import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Loader2 } from "lucide-react"

interface StatusData {
  activePages: number
  availablePages: number
  isActive: boolean
  maxPages: number
  uptime: number
}

export function APIStatus() {
  const [status, setStatus] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/v1/status")
        const data = await response.json()
        setStatus(data.data)
        console.log("API Status:", data.data)
      } catch (error) {
        console.error("Error fetching API status:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!status) {
    return <div>Error fetching API status</div>
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Active Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{status.activePages}</div>
          <p className="text-sm text-muted-foreground">of {status.availablePages} available</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>API Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${status.isActive ? "text-green-500" : "text-red-500"}`}>
            {status.isActive ? "Active" : "Inactive"}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Uptime</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.floor(status.uptime / 60)} minutes</div>
          <p className="text-sm text-muted-foreground">{Math.floor(status.uptime % 60)} seconds</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Max Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{status.maxPages}</div>
        </CardContent>
      </Card>
    </div>
  )
}