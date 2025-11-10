"""
Website analysis service: fetches page content and produces a structured analysis.

MVP behavior:
- Fetch URL HTML using httpx
- Extract title, meta description, h1/h2 and main text via BeautifulSoup
- If OPENAI/Anthropic key is configured, use LLM to generate overview, core pain point,
  and audience breakdown. Otherwise, fall back to heuristic placeholders so the
  end-to-end flow works in dev environments.
"""
from __future__ import annotations

import re
from typing import Any, Dict, List, Optional, Tuple

import httpx
from bs4 import BeautifulSoup

from app.core.config import settings


USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
)


async def fetch_page(url: str, timeout: float = 20.0) -> Tuple[str, bytes]:
    headers = {"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml"}
    async with httpx.AsyncClient(follow_redirects=True, timeout=timeout) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        content_type = resp.headers.get("content-type", "")
        return content_type, resp.content


def extract_text_parts(content_type: str, html: bytes) -> Dict[str, Optional[str]]:
    if "html" not in content_type.lower():
        return {"title": None, "description": None, "h1": None, "text": None}

    soup = BeautifulSoup(html, "lxml")

    # Title
    title = (soup.title.string if soup.title else None) or None

    # Meta description
    desc = None
    desc_tag = soup.find("meta", attrs={"name": re.compile("description", re.I)})
    if desc_tag and desc_tag.get("content"):
        desc = desc_tag.get("content").strip() or None

    # First H1
    h1 = None
    h1_tag = soup.find("h1")
    if h1_tag:
        h1 = h1_tag.get_text(strip=True) or None

    # Main text - take visible text from body, limited size
    body = soup.body
    text = None
    if body:
        for s in body(["script", "style", "noscript"]):
            s.extract()
        raw = body.get_text(" ", strip=True)
        # collapse whitespace
        raw = re.sub(r"\s+", " ", raw)
        # limit length to 6000 chars to keep prompts small
        text = raw[:6000]

    return {"title": title, "description": desc, "h1": h1, "text": text}


def guess_name_from_title(title: Optional[str]) -> Optional[str]:
    if not title:
        return None
    # Common patterns like "Notion – Your connected workspace"
    # Take the first token before dash/pipe
    parts = re.split(r"\s*[\-|–|—|\|]\s*", title)
    if parts:
        candidate = parts[0].strip()
        if 1 <= len(candidate) <= 40:
            return candidate
    return None


def build_llm_prompt(url: str, parts: Dict[str, Optional[str]]) -> str:
    ctx = []
    if parts.get("title"):
        ctx.append(f"Title: {parts['title']}")
    if parts.get("description"):
        ctx.append(f"MetaDescription: {parts['description']}")
    if parts.get("h1"):
        ctx.append(f"H1: {parts['h1']}")
    if parts.get("text"):
        ctx.append(f"PageText: {parts['text']}")
    context_block = "\n".join(ctx)

    return (
        "You are an assistant that analyzes a product/tool website and produces "
        "a concise overview and multi-audience breakdown in Chinese per the schema.\n"
        "Focus on factual details from the provided page context. \n\n"
        f"URL: {url}\n\n"
        f"Context:\n{context_block}\n\n"
        "Return a JSON object with keys: name, overview, core_pain_point, audiences.\n"
        "audiences is an array of 5-8 items, each with: label, emoji, pain_points (3 items), "
        "solutions (3 items), match_score (0-100). Keep responses concise."
    )


async def analyze_with_llm(url: str, parts: Dict[str, Optional[str]]) -> Dict[str, Any]:
    prompt = build_llm_prompt(url, parts)

    # Prefer Anthropic if configured, else OpenAI, else None
    if settings.ANTHROPIC_API_KEY:
        try:
            from anthropic import Anthropic

            client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            msg = client.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=1200,
                temperature=0.5,
                messages=[{"role": "user", "content": prompt}],
            )
            content_text = "".join(
                part.text for part in msg.content if hasattr(part, "text")
            )
            import json

            data = json.loads(content_text)
            return data
        except Exception:
            pass

    if settings.OPENAI_API_KEY:
        try:
            from openai import OpenAI

            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            chat = client.chat.completions.create(
                model="gpt-4o-mini",
                temperature=0.5,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                max_tokens=1200,
            )
            content_text = chat.choices[0].message.content
            import json

            data = json.loads(content_text)
            return data
        except Exception:
            pass

    # No LLM available or failed — return heuristic placeholders
    name = guess_name_from_title(parts.get("title")) or "该工具"
    overview = (
        parts.get("description")
        or parts.get("h1")
        or (parts.get("text")[:160] + "...")
        if parts.get("text")
        else None
    )
    core_pain = "帮助用户更高效地完成任务，提高生产力。"
    audiences = [
        {
            "label": "学生党",
            "emoji": "👨‍🎓",
            "pain_points": ["信息分散", "难以系统化", "复习低效"],
            "solutions": ["集中管理", "结构化整理", "快速检索"],
            "match_score": 85,
        },
        {
            "label": "职场人士",
            "emoji": "💼",
            "pain_points": ["多任务切换", "协作困难", "流程混乱"],
            "solutions": ["一处协作", "可视化流程", "模板化管理"],
            "match_score": 88,
        },
        {
            "label": "自媒体创作",
            "emoji": "📝",
            "pain_points": ["选题零散", "素材管理难", "产出不稳定"],
            "solutions": ["灵感库", "素材库", "流程看板"],
            "match_score": 82,
        },
    ]

    return {
        "name": name,
        "overview": overview,
        "core_pain_point": core_pain,
        "audiences": audiences,
    }


async def analyze_website(url: str) -> Dict[str, Any]:
    content_type, html = await fetch_page(url)
    parts = extract_text_parts(content_type, html)
    llm_data = await analyze_with_llm(url, parts)

    # Ensure required keys exist
    result: Dict[str, Any] = {
        "url": url,
        "name": llm_data.get("name") if isinstance(llm_data, dict) else None,
        "overview": llm_data.get("overview") if isinstance(llm_data, dict) else None,
        "core_pain_point": llm_data.get("core_pain_point") if isinstance(llm_data, dict) else None,
        "audiences": llm_data.get("audiences") if isinstance(llm_data, dict) else [],
    }

    # Fill name if missing
    if not result.get("name"):
        result["name"] = guess_name_from_title(parts.get("title"))

    return result

