import { getAdminClient, resolveGuest } from '../../../lib/supabase'

export async function POST(req) {
  try {
    const { token, name, message } = await req.json()
    if (!message || !message.trim()) {
      return Response.json({ error: 'empty' }, { status: 400 })
    }
    const sb = getAdminClient()
    const guest = await resolveGuest(sb, token)
    const { error } = await sb.from('wishes').insert({
      guest_id: guest?.id || null,
      name: guest?.name || (name || 'Ανώνυμος').slice(0, 80),
      message: message.trim().slice(0, 2000),
    })
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ error: String(e.message || e) }, { status: 500 })
  }
}
