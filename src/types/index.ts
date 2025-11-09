// Type definitions for API responses and data structures

// ==========================================
// Tool Analysis Types
// ==========================================

export interface ToolAnalysis {
  tool_id: string
  url: string
  name: string
  overview: string
  core_pain_point: string
  audiences: Audience[]
  recommendations?: ToolRecommendations
  created_at: string
}

export interface Audience {
  id: string
  label: string
  emoji: string
  pain_points: string[]
  solutions: string[]
  match_score: number
}

export interface ToolRecommendations {
  similar_by_feature: ToolSummary[]
  similar_by_audience: ToolSummary[]
}

export interface ToolSummary {
  name: string
  url: string
  description: string
  key_differences: string[]
}

// ==========================================
// Search Types
// ==========================================

export interface SearchResult {
  title: string
  url: string
  snippet: string
  favicon: string
  preview?: {
    screenshot?: string
    og_image?: string
  }
  ai_analysis: {
    is_official: boolean
    description: string
    score: number
  }
}

export interface SearchResponse {
  query: string
  results: SearchResult[]
}

// ==========================================
// Script Generation Types
// ==========================================

export interface ScriptSection {
  text: string
  visual_hint: string
  duration: string
}

export interface Script {
  script_id: string
  style: ScriptStyle
  platform: Platform
  content: {
    hook: ScriptSection
    pain_point: ScriptSection
    solution: ScriptSection
    cta: ScriptSection
  }
  keywords: string[]
  estimated_duration: string
  created_at: string
}

export type ScriptStyle = 'dry_goods' | 'story' | 'comparison' | 'pain_point' | 'custom'
export type Platform = 'douyin' | 'xiaohongshu' | 'bilibili' | 'shipinhao'

export interface GenerateScriptRequest {
  tool_id: string
  audience_id: string
  style: ScriptStyle
  platform: Platform
  custom_examples?: string[]
}

// ==========================================
// Export Types
// ==========================================

export type ExportFormat = 'markdown' | 'word' | 'pdf' | 'json' | 'txt'

export interface ExportResponse {
  download_url: string
  expires_at: string
}

// ==========================================
// Page Preview Types
// ==========================================

export interface PagePreview {
  url: string
  screenshot: string
  summary: string
  suitability: {
    is_official: boolean
    has_product_info: boolean
    content_richness: 'rich' | 'medium' | 'poor'
  }
  recommendation: {
    level: 'high' | 'medium' | 'low'
    reason: string
  }
}

// ==========================================
// History Types
// ==========================================

export interface AnalysisHistory {
  id: string
  tool_name: string
  url: string
  audiences_count: number
  scripts_count: number
  created_at: string
}

// ==========================================
// API Error Types
// ==========================================

export interface APIError {
  detail: string
  status_code: number
}

// ==========================================
// Minimal Analyze API (MVP)
// ==========================================

export interface AnalyzeRequest {
  url: string
}

export interface AnalyzeAudienceItem {
  label: string
  emoji?: string
  pain_points: string[]
  solutions: string[]
  match_score?: number
}

export interface AnalyzeResponse {
  url: string
  name?: string
  overview?: string
  core_pain_point?: string
  audiences: AnalyzeAudienceItem[]
}
