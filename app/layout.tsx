import React from "react"
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'Nexobot',
  description: 'Professional analytics and management dashboard',
  icons: {
    // Ganti '/logo.png' dengan nama file logo Anda yang ada di folder public
    icon: '/logo.png',

    // Opsional: Jika ingin logo yang sama juga dipakai untuk bookmark di iPhone/iPad
    apple: '/logo.png',
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
        className="font-sans antialiased bg-white text-foreground"
        suppressHydrationWarning // INI KUNCINYA agar error extension browser hilang
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}