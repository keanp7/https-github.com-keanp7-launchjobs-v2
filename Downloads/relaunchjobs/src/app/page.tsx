"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Playfair_Display } from "next/font/google"
import { LangToggle } from "@/components/landing/LangToggle"

const playfair = Playfair_Display({ subsets: ["latin"] })

// ── Brand tokens ───────────────────────────────────────────────────────────────
const C = {
  royal: "#1a3a6b",
  royalDeep: "#0d2147",
  gold: "#c9952a",
  goldBright: "#f0b832",
  green: "#1a6b4a",
  greenBright: "#3ecf8e",
  bg: "#f8fafc",
  white: "#ffffff",
  text: "#0f172a",
  muted: "#6b7280",
  border: "#e5e7eb",
  subtle: "#f1f5f9",
}

// ── Pain points ────────────────────────────────────────────────────────────────
const PAIN_POINTS = [
  {
    icon: "🤖",
    title: "ATS filters you out instantly",
    body: "Automated systems reject your résumé before a human ever sees it — because your title doesn't match a keyword.",
  },
  {
    icon: "👻",
    title: "Ghost jobs waste your time",
    body: "Roles stay posted for months after they're filled. You apply into a void and hear nothing.",
  },
  {
    icon: "📚",
    title: '"Just reskill" isn\'t advice',
    body: "Every platform tells you to learn something new. None of them tell you what to do with the experience you already have.",
  },
  {
    icon: "🔄",
    title: "Your experience doesn't translate",
    body: "You've done the work. But without the right title history, hiring managers can't see it.",
  },
]

// ── How it works steps ─────────────────────────────────────────────────────────
const STEPS = [
  { n: "01", title: "Describe your background", body: "Tell us your last role, industry, and what happened. 5 minutes." },
  { n: "02", title: "AI extracts your skills", body: "We identify every transferable skill — including ones you wouldn't think to list." },
  { n: "03", title: "Risk scoring", body: "Each skill gets scored for AI automation risk so you know what to lean into." },
  { n: "04", title: "Role matching", body: "We surface adjacent roles your existing skills qualify you for right now." },
  { n: "05", title: "Gap sprint", body: "A targeted learning plan — only the gaps that matter for your target role." },
  { n: "06", title: "Skills profile", body: "A shareable profile that translates your experience for any hiring manager." },
]

// ── Testimonials ───────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "I'd been an Executive Assistant for 11 years. Every job board told me I was 'overqualified' for entry-level ops roles and underqualified for director roles. RelaunchJobs showed me I already had the skills for Chief of Staff — I just didn't know how to frame it.",
    name: "Jessica H.",
    role: "Executive Assistant → Chief of Staff",
    location: "Austin, TX",
  },
  {
    quote: "I spent 8 years in insurance claims processing. When AI started handling most of it, I panicked. Turned out I had risk assessment and stakeholder communication skills that translate directly to compliance roles. Landed an interview in 3 weeks.",
    name: "Marcus T.",
    role: "Claims Processor → Compliance Analyst",
    location: "Chicago, IL",
  },
  {
    quote: "After my warehouse management role got automated, I didn't know where to go. The pipeline found that my logistics coordination experience was highly valued in supply chain consulting. Something I never would have found on my own.",
    name: "Diana R.",
    role: "Warehouse Manager → Supply Chain Consultant",
    location: "Phoenix, AZ",
  },
]

