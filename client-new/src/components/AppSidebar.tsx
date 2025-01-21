import { Command, BookOpen, Activity, Linkedin, Mail, Twitter } from "lucide-react"
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar"
import { Card, CardContent } from "./ui/card"

export function AppSidebar() {
    return (
        <Sidebar variant="inset" className="flex flex-col">
            <div className="flex-1">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <a href="#">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <Command className="size-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">FCC TOC Extractor</span>
                                        <span className="truncate text-xs">v1.0.0</span>
                                    </div>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() => window.location.hash = 'extractor'}
                                className="cursor-pointer"
                            >
                                <BookOpen className="mr-2 h-4 w-4" />
                                <span>TOC Extractor</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() => window.location.hash = 'status'}
                                className="cursor-pointer"
                            >
                                <Activity className="mr-2 h-4 w-4" />
                                <span>API Status</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
            </div>

            <div className="p-4 mt-auto">
                <Card className="bg-muted/50">
                    <CardContent className="p-4 space-y-4">
                        <div className="text-sm font-medium">Built by Francis Ihejirika</div>
                        <div className="flex gap-3">
                            <a
                                href="https://twitter.com/francisihej"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a
                                href="https://linkedin.com/in/francis-ihejirika"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Linkedin className="h-4 w-4" />
                            </a>
                            <a
                                href="mailto:francisihejirikadev@gmail.com"
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Mail className="h-4 w-4" />
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Sidebar>
    )
}