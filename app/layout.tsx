import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { PwaRegister } from '@/components/pwa-register'
import './globals.css'
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes' // <-- ADD THIS

export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // Add suppressHydrationWarning and remove hardcoded dark class
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          offset="80px"
          toastOptions={{
            className:
              'w-[calc(100vw-32px)] max-w-sm rounded-2xl shadow-lg md:w-auto md:min-w-[360px] md:max-w-md',
          }}
        />
        <PwaRegister />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
