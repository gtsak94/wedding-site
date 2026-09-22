import './globals.css'
import { COUPLE } from '../lib/config'

export const metadata = {
  title: COUPLE.full,
  description: 'Πρόσκληση & αναμνήσεις',
}

export default function RootLayout({ children }) {
  return (
    <html lang="el">
      <body>{children}</body>
    </html>
  )
}
