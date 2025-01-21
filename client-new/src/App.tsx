import { SidebarProvider } from "./components/ui/sidebar"
import { AppSidebar } from "./components/AppSidebar"
import { MainContent } from "./components/MainContent"

function App() {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                <AppSidebar />
                <MainContent />
            </div>
        </SidebarProvider>
    )
}

export default App