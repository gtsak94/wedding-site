'use client'
import { useState } from 'react'
import { COUPLE } from '../../lib/config'
import Ornament from '../../components/Ornament'

export default function WishesPage() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle')

  async function submit() {
    if (!message.trim()) return
    setStatus('saving')
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      })
      setStatus(res.ok ? 'saved' : 'error')
    } catch (e) { setStatus('error') }
  }

  if (status === 'saved') {
    return (
      <main className="wrap">
        <div className="pagehead">
          <Ornament className="ornament" width={160} />
          <h1>Ευχαριστούμε! 💛</h1>
        </div>
        <div className="card"><p style={{ color: 'var(--ink)' }}>Η ευχή σου καταχωρήθηκε — {COUPLE.full} θα τη διαβάσουν.</p></div>
        <a className="btn secondary" href="/party">Πίσω στην αρχική</a>
      </main>
    )
  }

  return (
    <main className="wrap">
      <div className="pagehead">
        <Ornament className="ornament r r1" width={160} />
        <h1 className="r r2">Άφησε μια ευχή</h1>
        <p className="r r2">Δυο λόγια στους {COUPLE.full}.</p>
      </div>
      <div className="card r r3">
        <label>Το όνομά σου (προαιρετικό)</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="π.χ. Γιάννης & Μαρία" />
        <label>Η ευχή σου</label>
        <textarea rows="5" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Να ζήσετε! …" />
        <button className="btn" style={{ marginTop: 18 }} onClick={submit} disabled={status === 'saving'}>
          {status === 'saving' ? 'Αποστολή…' : 'Στείλε την ευχή'}
        </button>
        {status === 'error' && <p className="muted">Κάτι πήγε στραβά — δοκίμασε ξανά.</p>}
      </div>
    </main>
  )
}
