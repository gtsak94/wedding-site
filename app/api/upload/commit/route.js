import { getAdminClient } from '../../../../lib/supabase'

// Καταγράφει τα metadata του αρχείου ΜΕΤΑ το επιτυχές ανέβασμα στο storage.
export async function POST(req) {
  try {
    const { path, kind, guest_name, message, phase, size_bytes, mime } = await req.json()
    if (!path || !kind) {
      return Response.json({ error: 'bad request' }, { status: 400 })
    }
    const sb = getAdminClient()
    const { error } = await sb.from('media').insert({
      path,
      kind,
      guest_name: guest_name?.slice(0, 120) || null,
      message: message?.slice(0, 500) || null,
      phase: phase || null,
      size_bytes: size_bytes || null,
      mime: mime || null,
    })
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ error: 'server error' }, { status: 500 })
  }
}
