import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0F172A',
}

export const metadata: Metadata = {
  title: 'Gaming Hub - Juegos Multijugador en Tiempo Real',
  description: 'Tu portal de juegos multijugador. Juega con amigos juegos como Codigo Secreto, Impostor y muchos mas.',
  keywords: ['juegos', 'multijugador', 'amigos', 'fiesta', 'online', 'impostor', 'codigo secreto'],
  authors: [{ name: 'Gaming Hub' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
