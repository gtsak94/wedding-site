'use client'
import { useState } from 'react'

export default function AdminManage({ adminKey }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [newLink, setNewLink] = useState('')

  async function addGuest() {
    if (!name.trim()) return
    setBusy(true); setNewLink('')
    try {
      const res = await fetch('/api/admin/add-guest', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: adminKey, name }),
      })
      const d = await res.json()
      if (res.ok) {
        setNewLink(`${window.location.origin}/rsvp/${d.token}`)
        setName('')
        setTimeout(() => location.reload(), 2500)
      } else alert('Σφάλμα: ' + (d.error || ''))
    } catch { alert('Σφάλμα δικτύου') }
    setBusy(false)
  }

  async function clearTests() {
    if (!confirm('Σίγουρα; Θα διαγραφούν ΟΛΕΣ οι φωτο/βίντεο, ευχές, σκορ και RSVP. Οι καλεσμένοι ΜΕΝΟΥΝ.')) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/clear-tests', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: adminKey }),
      })
      if (res.ok) location.reload(); else alert('Σφάλμα καθαρισμού')
    } catch { alert('Σφάλμα δικτύου') }
    setBusy(false)
  }

  return (
    <div className="card">
      <label>Προσθήκη καλεσμένου</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ονοματεπώνυμο" />
        <button className="btn" style={{ width: 'auto', margin: 0, padding: '0 18px', flex: 'none' }} onClick={addGuest} disabled={busy}>Προσθήκη</button>
      </div>
      {newLink && <p className="muted" style={{ marginTop: 8 }}>✅ Νέο link: <code>{newLink}</code> (αντίγραψέ το τώρα)</p>}

      <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '18px 0' }} />

      <button className="btn secondary" onClick={clearTests} disabled={busy}>🧹 Καθαρισμός δοκιμαστικών (κρατά τους καλεσμένους)</button>
      <p className="muted" style={{ marginTop: 6 }}>Σβήνει φωτο/βίντεο, ευχές, σκορ και RSVP — για καθαρό ξεκίνημα πριν τον γάμο.</p>
    </div>
  )
}
