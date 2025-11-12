// Simple in-memory job store for analyze tasks
// NOTE: process-local and volatile; suitable for dev/demo.

export type AnalyzeJobStatus = 'pending' | 'completed' | 'failed'

export interface AnalyzeJob {
  id: string
  status: AnalyzeJobStatus
  model?: string
  analysis?: string
  error?: string
  createdAt: number
  updatedAt: number
}

const JOBS = new Map<string, AnalyzeJob>()

function now() { return Date.now() }
function genId(): string { return `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}` }

export function createJob(): AnalyzeJob {
  const job: AnalyzeJob = { id: genId(), status: 'pending', createdAt: now(), updatedAt: now() }
  JOBS.set(job.id, job)
  return job
}

export function setCompleted(id: string, model?: string, analysis?: string) {
  const job = JOBS.get(id)
  if (!job) return
  job.status = 'completed'
  if (model) job.model = model
  if (typeof analysis === 'string') job.analysis = analysis
  job.updatedAt = now()
}

export function setFailed(id: string, error: any) {
  const job = JOBS.get(id)
  if (!job) return
  job.status = 'failed'
  job.error = typeof error === 'string' ? error : (error?.message || 'failed')
  job.updatedAt = now()
}

export function getJob(id: string): AnalyzeJob | undefined { return JOBS.get(id) }
