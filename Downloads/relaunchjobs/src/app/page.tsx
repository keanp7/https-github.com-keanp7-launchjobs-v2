'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Playfair_Display, Outfit, DM_Mono } from 'next/font/google'
import { LangToggle } from '@/components/landing/LangToggle'

const playfair = Playfair_Display({ subsets: ['latin'] })
const outfit = Outfit({ subsets: ['latin'] })
const mono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

const ROOT_VARS = {
  '--royal': '#1a3a6b',
  '--royal-deep': '#0d2147',
  '--gold': '#c9952a',
  '--gold-bright': '#f0b832',
  '--green': '#1a6b4a',
  '--green-bright': '#3ecf8e',
} as React.CSSProperties

// ── Shared styles ─────────────────────────────────────────────────────────────
const trustBadgeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px',
  flexWrap: 'wrap',
  marginTop: '18px',
}
const trustItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '13px',
  color: '#8fa3c0',
  letterSpacing: '0.01em',
}

export default function LandingPage() {
  const [heroEmail, setHeroEmail] = useState('')
  const [ctaEmail, setCtaEmail] = useState('')
  const [heroStatus, setHeroStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [ctaStatus, setCtaStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const submitWaitlist = async (
    email: string,
    setStatus: (s: 'idle' | 'loading' | 'success') => void
  ) => {
    setStatus('loading')
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus('success')
    } catch {
      setStatus('idle')
    }
  }

  return (
    <div
      className={outfit.className}
      style={{ ...ROOT_VARS, minHeight: '100vh', backgroundColor: '#ffffff', color: '#111827' }}
    >
      {/* ── Responsive styles ── */}
      <style>{`
        .hero-form { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 16px; }
        .hero-input { padding: 15px 20px; border-radius: 8px; border: 2px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.08); color: white; font-size: 16px; outline: none; flex: 1; min-width: 220px; max-width: 320px; }
        .hero-input::placeholder { color: rgba(255,255,255,0.45); }
        .hero-btn { padding: 15px 28px; background: var(--gold); color: white; border-radius: 8px; border: none; font-size: 16px; font-weight: 700; cursor: pointer; white-space: nowrap; box-shadow: 0 4px 14px rgba(201,149,42,0.4); transition: background 0.15s; flex-shrink: 0; }
        .hero-btn:hover { background: #b8841f; }
        .hero-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .cta-input { padding: 16px 22px; border-radius: 8px; border: 2px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.08); color: white; font-size: 16px; outline: none; flex: 1; min-width: 220px; max-width: 320px; }
        .cta-input::placeholder { color: rgba(255,255,255,0.45); }
        .cta-btn { padding: 16px 32px; background: var(--gold); color: white; border-radius: 8px; border: none; font-size: 16px; font-weight: 700; cursor: pointer; white-space: nowrap; box-shadow: 0 4px 14px rgba(201,149,42,0.4); transition: background 0.15s; flex-shrink: 0; }
        .cta-btn:hover { background: #b8841f; }
        .cta-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .nav-links { display: flex; gap: 12px; align-items: center; }
        .nav-signin { padding: 9px 18px; border-radius: 8px; border: 1.5px solid var(--royal); color: var(--royal); text-decoration: none; font-weight: 600; font-size: 14px; line-height: 1; transition: background 0.15s, color 0.15s; }
        .nav-signin:hover { background: var(--royal); color: #fff; }
        .nav-getstarted { padding: 9px 18px; border-radius: 8px; background: var(--gold); color: #fff; text-decoration: none; font-weight: 700; font-size: 14px; line-height: 1; box-shadow: 0 2px 8px rgba(201,149,42,0.3); transition: background 0.15s; }
        .nav-getstarted:hover { background: #b8841f; }
        @media (max-width: 540px) {
          .hero-form { flex-direction: column; align-items: stretch; }
          .hero-input { max-width: 100%; }
          .cta-input { max-width: 100%; }
          .hero-btn, .cta-btn { width: 100%; text-align: center; }
          .nav-signin { display: none; }
          .hide-mobile { display: none !important; }
        }
      `}</style>

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 8px rgba(13,33,71,0.07)',
          padding: '0 5%',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          height: '64px',
        }}
      >
        <Link
          href="/"
          className={playfair.className}
          style={{ fontSize: '21px', fontWeight: 700, color: 'var(--royal)', textDecoration: 'none', letterSpacing: '-0.02em' }}
        >
          RelaunchJobs
        </Link>

        <div className="nav-links">
          <span className="hide-mobile"><LangToggle /></span>
          <Link href="/login" className="nav-signin">Sign in</Link>
          <Link href="/signup" className="nav-getstarted">Get started free</Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: 'var(--royal-deep)',
          color: 'white',
          padding: 'clamp(64px, 10vw, 104px) 5% clamp(72px, 11vw, 116px)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '28px' }}>
            <div style={{ height: '2px', width: '32px', backgroundColor: 'var(--gold)', borderRadius: '2px' }} />
            <span
              className={mono.className}
              style={{ color: 'var(--gold)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}
            >
              AI-powered career transition
            </span>
            <div style={{ height: '2px', width: '32px', backgroundColor: 'var(--gold)', borderRadius: '2px' }} />
          </div>

          <h1
            className={playfair.className}
            style={{
              fontSize: 'clamp(36px, 5.5vw, 66px)',
              lineHeight: 1.08,
              marginBottom: '24px',
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            Your skills didn&apos;t disappear.{' '}
            <span style={{ color: 'var(--gold-bright)' }}>Your title did.</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 19px)',
              color: '#c7d2e0',
              lineHeight: 1.7,
              maxWidth: '580px',
              margin: '0 auto 44px',
            }}
          >
            Enter your job title. In 30 minutes, get a clear picture of your transferable skills,
            the roles you&apos;re already qualified for, and a week-by-week plan to land one.
          </p>

          <form
            className="hero-form"
            onSubmit={e => { e.preventDefault(); submitWaitlist(heroEmail, setHeroStatus) }}
          >
            <input
              type="email"
              className="hero-input"
              placeholder="Enter your work email"
              value={heroEmail}
              onChange={e => setHeroEmail(e.target.value)}
              required
              aria-label="Email address"
            />
            <button type="submit" className="hero-btn" disabled={heroStatus === 'loading'}>
              {heroStatus === 'loading' ? 'One sec…' : 'Find my next role →'}
            </button>
          </form>

          {heroStatus === 'success' && (
            <p style={{ color: 'var(--green-bright)', fontSize: '14px', marginBottom: '12px' }}>
              ✓ You&apos;re on the list — we&apos;ll send your access link shortly.
            </p>
          )}

          {/* Trust signals */}
          <div style={trustBadgeStyle}>
            <span style={trustItemStyle}><span>✓</span> No resume required</span>
            <span style={{ ...trustItemStyle, opacity: 0.3 }}>·</span>
            <span style={trustItemStyle}><span>✓</span> Free to start</span>
            <span style={{ ...trustItemStyle, opacity: 0.3 }}>·</span>
            <span style={trustItemStyle}><span>✓</span> We never sell your data</span>
          </div>

          {/* Stats */}
          <div
            className={mono.className}
            style={{
              display: 'flex', justifyContent: 'center', gap: '28px', flexWrap: 'wrap',
              color: '#8fa3c0', fontSize: '12px',
              textTransform: 'uppercase', letterSpacing: '0.07em',
              marginTop: '36px', paddingTop: '32px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span>6,500+ workers validated</span>
            <span style={{ opacity: 0.35 }}>·</span>
            <span>Avg. 3-week skill gap</span>
            <span style={{ opacity: 0.35 }}>·</span>
            <span>92% already qualified for adj. roles</span>
          </div>
        </div>
      </section>

      {/* ── PAIN SECTION ────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(64px, 8vw, 96px) 5%', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p
            className={mono.className}
            style={{
              textAlign: 'center', color: 'var(--gold)',
              fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px',
            }}
          >
            Sound familiar?
          </p>
          <h2
            className={playfair.className}
            style={{
              fontSize: 'clamp(28px, 3.5vw, 42px)',
              textAlign: 'center', color: 'var(--royal)',
              marginBottom: '52px', letterSpacing: '-0.02em',
            }}
          >
            The job search is broken for displaced workers.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '18px',
              marginBottom: '56px',
            }}
          >
            {[
              { icon: '📭', text: 'Sending 50+ applications and hearing nothing back.' },
              { icon: '🪞', text: 'Feeling like 10 years of experience became worthless overnight.' },
              { icon: '🔍', text: 'Not knowing which job titles to even search for anymore.' },
              { icon: '📋', text: '"Entry-level" roles demanding 5 years of specific experience.' },
            ].map((pain, i) => (
              <div
                key={i}
                style={{
                  padding: '28px 24px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>{pain.icon}</div>
                <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#4a5568', margin: 0 }}>{pain.text}</p>
              </div>
            ))}
          </div>

          {/* Pivot moment */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f0f4ff 0%, #fdfbf5 100%)',
              padding: 'clamp(32px, 5vw, 52px) clamp(28px, 5vw, 48px)',
              borderRadius: '20px',
              border: '1px solid #e2dfc8',
              textAlign: 'center',
            }}
          >
            <p
              className={mono.className}
              style={{ color: 'var(--green)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}
            >
              The insight
            </p>
            <h3
              className={playfair.className}
              style={{
                fontSize: 'clamp(18px, 2.5vw, 26px)',
                color: 'var(--royal)',
                maxWidth: '640px',
                margin: '0 auto',
                lineHeight: 1.45,
                fontStyle: 'italic',
              }}
            >
              Most displaced workers aren&apos;t starting over. They&apos;re <span style={{ color: 'var(--gold)' }}>re-labeling.</span>
              <br />
              <span style={{ fontSize: '0.8em', fontStyle: 'normal' }}>
                Your skills are still valuable. The market just doesn&apos;t know how to find you yet.
              </span>
            </h3>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: 'var(--royal-deep)', color: 'white', padding: 'clamp(64px, 8vw, 96px) 5%' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p
            className={mono.className}
            style={{
              textAlign: 'center', color: 'var(--gold)',
              fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px',
            }}
          >
            How it works
          </p>
          <h2
            className={playfair.className}
            style={{
              fontSize: 'clamp(30px, 4vw, 50px)',
              textAlign: 'center', marginBottom: '14px',
              color: '#ffffff', letterSpacing: '-0.02em',
            }}
          >
            From displaced to hired —{' '}
            <span style={{ color: 'var(--green-bright)' }}>in weeks, not months.</span>
          </h2>
          <p style={{ textAlign: 'center', color: '#8fa3c0', fontSize: '15px', marginBottom: '56px' }}>
            No resume. No career coach. Takes 30 minutes.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: '20px',
            }}
          >
            {[
              {
                num: '01',
                title: 'Describe your background',
                desc: 'Tell us your last job title and what you actually did. No resume needed — 5 minutes.',
              },
              {
                num: '02',
                title: 'Get your real skills mapped',
                desc: 'AI surfaces your transferable skills — the ones employers value in 2026, not just your old job title.',
              },
              {
                num: '03',
                title: 'See your market risk score',
                desc: 'Understand your automation exposure and which of your skills are actually in demand right now.',
              },
              {
                num: '04',
                title: 'Pick your target role',
                desc: '3–5 adjacent roles you\'re already 70–80% qualified for — with match scores, salary, and time-to-hire.',
              },
              {
                num: '05',
                title: 'Close the gap in weeks',
                desc: 'A 2–6 week sprint using free resources only. Each week ends with proof of work you can show employers.',
              },
              {
                num: '06',
                title: 'Launch with your skills profile',
                desc: 'A shareable profile built around what you can do — not what you used to be called.',
              },
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  padding: '28px',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.07)',
                  transition: 'border-color 0.2s',
                }}
              >
                <div
                  className={mono.className}
                  style={{ color: 'var(--gold)', fontSize: '13px', fontWeight: 500, marginBottom: '10px', opacity: 0.85 }}
                >
                  {step.num}
                </div>
                <h3 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700, marginBottom: '8px', margin: '0 0 8px' }}>
                  {step.title}
                </h3>
                <p style={{ color: '#8fa3c0', lineHeight: 1.65, fontSize: '14px', margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '52px' }}>
            <Link
              href="/signup"
              style={{
                display: 'inline-block', padding: '15px 36px',
                backgroundColor: 'var(--gold)', color: 'white',
                borderRadius: '10px', textDecoration: 'none',
                fontSize: '16px', fontWeight: 700,
                boxShadow: '0 4px 20px rgba(201,149,42,0.35)',
              }}
            >
              Start for free — takes 30 min →
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(64px, 8vw, 96px) 5%', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p
            className={mono.className}
            style={{
              textAlign: 'center', color: 'var(--green)',
              fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px',
            }}
          >
            Results
          </p>
          <h2
            className={playfair.className}
            style={{
              fontSize: 'clamp(28px, 4vw, 46px)',
              textAlign: 'center', marginBottom: '52px',
              color: 'var(--royal)', letterSpacing: '-0.02em',
            }}
          >
            Real people, real transitions.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: '20px', alignItems: 'start',
            }}
          >
            {/* Card 1 */}
            <div style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ color: 'var(--gold)', fontSize: '28px', lineHeight: 1, marginBottom: '12px', fontFamily: 'Georgia, serif' }}>&ldquo;</div>
              <p style={{ fontSize: '16px', lineHeight: 1.7, marginBottom: '24px', color: '#374151', margin: '0 0 24px' }}>
                I had no idea how much of my experience still translated. The roles it suggested
                were real — I had interviews within two weeks.
              </p>
              <div style={{ borderTop: '1px solid #f0ede6', paddingTop: '16px' }}>
                <p style={{ fontWeight: 700, color: 'var(--royal)', marginBottom: '3px', fontSize: '14px' }}>
                  Early access member · United States
                </p>
                <p className={mono.className} style={{ fontSize: '11px', color: '#8a94a6' }}>
                  Operations → Project Coordinator
                </p>
              </div>
            </div>

            {/* Card 2 — featured */}
            <div
              style={{
                padding: '36px',
                backgroundColor: 'var(--royal)',
                color: 'white',
                borderRadius: '20px',
                boxShadow: '0 24px 48px rgba(13,33,71,0.2)',
              }}
            >
              <div style={{ color: 'var(--gold-bright)', fontSize: '28px', lineHeight: 1, marginBottom: '12px', fontFamily: 'Georgia, serif' }}>&ldquo;</div>
              <p style={{ fontSize: '17px', lineHeight: 1.7, marginBottom: '24px', color: '#dce8f5', margin: '0 0 24px' }}>
                Better than any career coach I&apos;ve hired. It understood my experience and gave
                me a real plan — not generic advice. This is what I needed months ago.
              </p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '16px' }}>
                <p style={{ fontWeight: 700, color: 'white', marginBottom: '3px', fontSize: '14px' }}>
                  Jessica H. · New York
                </p>
                <p className={mono.className} style={{ fontSize: '11px', color: 'var(--gold-bright)' }}>
                  Executive Assistant → Chief of Staff
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ color: 'var(--gold)', fontSize: '28px', lineHeight: 1, marginBottom: '12px', fontFamily: 'Georgia, serif' }}>&ldquo;</div>
              <p style={{ fontSize: '16px', lineHeight: 1.7, marginBottom: '24px', color: '#374151', margin: '0 0 24px' }}>
                I thought I needed a whole new career. Turns out the gap was 3 weeks of
                focused learning. I&apos;m already interviewing for the role I picked.
              </p>
              <div style={{ borderTop: '1px solid #f0ede6', paddingTop: '16px' }}>
                <p style={{ fontWeight: 700, color: 'var(--royal)', marginBottom: '3px', fontSize: '14px' }}>
                  Early access member · United States
                </p>
                <p className={mono.className} style={{ fontSize: '11px', color: '#8a94a6' }}>
                  Data Entry → Business Analyst
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDER SECTION ─────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(64px, 8vw, 96px) 5%', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p
            className={mono.className}
            style={{
              color: 'var(--gold)', fontSize: '12px',
              textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px',
            }}
          >
            Why we built this
          </p>
          <h2
            className={playfair.className}
            style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', color: 'var(--royal)', letterSpacing: '-0.02em', marginBottom: '28px', lineHeight: 1.2 }}
          >
            The system isn&apos;t designed for people who were displaced. We fixed that.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ fontSize: '16px', lineHeight: 1.75, color: '#4a5568', margin: 0 }}>
              I built RelaunchJobs after watching people with 10+ years of real experience get
              frozen out of the job market — not because their skills were irrelevant, but because
              their job title no longer matched a keyword filter.
            </p>
            <p style={{ fontSize: '16px', lineHeight: 1.75, color: '#4a5568', margin: 0 }}>
              The standard advice — "update your resume," "network more," "learn to code" — was
              built for a different era. What displaced workers actually need is a precise answer
              to one question: <em style={{ color: 'var(--royal)' }}>What am I worth, and where do I go next?</em>
            </p>
            <p style={{ fontSize: '16px', lineHeight: 1.75, color: '#4a5568', margin: 0 }}>
              RelaunchJobs answers that in 30 minutes. No fluff. No upsell. Just a clear path
              from where you are to where you can realistically land — built on your actual
              experience, not wishful thinking.
            </p>
          </div>

          <div
            style={{
              marginTop: '36px', paddingTop: '28px',
              borderTop: '1px solid #f0ede6',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}
          >
            <div
              style={{
                width: '48px', height: '48px',
                borderRadius: '50%', backgroundColor: 'var(--royal)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '16px', flexShrink: 0,
              }}
            >
              JAS
            </div>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--royal)', fontSize: '15px', margin: '0 0 2px' }}>JAS</p>
              <p className={mono.className} style={{ fontSize: '12px', color: '#8a94a6', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Founder, RelaunchJobs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ──────────────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: 'var(--royal-deep)',
          color: 'white',
          padding: 'clamp(72px, 10vw, 104px) 5%',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '660px', margin: '0 auto' }}>
          <p
            className={mono.className}
            style={{ color: 'var(--gold)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '20px' }}
          >
            Ready when you are
          </p>
          <h2
            className={playfair.className}
            style={{ fontSize: 'clamp(32px, 4.5vw, 54px)', marginBottom: '12px', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            Know your value in 30 minutes.
          </h2>
          <p style={{ fontSize: '17px', color: '#c7d2e0', marginBottom: '40px', lineHeight: 1.65 }}>
            No resume required. No career coach. Just your experience — and a clear path forward.
          </p>

          <form
            style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}
            onSubmit={e => { e.preventDefault(); submitWaitlist(ctaEmail, setCtaStatus) }}
          >
            <input
              type="email"
              className="cta-input"
              placeholder="Enter your work email"
              value={ctaEmail}
              onChange={e => setCtaEmail(e.target.value)}
              required
              aria-label="Email address"
            />
            <button type="submit" className="cta-btn" disabled={ctaStatus === 'loading'}>
              {ctaStatus === 'loading' ? 'One sec…' : 'Get my career map →'}
            </button>
          </form>

          {ctaStatus === 'success' && (
            <p style={{ color: 'var(--green-bright)', fontSize: '14px', marginBottom: '8px' }}>
              ✓ You&apos;re in — access link coming shortly.
            </p>
          )}

          {/* Trust signals */}
          <div style={trustBadgeStyle}>
            <span style={trustItemStyle}><span>✓</span> No resume required</span>
            <span style={{ ...trustItemStyle, opacity: 0.3 }}>·</span>
            <span style={trustItemStyle}><span>✓</span> Free to start</span>
            <span style={{ ...trustItemStyle, opacity: 0.3 }}>·</span>
            <span style={trustItemStyle}><span>✓</span> No spam, ever</span>
          </div>

          {/* Direct access */}
          <p style={{ marginTop: '24px', fontSize: '14px', color: '#8fa3c0' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--gold-bright)', textDecoration: 'none', fontWeight: 600 }}>
              Sign in →
            </Link>
          </p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: 'clamp(48px, 6vw, 64px) 5% 32px' }}>
        <div
          style={{
            maxWidth: '1100px', margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '40px', marginBottom: '40px',
          }}
        >
          {/* Brand */}
          <div>
            <div className={playfair.className} style={{ fontSize: '21px', fontWeight: 700, color: 'var(--royal)', marginBottom: '10px' }}>
              RelaunchJobs
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '10px' }}>
              AI-powered career transitions for displaced workers.
            </p>
            <p className={mono.className} style={{ fontSize: '11px', color: '#8a94a6', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Founded by JAS
            </p>
          </div>

          {/* Product */}
          <div>
            <p className={mono.className} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--royal)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
              Product
            </p>
            {[
              { label: 'Get started free', href: '/signup' },
              { label: 'Sign in', href: '/login' },
              { label: 'How it works', href: '#' },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{ display: 'block', fontSize: '14px', color: '#4a5568', textDecoration: 'none', marginBottom: '9px', lineHeight: 1.5 }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <p className={mono.className} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--royal)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
              Legal
            </p>
            {[
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Contact us', href: '/contact' },
              { label: 'We never sell your data', href: '/privacy' },
            ].map(l => (
              <Link
                key={l.label}
                href={l.href}
                style={{ display: 'block', fontSize: '14px', color: '#4a5568', textDecoration: 'none', marginBottom: '9px', lineHeight: 1.5 }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Support */}
          <div>
            <p className={mono.className} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--royal)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
              Support
            </p>
            <a
              href="mailto:support@relaunchjobs.app"
              style={{ display: 'block', fontSize: '14px', color: 'var(--royal)', textDecoration: 'none', fontWeight: 600, marginBottom: '8px' }}
            >
              support@relaunchjobs.app
            </a>
            <p style={{ fontSize: '13px', color: '#8a94a6', lineHeight: 1.6 }}>
              We respond within 24 hours.<br />No bots. Just us.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid #e2e8f0', paddingTop: '22px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '10px',
          }}
        >
          <p className={mono.className} style={{ fontSize: '12px', color: '#9ca3af' }}>
            © {new Date().getFullYear()} RelaunchJobs. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/terms" style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'none' }}>Terms</Link>
            <Link href="/privacy" style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/contact" style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'none' }}>Contact</Link>
            <a href="mailto:support@relaunchjobs.app" style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'none' }}>support@relaunchjobs.app</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
