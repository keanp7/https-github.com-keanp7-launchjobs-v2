// ─── Intake ───────────────────────────────────────────────────────────────────
export interface CandidateIntake {
  old_job_title: string
  years_experience: number
  industry: string
  displacement_reason: string
  extra_context?: string
}

// ─── Step 1: Skills Extraction ────────────────────────────────────────────────
export interface HardSkill {
  skill: string
  proficiency: "expert" | "intermediate" | "basic"
}

export interface SoftSkill {
  skill: string
  evidence: string
}

export interface DomainKnowledge {
  area: string
  depth: "deep" | "moderate" | "surface"
}

export interface HiddenStrength {
  strength: string
  inferred_from: string
}

export interface ExtractResult {
  hard_skills: HardSkill[]
  soft_skills: SoftSkill[]
  domain_knowledge: DomainKnowledge[]
  hidden_strengths: HiddenStrength[]
}

// ─── Step 2: Risk Scoring ─────────────────────────────────────────────────────
export interface RatedSkill {
  skill: string
  reason: string
}

export interface SafeSkill extends RatedSkill {
  market_demand: "high" | "medium" | "low"
}

export interface AtRiskSkill extends RatedSkill {
  timeline: string
}

export interface HybridSkill extends RatedSkill {
  ai_tool_pairing: string
}

export interface RiskResult {
  safe_skills: SafeSkill[]
  at_risk_skills: AtRiskSkill[]
  hybrid_skills: HybridSkill[]
}

// ─── Step 3: Role Matching ────────────────────────────────────────────────────
export interface TargetRole {
  title: string
  match_score: number
  why_realistic: string
  market_demand: "high" | "medium" | "low"
  avg_salary_range: string
  time_to_hire_weeks: number
  already_qualified_percent: number
}

export interface MatchResult {
  target_roles: TargetRole[]
}

// ─── Step 4: Gap Analysis ─────────────────────────────────────────────────────
export interface GapItem {
  skill: string
  priority: "critical" | "important" | "nice-to-have"
  learn_time_days: number
  proof_type: string
  free_resource: string
}

export interface RoleGapAnalysis {
  role: string
  already_have: string[]
  gaps: GapItem[]
  biggest_barrier: string
  readiness_percent: number
}

export interface GapResult {
  gap_analysis: RoleGapAnalysis[]
}

// ─── Step 5: Learning Path ────────────────────────────────────────────────────
export interface LearningResource {
  name: string
  type: "video" | "course" | "article" | "practice" | "project"
  platform: string
  cost: "free" | "paid"
  url: string
  hours: number
}

export interface LearningWeek {
  week: number
  focus: string
  goal: string
  resources: LearningResource[]
  milestone: string
}

export interface LearningResult {
  target_role: string
  total_weeks: number
  weekly_hours: number
  weeks: LearningWeek[]
  final_proof: string
  interview_angle: string
  is_fallback?: boolean
}

// ─── Step 6: Profile ──────────────────────────────────────────────────────────
export interface ProofPoint {
  claim: string
  evidence: string
}

export interface ProfileResult {
  headline: string
  positioning_statement: string
  top_skills: string[]
  proof_points: ProofPoint[]
  employer_pitch: string
  open_to: string[]
  is_fallback?: boolean
}

// ─── Full Pipeline State ──────────────────────────────────────────────────────
export interface PipelineState {
  candidate_id: string
  current_step: PipelineStep
  intake?: CandidateIntake
  extract?: ExtractResult
  risk?: RiskResult
  match?: MatchResult
  gap?: GapResult
  learning?: LearningResult
  profile?: ProfileResult
}

export type PipelineStep =
  | "intake"
  | "analysis"
  | "roles"
  | "learning"
  | "profile"
  | "complete"
