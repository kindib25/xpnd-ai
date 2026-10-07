import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { PwaRegister } from '@/components/pwa-register'
import './globals.css'
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from '@/components/ui/sonner'

export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: 'Xpnd AI',
  description: 'Track, analyze, and optimize your expenses with AI-powered insights. Smart budgeting made simple.',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      {
        url: '/xpnd-ai-icon.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/xpnd-ai-icon.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/xpnd-ai-icon.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/xpnd-ai-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {children}
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
