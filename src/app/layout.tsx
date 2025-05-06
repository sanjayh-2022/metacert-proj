import type { Metadata } from 'next'
import { Josefin_Sans } from 'next/font/google'
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import Providers from './components/Providers'

const Josefin = Josefin_Sans({ weight: ['400'], subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MetaCert',
  description: 'Educational credentials on your wallet',
  icons: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      url: 'icon2.ico',
      media: '(prefers-color-scheme: dark)',
    },
    {
      rel: 'icon',
      type: 'image/x-icon',
      url: 'icon.ico',
      media: '(prefers-color-scheme: light)',
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${Josefin.className} bg-stone-700`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
