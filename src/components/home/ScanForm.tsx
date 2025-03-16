// src/components/home/ScanForm.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface ScanFormProps {
  onScan: (repoUrl: string) => void;
}

export default function ScanForm({ onScan }: ScanFormProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");

  const validateUrl = (url: string) => {
    // Simple validation - you might want more thorough validation
    if (!url) {
      setError("Please enter a GitHub repository URL");
      return false;
    }

    if (!url.includes("github.com/")) {
      setError("Please enter a valid GitHub repository URL");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateUrl(repoUrl)) {
      onScan(repoUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          placeholder="https://github.com/username/repository"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="h-12"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <Button type="submit" className="w-full h-12">
        <Search className="mr-2 h-4 w-4" />
        Scan Repository
      </Button>
    </form>
  );
}
