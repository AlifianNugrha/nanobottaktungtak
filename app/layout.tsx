import React from "react"
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'Nanobot By NanoArtif',
  description: 'Professional analytics and management dashboard',
  icons: {
    // Ganti '/logo.png' dengan nama file logo Anda yang ada di folder public
    icon: '/LOGOS.png',

    // Opsional: Jika ingin logo yang sama juga dipakai untuk bookmark di iPhone/iPad
    apple: '/LOGOS.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // TAMBAHKAN suppressHydrationWarning di sini
    <html lang="en" className={`${jakartaSans.variable}`} suppressHydrationWarning>
      <body
        className="font-sans antialiased text-foreground"
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}