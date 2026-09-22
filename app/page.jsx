import { COUPLE } from '../lib/config'

export default function Home() {
  return (
    <main className="wrap">
      <h1>💍 {COUPLE.full} — δοκιμαστική αρχική</h1>
      <p>Χρήσιμα links για τοπική δοκιμή:</p>
      <div className="card">
        <p><a href="/party">/party</a> — η landing του QR (φωτο + κουίζ + ευχές)</p>
        <p><a href="/quiz">/quiz</a> — το κουίζ</p>
        <p><a href="/wishes">/wishes</a> — ευχές (guestbook)</p>
        <p><a href="/rsvp/demo-token">/rsvp/demo-token</a> — RSVP (τρέξε πρώτα <code>npm run seed</code>)</p>
        <p><a href="/admin?key=changeme">/admin?key=…</a> — dashboard ζευγαριού</p>
      </div>
    </main>
  )
}
