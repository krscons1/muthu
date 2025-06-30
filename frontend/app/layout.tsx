import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarToggle } from "@/components/sidebar-toggle"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "M-Track - Professional Time Tracking",
  description: "Modern time tracking application for professionals",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-screen bg-gradient-primary">
            <AppSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <header className="border-b border-white/10 shadow-sm bg-transparent">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center space-x-4">
                    <SidebarToggle />
                    <h1 className="text-xl font-semibold text-white">
                      M-Track
                    </h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">U</span>
                    </div>
                  </div>
                </div>
              </header>
              <main className="flex-1 overflow-auto">
                <div className="container mx-auto p-6">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
