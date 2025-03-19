import os
import shutil
import subprocess
import json
import uuid
from git import Repo
from typing import Dict, List, Optional
import tempfile
from app.core.config import settings
import asyncio
from app.models.scan import ScanStatus

class SecurityScanner:
    def __init__(self, repo_url: str, scan_id: str):
        self.repo_url = repo_url
        self.scan_id = scan_id
        self.clone_path = os.path.join(settings.REPO_CLONE_DIR, self.scan_id)
        self.results_path = os.path.join(settings.SCAN_RESULTS_DIR, f"{self.scan_id}.json")

    async def setup(self):
        """Create necessary directories"""
        os.makedirs(settings.REPO_CLONE_DIR, exist_ok=True)
        os.makedirs(settings.SCAN_RESULTS_DIR, exist_ok=True)

    async def clone_repository(self) -> bool:
        """Clone the repository to a temporary directory"""
        try:
            Repo.clone_from(self.repo_url, self.clone_path)
            return True
        except Exception as e:
            print(f"Error cloning repository: {str(e)}")
            return False

    async def run_bandit_scan(self) -> List[Dict]:
        """Run Bandit scanner on Python files"""
        try:
            result = subprocess.run(
                ["bandit", "-r", "-f", "json", self.clone_path],
                capture_output=True,
                text=True
            )
            return json.loads(result.stdout).get("results", [])
        except Exception as e:
            print(f"Error running Bandit scan: {str(e)}")
            return []

    async def run_semgrep_scan(self) -> List[Dict]:
        """Run Semgrep scanner"""
        try:
            result = subprocess.run(
                [
                    "semgrep",
                    "--config=auto",
                    "--json",
                    self.clone_path
                ],
                capture_output=True,
                text=True
            )
            return json.loads(result.stdout).get("results", [])
        except Exception as e:
            print(f"Error running Semgrep scan: {str(e)}")
            return []

    def normalize_results(self, bandit_results: List[Dict], semgrep_results: List[Dict]) -> Dict:
        """Normalize results from different scanners into a unified format"""
        normalized_results = {
            "scan_id": self.scan_id,
            "repo_url": self.repo_url,
            "vulnerabilities": []
        }

        # Normalize Bandit results
        for result in bandit_results:
            normalized_results["vulnerabilities"].append({
                "tool": "bandit",
                "severity": result.get("issue_severity", "unknown"),
                "file_path": result.get("filename", "unknown"),
                "line_number": result.get("line_number", 0),
                "description": result.get("issue_text", ""),
                "code": result.get("code", "")
            })

        # Normalize Semgrep results
        for result in semgrep_results:
            normalized_results["vulnerabilities"].append({
                "tool": "semgrep",
                "severity": result.get("extra", {}).get("severity", "unknown"),
                "file_path": result.get("path", "unknown"),
                "line_number": result.get("start", {}).get("line", 0),
                "description": result.get("extra", {}).get("message", ""),
                "code": result.get("extra", {}).get("lines", "")
            })

        return normalized_results

    async def cleanup(self):
        """Clean up temporary files and directories"""
        try:
            if os.path.exists(self.clone_path):
                shutil.rmtree(self.clone_path)
        except Exception as e:
            print(f"Error during cleanup: {str(e)}")

    @staticmethod
    async def generate_scan_id() -> str:
        """Generate a unique scan ID"""
        return str(uuid.uuid4())

    async def scan(self) -> Dict:
        """Run the complete scanning process"""
        try:
            await self.setup()
            if not await self.clone_repository():
                return {"status": "error", "message": "Failed to clone repository"}

            bandit_results = await self.run_bandit_scan()
            semgrep_results = await self.run_semgrep_scan()
            
            results = self.normalize_results(bandit_results, semgrep_results)
            
            # Save results to file
            with open(self.results_path, 'w') as f:
                json.dump(results, f)

            await self.cleanup()
            return results
        except Exception as e:
            await self.cleanup()
            return {"status": "error", "message": str(e)} 