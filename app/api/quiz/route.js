import { getAdminClient } from '../../../lib/supabase'

export async function POST(req) {
  try {
    const { name, score, total } = await req.json()
    const sb = getAdminClient()
    const { error } = await sb.from('quiz_scores').insert({
      name: (name || 'Ανώνυμος').slice(0, 80),
      score: Number(score) || 0,
      total: Number(total) || 0,
    })
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ error: String(e.message || e) }, { status: 500 })
  }
}
