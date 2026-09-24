// Κατεβάζει ΟΛΑ τα φωτο/βίντεο από το Supabase Storage σε τοπικό φάκελο downloads/.
// Τρέξιμο:  npm run download
import { createClient } from '@supabase/supabase-js'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'uploads'
if (!url || !key) {
  console.error('❌ Λείπουν SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY στο .env.local')
  process.exit(1)
}
const sb = createClient(url, key, { auth: { persistSession: false } })

const { data: media, error } = await sb.from('media')
  .select('path, guest_name, kind, created_at').order('created_at', { ascending: true })
if (error) { console.error('❌', error.message); process.exit(1) }
if (!media?.length) { console.log('Καμία εγγραφή media — τίποτα να κατέβει.'); process.exit(0) }

mkdirSync('downloads', { recursive: true })
let ok = 0
for (const m of media) {
  const { data, error } = await sb.storage.from(BUCKET).download(m.path)
  if (error) { console.error('  ⚠️', m.path, error.message); continue }
  const buf = Buffer.from(await data.arrayBuffer())
  const base = m.path.split('/').pop()
  const who = (m.guest_name || 'anonymous').replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 40)
  const out = join('downloads', `${who}__${base}`)
  writeFileSync(out, buf)
  ok++
  console.log(`✅ ${out}`)
}
console.log(`\n📁 Κατέβηκαν ${ok}/${media.length} αρχεία στον φάκελο downloads/`)
