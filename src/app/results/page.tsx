// src/app/results/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SummaryCard from "@/components/results/SummaryCard";
import SeverityChart from "@/components/results/SeverityChart";
import VulnerabilityTable from "@/components/results/VulnerabilityTable";
import AIFixButton from "@/components/results/AIFixButton";
import { AlertCircle } from "lucide-react";

// Simulated data for demonstration
const mockResults = {
  repoName: "username/repository",
  totalIssues: 12,
  severities: {
    high: 3,
    medium: 5,
    low: 4,
  },
  vulnerabilities: [
    {
      id: 1,
      file: "src/auth.js",
      line: 45,
      severity: "high",
      description: "Insecure authentication method",
    },
    {
      id: 2,
      file: "src/api/users.js",
      line: 23,
      severity: "high",
      description: "SQL injection vulnerability",
    },
    {
      id: 3,
      file: "src/utils/validation.js",
      line: 12,
      severity: "medium",
      description: "Improper input validation",
    },
    {
      id: 4,
      file: "src/components/Form.jsx",
      line: 78,
      severity: "low",
      description: "XSS vulnerability in form handling",
    },
    {
      id: 5,
      file: "src/middleware/logger.js",
      line: 34,
      severity: "medium",
      description: "Information exposure through logs",
    },
  ],
};

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get("repo");
  const [results, setResults] = useState<typeof mockResults | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isGeneratingFixes, setIsGeneratingFixes] = useState(false);

  useEffect(() => {
    // In a real app, fetch actual results from your API
    const fetchResults = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setResults(mockResults);
      } catch (err) {
        setError("Failed to load scan results");
      } finally {
        setLoading(false);
      }
    };

    if (repoUrl) {
      fetchResults();
    } else {
      setError("No repository specified");
      setLoading(false);
    }
  }, [repoUrl]);

  const handleGenerateFixes = async () => {
    setIsGeneratingFixes(true);
    // In a real implementation, call Gemini API
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGeneratingFixes(false);
    // Handle displaying fixes
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Error</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button
                className="mt-4"
                onClick={() => (window.location.href = "/")}
              >
                Back to Scanner
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Scan Results</h1>
          <p className="text-muted-foreground">
            Repository: {results.repoName}
          </p>
        </div>
        <AIFixButton
          onClick={handleGenerateFixes}
          isLoading={isGeneratingFixes}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SummaryCard data={results} />
        <SeverityChart data={results.severities} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detected Vulnerabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <VulnerabilityTable vulnerabilities={results.vulnerabilities} />
        </CardContent>
      </Card>
    </div>
  );
}
