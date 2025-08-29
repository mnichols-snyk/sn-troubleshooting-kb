import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/auth-provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Snyk ServiceNow Troubleshooting Knowledge Base',
  description: 'A comprehensive knowledge base for Snyk ServiceNow integration troubleshooting',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-slate-900 text-gray-200`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
