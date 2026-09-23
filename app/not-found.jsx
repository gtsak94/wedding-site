import Ornament from '../components/Ornament'
import { COUPLE } from '../lib/config'

export const metadata = { title: `Δεν βρέθηκε — ${COUPLE.full}` }

export default function NotFound() {
  return (
    <main className="wrap">
      <div className="pagehead">
        <Ornament className="ornament r r1" width={150} />
        <h1 className="r r2">Ουπς…</h1>
        <p className="muted r r2">Αυτή η σελίδα δεν υπάρχει.</p>
      </div>
      <div className="footer r r3"><a href="/">← Στην αρχική</a></div>
    </main>
  )
}
