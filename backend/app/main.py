from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import scan, health, ai_fix
from app.core.config import settings

app = FastAPI(
    title="Security Scanner API",
    description="API for scanning GitHub repositories for security vulnerabilities",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(scan.router, prefix="/api/v1", tags=["scan"])
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(ai_fix.router, prefix="/api/v1", tags=["ai-fix"]) 