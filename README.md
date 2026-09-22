# Ιστοσελίδα γάμου — RSVP + Κουίζ + Φωτο/Βίντεο (Supabase Storage)

Next.js (App Router) + Supabase. Ίδιος κώδικας τοπικά και live — αλλάζουν μόνο
τα environment variables.

## Τι κάνει
- **/rsvp/[token]** — κάθε καλεσμένος έχει μοναδικό link· τον χαιρετά με το όνομά
  του και καταγράφει αν έρχεται (χωρίς να πληκτρολογεί ποιος είναι).
- **/quiz** — κουίζ για το ζευγάρι, με κατάταξη.
- **/party** — η landing πίσω από το QR: φωτο/βίντεο + κουίζ + ευχές.
- **/upload** — in-app ανέβασμα φωτο & βίντεο στο Supabase Storage (με συμπίεση
  εικόνων στον browser, όνομα/μήνυμα/φάση ανά αρχείο). Ο καλεσμένος δεν φεύγει από το app.
- **/admin?key=…** — ο πίνακας του ζευγαριού (RSVP + leaderboard + ευχές + gallery φωτο/βίντεο).
- **/wishes** — ευχές καλεσμένων (όνομα + μήνυμα) — ψηφιακό guestbook.

> ✏️ Τα ονόματα του ζευγαριού αλλάζουν από ΕΝΑ σημείο: `lib/config.js`.
> Οι ερωτήσεις/απαντήσεις του κουίζ: `app/quiz/page.jsx`.

---

## 1) Τοπική εκτέλεση (~10')

1. **Supabase project** (δωρεάν): φτιάξε ένα στο supabase.com.
2. **Πίνακες + Storage + grants**: Supabase → SQL Editor → επικόλλησε όλο το
   `supabase/schema.sql` → Run. (Είναι idempotent — τρέξ' το ξανά με ασφάλεια·
   φτιάχνει πίνακες, τον πίνακα `media`, το bucket `uploads`, και τα grants.)
3. **Env**: `cp .env.local.example .env.local` και συμπλήρωσε
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Settings → API), `ADMIN_KEY`.
4. **Εγκατάσταση & καλεσμένοι**:
   ```bash
   npm install
   npm run seed      # φτιάχνει demo καλεσμένους + τυπώνει links, γράφει guest-links.csv
   npm run dev
   ```
5. Άνοιξε **http://localhost:3000** — έχει links για όλες τις σελίδες.
   Για το RSVP, πάρε ένα link από το `guest-links.csv`.

> Πραγματικοί καλεσμένοι: φτιάξε `guests.txt` με ένα όνομα ανά γραμμή και ξανατρέξε `npm run seed`.

---

## 2) Live (Vercel, ~5')

1. Push το repo στο GitHub.
2. Vercel → New Project → διάλεξε το repo.
3. **Environment Variables**: βάλε τα ίδια με το `.env.local`, αλλά
   `SITE_BASE_URL=https://to-domain-sou.gr` (το domain του Vercel/δικό σου).
4. Deploy. Τέλος — ο κώδικας είναι ίδιος.
5. Ξανατρέξε το seed με το live `SITE_BASE_URL` ώστε τα links στο `guest-links.csv`
   να δείχνουν στο live domain (ή τρέξ' το με `SITE_BASE_URL=... npm run seed`).

### QR code
Φτιάξε ένα QR που δείχνει στο `https://to-domain-sou.gr/party` (οποιοσδήποτε
generator, ή προγραμματιστικά). Στατικό QR προς δικό σου domain δεν λήγει ποτέ.

---

## Δομή
```
app/
  party/         landing του QR (φωτο/κουίζ/ευχές)
  upload/        in-app ανέβασμα φωτο/βίντεο (client, με συμπίεση)
  quiz/          το κουίζ (client)
  rsvp/[token]/  RSVP ανά καλεσμένο
  admin/         πίνακας ζευγαριού + gallery (key-gated)
  wishes/        ψηφιακό guestbook
  api/rsvp/      αποθήκευση RSVP
  api/quiz/      αποθήκευση σκορ
  api/wishes/    αποθήκευση ευχών
  api/upload/    sign (signed URL) + commit (metadata) για το storage
components/
  Ornament.jsx   eucalyptus κλαδί (SVG, παραμετρικό)
  CornerLeaves.jsx  γωνιακά φυλλώματα του hero
lib/supabase.js  server-only client (service role)
lib/config.js    ονόματα ζευγαριού + WEDDING + UPLOAD ρυθμίσεις
scripts/generate-guests.mjs   δημιουργία καλεσμένων + links
supabase/schema.sql           πίνακες + storage bucket + grants
```

## Σημειώσεις
- Το κουίζ έχει placeholder ερωτήσεις στο `app/quiz/page.jsx` — άλλαξέ τις.
- Η `/admin` προστατεύεται με απλό `?key=`. Για γάμο αρκεί· μη μοιράσεις το link.
- Το `service_role` key χρησιμοποιείται ΜΟΝΟ server-side. Ποτέ σε client κώδικα.
- **Φωτο/βίντεο**: το bucket `uploads` είναι ιδιωτικό· η προβολή στο `/admin` γίνεται
  με signed URLs. Ρυθμίσεις (όρια μεγέθους, ποιότητα συμπίεσης) στο `lib/config.js → UPLOAD`.
- **Storage free tier**: ~1GB. Οι εικόνες συμπιέζονται (~0.3–0.8MB), οπότε χωράνε
  χιλιάδες· τα **βίντεο** είναι βαριά — αν περιμένεις πολλά, σκέψου το Supabase Pro
  (~$25/μήνα = 100GB) ή αύξησε/μείωσε το `videoMaxMB`.
