import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Textarea } from "./ui/textarea"
import { Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"

export function TOCExtractor() {
  const [url, setUrl] = useState("")
  const [markdown, setMarkdown] = useState("")
  const [loading, setLoading] = useState(false)

  const extractTOC = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/v1/extract-toc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ previewUrl: url }),
      })
      const data = await response.json()
      setMarkdown(data.content)
    } catch (error) {
      console.error("Error extracting TOC:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Extract Table of Contents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input type="url" placeholder="Enter article URL" value={url} onChange={(e) => setUrl(e.target.value)} />
            <Button onClick={extractTOC} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Extract"}
            </Button>
          </div>
          <Textarea
            className="mt-4 h-[calc(100vh-300px)]"
            placeholder="Markdown content will appear here..."
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert h-[calc(100vh-250px)] overflow-auto">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

