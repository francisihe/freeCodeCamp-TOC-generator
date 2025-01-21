import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Textarea } from "./ui/textarea"
import { Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"

const BULLET_POINTS = ['•', '○', '▪', '▫']

interface TOCItem {
  id: string
  text: string
  level: number
  link: string
}

export function TOCExtractor() {
  const [url, setUrl] = useState("")
  const [markdown, setMarkdown] = useState("")
  const [tocItems, setTocItems] = useState<TOCItem[]>([])
  const [loading, setLoading] = useState(false)

  const getMinLevel = (items: TOCItem[]) => {
    return Math.min(...items.map(item => item.level))
  }

  const getBulletPoint = (level: number, minLevel: number) => {
    const relativeLevel = level - minLevel
    return BULLET_POINTS[relativeLevel % BULLET_POINTS.length]
  }

  const parseMarkdown = (markdown: string): TOCItem[] => {
    return markdown.split('\n')
      .map((line, index) => {
        const match = line.match(/^(\s*)-\s*\[(.*?)\]\((.*?)\)$/)
        if (!match) return null

        const [, indent, text, link] = match
        const level = (indent.length / 2) + 1

        return {
          id: `toc-${index}`,
          text,
          level,
          link
        }
      })
      .filter((item): item is TOCItem => item !== null)
  }

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
      setMarkdown(data.data.tocItems.map((item: TOCItem) => `- [${item.text}](${item.link})`).join('\n'))
      setTocItems(data.data.tocItems)
    } catch (error) {
      console.error("Error extracting TOC:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdown(newMarkdown)
    setTocItems(parseMarkdown(newMarkdown))
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 md:w-contain">
      <Card>
        <CardHeader>
          <CardTitle>Extract Table of Contents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              type="url"
              placeholder="Enter article URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button onClick={extractTOC} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Extract"}
            </Button>
          </div>
          <Textarea
            className="mt-4 h-[calc(100vh-300px)]"
            placeholder="Markdown content will appear here..."
            value={markdown}
            onChange={(e) => handleMarkdownChange(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert h-[calc(100vh-250px)] overflow-auto">
            {tocItems.length > 0 && (() => {
              const minLevel = getMinLevel(tocItems)
              return (
                <div className="space-y-1">
                  {tocItems.map((item) => (
                    <div
                      key={item.id}
                      style={{ paddingLeft: `${(item.level - minLevel) * 1.5}rem` }}
                    // className="font-mono"
                    >
                      <a
                        href={item.link}
                        className="text-gray-900 hover:text-blue-600 no-underline hover:underline"
                      >
                        {getBulletPoint(item.level, minLevel)} {item.text}
                      </a>
                    </div>
                  ))}
                </div>
              )
            })()}
            {!tocItems.length && <ReactMarkdown>{markdown}</ReactMarkdown>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}