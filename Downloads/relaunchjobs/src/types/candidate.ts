export type ExperienceLevel = "entry" | "mid" | "senior" | "executive"
export type WorkMode = "remote" | "hybrid" | "onsite"

export interface Candidate {
  id: string
  user_id: string
  current_title: string
  context: string
  experience_years: number
  experience_level: ExperienceLevel
  location: string
  work_mode_preference: WorkMode
  created_at: string
  updated_at: string
}

export interface CandidateProfile {
  id: string
  candidate_id: string
  headline: string
  summary: string
  skills: Skill[]
  target_roles: string[]
  completed_at: string | null
}

export interface Skill {
  name: string
  category: SkillCategory
  level: SkillLevel
  years?: number
  transferable: boolean
}

export type SkillCategory =
  | "technical"
  | "leadership"
  | "communication"
  | "analytical"
  | "domain"
  | "soft"

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert"
