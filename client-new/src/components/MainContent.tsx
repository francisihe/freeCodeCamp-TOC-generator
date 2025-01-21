import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "./ui/sidebar"
import { Separator } from "./ui/separator"
import { TOCExtractor } from "./TOCExtractor"
import { APIStatus } from "./APIStatus"
import { ExternalLink } from "lucide-react"

export function MainContent() {
  const [activeTab, setActiveTab] = useState<"extractor" | "status">("extractor")

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash === "status" || hash === "extractor") {
        setActiveTab(hash)
      }
    }

    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  return (
    <SidebarInset className="flex flex-col flex-1">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <nav className="flex space-x-4">
          <button
            className={`text-sm font-medium ${activeTab === "extractor" ? "text-primary" : "text-muted-foreground"}`}
            onClick={() => {
              setActiveTab("extractor")
              window.location.hash = "extractor"
            }}
          >
            TOC Extractor
          </button>
          <button
            className={`text-sm font-medium ${activeTab === "status" ? "text-primary" : "text-muted-foreground"}`}
            onClick={() => {
              setActiveTab("status")
              window.location.hash = "status"
            }}
          >
            API Status
          </button>
        </nav>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        {activeTab === "extractor" ? <TOCExtractor /> : <APIStatus />}
      </main>

      <footer className="border-t p-4 text-center text-sm">
        Built for{" "}
        <a
          href="https://www.freecodecamp.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          freeCodeCamp
        </a>{" "}
        by{" "}
        <a
          href="https://github.com/francisihe"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          Francis Ihejirika
          <ExternalLink className="h-3 w-3" />
        </a>
      </footer>
    </SidebarInset>
  )
}