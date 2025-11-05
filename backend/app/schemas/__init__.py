"""
Pydantic Schemas for API Request/Response
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, HttpUrl


# ==========================================
# Tool Schemas
# ==========================================

class AudienceBase(BaseModel):
    label: str
    emoji: str
    pain_points: List[str]
    solutions: List[str]
    match_score: float


class AudienceResponse(AudienceBase):
    id: str
    tool_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ToolSummary(BaseModel):
    name: str
    url: str
    description: str
    key_differences: List[str]


class ToolRecommendations(BaseModel):
    similar_by_feature: List[ToolSummary]
    similar_by_audience: List[ToolSummary]


class ToolAnalysisResponse(BaseModel):
    tool_id: str
    url: str
    name: str
    overview: str
    core_pain_point: str
    audiences: List[AudienceResponse]
    recommendations: Optional[ToolRecommendations] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# Search Schemas
# ==========================================

class SearchRequest(BaseModel):
    query: str


class AIAnalysis(BaseModel):
    is_official: bool
    description: str
    score: int


class SearchResultItem(BaseModel):
    title: str
    url: str
    snippet: str
    favicon: str
    preview: Optional[Dict[str, str]] = None
    ai_analysis: AIAnalysis


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResultItem]


# ==========================================
# Script Schemas
# ==========================================

class ScriptSection(BaseModel):
    text: str
    visual_hint: str
    duration: str


class ScriptContent(BaseModel):
    hook: ScriptSection
    pain_point: ScriptSection
    solution: ScriptSection
    cta: ScriptSection


class GenerateScriptRequest(BaseModel):
    tool_id: str
    audience_id: str
    style: str  # dry_goods/story/comparison/pain_point/custom
    platform: str  # douyin/xiaohongshu/bilibili/shipinhao
    custom_examples: Optional[List[str]] = None


class ScriptResponse(BaseModel):
    script_id: str
    style: str
    platform: str
    content: ScriptContent
    keywords: List[str]
    estimated_duration: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# Export Schemas
# ==========================================

class ExportRequest(BaseModel):
    tool_id: str
    format: str  # markdown/word/pdf/json/txt


class ExportResponse(BaseModel):
    download_url: str
    expires_at: datetime


# ==========================================
# Page Preview Schemas
# ==========================================

class PageSuitability(BaseModel):
    is_official: bool
    has_product_info: bool
    content_richness: str  # rich/medium/poor


class PageRecommendation(BaseModel):
    level: str  # high/medium/low
    reason: str


class PagePreviewResponse(BaseModel):
    url: str
    screenshot: str
    summary: str
    suitability: PageSuitability
    recommendation: PageRecommendation


# ==========================================
# Common Schemas
# ==========================================

class HealthResponse(BaseModel):
    status: str
    version: str


class ErrorResponse(BaseModel):
    detail: str
