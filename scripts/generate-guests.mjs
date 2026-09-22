// Δημιουργεί καλεσμένους + μοναδικά tokens και τυπώνει τα personalized links.
// Τρέξιμο:  npm run seed
//
// Βάλε τα ονόματα στο guests.txt (ένα ανά γραμμή) ή άλλαξε το DEFAULT_NAMES.
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'
import { readFileSync, existsSync, writeFileSync } from 'node:fs'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const base = process.env.SITE_BASE_URL || 'http://localhost:3000'
if (!url || !key) {
  console.error('❌ Λείπουν SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY στο .env.local')
  process.exit(1)
}
const sb = createClient(url, key, { auth: { persistSession: false } })

const DEFAULT_NAMES = ['Γιάννης Παπαδόπουλος', 'Μαρία & Νίκος', 'Ελένη Δήμου']
const names = existsSync('guests.txt')
  ? readFileSync('guests.txt', 'utf8').split('\n').map((s) => s.trim()).filter(Boolean)
  : DEFAULT_NAMES

const token = () => randomBytes(5).toString('hex') // 10 χαρακτήρες

const rows = []
for (const name of names) {
  const t = token()
  const { error } = await sb.from('guests').insert({ name, token: t })
  if (error) { console.error('  ⚠️', name, error.message); continue }
  rows.push({ name, link: `${base}/rsvp/${t}` })
  console.log(`✅ ${name}  →  ${base}/rsvp/${t}`)
}

writeFileSync('guest-links.csv', 'name,link\n' + rows.map((r) => `"${r.name}","${r.link}"`).join('\n'))
console.log(`\n📄 Γράφτηκε το guest-links.csv (${rows.length} καλεσμένοι). Στείλ' τα links ένα-ένα.`)
