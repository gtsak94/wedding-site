'use client'

// Μικρό κουμπί διαγραφής. Καλεί το endpoint με το ADMIN_KEY + payload και κάνει reload.
export default function AdminDelete({ adminKey, endpoint, payload, confirmText, label = '✕', className = 'del-btn' }) {
  async function del() {
    if (!confirm(confirmText || 'Διαγραφή;')) return
    try {
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: adminKey, ...payload }),
      })
      if (res.ok) location.reload(); else alert('Σφάλμα διαγραφής')
    } catch { alert('Σφάλμα δικτύου') }
  }
  return <button type="button" onClick={del} className={className} title="Διαγραφή">{label}</button>
}
