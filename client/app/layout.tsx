import type { Metadata } from 'next'
import './globals.css'
import { QueryProvider } from '@/components/providers'

export const metadata: Metadata = {
  title: 'Cek Resi - Tracking Paket Indonesia',
  description: 'Lacak paket dari berbagai kurir Indonesia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
