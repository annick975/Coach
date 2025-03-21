"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Download,
  Shield,
  ShieldAlert,
  Eye,
  Terminal,
  FileWarning,
  Lock,
  Fingerprint,
  Zap,
  AlertTriangle,
} from "lucide-react";
import api, { ScanResult, Vulnerability } from "@/lib/api";


const fetchResults = async (
  scanId: string,
  setLoadingProgress: React.Dispatch<React.SetStateAction<number>>
) => {
  const interval = setInterval(() => {
    setLoadingProgress((prev) => {
      if (prev >= 95) {
        clearInterval(interval);
        return 95;
      }
      return prev + Math.floor(Math.random() * 15);
    });
  }, 300);

  try {
    const result = await api.getScanResults(scanId);
    setLoadingProgress(100);
    clearInterval(interval);


    return {
      repoName: result.results?.repo_url || "Unknown repository",
      scanTimestamp: result.completed_at || result.created_at,
      securityScore: calculateSecurityScore(
        result.results?.vulnerabilities || []
      ),
      totalIssues: result.results?.vulnerabilities?.length || 0,
      severities: countVulnerabilitiesBySeverity(
        result.results?.vulnerabilities || []
      ),
      vulnerabilities: normalizeVulnerabilities(
        result.results?.vulnerabilities || []
      ),
    };
  } catch (error) {
    clearInterval(interval);
    throw error;
  }
};

const calculateSecurityScore = (vulnerabilities: Vulnerability[]) => {
  if (!vulnerabilities.length) return 100;

  
  let score = 100;

  for (const vuln of vulnerabilities) {
    switch (vuln.severity.toLowerCase()) {
      case "high":
      case "critical":
        score -= 10;
        break;
      case "medium":
        score -= 5;
        break;
      case "low":
        score -= 2;
        break;
      default:
        score -= 1;
    }
  }

 
  return Math.max(0, score);
};

const countVulnerabilitiesBySeverity = (vulnerabilities: Vulnerability[]) => {
  const counts = { high: 0, medium: 0, low: 0 };

  for (const vuln of vulnerabilities) {
    const severity = vuln.severity.toLowerCase();
    if (severity === "high" || severity === "critical") {
      counts.high++;
    } else if (severity === "medium") {
      counts.medium++;
    } else {
      counts.low++;
    }
  }

  return counts;
};

