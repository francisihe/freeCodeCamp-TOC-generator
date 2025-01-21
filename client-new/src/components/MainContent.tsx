import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "./ui/sidebar"
import { Separator } from "./ui/separator"
import { TOCExtractor } from "./TOCExtractor"
import { APIStatus } from "./APIStatus"

export function MainContent() {
  const [activeTab, setActiveTab] = useState<"extractor" | "status">("extractor")

  return (
    <SidebarInset className="flex-1 overflow-auto">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <nav className="flex space-x-4">
          <button
            className={`text-sm font-medium ${activeTab === "extractor" ? "text-primary" : "text-muted-foreground"}`}
            onClick={() => setActiveTab("extractor")}
          >
            TOC Extractor
          </button>
          <button
            className={`text-sm font-medium ${activeTab === "status" ? "text-primary" : "text-muted-foreground"}`}
            onClick={() => setActiveTab("status")}
          >
            API Status
          </button>
        </nav>
      </header>
      <main className="p-6">{activeTab === "extractor" ? <TOCExtractor /> : <APIStatus />}</main>
    </SidebarInset>
  )
}

