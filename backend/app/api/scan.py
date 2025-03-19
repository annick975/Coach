from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, HttpUrl
from typing import Dict, Optional
from app.utils.scanner import SecurityScanner
from app.models.scan import ScanStatus, ScanResult
from sqlalchemy.orm import Session
from app.core.database import get_db
from datetime import datetime

router = APIRouter()

class ScanRequest(BaseModel):
    repo_url: HttpUrl

class ScanResponse(BaseModel):
    scan_id: str
    status: ScanStatus
    message: str

async def run_scan(scan_id: str, repo_url: str, db: Session):
    scanner = SecurityScanner(repo_url=str(repo_url), scan_id=scan_id)
    
    try:
        # Update scan status to in progress
        scan_record = db.query(ScanResult).filter(ScanResult.scan_id == scan_id).first()
        scan_record.status = ScanStatus.IN_PROGRESS
        db.commit()

        # Run the scan
        results = await scanner.scan()

        # Update scan results
        scan_record.status = ScanStatus.COMPLETED
        scan_record.completed_at = datetime.utcnow()
        scan_record.results = results
        db.commit()

    except Exception as e:
        scan_record.status = ScanStatus.FAILED
        scan_record.error_message = str(e)
        scan_record.completed_at = datetime.utcnow()
        db.commit()

@router.post("/scan/", response_model=ScanResponse)
async def create_scan(
    scan_request: ScanRequest,
    background_tasks: BackgroundTasks,
    db: Session = get_db()
):
    scan_id = await SecurityScanner.generate_scan_id()
    
    # Create scan record
    scan_record = ScanResult(
        scan_id=scan_id,
        repo_url=str(scan_request.repo_url),
        status=ScanStatus.PENDING
    )
    db.add(scan_record)
    db.commit()

    # Add scan task to background tasks
    background_tasks.add_task(run_scan, scan_id, scan_request.repo_url, db)

    return ScanResponse(
        scan_id=scan_id,
        status=ScanStatus.PENDING,
        message="Scan initiated successfully"
    )

@router.get("/results/{scan_id}/")
async def get_scan_results(scan_id: str, db: Session = get_db()):
    scan_record = db.query(ScanResult).filter(ScanResult.scan_id == scan_id).first()
    
    if not scan_record:
        raise HTTPException(status_code=404, detail="Scan not found")

    return {
        "scan_id": scan_record.scan_id,
        "status": scan_record.status,
        "results": scan_record.results if scan_record.status == ScanStatus.COMPLETED else None,
        "error": scan_record.error_message if scan_record.status == ScanStatus.FAILED else None,
        "created_at": scan_record.created_at,
        "completed_at": scan_record.completed_at
    } 