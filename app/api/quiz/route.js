import { getAdminClient, resolveGuest } from '../../../lib/supabase'

export async function POST(req) {
  try {
    const { token, name, score, total } = await req.json()
    const sb = getAdminClient()
    const guest = await resolveGuest(sb, token)
    const { error } = await sb.from('quiz_scores').insert({
      guest_id: guest?.id || null,
      name: guest?.name || (name || 'Ανώνυμος').slice(0, 80),
      score: Number(score) || 0,
      total: Number(total) || 0,
    })
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ error: String(e.message || e) }, { status: 500 })
  }
}
