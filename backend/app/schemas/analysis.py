"""
Pydantic schemas for website analysis
"""
from typing import List, Optional
from pydantic import BaseModel, HttpUrl, Field


class AnalyzeRequest(BaseModel):
    url: HttpUrl = Field(..., description="Website URL to analyze")


class AudienceItem(BaseModel):
    label: str
    emoji: Optional[str] = None
    pain_points: List[str] = []
    solutions: List[str] = []
    match_score: Optional[float] = Field(
        default=None, ge=0, le=100, description="Audience fit score 0-100"
    )


class AnalyzeResponse(BaseModel):
    url: HttpUrl
    name: Optional[str] = None
    overview: Optional[str] = None
    core_pain_point: Optional[str] = None
    audiences: List[AudienceItem] = []
    # recommendations can be added later per design

