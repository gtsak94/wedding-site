'use client'
import { useState } from 'react'

export default function RsvpForm({ token, existing }) {
  const [attending, setAttending] = useState(
    existing ? String(existing.attending) : ''
  )
  const [numGuests, setNumGuests] = useState(existing?.num_guests || 1)
  const [message, setMessage] = useState(existing?.message || '')
  const [status, setStatus] = useState(existing ? 'saved' : 'idle')

  async function submit() {
    if (attending === '') return
    setStatus('saving')
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          attending: attending === 'true',
          num_guests: Number(numGuests),
          message,
        }),
      })
      setStatus(res.ok ? 'saved' : 'error')
    } catch (e) {
      setStatus('error')
    }
  }

  return (
    <div className="card">
      <label>Θα παρευρεθείς;</label>
      <div className="radio-row">
        <label>
          <input type="radio" name="att" checked={attending === 'true'} onChange={() => setAttending('true')} />
          <span>✅ Ναι</span>
        </label>
        <label>
          <input type="radio" name="att" checked={attending === 'false'} onChange={() => setAttending('false')} />
          <span>🙁 Όχι</span>
        </label>
      </div>

      {attending === 'true' && (
        <>
          <label>Πόσα άτομα (μαζί με εσένα);</label>
          <input type="number" min="1" max="10" value={numGuests}
            onChange={(e) => setNumGuests(e.target.value)} />
        </>
      )}

      <label>Μήνυμα προς το ζευγάρι (προαιρετικό)</label>
      <textarea rows="3" value={message} onChange={(e) => setMessage(e.target.value)} />

      <button className="btn" style={{ marginTop: 16 }} onClick={submit} disabled={status === 'saving'}>
        {status === 'saving' ? 'Αποθήκευση…' : existing ? 'Ενημέρωση απάντησης' : 'Στείλε την απάντηση'}
      </button>

      {status === 'saved' && <p className="muted">Καταχωρήθηκε — ευχαριστούμε! Μπορείς να αλλάξεις την απάντηση όποτε θες.</p>}
      {status === 'error' && <p className="muted">Κάτι πήγε στραβά. Δοκίμασε ξανά.</p>}
    </div>
  )
}
