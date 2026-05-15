'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Playfair_Display, Outfit, DM_Mono } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'] })
const outfit = Outfit({ subsets: ['latin'] })
const mono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

// ── CSS vars available throughout the page ────────────────────────────────────
const ROOT_VARS = {
  '--royal': '#1a3a6b',
  '--royal-deep': '#0d2147',
  '--gold': '#c9952a',
  '--gold-bright': '#f0b832',
  '--green': '#1a6b4a',
  '--green-bright': '#3ecf8e',
} as React.CSSProperties

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
      {/* ── NAVBAR ── white bg, royal blue logo, accessible nav links ──────── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 8px rgba(13,33,71,0.07)',
          padding: '0 5%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '68px',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className={playfair.className}
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--royal)',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
          }}
        >
          RelaunchJobs
        </Link>

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link
            href="/login"
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1.5px solid var(--royal)',
              color: 'var(--royal)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '15px',
              display: 'inline-block',
              lineHeight: 1,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--royal)'
              ;(e.currentTarget as HTMLAnchorElement).style.color = '#fff'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'
              ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--royal)'
            }}
          >
            Sign in
          </Link>

          <Link
            href="/intake"
            style={{
              padding: '10px 22px',
              borderRadius: '8px',
              backgroundColor: 'var(--gold)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '15px',
              display: 'inline-block',
              lineHeight: 1,
              boxShadow: '0 2px 8px rgba(201,149,42,0.3)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e =>
              ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#b8841f')
            }
            onMouseLeave={e =>
              ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--gold)')
            }
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── HERO ── dark navy bg, gold headline accent ───────────────────────── */}
      <section
        style={{
          backgroundColor: 'var(--royal-deep)',
          color: 'white',
          padding: '96px 5% 112px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          {/* Gold accent bar */}
          <div
            style={{
              display: 'inline-block',
              height: '3px',
              width: '48px',
              backgroundColor: 'var(--gold)',
              borderRadius: '2px',
              marginBottom: '32px',
            }}
          />
          <h1
            className={playfair.className}
            style={{
              fontSize: 'clamp(38px, 5vw, 68px)',
              lineHeight: 1.08,
              marginBottom: '28px',
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            Your skills didn&apos;t disappear.{' '}
            <span style={{ color: 'var(--gold-bright)' }}>Your title did.</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(17px, 2vw, 21px)',
              color: '#c7d2e0',
              marginBottom: '52px',
              lineHeight: 1.65,
              maxWidth: '640px',
              margin: '0 auto 52px',
            }}
          >
            AI displaced you. We use AI to show you what you&apos;re actually worth — and hand you
            the fastest path to your next role.
          </p>

          <form
            onSubmit={e => {
              e.preventDefault()
              submitWaitlist(heroEmail, setHeroStatus)
            }}
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '20px',
            }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={heroEmail}
              onChange={e => setHeroEmail(e.target.value)}
              required
              aria-label="Email address"
              style={{
                padding: '15px 20px',
                borderRadius: '8px',
                border: '2px solid rgba(255,255,255,0.15)',
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: 'white',
                width: '300px',
                fontSize: '16px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '15px 30px',
                backgroundColor: 'var(--gold)',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(201,149,42,0.4)',
              }}
            >
              {heroStatus === 'loading' ? 'Submitting…' : 'Start free →'}
            </button>
          </form>

          {heroStatus === 'success' && (
            <p style={{ color: 'var(--green-bright)', marginBottom: '24px', fontSize: '15px' }}>
              ✓ You&apos;re on the early access list
            </p>
          )}

          <div
            className={mono.className}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '28px',
              flexWrap: 'wrap',
              color: '#8fa3c0',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginTop: '40px',
            }}
          >
            <span>6,500 workers validated</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>3 wk avg gap</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>92% already qualified</span>
          </div>
        </div>
      </section>

      {/* ── PAIN SECTION ── white bg, royal blue headline ────────────────────── */}
      <section style={{ padding: '96px 5%', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p
            className={mono.className}
            style={{
              textAlign: 'center',
              color: 'var(--gold)',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '16px',
            }}
          >
            Sound familiar?
          </p>
          <h2
            className={playfair.className}
            style={{
              fontSize: 'clamp(30px, 3.5vw, 44px)',
              textAlign: 'center',
              color: 'var(--royal)',
              marginBottom: '56px',
              letterSpacing: '-0.02em',
            }}
          >
            The job search is broken for displaced workers.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
              marginBottom: '64px',
            }}
          >
            {[
              'Applying to 100+ roles with zero response.',
              'Feeling like your 10 years of experience is suddenly worthless.',
              'Not knowing what title to even search for anymore.',
              'Watching entry-level roles demand 5 years of experience.',
            ].map((pain, i) => (
              <div
                key={i}
                style={{
                  padding: '32px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '3px',
                    backgroundColor: 'var(--gold)',
                    marginBottom: '20px',
                    borderRadius: '2px',
                  }}
                />
                <p style={{ fontSize: '17px', lineHeight: 1.65, color: '#4a5568' }}>{pain}</p>
              </div>
            ))}
          </div>

          {/* Pull quote */}
          <div
            style={{
              backgroundColor: '#fdfbf5',
              padding: '52px 48px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              border: '1px solid #e8dfc8',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                lineHeight: 1,
                color: 'var(--gold)',
                fontFamily: 'Georgia, serif',
                marginBottom: '12px',
              }}
            >
              &ldquo;
            </div>
            <h3
              className={playfair.className}
              style={{
                fontSize: 'clamp(20px, 2.5vw, 28px)',
                marginBottom: '24px',
                color: 'var(--royal)',
                maxWidth: '680px',
                lineHeight: 1.45,
              }}
            >
              Better than any career coach I&apos;ve hired. You actually get my experience.
            </h3>
            <p
              className={mono.className}
              style={{
                color: '#8a94a6',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
              }}
            >
              Jessica H. &nbsp;·&nbsp; Executive Operations Professional &nbsp;·&nbsp; New York
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── dark navy bg, gold step labels ───────────────────── */}
      <section style={{ backgroundColor: 'var(--royal-deep)', color: 'white', padding: '96px 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p
            className={mono.className}
            style={{
              textAlign: 'center',
              color: 'var(--gold)',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '16px',
            }}
          >
            The process
          </p>
          <h2
            className={playfair.className}
            style={{
              fontSize: 'clamp(32px, 4vw, 52px)',
              textAlign: 'center',
              marginBottom: '64px',
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            From displaced to{' '}
            <span style={{ color: 'var(--green-bright)' }}>re-employed in weeks.</span>
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {[
              {
                title: 'Step 1 — Describe your background',
                desc: 'Your job title and a few sentences about what you did. No resume upload. 5 minutes.',
              },
              {
                title: 'Step 2 — We extract your real skills',
                desc: 'Our AI maps your experience to transferable skills — the ones that actually matter to employers in 2026.',
              },
              {
                title: 'Step 3 — See your market risk score',
                desc: 'Understand your automation risk, demand signals, and transferability — with honest, clear insights.',
              },
              {
                title: 'Step 4 — Pick your target role',
                desc: '3–5 adjacent roles you\'re already 70–80% qualified for. Match scores, salary ranges, time-to-hire estimates.',
              },
              {
                title: 'Step 5 — Close the gap in weeks',
                desc: 'A personalized 2–6 week learning sprint. Free resources only. Each week ends with proof you can show an employer.',
              },
              {
                title: 'Step 6 — Get your skills profile',
                desc: 'A shareable profile built around what you can do — not what you used to be. Employers reach out. You pick.',
              },
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  padding: '32px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div
                  className={mono.className}
                  style={{ color: 'var(--gold)', fontSize: '14px', marginBottom: '14px', fontWeight: 500 }}
                >
                  {step.title}
                </div>
                <p style={{ color: '#9bafc8', lineHeight: 1.65, fontSize: '15px' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── light bg, royal blue headline ────────────────────── */}
      <section style={{ padding: '96px 5%', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p
            className={mono.className}
            style={{
              textAlign: 'center',
              color: 'var(--green)',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '16px',
            }}
          >
            Results
          </p>
          <h2
            className={playfair.className}
            style={{
              fontSize: 'clamp(30px, 4vw, 48px)',
              textAlign: 'center',
              marginBottom: '64px',
              color: 'var(--royal)',
              letterSpacing: '-0.02em',
            }}
          >
            Proof it works.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* Card 1 */}
            <div
              style={{
                padding: '40px',
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
              }}
            >
              <p style={{ fontSize: '17px', lineHeight: 1.7, marginBottom: '28px', color: '#4a5568' }}>
                &ldquo;I had no idea how much of my experience was still valuable. The roles it
                suggested were ones I had never considered.&rdquo;
              </p>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <p style={{ fontWeight: 700, color: 'var(--royal)', marginBottom: '4px' }}>
                  Early access member · United States
                </p>
                <p className={mono.className} style={{ fontSize: '12px', color: '#8a94a6' }}>
                  Transition: Operations Professional · In progress
                </p>
              </div>
            </div>

            {/* Card 2 — featured */}
            <div
              style={{
                padding: '40px',
                backgroundColor: 'var(--royal)',
                color: 'white',
                borderRadius: '20px',
                boxShadow: '0 24px 48px rgba(13,33,71,0.22)',
              }}
            >
              <p style={{ fontSize: '19px', lineHeight: 1.7, marginBottom: '28px', color: '#dce8f5' }}>
                &ldquo;Better than any career coach I&apos;ve hired. You actually get my experience.
                This gave me a glimmer of hope when I needed it most.&rdquo;
              </p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '20px' }}>
                <p style={{ fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                  Jessica H. · New York
                </p>
                <p className={mono.className} style={{ fontSize: '12px', color: 'var(--gold-bright)' }}>
                  Transition: EA to C-Suite → Chief of Staff
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div
              style={{
                padding: '40px',
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
              }}
            >
              <p style={{ fontSize: '17px', lineHeight: 1.7, marginBottom: '28px', color: '#4a5568' }}>
                &ldquo;I spent months thinking I needed to start from scratch. Turns out the gap was
                much smaller than I thought.&rdquo;
              </p>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <p style={{ fontWeight: 700, color: 'var(--royal)', marginBottom: '4px' }}>
                  Early access member · United States
                </p>
                <p className={mono.className} style={{ fontSize: '12px', color: '#8a94a6' }}>
                  Transition: Tech Professional · In progress
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── dark navy bg, gold headline ───────────────────────── */}
      <section
        style={{
          backgroundColor: 'var(--royal-deep)',
          color: 'white',
          padding: '100px 5%',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2
            className={playfair.className}
            style={{
              fontSize: 'clamp(34px, 4.5vw, 56px)',
              marginBottom: '16px',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            You didn&apos;t lose your career.
          </h2>
          <h2
            className={playfair.className}
            style={{
              fontSize: 'clamp(34px, 4.5vw, 56px)',
              marginBottom: '48px',
              color: 'var(--gold-bright)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            You lost your title.
          </h2>

          <form
            onSubmit={e => {
              e.preventDefault()
              submitWaitlist(ctaEmail, setCtaStatus)
            }}
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '20px',
            }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={ctaEmail}
              onChange={e => setCtaEmail(e.target.value)}
              required
              aria-label="Email address"
              style={{
                padding: '16px 22px',
                borderRadius: '8px',
                border: '2px solid rgba(255,255,255,0.15)',
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: 'white',
                width: '300px',
                fontSize: '16px',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '16px 32px',
                backgroundColor: 'var(--gold)',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(201,149,42,0.4)',
              }}
            >
              {ctaStatus === 'loading' ? 'Submitting…' : 'Start free →'}
            </button>
          </form>

          {ctaStatus === 'success' && (
            <p style={{ color: 'var(--green-bright)', fontSize: '15px' }}>
              ✓ You&apos;re on the early access list
            </p>
          )}
        </div>
      </section>

      {/* ── FOOTER ── responsive grid, support email, JAS founder ────────────── */}
      <footer
        style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '64px 5% 40px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '48px',
            marginBottom: '48px',
          }}
        >
          {/* Brand column */}
          <div>
            <div
              className={playfair.className}
              style={{ fontSize: '22px', fontWeight: 700, color: 'var(--royal)', marginBottom: '12px' }}
            >
              RelaunchJobs
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '12px' }}>
              AI-powered career transition for displaced workers.
            </p>
            <p
              className={mono.className}
              style={{ fontSize: '12px', color: '#8a94a6', textTransform: 'uppercase', letterSpacing: '0.07em' }}
            >
              Founded by JAS
            </p>
          </div>

          {/* Product column */}
          <div>
            <p
              className={mono.className}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--royal)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '16px',
              }}
            >
              Product
            </p>
            {[
              { label: 'Get started', href: '/intake' },
              { label: 'Sign in', href: '/login' },
              { label: 'Create account', href: '/signup' },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#4a5568',
                  textDecoration: 'none',
                  marginBottom: '10px',
                  lineHeight: 1.5,
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Contact column */}
          <div>
            <p
              className={mono.className}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--royal)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '16px',
              }}
            >
              Support
            </p>
            <a
              href="mailto:support@relaunchjobs.com"
              style={{
                display: 'block',
                fontSize: '14px',
                color: 'var(--royal)',
                textDecoration: 'none',
                fontWeight: 600,
                marginBottom: '10px',
              }}
            >
              support@relaunchjobs.com
            </a>
            <p style={{ fontSize: '13px', color: '#8a94a6', lineHeight: 1.6 }}>
              We respond within 24 hours.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <p className={mono.className} style={{ fontSize: '12px', color: '#9ca3af' }}>
            © {new Date().getFullYear()} RelaunchJobs. All rights reserved.
          </p>
          <p className={mono.className} style={{ fontSize: '12px', color: '#9ca3af' }}>
            Built by JAS, Founder
          </p>
        </div>
      </footer>
    </div>
  )
}
