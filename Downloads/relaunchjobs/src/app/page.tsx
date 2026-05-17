"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Playfair_Display } from "next/font/google"
import { LangToggle } from "@/components/landing/LangToggle"
import { useLang } from "@/contexts/LangContext"

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

const STATS_VALUES = ["6,500+", "3 wks", "92%"]

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

const PAIN_ICONS = ["🤖", "👻", "📚", "🔄"]

export default function LandingPage() {
  const { t } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [ctaLoading, setCtaLoading] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  function handleCta() {
    setCtaLoading(true)
    window.location.href = "/signup"
  }

  const PAIN_POINTS = [
    { icon: PAIN_ICONS[0], title: t("landing.problem.p0title"), body: t("landing.problem.p0body") },
    { icon: PAIN_ICONS[1], title: t("landing.problem.p1title"), body: t("landing.problem.p1body") },
    { icon: PAIN_ICONS[2], title: t("landing.problem.p2title"), body: t("landing.problem.p2body") },
    { icon: PAIN_ICONS[3], title: t("landing.problem.p3title"), body: t("landing.problem.p3body") },
  ]

  const STEPS = [
    { n: "01", title: t("landing.how.s01title"), body: t("landing.how.s01body") },
    { n: "02", title: t("landing.how.s02title"), body: t("landing.how.s02body") },
    { n: "03", title: t("landing.how.s03title"), body: t("landing.how.s03body") },
    { n: "04", title: t("landing.how.s04title"), body: t("landing.how.s04body") },
    { n: "05", title: t("landing.how.s05title"), body: t("landing.how.s05body") },
    { n: "06", title: t("landing.how.s06title"), body: t("landing.how.s06body") },
  ]

  const STATS = [
    { value: STATS_VALUES[0], label: t("landing.hero.stat1Label") },
    { value: STATS_VALUES[1], label: t("landing.hero.stat2Label") },
    { value: STATS_VALUES[2], label: t("landing.hero.stat3Label") },
  ]

  const TRUST_ITEMS = [
    t("landing.trust.t1"),
    t("landing.trust.t2"),
    t("landing.trust.t3"),
    t("landing.trust.t4"),
  ]

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
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .btn-ghost { background: transparent; color: ${C.royal}; border: 1.5px solid ${C.royal}; border-radius: 10px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; text-decoration: none; display: inline-block; }
        .btn-ghost:hover { background: ${C.royal}; color: white; }
        .pain-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .step-card:hover { border-color: ${C.royal}; }
        .testimonial-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
          .grid-mobile-1 { grid-template-columns: 1fr !important; }
          .stack-mobile { flex-direction: column !important; align-items: stretch !important; }
          .stack-mobile a, .stack-mobile button { width: 100% !important; text-align: center !important; }
        }
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
            <LangToggle />
            <Link href="/login" className="btn-ghost" style={{ padding: "8px 16px", fontSize: 14 }}>{t("landing.nav.signIn")}</Link>
            <Link href="/signup" className="btn-primary" style={{ padding: "10px 20px", fontSize: 14 }}>{t("landing.nav.getStarted")}</Link>
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
            {t("landing.hero.badge")}
          </div>

          {/* Headline */}
          <h1 className={`${playfair.className} fade-up-1`} style={{
            fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 700,
            lineHeight: 1.15, color: C.royalDeep, marginBottom: 20,
            letterSpacing: "-0.02em",
          }}>
            {t("landing.hero.h1")}<br />
            <span style={{ color: C.gold }}>{t("landing.hero.h2")}</span>
          </h1>

          {/* Sub */}
          <p className="fade-up-2" style={{
            fontSize: "clamp(16px, 2.5vw, 20px)", color: C.muted,
            lineHeight: 1.6, maxWidth: 580, margin: "0 auto 40px",
          }}>
            {t("landing.hero.sub")}
          </p>

          {/* CTA */}
          <div className="fade-up-3 stack-mobile" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
            <button onClick={handleCta} disabled={ctaLoading} className="btn-primary" style={{ fontSize: 16, padding: "16px 36px" }}>
              {ctaLoading ? t("landing.hero.loading") : t("landing.hero.ctaStart")}
            </button>
            <a href="#how-it-works" className="btn-ghost" style={{ fontSize: 16, padding: "16px 28px" }}>
              {t("landing.hero.ctaHow")}
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
          {TRUST_ITEMS.map((item) => (
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
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: C.gold, textTransform: "uppercase" }}>{t("landing.problem.label")}</span>
            <h2 className={playfair.className} style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: C.royalDeep, marginTop: 12, lineHeight: 1.2 }}>
              {t("landing.problem.title")}
            </h2>
            <p style={{ color: C.muted, fontSize: 16, marginTop: 12, maxWidth: 540, margin: "12px auto 0" }}>
              {t("landing.problem.sub")}
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
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: C.green, textTransform: "uppercase" }}>{t("landing.how.label")}</span>
            <h2 className={playfair.className} style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: C.royalDeep, marginTop: 12 }}>
              {t("landing.how.title")}
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
            <button onClick={handleCta} disabled={ctaLoading} className="btn-primary" style={{ fontSize: 16, padding: "16px 40px" }}>
              {ctaLoading ? t("landing.hero.loading") : t("landing.hero.ctaStart")}
            </button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <section id="testimonials" style={{ padding: "96px 24px", background: C.bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: C.royal, textTransform: "uppercase" }}>{t("landing.testimonials.label")}</span>
            <h2 className={playfair.className} style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: C.royalDeep, marginTop: 12 }}>
              {t("landing.testimonials.title")}
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {TESTIMONIALS.map((testimonial, i) => (
              <div key={i} className="testimonial-card" style={{
                background: C.white, borderRadius: 16,
                border: `1px solid ${C.border}`, padding: "28px 24px",
                transition: "all 0.2s", display: "flex", flexDirection: "column", gap: 20,
              }}>
                <div style={{ color: C.gold, fontSize: 28, lineHeight: 1 }}>"</div>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, flexGrow: 1 }}>{testimonial.quote}</p>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.royalDeep }}>{testimonial.name}</div>
                  <div style={{ fontSize: 12, color: C.green, fontWeight: 600, marginTop: 2 }}>{testimonial.role}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{testimonial.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "96px 24px", background: C.royalDeep }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: C.gold, textTransform: "uppercase" }}>{t("landing.founder.label")}</span>
          <h2 className={playfair.className} style={{ fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 700, color: C.white, marginTop: 16, marginBottom: 24, lineHeight: 1.3 }}>
            {t("landing.founder.title")}
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: 1.8, marginBottom: 20 }}>
            {t("landing.founder.p1")}
          </p>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: 1.8 }}>
            {t("landing.founder.p2")}
          </p>
          <div style={{ marginTop: 32, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldBright} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 700, color: C.white,
            }}>J</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700, color: C.white, fontSize: 15 }}>{t("landing.founder.founderName")}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{t("landing.founder.founderRole")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section style={{ padding: "96px 24px", background: C.white, textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 className={playfair.className} style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: C.royalDeep, lineHeight: 1.2, marginBottom: 16 }}>
            {t("landing.cta.title")}
          </h2>
          <p style={{ fontSize: 16, color: C.muted, marginBottom: 40, lineHeight: 1.6 }}>
            {t("landing.cta.sub")}
          </p>

          <button onClick={handleCta} disabled={ctaLoading} className="btn-primary" style={{ fontSize: 16, padding: "16px 40px" }}>
            {ctaLoading ? t("landing.cta.loading") : t("landing.cta.start")}
          </button>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 16 }}>{t("landing.cta.noCard")}</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ background: C.royalDeep, padding: "48px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 32, marginBottom: 40 }}>
            <div>
              <span className={playfair.className} style={{ fontSize: 22, fontWeight: 700, color: C.white }}>RelaunchJobs</span>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 8, maxWidth: 240, lineHeight: 1.6 }}>
                {t("landing.footer.tagline")}
              </p>
            </div>
            <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 12 }}>{t("landing.footer.product")}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <a href="#how-it-works" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>{t("landing.footer.howItWorks")}</a>
                  <Link href="/signup" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>{t("landing.footer.getStarted")}</Link>
                  <Link href="/login" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>{t("landing.footer.signIn")}</Link>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 12 }}>{t("landing.footer.legal")}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Link href="/terms" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>{t("landing.footer.terms")}</Link>
                  <Link href="/privacy" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>{t("landing.footer.privacy")}</Link>
                  <Link href="/contact" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>{t("landing.footer.contact")}</Link>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 12 }}>{t("landing.footer.support")}</div>
                <a href="mailto:support@relaunchjobs.app" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
                  support@relaunchjobs.app
                </a>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© {new Date().getFullYear()} RelaunchJobs. {t("landing.footer.rights")}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{t("landing.footer.tagline2")}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
