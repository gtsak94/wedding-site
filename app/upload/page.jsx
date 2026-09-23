'use client'
import { useState, useRef } from 'react'
import { COUPLE, UPLOAD } from '../../lib/config'
import Ornament from '../../components/Ornament'
import { useGuestParam } from '../../lib/useGuestParam'

// Συμπίεση εικόνας στον browser με canvas (χωρίς εξωτερική βιβλιοθήκη).
async function compressImage(file) {
  try {
    const bitmap = await createImageBitmap(file)
    const max = UPLOAD.compressMaxDim
    let { width, height } = bitmap
    if (width > max || height > max) {
      const s = Math.min(max / width, max / height)
      width = Math.round(width * s)
      height = Math.round(height * s)
    }
    const canvas = document.createElement('canvas')
    canvas.width = width; canvas.height = height
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
    const blob = await new Promise((res) =>
      canvas.toBlob(res, 'image/jpeg', UPLOAD.compressQuality)
    )
    if (blob && blob.size < file.size) return blob
    return file
  } catch {
    return file // αν αποτύχει η συμπίεση, ανεβάζουμε το πρωτότυπο
  }
}

function humanMB(bytes) { return (bytes / 1048576).toFixed(1) }

export default function UploadPage() {
  const { token, name: guestName } = useGuestParam()
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [phase, setPhase] = useState('during')
  const [items, setItems] = useState([])   // {file, status, kind, error}
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(0)
  const inputRef = useRef(null)

  function pick(e) {
    const files = Array.from(e.target.files || [])
    const mapped = files.map((file) => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      let error = null
      if (!isImage && !isVideo) error = 'Δεκτά μόνο εικόνες/βίντεο'
      else if (isImage && file.size > UPLOAD.imageMaxMB * 1048576) error = `Μεγάλη εικόνα (>${UPLOAD.imageMaxMB}MB)`
      else if (isVideo && file.size > UPLOAD.videoMaxMB * 1048576) error = `Μεγάλο βίντεο (>${UPLOAD.videoMaxMB}MB)`
      return { file, kind: isImage ? 'image' : 'video', status: error ? 'error' : 'ready', error }
    })
    setItems(mapped)
    setDone(0)
  }

  async function uploadOne(it) {
    let body = it.file
    let mime = it.file.type
    if (it.kind === 'image') {
      const blob = await compressImage(it.file)
      body = blob
      mime = blob.type || mime
    }
    // 1) ζήτα signed URL
    const signRes = await fetch('/api/upload/sign', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ filename: it.file.name, contentType: mime }),
    })
    const sign = await signRes.json()
    if (!signRes.ok) throw new Error(sign.error || 'sign failed')

    // 2) ανέβασε ΚΑΤΕΥΘΕΙΑΝ στο storage
    const put = await fetch(sign.signedUrl, {
      method: 'PUT', headers: { 'content-type': mime }, body,
    })
    if (!put.ok) throw new Error('upload failed')

    // 3) κατέγραψε metadata
    await fetch('/api/upload/commit', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        path: sign.path, kind: it.kind,
        token: token || undefined,
        guest_name: token ? undefined : name,
        message, phase, size_bytes: body.size, mime,
      }),
    })
  }

  async function submit() {
    const ready = items.filter((i) => i.status !== 'error')
    if (!ready.length) return
    setBusy(true)
    let ok = 0
    const next = [...items]
    for (let i = 0; i < next.length; i++) {
      if (next[i].status === 'error') continue
      next[i] = { ...next[i], status: 'uploading' }; setItems([...next])
      try {
        await uploadOne(next[i])
        next[i] = { ...next[i], status: 'ok' }; ok++
      } catch (e) {
        next[i] = { ...next[i], status: 'error', error: 'Απέτυχε — δοκίμασε ξανά' }
      }
      setItems([...next]); setDone(ok)
    }
    setBusy(false)
  }

  const readyCount = items.filter((i) => i.status === 'ready').length
  const okCount = items.filter((i) => i.status === 'ok').length
  const allDone = items.length > 0 && items.every((i) => i.status === 'ok' || i.status === 'error') && !busy

  return (
    <main className="wrap">
      <div className="pagehead">
        <Ornament className="ornament r r1" width={150} />
        <h1 className="r r2">Μοιράσου τις στιγμές</h1>
        <p className="muted r r2">Οι φωτογραφίες & τα βίντεό σου πάνε κατευθείαν στο {COUPLE.a} & {COUPLE.b}.</p>
      </div>

      <div className="card r r3">
        {token ? (
          <p className="muted" style={{ marginTop: 0 }}>Ανεβάζεις ως <strong style={{ color: 'var(--ink)' }}>{guestName || 'καλεσμένος'}</strong> 🤍</p>
        ) : (
          <>
            <label>Το όνομά σου (προαιρετικό)</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="π.χ. Μαρία" />
          </>
        )}

        <label>Δυο λόγια μαζί με τις φωτο (προαιρετικό)</label>
        <textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Μια ανάμνηση, μια ευχή…" />

        <label>Πότε τραβήχτηκαν;</label>
        <div className="radio-row">
          <label><input type="radio" name="phase" checked={phase === 'before'} onChange={() => setPhase('before')} /><span>Πριν τον γάμο</span></label>
          <label><input type="radio" name="phase" checked={phase === 'during'} onChange={() => setPhase('during')} /><span>Στον γάμο</span></label>
        </div>

        <label>Αρχεία</label>
        <input ref={inputRef} type="file" accept="image/*,video/*" multiple onChange={pick} />
        <p className="muted" style={{ marginTop: 6 }}>
          Εικόνες έως {UPLOAD.imageMaxMB}MB, βίντεο έως {UPLOAD.videoMaxMB}MB. Οι εικόνες συμπιέζονται αυτόματα.
        </p>

        {items.length > 0 && (
          <ul className="filelist">
            {items.map((it, i) => (
              <li key={i} className={'fi ' + it.status}>
                <span className="fi-ic">{it.kind === 'video' ? '🎬' : '🖼️'}</span>
                <span className="fi-nm">{it.file.name}</span>
                <span className="fi-st">
                  {it.status === 'ready' && `${humanMB(it.file.size)}MB`}
                  {it.status === 'uploading' && '…'}
                  {it.status === 'ok' && '✓'}
                  {it.status === 'error' && (it.error || '✗')}
                </span>
              </li>
            ))}
          </ul>
        )}

        {!allDone && (
          <button className="btn" onClick={submit} disabled={busy || readyCount === 0}>
            {busy ? `Ανέβασμα… (${done}/${readyCount})` : `Ανέβασε ${readyCount || ''}`.trim()}
          </button>
        )}

        {allDone && (
          <div className="result" style={{ marginTop: 10 }}>
            <div className="emoji">💚</div>
            <div className="rt">Ευχαριστούμε!</div>
            <p className="muted">Ανέβηκαν {okCount} αρχεία. Θες να προσθέσεις κι άλλα;</p>
            <button className="btn secondary" onClick={() => { setItems([]); setDone(0); if (inputRef.current) inputRef.current.value = '' }}>
              Ανέβασε κι άλλα
            </button>
          </div>
        )}
      </div>

      <div className="footer r r3"><a href={token ? `/rsvp/${token}` : '/party'}>← Πίσω</a></div>
    </main>
  )
}
