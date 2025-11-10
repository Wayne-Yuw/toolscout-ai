"""
Analyze API endpoints
"""
from fastapi import APIRouter, HTTPException

from app.schemas.analysis import AnalyzeRequest, AnalyzeResponse
from app.services.analyzer import analyze_website


router = APIRouter(prefix="/analyze", tags=["Analysis"])


@router.post("/", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    """Analyze a website by URL and return structured results."""
    try:
        data = await analyze_website(req.url)
        return AnalyzeResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to analyze: {e}")

