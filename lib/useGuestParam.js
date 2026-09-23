'use client'
import { useState, useEffect } from 'react'

// Διαβάζει το ?t=<token>&n=<όνομα> από το URL (όταν ο καλεσμένος μπαίνει από το
// προσωπικό του link). token = ταυτοποίηση (server-side), name = μόνο για εμφάνιση.
export function useGuestParam() {
  const [g, setG] = useState({ token: '', name: '' })
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search)
      setG({ token: p.get('t') || '', name: p.get('n') || '' })
    } catch {}
  }, [])
  return g
}
