import type { Metadata, Viewport } from 'next'
import { Poppins, IBM_Plex_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
});
const _ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex'
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0ea5e9'
}

export const metadata: Metadata = {
  title: {
    default: 'Paras Pharmacy Supplier',
    template: '%s | Paras Pharmacy Supplier'
  },
  description: 'Premium pharmaceutical supplier in Toronto, Canada. Order medications, track shipments, and manage your pharmacy needs.',
  generator: 'v0.app',
  icons: {
    icon: '/favicon.png',
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_poppins.variable} ${_ibmPlexSans.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
