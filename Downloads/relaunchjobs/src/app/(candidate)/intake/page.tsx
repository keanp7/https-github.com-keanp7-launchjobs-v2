'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/contexts/LangContext'
import { toast } from 'sonner'
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
  const { t } = useLang()

  const handleSubmit = async () => {
    setIsLoading(true)
    const messages = [
      t('intake.loading1'),
      t('intake.loading2'),
      t('intake.loading3'),
      t('intake.loading4'),
      t('intake.loading5'),
      t('intake.loading6'),
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
      if (!riskRes.ok) throw new Error(riskData.details || 'Risk scoring failed')
      console.log('[intake] Risk response:', riskData)

      // Step 3 - Role matching
      const matchRes = await fetch('/api/pipeline/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate_id: candidate.id, intake_data: formData })
      })
      if (!matchRes.ok) {
        const e = await matchRes.json()
        throw new Error(e.details || 'Role matching failed')
      }
      const matchData = await matchRes.json()
      console.log('[intake] Match response:', JSON.stringify(matchData))
      console.log('[intake] target_roles saved:', matchData?.data?.target_roles?.length, 'roles')

      // Step 4 - Gap analysis
      const gapRes = await fetch('/api/pipeline/gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate_id: candidate.id, intake_data: formData })
      })
      if (!gapRes.ok) {
        const e = await gapRes.json()
        console.warn('[intake] Gap analysis failed (non-fatal):', e.details)
      } else {
        const gapData = await gapRes.json()
        console.log('[intake] Gap response:', gapData)
      }

      clearInterval(interval)
      router.push('/analysis')
    } catch(error: any) {
      clearInterval(interval)
      setIsLoading(false)
      setLoadingMessage('')
      console.error("Submit error:", error)
      toast.error(error.message || 'Something went wrong. Your answers are saved — please try again.')
    }
  }

  const handleNext = () => {
    if (currentStep === 5) {
      handleSubmit()
      return
    }

    if (currentStep === 1) {
      if (!formData.jobTitle.trim()) { toast.error('Please enter your job title.'); return }
      setFlashMessage(t('intake.gotIt', { title: formData.jobTitle }))
      setTimeout(() => {
        setFlashMessage('')
        setCurrentStep(2)
      }, 1500)
      return
    }

    if (currentStep === 2 && !formData.yearsExp) { toast.error('Please select your years of experience.'); return }
    if (currentStep === 3 && !formData.industry.trim()) { toast.error('Please enter your industry.'); return }
    if (currentStep === 4 && !formData.reason) { toast.error('Please select your displacement reason.'); return }

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
            <h2 className="question-label">{t('intake.step1Question')}</h2>
            <p className="helper-text">{t('intake.step1Helper')}</p>
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
            <h2 className="question-label">{t('intake.step2Question')}</h2>
            <select
              className="intake-select"
              value={formData.yearsExp}
              onChange={(e) => setFormData({ ...formData, yearsExp: e.target.value })}
            >
              <option value="" disabled>{t('intake.step2Select')}</option>
              <option value="1">{t('intake.step2Opt1')}</option>
              <option value="2">{t('intake.step2Opt2')}</option>
              <option value="4">{t('intake.step2Opt3')}</option>
              <option value="8">{t('intake.step2Opt4')}</option>
              <option value="12">{t('intake.step2Opt5')}</option>
            </select>
          </>
        )
      case 3:
        return (
          <>
            <h2 className="question-label">{t('intake.step3Question')}</h2>
            <p className="helper-text">{t('intake.step3Helper')}</p>
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
            <h2 className="question-label">{t('intake.step4Question')}</h2>
            <p className="helper-text">{t('intake.step4Helper')}</p>
            <select
              className="intake-select"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            >
              <option value="" disabled>{t('intake.step4Select')}</option>
              <option value="AI or automation replaced my role">{t('intake.step4Opt1')}</option>
              <option value="Company-wide layoffs">{t('intake.step4Opt2')}</option>
              <option value="My role was outsourced">{t('intake.step4Opt3')}</option>
              <option value="Company shutdown or acquisition">{t('intake.step4Opt4')}</option>
              <option value="I chose to leave before being displaced">{t('intake.step4Opt5')}</option>
              <option value="Other">{t('intake.step4Opt6')}</option>
            </select>
          </>
        )
      case 5:
        return (
          <>
            <div className="gold-banner">{t('intake.step5Banner')}</div>
            <h2 className="question-label">{t('intake.step5Question')}</h2>
            <p className="helper-text">{t('intake.step5Helper')}</p>
            <textarea
              className="intake-textarea"
              placeholder={t('intake.step5Placeholder')}
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
        <div className="progress-label">{t('intake.stepOf', { current: currentStep })}</div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="intake-card">
        {currentStep > 1 && (
          <button className="btn-back" onClick={handleBack}>{t('intake.back')}</button>
        )}

        {renderStep(currentStep)}

        {flashMessage && <div className="flash-msg">{flashMessage}</div>}

        <button className="btn-next" onClick={handleNext}>
          {currentStep === 5 ? t('intake.analyze') : t('intake.continue')}
        </button>
      </div>
    </div>
  )
}
