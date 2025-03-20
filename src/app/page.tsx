"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  Shield,
  Search,
  Github,
  Code,
  Lock,
  AlertCircle,
  ArrowRight,
  Fingerprint,
  Scan,
} from "lucide-react";
import api from "@/lib/api";

export default function Home() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) {
      setError("Please enter a repository URL");
      return;
    }

    setError("");
    setIsScanning(true);

    
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 15);
      });
    }, 300);

    try {
      // Call the backend API to start the scan
      const response = await api.scanRepository(repoUrl);

      // Keep checking scan status until completed or failed
      let scanResult = await api.getScanResults(response.scan_id);

      while (
        scanResult.status === "pending" ||
        scanResult.status === "in_progress"
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Poll every 1 second
        scanResult = await api.getScanResults(response.scan_id);
      }

      clearInterval(interval);
      setScanProgress(100);

      // Navigate to results page with the scan ID
      setTimeout(() => {
        router.push(
          `/results?scanId=${response.scan_id}&repo=${encodeURIComponent(
            repoUrl
          )}`
        );
      }, 500);
    } catch (error) {
      clearInterval(interval);
      setIsScanning(false);
      setScanProgress(0);
      setError("Failed to scan repository. Please try again.");
      console.error("Scan error:", error);
    }
  };

 
  const cyberPattern = `linear-gradient(to right, rgba(16, 24, 39, 0.9), rgba(16, 24, 39, 0.92)), 
                        url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <div className="min-h-screen w-full" style={{ background: cyberPattern }}>
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-blue-500/30 mb-6">
              <div className="flex items-center justify-center gap-3">
                <Shield className="h-8 w-8 text-blue-400" />
                <h1 className="text-3xl font-mono font-bold text-white">
                  COACH
                </h1>
              </div>
            </div>
            <h2 className="text-2xl font-mono text-blue-300 mb-3">
              CYBERSECURITY OBSERVER & ANALYZER FOR CODE HEALTH
            </h2>
            <p className="text-blue-200/80 max-w-2xl mx-auto font-mono">
              Scan repositories for vulnerabilities and get AI-powered fixes to
              enhance your code security
            </p>
          </div>

          {/* Main Container */}
          <div className="w-full max-w-3xl">
            {isScanning ? (
              <CyberLoadingState progress={scanProgress} />
            ) : (
              <CyberScanForm
                onScan={handleScan}
                repoUrl={repoUrl}
                setRepoUrl={setRepoUrl}
                error={error}
              />
            )}
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl">
            <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/30 p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all text-center">
              <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center mx-auto mb-4">
                <Scan className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-mono text-blue-300 mb-2">
                DEEP SCAN
              </h3>
              <p className="text-blue-200/70 text-sm">
                Analyze code patterns and identify potential security
                vulnerabilities
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/30 p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all text-center">
              <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-mono text-blue-300 mb-2">
                SECURITY SCORE
              </h3>
              <p className="text-blue-200/70 text-sm">
                Get a comprehensive security rating for your repository
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/30 p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all text-center">
              <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center mx-auto mb-4">
                <Code className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-mono text-blue-300 mb-2">AI FIXES</h3>
              <p className="text-blue-200/70 text-sm">
                Receive AI-powered recommendations to fix identified
                vulnerabilities
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function CyberScanForm({
  onScan,
  repoUrl,
  setRepoUrl,
  error,
}: {
  onScan: (e: React.FormEvent) => void;
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  error: string;
}) {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-8 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
      <div className="flex items-center justify-center mb-6">
        <div className="h-12 w-12 rounded-full bg-blue-900/50 flex items-center justify-center">
          <Github className="h-6 w-6 text-blue-400" />
        </div>
        <div className="h-1 w-16 bg-blue-500/30 mx-2"></div>
        <div className="h-12 w-12 rounded-full bg-blue-900/50 flex items-center justify-center">
          <Fingerprint className="h-6 w-6 text-blue-400" />
        </div>
        <div className="h-1 w-16 bg-blue-500/30 mx-2"></div>
        <div className="h-12 w-12 rounded-full bg-blue-900/50 flex items-center justify-center">
          <Shield className="h-6 w-6 text-blue-400" />
        </div>
      </div>

      <h3 className="text-xl font-mono text-center text-white mb-6">
        SCAN REPOSITORY
      </h3>

      <form onSubmit={onScan} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-blue-500" />
          </div>
          <Input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="Enter GitHub repository URL"
            className="pl-10 bg-gray-900 border-blue-500/30 text-white font-mono focus:border-blue-400 focus:ring-blue-400/20"
          />
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <p className="text-red-300 font-mono text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center pt-2">
          <Button
            type="submit"
            className="bg-blue-900/70 hover:bg-blue-800 text-blue-100 border border-blue-700/50 font-mono flex items-center gap-2 px-6 py-6"
          >
            <Scan className="h-5 w-5" />
            SCAN REPOSITORY
            <ArrowRight className="h-5 w-5 ml-1" />
          </Button>
        </div>

        <div className="pt-4 text-center">
          <p className="text-blue-300/70 text-xs font-mono">
            Example: https://github.com/username/repository
          </p>
        </div>
      </form>
    </div>
  );
}


function CyberLoadingState({ progress }: { progress: number }) {
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl border border-blue-500/30 p-8 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
          <div
            className="absolute inset-2 rounded-full border-t-2 border-cyan-400 animate-spin"
            style={{ animationDuration: "3s" }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Fingerprint className="h-12 w-12 text-blue-400" />
          </div>
        </div>

        <h2 className="text-xl font-mono font-semibold text-white">
          Analyzing Repository Security
        </h2>

        <div className="w-full space-y-2">
          <div className="flex justify-between text-sm text-blue-300">
            <span>0%</span>
            <span>{progress}%</span>
            <span>100%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="text-sm text-blue-300 font-mono">
          {progress < 30 && "[STATUS] Scanning repository structure..."}
          {progress >= 30 &&
            progress < 60 &&
            "[STATUS] Identifying potential vulnerabilities..."}
          {progress >= 60 &&
            progress < 90 &&
            "[STATUS] Analyzing security patterns..."}
          {progress >= 90 && "[STATUS] Preparing security report..."}
        </div>

        <div className="flex space-x-3 pt-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
          <div
            className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
