// src/app/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ScanForm from "@/components/home/ScanForm";
import LoadingState from "@/components/home/LoadingState";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const router = useRouter();

  const handleScan = async (repoUrl: string) => {
    if (!repoUrl) return;

    setIsScanning(true);

    // Simulate scan progress
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 300);

    try {
      // In a real implementation, this would call your API
      await new Promise((resolve) => setTimeout(resolve, 3000));
      clearInterval(interval);
      setScanProgress(100);

      // Navigate to results page with simulated data for now
      setTimeout(() => {
        router.push("/results?repo=" + encodeURIComponent(repoUrl));
      }, 500);
    } catch (error) {
      clearInterval(interval);
      setIsScanning(false);
      setScanProgress(0);
      // Handle error state
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12">
      <div className="space-y-6 text-center max-w-2xl w-full">
        <h1 className="text-4xl font-bold tracking-tight">
          GitHub Security Scanner
        </h1>
        <p className="text-lg text-muted-foreground">
          Scan repositories for vulnerabilities and get AI-powered fixes
        </p>

        <Card className="w-full">
          <CardContent className="pt-6">
            {isScanning ? (
              <LoadingState progress={scanProgress} />
            ) : (
              <ScanForm onScan={handleScan} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
