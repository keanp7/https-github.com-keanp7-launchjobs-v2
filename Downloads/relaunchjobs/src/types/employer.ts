export interface Employer {
  id: string
  user_id: string
  company_name: string
  company_size: CompanySize
  industry: string
  website?: string
  created_at: string
}

export type CompanySize =
  | "1-10"
  | "11-50"
  | "51-200"
  | "201-500"
  | "501-1000"
  | "1000+"

export interface JobRole {
  id: string
  employer_id: string
  title: string
  description: string
  required_skills: string[]
  preferred_skills: string[]
  experience_years_min: number
  experience_years_max?: number
  work_mode: "remote" | "hybrid" | "onsite"
  location?: string
  salary_min?: number
  salary_max?: number
  status: "draft" | "active" | "closed"
  created_at: string
  updated_at: string
}
