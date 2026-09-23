import './globals.css'
import { COUPLE } from '../lib/config'

export const metadata = {
  title: COUPLE.full,
  description: 'Πρόσκληση & αναμνήσεις',
  // Ιδιωτικό site γάμου — να μη φαίνεται σε μηχανές αναζήτησης.
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }) {
  return (
    <html lang="el">
      <body>{children}</body>
    </html>
  )
}
