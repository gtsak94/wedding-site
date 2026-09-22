'use client'
import { useState } from 'react'
import { COUPLE } from '../../lib/config'
import Ornament from '../../components/Ornament'

const A = COUPLE.a
const B = COUPLE.b
const BOTH = 'Και οι δύο'
const NONE = 'Κανένας'

// ✏️ Το ζευγάρι ορίζει τις «σωστές» απαντήσεις: answer = index στο options.
const QUESTIONS = [
  { q: 'Ποιος κάνει περισσότερη ώρα να ετοιμαστεί;', options: [A, B], answer: 1 },
  { q: 'Ποιος είπε πρώτος «Σ’ αγαπώ»;', options: [A, B], answer: 0 },
  { q: 'Ποιος είναι πιο πιθανό να ξεχάσει την επέτειό σας; 😂', options: [A, B], answer: 0 },
  { q: 'Ποιος νευριάζει πιο εύκολα;', options: [A, B, BOTH], answer: 1 },
  { q: 'Ποιος αποφασίζει τι θα φάτε;', options: [A, B, BOTH], answer: 1 },
  { q: 'Ποιος θα πει «πάμε για ένα ποτό» και θα γυρίσει στις 5 το πρωί;', options: [A, B], answer: 0 },
  { q: 'Ποιος έχει πάντα δίκιο;', options: [A, B, BOTH, NONE], answer: 1 },
  { q: 'Ποιος ξυπνάει πρώτος το πρωί;', options: [A, B], answer: 1 },
  { q: 'Ποιος είναι πιο τακτικός;', options: [A, B, BOTH], answer: 1 },
  { q: 'Ποιος έκανε την πρόταση γάμου;', options: [A, B], answer: 0 },
]

function resultFor(score) {
  if (score <= 3) return { emoji: '😂', title: '«Εσύ πώς βρέθηκες στον γάμο;»', sub: `Μάλλον χρειάζεσαι επειγόντως έναν καφέ με τον ${A} και την ${B}.` }
  if (score <= 6) return { emoji: '😅', title: '«Κάτι ξέρεις… αλλά όχι και πολλά!»', sub: 'Έχεις περιθώρια βελτίωσης.' }
  if (score <= 8) return { emoji: '👏', title: '«Εντάξει, μας ξέρεις!»', sub: 'Είσαι επίσημα στον στενό κύκλο.' }
  if (score === 9) return { emoji: '❤️', title: '«Εσύ μάλλον ξέρεις περισσότερα κι από εμάς!»', sub: '' }
  return { emoji: '👑', title: '«Επίσημα είσαι οικογένεια.»', sub: 'Κέρδισες το δικαίωμα να μας θυμίζεις για πάντα ότι μας ξέρεις καλύτερα από όλους.' }
}

export default function QuizPage() {
  const [name, setName] = useState('')
  const [started, setStarted] = useState(false)
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState(null)
  const [done, setDone] = useState(false)

  const total = QUESTIONS.length

  function choose(idx) {
    if (picked !== null) return
    setPicked(idx)
    if (idx === QUESTIONS[i].answer) setScore((s) => s + 1)
  }

  async function next() {
    if (i + 1 < total) { setI(i + 1); setPicked(null) }
    else {
      setDone(true)
      try {
        await fetch('/api/quiz', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name || 'Ανώνυμος', score, total }),
        })
      } catch (e) {}
    }
  }

  if (!started) {
    return (
      <main className="wrap">
        <div className="pagehead">
          <Ornament className="ornament r r1" width={160} />
          <h1 className="r r2">Πόσο καλά μας ξέρεις;</h1>
          <p className="r r2">Γράψε το όνομά σου και ξεκίνα!</p>
        </div>
        <div className="card r r3">
          <label>Το όνομά σου</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="π.χ. Γιάννης" />
          <button className="btn" style={{ marginTop: 18 }} onClick={() => setStarted(true)}>Ξεκίνα</button>
        </div>
      </main>
    )
  }

  if (done) {
    const r = resultFor(score)
    return (
      <main className="wrap">
        <div className="pagehead"><h1>Τέλος! 🎊</h1></div>
        <div className="card result">
          <div className="emoji">{r.emoji}</div>
          <div className="rt">{r.title}</div>
          {r.sub && <p className="muted">{r.sub}</p>}
          <div className="score">Σκορ: <strong>{score}/{total}</strong></div>
        </div>
        <p style={{ textAlign: 'center' }}>📸 Τώρα σειρά σου να αφήσεις μια ανάμνηση!</p>
        <a className="btn" href="/wishes">💌 Άφησε μια ευχή</a>
        <a className="btn secondary" href="/party">📸 Ανέβασε φωτογραφίες & βίντεο</a>
      </main>
    )
  }

  const cur = QUESTIONS[i]
  return (
    <main className="wrap">
      <p className="qcount muted">Ερώτηση {i + 1} από {total}</p>
      <div className="pagehead"><h1>{cur.q}</h1></div>
      <div className="card">
        {cur.options.map((opt, idx) => {
          const state = picked === null ? undefined
            : idx === cur.answer ? 'correct'
            : idx === picked ? 'wrong' : undefined
          return (
            <button key={idx} className="opt" data-state={state} disabled={picked !== null} onClick={() => choose(idx)}>
              {opt}
            </button>
          )
        })}
        {picked !== null && (
          <button className="btn" style={{ marginTop: 14 }} onClick={next}>
            {i + 1 < total ? 'Επόμενη' : 'Δες το αποτέλεσμα'}
          </button>
        )}
      </div>
    </main>
  )
}
