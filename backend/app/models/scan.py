from sqlalchemy import Column, Integer, String, DateTime, JSON, Enum
from sqlalchemy.ext.declarative import declarative_base
import enum
from datetime import datetime

Base = declarative_base()

class ScanStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)
    repo_url = Column(String, index=True)
    scan_id = Column(String, unique=True, index=True)
    status = Column(Enum(ScanStatus), default=ScanStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    results = Column(JSON, nullable=True)
    error_message = Column(String, nullable=True)

class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(String, index=True)
    severity = Column(String)
    file_path = Column(String)
    line_number = Column(Integer)
    description = Column(String)
    tool = Column(String)  # bandit or semgrep
    created_at = Column(DateTime, default=datetime.utcnow) 