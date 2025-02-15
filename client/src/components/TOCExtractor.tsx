import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Textarea } from "./ui/textarea"
import { Loader2, Copy, Check } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { useToast } from "../hooks/use-toast"

const BULLET_POINTS = ['•', '○', '▪', '▫']

interface TOCItem {
  id: string
  text: string
  level: number
  link: string
}

export function TOCExtractor() {
  const { toast } = useToast()

  const [url, setUrl] = useState("")
  const [markdown, setMarkdown] = useState("")
  const [tocItems, setTocItems] = useState<TOCItem[]>([])
  const [loading, setLoading] = useState(false)
  const [copyingMarkdown, setCopyingMarkdown] = useState(false)
  const [copyingPreview, setCopyingPreview] = useState(false)

  const getMinLevel = (items: TOCItem[]) => {
    return Math.min(...items.map(item => item.level))
  }

  const getBulletPoint = (level: number, minLevel: number) => {
    const relativeLevel = level - minLevel
    return BULLET_POINTS[relativeLevel % BULLET_POINTS.length]
  }

  const extractHashFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
      return urlObj.hash || url
    } catch {
      // If URL parsing fails, return the original string if it starts with #
      return url.startsWith('#') ? url : '#' + url
    }
  }

  const generateIndentedMarkdown = (items: TOCItem[]) => {
    const minLevel = getMinLevel(items)
    return items.map(item => {
      const indent = '  '.repeat(item.level - minLevel)
      const hash = extractHashFromUrl(item.link)
      return `${indent}- [${item.text}](${hash})`
    }).join('\n')
  }

  const parseMarkdown = (markdown: string): TOCItem[] => {
    const lines = markdown.split('\n')
    return lines.map((line, index) => {
      const workingLine = line.replace(/\s+$/, '')
      if (!workingLine) return null

      const leadingSpaces = workingLine.match(/^\s*/)?.[0].length || 0
      const level = Math.floor(leadingSpaces / 2) + 1

      const linkMatch = workingLine.match(/^\s*-\s*\[(.*?)\]\((.*?)\).*$/)
      if (!linkMatch) return null

      const [, text, link] = linkMatch
      return {
        id: `toc-${index}`,
        text: text.trim(),
        level,
        link: link.trim()
      }
    }).filter((item): item is TOCItem => item !== null)
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

      if (!response.ok) {
        throw new Error(data.message || 'Failed to extract TOC')
      }

      const formattedMarkdown = generateIndentedMarkdown(data.data.tocItems)
      setMarkdown(formattedMarkdown)
      setTocItems(data.data.tocItems)
    } catch (error) {
      console.error("Error extracting TOC:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to extract table of contents",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdown(newMarkdown)
    const newTocItems = parseMarkdown(newMarkdown)
    setTocItems(newTocItems)
  }

  const getPreviewText = () => {
    if (tocItems.length === 0) return ""
    const minLevel = getMinLevel(tocItems)
    
    const lines = tocItems.map(item => {
      const level = item.level - minLevel
      const bullet = getBulletPoint(item.level, minLevel)
      // const indent = '\u00A0\u00A0\u00A0\u00A0'.repeat(level)
      const hash = extractHashFromUrl(item.link)
      
      return `<p class="m-0 whitespace-nowrap overflow-hidden text-ellipsis" style="padding-left: ${level * 1.5}rem">
        <span class="inline-block min-w-[1em]">${bullet}</span>
        <a href="${hash}" class="inline-block">${item.text}</a>
      </p>`
    })
  
    return `<div class="space-y-1">${lines.join('')}</div>`
  }
  
  const copyToClipboard = async (text: string, type: 'markdown' | 'preview') => {
    const setState = type === 'markdown' ? setCopyingMarkdown : setCopyingPreview
  
    try {
      setState(true)
      
      if (type === 'preview') {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = text
        
        const plainText = tocItems.map(item => {
          const level = item.level - getMinLevel(tocItems)
          const bullet = getBulletPoint(item.level, getMinLevel(tocItems))
          const indent = '    '.repeat(level)
          const hash = extractHashFromUrl(item.link)
          return `${indent}${bullet} ${item.text} ${hash}`
        }).join('\n')
  
        const clipboardItem = new ClipboardItem({
          'text/html': new Blob([tempDiv.outerHTML], { type: 'text/html' }),
          'text/plain': new Blob([plainText], { type: 'text/plain' })
        })
        
        await navigator.clipboard.write([clipboardItem])
      } else {
        // For markdown copying
        const hashOnlyMarkdown = tocItems.map(item => {
          const level = item.level - getMinLevel(tocItems)
          const indent = '  '.repeat(level)
          const hash = extractHashFromUrl(item.link)
          return `${indent}- [${item.text}](${hash})`
        }).join('\n')
        
        await navigator.clipboard.writeText(hashOnlyMarkdown)
      }
  
      toast({
        title: "Copied!",
        description: `${type === 'markdown' ? 'Markdown' : 'Preview'} copied to clipboard`,
      })
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy to clipboard",
      })
    } finally {
      setTimeout(() => setState(false), 2000)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 md:w-contain">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Extract Table of Contents</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyToClipboard(markdown, 'markdown')}
            disabled={!markdown || copyingMarkdown}
          >
            {copyingMarkdown ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="ml-2">Copy</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              type="url"
              placeholder="Enter article URL"
              value={url}
              onChange={(e) => setUrl(e.target.value.trim())}
            />
            <Button onClick={extractTOC} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Extract"}
            </Button>
          </div>
          <Textarea
            className="mt-4 h-[calc(100vh-300px)] font-mono"
            placeholder="Markdown content will appear here..."
            value={markdown}
            onChange={(e) => handleMarkdownChange(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Preview</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyToClipboard(getPreviewText(), 'preview')}
            disabled={!tocItems.length || copyingPreview}
          >
            {copyingPreview ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="ml-2">Copy</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert h-[calc(100vh-250px)] overflow-auto">
            {tocItems.length > 0 && (
              <div className="space-y-1">
                {tocItems.map((item) => (
                  <div
                    key={item.id}
                    className="whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ paddingLeft: `${(item.level - getMinLevel(tocItems)) * 1.5}rem` }}
                  >
                    <span className="inline-block min-w-[1em]">
                      {getBulletPoint(item.level, getMinLevel(tocItems))}
                    </span>
                    <a
                      href={extractHashFromUrl(item.link)}
                      className="inline-block text-gray-900 hover:text-blue-600 no-underline hover:underline"
                    >
                      {item.text}
                    </a>
                  </div>
                ))}
              </div>
            )}
            {!tocItems.length && <ReactMarkdown>{markdown}</ReactMarkdown>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TOCExtractor