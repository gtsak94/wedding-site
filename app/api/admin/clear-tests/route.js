import { getAdminClient } from '../../../../lib/supabase'
import { UPLOAD } from '../../../../lib/config'

// Καθαρίζει ΟΛΕΣ τις συμμετοχές (φωτο/βίντεο, ευχές, σκορ, RSVP) — ΚΡΑΤΑΕΙ τους καλεσμένους.
export async function POST(req) {
  try {
    const { key } = await req.json()
    if (key !== (process.env.ADMIN_KEY || 'changeme')) {
      return Response.json({ error: 'unauthorized' }, { status: 401 })
    }
    const sb = getAdminClient()
    const NONE = '00000000-0000-0000-0000-000000000000'

    // πρώτα σβήσε τα αρχεία από το storage
    try {
      const { data: media } = await sb.from('media').select('path')
      const paths = (media || []).map((m) => m.path).filter(Boolean)
      if (paths.length) await sb.storage.from(UPLOAD.bucket).remove(paths)
    } catch {}

    await sb.from('media').delete().neq('id', NONE)
    await sb.from('wishes').delete().neq('id', NONE)
    await sb.from('quiz_scores').delete().neq('id', NONE)
    await sb.from('rsvps').delete().neq('id', NONE)

    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ error: String(e.message || e) }, { status: 500 })
  }
}
