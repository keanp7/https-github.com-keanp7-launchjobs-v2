'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import './intake.css'

export default function IntakePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [flashMessage, setFlashMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [formData, setFormData] = useState({
    jobTitle: '',
    yearsExp: '',
    industry: '',
    reason: '',
    context: ''
  })
  
  const router = useRouter()

  const handleSubmit = async () => {
    setIsLoading(true)
    const messages = [
      'Reading your background...',
      'Identifying transferable skills...',
      'Scoring market demand...',
      'Finding your target roles...',
      'Analyzing skill gaps...',
      'Finding your fastest path...'
    ]
    let i = 0
    setLoadingMessage(messages[0])
    const interval = setInterval(() => {
      i = (i + 1) % messages.length
      setLoadingMessage(messages[i])
    }, 2000)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')
      
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .upsert({
          profile_id: user?.id,
          old_job_title: formData.jobTitle,
          years_experience: parseInt(formData.yearsExp) || 1,
          industry: formData.industry,
          displacement_reason: formData.reason,
          extra_context: formData.context,
          status: 'intake'
        }, {
          onConflict: 'profile_id'
        })
        .select('id')
        .single()

      if (candidateError) {
        throw new Error(`Candidate insert failed: ${candidateError.message}`)
      }

      if (!candidate?.id) {
        throw new Error('Candidate created but no ID returned')
      }

      const res = await fetch('/api/pipeline/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: candidate.id,
          intake_data: formData
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.details || 'Pipeline failed')
      }

      // Step 2 - Risk scoring
      const riskRes = await fetch('/api/pipeline/risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate_id: candidate.id, intake_data: formData })
      })
      const riskData = await riskRes.json()
      console.log('Risk route response:', riskData)

      // Step 3 - Role matching
      const matchRes = await fetch('/api/pipeline/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate_id: candidate.id, intake_data: formData })
      })

      // Step 4 - Gap analysis
      const gapRes = await fetch('/api/pipeline/gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate_id: candidate.id, intake_data: formData })
      })

      clearInterval(interval)
      router.push('/analysis')
    } catch(error: any) {
      clearInterval(interval)
      setIsLoading(false)
      setLoadingMessage('')
      console.error("Submit error:", error)
      alert(`Error: ${error.message || 'Something went wrong. Your answers are saved — please try again.'}`)
    }
  }

  const handleNext = () => {
    if (currentStep === 5) {
      handleSubmit()
      return
    }
    
    if (currentStep === 1 && formData.jobTitle) {
      setFlashMessage(`Got it. Let's find out what ${formData.jobTitle} is really worth.`)
      setTimeout(() => {
        setFlashMessage('')
        setCurrentStep(2)
      }, 1500)
      return
    }

    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const renderStep = (step: number) => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="question-label">What was your most recent job title?</h2>
            <p className="helper-text">Don't worry about exact wording — just what you called yourself</p>
            <input 
              type="text"
              className="intake-input"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            />
          </>
        )
      case 2:
        return (
          <>
            <h2 className="question-label">How many years were you in that role?</h2>
            <select 
              className="intake-select"
              value={formData.yearsExp}
              onChange={(e) => setFormData({ ...formData, yearsExp: e.target.value })}
            >
              <option value="" disabled>Select years of experience</option>
              <option value="1">Less than 1 year</option>
              <option value="2">1 to 2 years</option>
              <option value="4">3 to 5 years</option>
              <option value="8">6 to 10 years</option>
              <option value="12">More than 10 years</option>
            </select>
          </>
        )
      case 3:
        return (
          <>
            <h2 className="question-label">What industry or type of company were you in?</h2>
            <p className="helper-text">Be specific — it helps us find the right adjacent roles</p>
            <input 
              type="text"
              className="intake-input"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            />
          </>
        )
      case 4:
        return (
          <>
            <h2 className="question-label">What happened to your role?</h2>
            <p className="helper-text">No judgment — this helps us understand the market context</p>
            <select 
              className="intake-select"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            >
              <option value="" disabled>Select a reason</option>
              <option value="AI or automation replaced my role">AI or automation replaced my role</option>
              <option value="Company-wide layoffs">Company-wide layoffs</option>
              <option value="My role was outsourced">My role was outsourced</option>
              <option value="Company shutdown or acquisition">Company shutdown or acquisition</option>
              <option value="I chose to leave before being displaced">I chose to leave before being displaced</option>
              <option value="Other">Other</option>
            </select>
          </>
        )
      case 5:
        return (
          <>
            <div className="gold-banner">This is the question that changes everything. Most people undersell themselves here. Don't.</div>
            <h2 className="question-label">Tell us what you actually did — in your own words</h2>
            <p className="helper-text">The more specific you are, the better your analysis.</p>
            <textarea 
              className="intake-textarea"
              placeholder="e.g. I managed a team of 8, handled enterprise client escalations, built our internal training docs, and owned the Zendesk setup. I also covered for my manager during a 3-month leave."
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
            />
          </>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="intake-wrapper">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', color: '#1a3a6b', margin: 0 }}>RelaunchJobs</h1>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e5e7eb', 
            borderTop: '4px solid #1a3a6b', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }} />
          <p style={{ color: '#6b7280', fontSize: '15px' }}>{loadingMessage}</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div className="intake-wrapper">
      <div className="progress-bar-wrap">
        <div className="progress-label">Step {currentStep} of 5</div>
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="intake-card">
        {currentStep > 1 && (
          <button className="btn-back" onClick={handleBack}>← Back</button>
        )}
        
        {renderStep(currentStep)}
        
        {flashMessage && <div className="flash-msg">{flashMessage}</div>}
        
        <button className="btn-next" onClick={handleNext}>
          {currentStep === 5 ? 'Analyze my skills →' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}
