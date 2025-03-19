from typing import List
from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Security Scanner API"
    API_V1_STR: str = "/api/v1"
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]  # Add your frontend URL
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./security_scanner.db")
    
    # GitHub Configuration
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "")
    
    # Gemini API Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # File System
    REPO_CLONE_DIR: str = "temp_repos"
    SCAN_RESULTS_DIR: str = "scan_results"
    
    # Scanning Configuration
    MAX_REPO_SIZE_MB: int = 100
    SCAN_TIMEOUT_SECONDS: int = 300
    
    class Config:
        case_sensitive = True
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings() 