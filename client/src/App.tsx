import { SidebarProvider } from "./components/ui/sidebar"
import { AppSidebar } from "./components/AppSidebar"
import { MainContent } from "./components/MainContent"
import { Toaster } from "./components/ui/toaster"

function App() {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                <AppSidebar />
                <MainContent />
                <Toaster />
            </div>
        </SidebarProvider>
    )
}

export default App