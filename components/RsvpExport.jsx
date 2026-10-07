'use client'
import * as XLSX from 'xlsx'

// Κατεβάζει τις απαντήσεις RSVP ως αρχείο Excel (.xlsx).
export default function RsvpExport({ rows, filename = 'rsvp.xlsx' }) {
  function download() {
    const data = rows.map((r) => ({
      'Καλεσμένος': r.name,
      'Απάντηση': r.attending ? 'Ναι' : 'Όχι',
      'Άτομα': r.attending ? r.num_guests : '',
      'Μήνυμα': r.message || '',
      'Ημ/νία': r.date || '',
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    ws['!cols'] = [{ wch: 28 }, { wch: 10 }, { wch: 8 }, { wch: 42 }, { wch: 20 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'RSVP')
    XLSX.writeFile(wb, filename)
  }

  return (
    <button type="button" className="btn" style={{ width: 'auto', margin: 0, padding: '9px 16px' }}
      onClick={download} disabled={!rows.length}>
      ⬇️ Excel
    </button>
  )
}