const normalizeVulnerabilities = (vulnerabilities: Vulnerability[]) => {
  return vulnerabilities.map((vuln, index) => ({
    id: index + 1,
    file: vuln.file_path,
    line: vuln.line_number,
    severity: vuln.severity.toLowerCase(),
    description: vuln.description,
    impact: `Detected by ${vuln.tool}`,
    cveId: null,
    code: vuln.code,
  }));
};

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="max-w-md w-full px-6 py-8 rounded-lg bg-black/50 backdrop-blur-md border border-blue-500/30 shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get("repo");
  const scanId = searchParams.get("scanId");
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isGeneratingFixes, setIsGeneratingFixes] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (repoUrl && scanId) {
      const doFetch = async () => {
        try {
          const results = await fetchResults(scanId, setLoadingProgress);
          setResults(results);
        } catch (error) {
          console.error("Failed to load scan results:", error);
          setError("Failed to load scan results");
        } finally {
          setTimeout(() => setLoading(false), 300);
        }
      };

      doFetch();
    } else {
      setError("Missing repository or scan ID");
      setLoading(false);
    }
  }, [repoUrl, scanId]);

  const handleGenerateFixes = async () => {
    if (!results?.vulnerabilities || results.vulnerabilities.length === 0) {
      return;
    }

    setIsGeneratingFixes(true);
    try {
      // Call AI fix endpoint
      const fixes = await api.getAIFixes(results.vulnerabilities);
     
      console.log("AI fixes generated:", fixes);
    } catch (error) {
      console.error("Failed to generate fixes:", error);
    } finally {
      setIsGeneratingFixes(false);
    }
  };

  const handleRescan = async () => {
    if (!repoUrl) return;

    setLoading(true);
    setLoadingProgress(0);
    setError("");

    try {
  
      const response = await api.scanRepository(repoUrl);
      const newScanId = response.scan_id;

      
      let scanResult = await api.getScanResults(newScanId);

      while (
        scanResult.status === "pending" ||
        scanResult.status === "in_progress"
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        scanResult = await api.getScanResults(newScanId);

   
        if (scanResult.status === "pending") {
          setLoadingProgress(25);
        } else if (scanResult.status === "in_progress") {
          setLoadingProgress(Math.min(75, loadingProgress + 10));
        }
      }

      const results = await fetchResults(newScanId, setLoadingProgress);
      setResults(results);
    } catch (error) {
      console.error("Failed to rescan:", error);
      setError("Failed to rescan repository");
    } finally {
      setLoading(false);
    }
  };


  const cyberPattern = `linear-gradient(to right, rgba(16, 24, 39, 0.9), rgba(16, 24, 39, 0.92)), 
                        url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: cyberPattern }}
      >
        <div className="max-w-md w-full px-6 py-8 rounded-lg bg-black/50 backdrop-blur-md border border-blue-500/30 shadow-lg shadow-blue-500/10">
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
                <span>{loadingProgress}%</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="text-sm text-blue-300 font-mono">
              {loadingProgress < 30 &&
                "[STATUS] Scanning repository structure..."}
              {loadingProgress >= 30 &&
                loadingProgress < 60 &&
                "[STATUS] Identifying potential vulnerabilities..."}
              {loadingProgress >= 60 &&
                loadingProgress < 90 &&
                "[STATUS] Analyzing security patterns..."}
              {loadingProgress >= 90 && "[STATUS] Preparing security report..."}
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
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: cyberPattern }}
      >
        <div className="max-w-md w-full px-6 py-8 rounded-lg bg-black/50 backdrop-blur-md border border-red-500/30 shadow-lg shadow-red-500/10">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full border border-red-500/50 flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-mono font-semibold text-white mb-2">
              SCAN FAILED
            </h2>
            <div className="bg-red-900/20 border border-red-500/30 w-full p-3 rounded mb-6">
              <p className="text-red-300 font-mono">[ERROR]: {error}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => (window.location.href = "/")}
                className="bg-gray-900 hover:bg-gray-800 text-gray-100 border border-gray-700 font-mono flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Scanner
              </Button>
              <Button
                onClick={handleRescan}
                className="bg-red-900/50 hover:bg-red-800 text-red-100 border border-red-700/50 font-mono flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Scan
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!results) return null;

  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen w-full" style={{ background: cyberPattern }}>
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-blue-500/30 mb-6">
            <div className="flex items-center justify-center gap-3">
              <Shield className="h-8 w-8 text-blue-400" />
              <h1 className="text-3xl font-mono font-bold text-white">COACH</h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-2 text-blue-300 font-mono mb-8">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <span>{results.repoName}</span>
            </div>
            <div className="hidden sm:block h-1 w-1 rounded-full bg-blue-500"></div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{new Date(results.scanTimestamp).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={handleRescan}
              className="bg-gray-900 hover:bg-gray-800 text-gray-100 border border-gray-700 font-mono flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Rescan
            </Button>
            <Button className="bg-gray-900 hover:bg-gray-800 text-gray-100 border border-gray-700 font-mono flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button
              onClick={handleGenerateFixes}
              disabled={isGeneratingFixes}
              className="bg-blue-900/70 hover:bg-blue-800 text-blue-100 border border-blue-700/50 font-mono flex items-center gap-2"
            >
              {isGeneratingFixes ? (
                <>
                  <div className="h-4 w-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                  Generating Fixes...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Generate AI Fixes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Security Score */}
        <div className="mb-10">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-8 text-center max-w-md mx-auto hover:shadow-lg hover:shadow-blue-500/10 transition-all">
            <h2 className="text-white font-mono text-xl mb-6">
              SECURITY SCORE
            </h2>

            <div className="relative w-48 h-48 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-8 border-gray-800"></div>
              <div
                className="absolute inset-0 rounded-full border-8 border-transparent border-t-blue-500 border-r-blue-400"
                style={{
                  transform: `rotate(${results.securityScore * 3.6}deg)`,
                  transition: "transform 1s ease-out",
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <div
                  className={`text-5xl font-mono font-bold ${getScoreColor(
                    results.securityScore
                  )}`}
                >
                  {results.securityScore}
                </div>
                <div className="text-blue-400 font-mono text-sm">/100</div>
              </div>
            </div>

            <div className="w-full grid grid-cols-3 gap-2 pt-4 border-t border-blue-500/20">
              <div className="text-center">
                <div className="text-sm text-gray-400 font-mono">HIGH</div>
                <div className="text-xl font-mono text-red-500">
                  {results.severities.high}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 font-mono">MEDIUM</div>
                <div className="text-xl font-mono text-yellow-500">
                  {results.severities.medium}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 font-mono">LOW</div>
                <div className="text-xl font-mono text-blue-500">
                  {results.severities.low}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vulnerability Distribution */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 mb-10 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
          <h2 className="text-white font-mono text-xl mb-6 text-center">
            VULNERABILITY DISTRIBUTION
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-black/60 to-red-950/30 rounded-lg border border-red-500/30 p-6 text-center hover:shadow-md hover:shadow-red-500/20 transition-all">
              <div className="w-12 h-12 rounded-full bg-red-900/50 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="h-6 w-6 text-red-400" />
              </div>
              <div className="text-3xl font-mono font-bold text-red-400">
                {results.severities.high}
              </div>
              <div className="text-red-300 font-mono mt-2">HIGH</div>
              <div className="text-xs text-red-300/70 mt-1">
                High Risk Vulnerabilities
              </div>
              <div className="w-full h-1 bg-red-900/50 mt-4">
                <div
                  className="h-full bg-red-500"
                  style={{
                    width: `${
                      (results.severities.high / results.totalIssues) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-black/60 to-yellow-950/30 rounded-lg border border-yellow-500/30 p-6 text-center hover:shadow-md hover:shadow-yellow-500/20 transition-all">
              <div className="w-12 h-12 rounded-full bg-yellow-900/50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="text-3xl font-mono font-bold text-yellow-400">
                {results.severities.medium}
              </div>
              <div className="text-yellow-300 font-mono mt-2">MEDIUM</div>
              <div className="text-xs text-yellow-300/70 mt-1">
                Medium Risk Vulnerabilities
              </div>
              <div className="w-full h-1 bg-yellow-900/50 mt-4">
                <div
                  className="h-full bg-yellow-500"
                  style={{
                    width: `${
                      (results.severities.medium / results.totalIssues) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-black/60 to-blue-950/30 rounded-lg border border-blue-500/30 p-6 text-center hover:shadow-md hover:shadow-blue-500/20 transition-all">
              <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center mx-auto mb-4">
                <Eye className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-3xl font-mono font-bold text-blue-400">
                {results.severities.low}
              </div>
              <div className="text-blue-300 font-mono mt-2">LOW</div>
              <div className="text-xs text-blue-300/70 mt-1">
                Low Risk Vulnerabilities
              </div>
              <div className="w-full h-1 bg-blue-900/50 mt-4">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${
                      (results.severities.low / results.totalIssues) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Vulnerabilities Table */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden">
          <div className="p-6 border-b border-blue-500/20">
            <h2 className="text-white font-mono text-xl text-center">
              SECURITY VULNERABILITIES
            </h2>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-center px-6 pt-4">
              <TabsList className="bg-gray-900 border border-blue-500/20">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-200 font-mono"
                >
                  ALL ({results.totalIssues})
                </TabsTrigger>
                <TabsTrigger
                  value="high"
                  className="data-[state=active]:bg-red-900/70 data-[state=active]:text-red-200 font-mono"
                >
                  HIGH ({results.severities.high})
                </TabsTrigger>
                <TabsTrigger
                  value="medium"
                  className="data-[state=active]:bg-yellow-900/70 data-[state=active]:text-yellow-200 font-mono"
                >
                  MEDIUM ({results.severities.medium})
                </TabsTrigger>
                <TabsTrigger
                  value="low"
                  className="data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-200 font-mono"
                >
                  LOW ({results.severities.low})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="p-4">
              <CyberVulnerabilityTable
                vulnerabilities={results.vulnerabilities}
              />
            </TabsContent>

            <TabsContent value="high" className="p-4">
              <CyberVulnerabilityTable
                vulnerabilities={results.vulnerabilities.filter(
                  (v) => v.severity === "high"
                )}
              />
            </TabsContent>

            <TabsContent value="medium" className="p-4">
              <CyberVulnerabilityTable
                vulnerabilities={results.vulnerabilities.filter(
                  (v) => v.severity === "medium"
                )}
              />
            </TabsContent>

            <TabsContent value="low" className="p-4">
              <CyberVulnerabilityTable
                vulnerabilities={results.vulnerabilities.filter(
                  (v) => v.severity === "low"
                )}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}


function CyberVulnerabilityTable({
  vulnerabilities,
}: {
  vulnerabilities: any[];
}) {
  const getSeverityData = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          color: "text-red-400",
          bgColor: "bg-red-900/30",
          borderColor: "border-red-500/30",
          icon: <ShieldAlert className="h-4 w-4 text-red-400" />,
          label: "HIGH",
        };
      case "medium":
        return {
          color: "text-yellow-400",
          bgColor: "bg-yellow-900/30",
          borderColor: "border-yellow-500/30",
          icon: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
          label: "MEDIUM",
        };
      case "low":
        return {
          color: "text-blue-400",
          bgColor: "bg-blue-900/30",
          borderColor: "border-blue-500/30",
          icon: <Eye className="h-4 w-4 text-blue-400" />,
          label: "LOW",
        };
      default:
        return {
          color: "text-gray-400",
          bgColor: "bg-gray-900/30",
          borderColor: "border-gray-500/30",
          icon: <AlertCircle className="h-4 w-4 text-gray-400" />,
          label: "UNKNOWN",
        };
    }
  };

  if (vulnerabilities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-900/30 border border-green-500/30 flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-mono font-medium mb-2 text-green-400">
          SECURE
        </h3>
        <p className="text-green-300/70 text-sm sm:text-base max-w-md">
          No security vulnerabilities detected in this category
        </p>
      </div>
    );
  }

  // Mobile card view for small screens
  const renderMobileView = () => {
    return (
      <div className="space-y-4">
        {vulnerabilities.map((vuln) => {
          const severityData = getSeverityData(vuln.severity);

          return (
            <div
              key={vuln.id}
              className="bg-gray-900/30 border border-blue-500/20 rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <div
                  className={`inline-flex items-center px-2 py-1 rounded ${severityData.bgColor} ${severityData.borderColor} border gap-1`}
                >
                  {severityData.icon}
                  <span className={`text-xs font-mono ${severityData.color}`}>
                    {severityData.label}
                  </span>
                </div>

                {vuln.cveId ? (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded px-2 py-1">
                    <span className="text-xs font-mono text-blue-400">
                      {vuln.cveId}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">No CVE</span>
                )}
              </div>

              <div className="mb-2 flex items-center gap-2">
                <FileWarning className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="font-mono text-sm truncate text-gray-300">
                  {vuln.file}
                </span>
                <span className="font-mono text-xs bg-gray-800 px-2 py-1 rounded">
                  Line {vuln.line}
                </span>
              </div>

              <div className="mb-2">
                <span className="font-mono text-sm text-white">
                  {vuln.description}
                </span>
              </div>

              <div className="mb-3">
                <span className="text-xs text-gray-400">{vuln.impact}</span>
              </div>

              <Button
                size="sm"
                className="w-full h-8 bg-gray-800 hover:bg-gray-700 text-blue-300 border border-blue-500/20 font-mono text-xs"
              >
                View Fix
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  // Desktop table view for larger screens
  const renderDesktopView = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-900/70 text-xs uppercase font-mono">
              <th className="px-4 py-3 text-left text-white">Severity</th>
              <th className="px-4 py-3 text-left text-white">File Location</th>
              <th className="px-4 py-3 text-left text-white">Line</th>
              <th className="px-4 py-3 text-left text-white">Vulnerability</th>
              <th className="px-4 py-3 text-left text-white">Impact</th>
              <th className="px-4 py-3 text-left text-white">Reference</th>
              <th className="px-4 py-3 text-left text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-900/30">
            {vulnerabilities.map((vuln) => {
              const severityData = getSeverityData(vuln.severity);

              return (
                <tr
                  key={vuln.id}
                  className="hover:bg-blue-900/10 transition-colors text-gray-300"
                >
                  <td className="px-4 py-3">
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded ${severityData.bgColor} ${severityData.borderColor} border gap-1`}
                    >
                      {severityData.icon}
                      <span
                        className={`text-xs font-mono ${severityData.color}`}
                      >
                        {severityData.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileWarning className="h-4 w-4 text-gray-400" />
                      <span
                        className="font-mono text-sm max-w-[160px] truncate"
                        title={vuln.file}
                      >
                        {vuln.file}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                      {vuln.line}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <span className="font-mono text-sm">
                      {vuln.description}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 max-w-xs">
                    <span className="text-xs">{vuln.impact}</span>
                  </td>
                  <td className="px-4 py-3">
                    {vuln.cveId ? (
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded px-2 py-1">
                        <span className="text-xs font-mono text-blue-400">
                          {vuln.cveId}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      className="h-8 bg-gray-800 hover:bg-gray-700 text-blue-300 border border-blue-500/20 font-mono text-xs"
                    >
                      View Fix
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      {/* Mobile view - visible on small screens only */}
      <div className="md:hidden">{renderMobileView()}</div>

      {/* Desktop view - visible on medium screens and up */}
      <div className="hidden md:block">{renderDesktopView()}</div>
    </>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
