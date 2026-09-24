'use client'
import { useState } from 'react'

// Κουμπί που αντιγράφει το προσωπικό link του καλεσμένου στο clipboard.
export default function CopyLink({ token, path = '/rsvp/' }) {
  const [done, setDone] = useState(false)

  async function copy() {
    const url = `${window.location.origin}${path}${token}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0'
      document.body.appendChild(ta); ta.focus(); ta.select()
      try { document.execCommand('copy') } catch {}
      document.body.removeChild(ta)
    }
    setDone(true)
    setTimeout(() => setDone(false), 1500)
  }

  return (
    <button type="button" className="copy-btn" onClick={copy} title="Αντιγραφή προσωπικού link">
      {done ? '✓' : '📋'}
    </button>
  )
}
