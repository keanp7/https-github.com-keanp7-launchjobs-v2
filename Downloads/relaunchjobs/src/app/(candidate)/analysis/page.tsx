'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AnalysisPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<any>(null)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }
        console.log('User id:', user.id)

        const { data: candidate } = await supabase
          .from('candidates')
          .select('id')
          .eq('profile_id', user.id)
          .single()

        console.log('Candidate:', candidate)
        if (!candidate) { setLoading(false); return }

        const { data: analysis, error } = await supabase
          .from('skills_analyses')
          .select('*')
          .eq('candidate_id', candidate.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        console.log('Analysis:', analysis)
        console.log('Analysis error:', error)

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <h2 className="text-2xl mb-4" style={{ fontFamily: 'Playfair Display' }}>RelaunchJobs</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9952a] mb-4"></div>
        <p className="text-[#6b7280]">Preparing your analysis...</p>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <p className="text-xl text-[#6b7280]">No analysis found.</p>
      </div>
    )
  }

  const safeSkills = analysis.safe_skills || []
  const hybridSkills = analysis.hybrid_skills || []
  const atRiskSkills = analysis.at_risk_skills || []
  const hiddenStrengths = analysis.hidden_strengths || []

  return (
    <div className="min-h-screen bg-white" style={{ padding: '48px 40px' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 640px) {
          .page-wrapper { padding: 24px 16px !important; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
      <div className="page-wrapper" style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Section 1 - Headline */}
        <section>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: '36px', margin: '0 0 8px 0' }}>
            Here's what you actually have.
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Your experience translated into language the market understands.
          </p>
        </section>

        {/* Section 2 - Stats row */}
        <section style={{ borderTop: '1px solid #f0ede6', paddingTop: '32px', marginTop: '32px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ backgroundColor: '#e8f5ef', color: '#1a6b4a', borderRadius: '20px', padding: '6px 16px', fontSize: '13px' }}>
              {safeSkills.length} safe skills
            </div>
            <div style={{ backgroundColor: '#ede9fe', color: '#7c3aed', borderRadius: '20px', padding: '6px 16px', fontSize: '13px' }}>
              {hybridSkills.length} hybrid skills
            </div>
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '20px', padding: '6px 16px', fontSize: '13px' }}>
              {atRiskSkills.length} at risk
            </div>
          </div>
        </section>

        {/* Section 3 - Safe skills */}
        <section style={{ borderTop: '1px solid #f0ede6', paddingTop: '32px', marginTop: '32px' }}>
          <h3 style={{ color: '#1a6b4a', fontWeight: 700, fontSize: '14px', margin: '0 0 4px 0' }}>✓ Safe from AI</h3>
          <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px', marginTop: 0 }}>
            These skills require human judgment — AI cannot replace them
          </p>
          {safeSkills.length > 0 ? (
            safeSkills.map((skill: any, i: number) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e4e2da',
                  borderRadius: '12px',
                  borderLeft: '3px solid #1a6b4a',
                  padding: '14px 16px',
                  marginBottom: '8px',
                  animation: 'fadeIn 0.5s ease forwards',
                  animationDelay: `${i * 100}ms`,
                  opacity: 0
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#0d0d0d' }}>{skill.skill}</div>
                <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>{skill.reason}</div>
              </div>
            ))
          ) : (
            <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '14px' }}>
              Risk scoring in progress...
            </p>
          )}
        </section>

        {/* Section 4 - Hybrid skills */}
        <section style={{ borderTop: '1px solid #f0ede6', paddingTop: '32px', marginTop: '32px' }}>
          <h3 style={{ color: '#7c3aed', fontWeight: 700, fontSize: '14px', margin: '0 0 4px 0' }}>⚡ More valuable with AI</h3>
          <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px', marginTop: 0 }}>
            These skills become stronger when paired with AI tools
          </p>
          {hybridSkills.length > 0 ? (
            hybridSkills.map((skill: any, i: number) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e4e2da',
                  borderRadius: '12px',
                  borderLeft: '3px solid #7c3aed',
                  padding: '14px 16px',
                  marginBottom: '8px',
                  animation: 'fadeIn 0.5s ease forwards',
                  animationDelay: `${i * 100}ms`,
                  opacity: 0
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#0d0d0d' }}>{skill.skill}</div>
                <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>{skill.reason}</div>
                {skill.ai_tool_pairing && (
                  <div style={{ color: '#7c3aed', fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>
                    Pairs with: {skill.ai_tool_pairing}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '14px' }}>
              Risk scoring in progress...
            </p>
          )}
        </section>

        {/* Section 5 - At risk skills */}
        <section style={{ borderTop: '1px solid #f0ede6', paddingTop: '32px', marginTop: '32px' }}>
          <h3 style={{ color: '#dc2626', fontWeight: 700, fontSize: '14px', margin: '0 0 4px 0' }}>⚠ Being automated</h3>
          <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px', marginTop: 0 }}>
            Be honest — these are being replaced
          </p>
          {atRiskSkills.length > 0 ? (
            atRiskSkills.map((skill: any, i: number) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e4e2da',
                  borderRadius: '12px',
                  borderLeft: '3px solid #dc2626',
                  padding: '14px 16px',
                  marginBottom: '8px',
                  animation: 'fadeIn 0.5s ease forwards',
                  animationDelay: `${i * 100}ms`,
                  opacity: 0
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#0d0d0d' }}>{skill.skill}</div>
                <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>{skill.reason}</div>
              </div>
            ))
          ) : (
            <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '14px' }}>
              Risk scoring in progress...
            </p>
          )}
          <p style={{ color: '#6b7280', fontStyle: 'italic', marginTop: '16px' }}>
            But notice how few these are compared to what you have.
          </p>
        </section>

        {/* Section 6 - Hidden strengths */}
        <section style={{ borderTop: '1px solid #f0ede6', paddingTop: '32px', marginTop: '32px' }}>
          <h3 style={{ color: '#c9952a', fontWeight: 700, fontSize: '14px', marginBottom: '16px', marginTop: 0 }}>
            🔍 What you didn't know you had
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {analysis.hidden_strengths?.map((item: any, i: number) => (
              <span key={i} style={{
                background: '#fdf3dc',
                color: '#c9952a',
                border: '1px solid rgba(201,149,42,0.3)',
                borderRadius: '20px',
                padding: '4px 14px',
                fontSize: '12px',
                margin: '4px',
                display: 'inline-block'
              }}>
                {typeof item === 'string' ? item : item.strength || item.inferred_from || JSON.stringify(item)}
              </span>
            ))}
          </div>
        </section>

        {/* Section 7 - CTA button */}
        <section style={{ borderTop: '1px solid #f0ede6', paddingTop: '32px', marginTop: '32px' }}>
          <button
            onClick={() => router.push('/roles')}
            style={{
              width: '100%',
              backgroundColor: '#c9952a',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '16px',
              fontSize: '15px',
              fontWeight: 700,
              marginTop: '40px',
              cursor: 'pointer'
            }}
          >
            See your target roles →
          </button>
          <p style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center', marginTop: '12px' }}>
            We found 3–5 roles you are already qualified for
          </p>
        </section>

      </div>
    </div>
  )
}
