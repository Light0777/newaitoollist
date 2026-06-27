import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "next-themes"
import { SidebarProvider } from "@/lib/sidebar-context"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const baseUrl = "https://newaitoollist.com"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "newaitoollist.com - Discover New AI Tools",
    template: "%s | newaitoollist.com",
  },
  description:
    "Discover the latest AI tools for every task. Browse, search, and find the perfect AI tool for your needs.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "newaitoollist.com",
    title: "newaitoollist.com - Discover New AI Tools",
    description:
      "Discover the latest AI tools for every task. Browse, search, and find the perfect AI tool for your needs.",
    images: [
      {
        url: `${baseUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "NewAIToolList",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "newaitoollist.com - Discover New AI Tools",
    description:
      "Discover the latest AI tools for every task. Browse, search, and find the perfect AI tool for your needs.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
