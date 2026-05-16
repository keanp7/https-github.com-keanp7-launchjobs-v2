'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/contexts/LangContext'

export default function AnalysisPage() {
  const router = useRouter()
  const { t } = useLang()
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<any>(null)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }

        const { data: candidate } = await supabase
          .from('candidates')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!candidate) { setLoading(false); return }

        const { data: analysis, error } = await supabase
          .from('skills_analyses')
          .select('*')
          .eq('candidate_id', candidate.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        console.log('Analysis:', analysis, 'error:', error)
        if (analysis) setAnalysis(analysis)
      } catch (error) {
        console.error('Fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalysis()
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTop: '3px solid #1a3a6b', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>{t('analysis.loading')}</p>
        <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '24px' }}>
        <p style={{ color: '#6b7280', fontSize: '16px', textAlign: 'center' }}>{t('analysis.noData')}</p>
        <button
          onClick={() => router.push('/intake')}
          style={{ padding: '12px 28px', background: '#1a3a6b', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
        >
          Start your analysis
        </button>
      </div>
    )
  }

  const safeSkills   = analysis.safe_skills   || []
  const hybridSkills = analysis.hybrid_skills  || []
  const atRiskSkills = analysis.at_risk_skills || []

  return (
    <div style={{ padding: '0' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
      `}} />

      {/* Headline */}
      <section style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '34px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.2 }}>
          {t('analysis.title')}
        </h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>
          {t('analysis.subtitle')}
        </p>
      </section>

      {/* Stats row */}
      <section style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #f0ede6' }}>
        <Pill bg="#e8f5ef" color="#1a6b4a">{t('analysis.safeLabel', { n: safeSkills.length })}</Pill>
        <Pill bg="#ede9fe" color="#7c3aed">{t('analysis.hybridLabel', { n: hybridSkills.length })}</Pill>
        <Pill bg="#fee2e2" color="#dc2626">{t('analysis.riskLabel', { n: atRiskSkills.length })}</Pill>
      </section>

      {/* Safe skills */}
      <Section>
        <SectionTitle color="#1a6b4a">{t('analysis.safeTitle')}</SectionTitle>
        <SectionSubtitle>{t('analysis.safeSubtitle')}</SectionSubtitle>
        {safeSkills.length > 0
          ? safeSkills.map((skill: any, i: number) => (
            <SkillCard key={i} delay={i} accent="#1a6b4a">
              <strong style={{ color: '#0d0d0d' }}>{skill.skill}</strong>
              <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>{skill.reason}</div>
            </SkillCard>
          ))
          : <InProgress>{t('analysis.inProgress')}</InProgress>
        }
      </Section>

      {/* Hybrid skills */}
      <Section>
        <SectionTitle color="#7c3aed">{t('analysis.hybridTitle')}</SectionTitle>
        <SectionSubtitle>{t('analysis.hybridSubtitle')}</SectionSubtitle>
        {hybridSkills.length > 0
          ? hybridSkills.map((skill: any, i: number) => (
            <SkillCard key={i} delay={i} accent="#7c3aed">
              <strong style={{ color: '#0d0d0d' }}>{skill.skill}</strong>
              <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>{skill.reason}</div>
              {skill.ai_tool_pairing && (
                <div style={{ color: '#7c3aed', fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>
                  {t('analysis.pairsWith')} {skill.ai_tool_pairing}
                </div>
              )}
            </SkillCard>
          ))
          : <InProgress>{t('analysis.inProgress')}</InProgress>
        }
      </Section>

      {/* At-risk skills */}
      <Section>
        <SectionTitle color="#dc2626">{t('analysis.riskTitle')}</SectionTitle>
        <SectionSubtitle>{t('analysis.riskSubtitle')}</SectionSubtitle>
        {atRiskSkills.length > 0
          ? atRiskSkills.map((skill: any, i: number) => (
            <SkillCard key={i} delay={i} accent="#dc2626">
              <strong style={{ color: '#0d0d0d' }}>{skill.skill}</strong>
              <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>{skill.reason}</div>
            </SkillCard>
          ))
          : <InProgress>{t('analysis.inProgress')}</InProgress>
        }
        <p style={{ color: '#6b7280', fontStyle: 'italic', marginTop: '16px', fontSize: '14px' }}>
          {t('analysis.riskFootnote')}
        </p>
      </Section>

      {/* Hidden strengths */}
      <Section>
        <SectionTitle color="#c9952a">{t('analysis.hiddenTitle')}</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
          {(analysis.hidden_strengths || []).map((item: any, i: number) => (
            <span key={i} style={{ background: '#fdf3dc', color: '#c9952a', border: '1px solid rgba(201,149,42,0.3)', borderRadius: '20px', padding: '4px 14px', fontSize: '12px' }}>
              {typeof item === 'string' ? item : item.strength || item.inferred_from || JSON.stringify(item)}
            </span>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <button
          onClick={() => router.push('/roles')}
          style={{ width: '100%', background: '#c9952a', color: 'white', border: 'none', borderRadius: '10px', padding: '16px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginTop: '8px' }}
          onMouseOver={e => (e.currentTarget.style.background = '#b8841f')}
          onMouseOut={e => (e.currentTarget.style.background = '#c9952a')}
        >
          {t('analysis.cta')}
        </button>
        <p style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>
          {t('analysis.ctaNote')}
        </p>
      </Section>
    </div>
  )
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function Pill({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span style={{ backgroundColor: bg, color, borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: 500 }}>
      {children}
    </span>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ borderTop: '1px solid #f0ede6', paddingTop: '28px', marginTop: '28px' }}>
      {children}
    </section>
  )
}

function SectionTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return <h3 style={{ color, fontWeight: 700, fontSize: '14px', margin: '0 0 4px 0' }}>{children}</h3>
}

function SectionSubtitle({ children }: { children: React.ReactNode }) {
  return <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '14px', marginTop: 0 }}>{children}</p>
}

function SkillCard({ delay, accent, children }: { delay: number; accent: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'white', border: '1px solid #e4e2da', borderRadius: '12px',
      borderLeft: `3px solid ${accent}`, padding: '14px 16px', marginBottom: '8px',
      animation: 'fadeIn 0.5s ease forwards', animationDelay: `${delay * 80}ms`, opacity: 0,
    }}>
      {children}
    </div>
  )
}

function InProgress({ children }: { children: React.ReactNode }) {
  return <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '14px' }}>{children}</p>
}