// ── Stat badges ────────────────────────────────────────────────────────────────
const STATS = [
  { value: "6,500+", label: "workers validated" },
  { value: "3 wks", label: "avg. gap closure" },
  { value: "92%", label: "qualification rate" },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "landing_hero" }),
    })
    setSubmitted(true)
  }

  return (
    <div style={{ fontFamily: "inherit", background: C.white, color: C.text }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.6s ease 0.1s forwards; opacity: 0; }
        .fade-up-2 { animation: fadeUp 0.6s ease 0.2s forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.6s ease 0.3s forwards; opacity: 0; }
        .btn-primary { background: ${C.gold}; color: white; border: none; border-radius: 10px; padding: 14px 28px; font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.15s, transform 0.1s; display: inline-block; text-decoration: none; }
        .btn-primary:hover { background: #b8841f; transform: translateY(-1px); }
        .btn-ghost { background: transparent; color: ${C.royal}; border: 1.5px solid ${C.royal}; border-radius: 10px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; text-decoration: none; display: inline-block; }
        .btn-ghost:hover { background: ${C.royal}; color: white; }
        .pain-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .step-card:hover { border-color: ${C.royal}; }
        .testimonial-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        transition: "all 0.2s",
        padding: "0 24px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <span className={playfair.className} style={{ fontSize: 20, fontWeight: 700, color: C.royal }}>
            RelaunchJobs
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="#how-it-works" style={{ fontSize: 14, color: C.muted, textDecoration: "none", padding: "8px 12px", display: "none" } as React.CSSProperties}>How it works</a>
            <LangToggle />
            <Link href="/login" className="btn-ghost" style={{ padding: "8px 16px", fontSize: 14 }}>Sign in</Link>
            <Link href="/signup" className="btn-primary" style={{ padding: "10px 20px", fontSize: 14 }}>Get started free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section id="hero" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
        padding: "120px 24px 80px",
        background: `linear-gradient(160deg, #f0f4ff 0%, ${C.white} 60%)`,
      }}>
        <div style={{ maxWidth: 760 }}>
          {/* Badge */}
          <div className="fade-up" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#fdf3dc", border: `1px solid rgba(201,149,42,0.3)`,
            borderRadius: 40, padding: "6px 16px", marginBottom: 28,
            fontSize: 13, fontWeight: 600, color: C.gold,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.goldBright, display: "inline-block", animation: "pulse 2s infinite" }} />
            AI-Powered Career Transition
          </div>

          {/* Headline */}
          <h1 className={`${playfair.className} fade-up-1`} style={{
            fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 700,
            lineHeight: 1.15, color: C.royalDeep, marginBottom: 20,
            letterSpacing: "-0.02em",
          }}>
            Your skills didn't disappear.<br />
            <span style={{ color: C.gold }}>Your title did.</span>
          </h1>

          {/* Sub */}
          <p className="fade-up-2" style={{
            fontSize: "clamp(16px, 2.5vw, 20px)", color: C.muted,
            lineHeight: 1.6, maxWidth: 580, margin: "0 auto 40px",
          }}>
            RelaunchJobs maps your existing experience to roles you qualify for right now — then builds the shortest path to landing them.
          </p>

          {/* CTA */}
          <div className="fade-up-3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
            <Link href="/signup" className="btn-primary" style={{ fontSize: 16, padding: "16px 36px" }}>
              Start free — no credit card
            </Link>
            <a href="#how-it-works" className="btn-ghost" style={{ fontSize: 16, padding: "16px 28px" }}>
              See how it works
            </a>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: "clamp(24px, 4vw, 56px)", flexWrap: "wrap" }}>
            {STATS.map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div className={playfair.className} style={{ fontSize: 28, fontWeight: 700, color: C.royal }}>{s.value}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust bar ───────────────────────────────────────────────────── */}
      <section style={{ background: C.royal, padding: "20px 24px" }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "clamp(16px, 4vw, 48px)", flexWrap: "wrap",
        }}>
          {[
            "✓  No résumé rewriting",
            "✓  No generic job boards",
            "✓  Built for AI-displaced workers",
            "✓  Free to start",
          ].map((item) => (
            <span key={item} style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap" }}>
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ── Problem ─────────────────────────────────────────────────────── */}
      <section id="problem" style={{ padding: "96px 24px", background: C.bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: C.gold, textTransform: "uppercase" }}>The problem</span>
            <h2 className={playfair.className} style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: C.royalDeep, marginTop: 12, lineHeight: 1.2 }}>
              The system wasn't built for you
            </h2>
            <p style={{ color: C.muted, fontSize: 16, marginTop: 12, maxWidth: 540, margin: "12px auto 0" }}>
              Traditional job search tools assume a linear career path. Yours just got interrupted.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {PAIN_POINTS.map((p) => (
              <div key={p.title} className="pain-card" style={{
                background: C.white, borderRadius: 16,
                border: `1px solid ${C.border}`, padding: "28px 24px",
                transition: "all 0.2s",
              }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{p.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "96px 24px", background: C.white }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: C.green, textTransform: "uppercase" }}>How it works</span>
            <h2 className={playfair.className} style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: C.royalDeep, marginTop: 12 }}>
              From displaced to deployed — in weeks
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {STEPS.map((s) => (
              <div key={s.n} className="step-card" style={{
                border: `1px solid ${C.border}`, borderRadius: 14,
                padding: "24px 22px", transition: "border-color 0.15s",
                display: "flex", gap: 16, alignItems: "flex-start",
              }}>
                <span className={playfair.className} style={{ fontSize: 28, fontWeight: 700, color: C.border, lineHeight: 1, flexShrink: 0 }}>{s.n}</span>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 48 }}>
            <Link href="/signup" className="btn-primary" style={{ fontSize: 16, padding: "16px 40px" }}>
              Start your relaunch →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <section id="testimonials" style={{ padding: "96px 24px", background: C.bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: C.royal, textTransform: "uppercase" }}>Real results</span>
            <h2 className={playfair.className} style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: C.royalDeep, marginTop: 12 }}>
              Workers who relaunched
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card" style={{
                background: C.white, borderRadius: 16,
                border: `1px solid ${C.border}`, padding: "28px 24px",
                transition: "all 0.2s", display: "flex", flexDirection: "column", gap: 20,
              }}>
                <div style={{ color: C.gold, fontSize: 28, lineHeight: 1 }}>"</div>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, flexGrow: 1 }}>{t.quote}</p>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.royalDeep }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: C.green, fontWeight: 600, marginTop: 2 }}>{t.role}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "96px 24px", background: C.royalDeep }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: C.gold, textTransform: "uppercase" }}>Why we built this</span>
          <h2 className={playfair.className} style={{ fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 700, color: C.white, marginTop: 16, marginBottom: 24, lineHeight: 1.3 }}>
            I validated 6,500 Reddit users before writing a single line of code
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: 1.8, marginBottom: 20 }}>
            I spent months reading posts from workers displaced by AI — data entry clerks, paralegals, customer service reps, financial analysts. The pattern was the same everywhere: they had real, valuable skills. They just had no way to surface them in a system built for a different era.
          </p>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: 1.8 }}>
            RelaunchJobs exists to fix that. Not with hustle advice or generic courses — with a real pipeline that translates what you already know into what the market actually needs.
          </p>
          <div style={{ marginTop: 32, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldBright} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 700, color: C.white,
            }}>J</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700, color: C.white, fontSize: 15 }}>Jean Alce</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Founder, RelaunchJobs</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section style={{ padding: "96px 24px", background: C.white, textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 className={playfair.className} style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: C.royalDeep, lineHeight: 1.2, marginBottom: 16 }}>
            Your next role already fits your skills.
          </h2>
          <p style={{ fontSize: 16, color: C.muted, marginBottom: 40, lineHeight: 1.6 }}>
            Stop applying blind. Let the pipeline show you exactly where you stand — and what to do next.
          </p>

          {submitted ? (
            <div style={{ padding: "20px 32px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, color: C.green, fontWeight: 600, fontSize: 15 }}>
              ✓ You're on the list — we'll be in touch soon.
            </div>
          ) : (
            <form onSubmit={handleWaitlist} style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  padding: "14px 18px", borderRadius: 10, border: `1.5px solid ${C.border}`,
                  fontSize: 15, outline: "none", width: "100%", maxWidth: 320,
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = C.royal)}
                onBlur={e => (e.currentTarget.style.borderColor = C.border)}
              />
              <button type="submit" className="btn-primary" style={{ fontSize: 15, padding: "14px 28px" }}>
                Join waitlist
              </button>
            </form>
          )}

          <p style={{ fontSize: 12, color: C.muted, marginTop: 16 }}>
            Or{" "}
            <Link href="/signup" style={{ color: C.royal, fontWeight: 600, textDecoration: "none" }}>
              create a free account now
            </Link>{" "}
            and start today.
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ background: C.royalDeep, padding: "48px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 32, marginBottom: 40 }}>
            <div>
              <span className={playfair.className} style={{ fontSize: 22, fontWeight: 700, color: C.white }}>RelaunchJobs</span>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 8, maxWidth: 240, lineHeight: 1.6 }}>
                AI-powered career transitions for displaced workers.
              </p>
            </div>
            <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 12 }}>Product</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <a href="#how-it-works" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>How it works</a>
                  <Link href="/signup" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Get started</Link>
                  <Link href="/login" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Sign in</Link>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 12 }}>Legal</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Link href="/terms" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Terms</Link>
                  <Link href="/privacy" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Privacy</Link>
                  <Link href="/contact" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Contact</Link>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 12 }}>Support</div>
                <a href="mailto:support@relaunchjobs.app" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
                  support@relaunchjobs.app
                </a>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© {new Date().getFullYear()} RelaunchJobs. All rights reserved.</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Built for the displaced — not the lucky.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
