// src/components/results/SummaryCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";

interface SummaryCardProps {
  data: {
    totalIssues: number;
    severities: {
      high: number;
      medium: number;
      low: number;
    };
    repoName: string;
  };
}

export default function SummaryCard({ data }: SummaryCardProps) {
  // Determine overall security status
  const getSecurityStatus = () => {
    if (data.severities.high > 0) return "Critical";
    if (data.severities.medium > 0) return "Warning";
    if (data.severities.low > 0) return "Minor Issues";
    return "Secure";
  };

  // Get appropriate icon and color based on status
  const getStatusIcon = () => {
    const status = getSecurityStatus();
    switch (status) {
      case "Critical":
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      case "Warning":
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      case "Minor Issues":
        return <Info className="h-8 w-8 text-blue-500" />;
      case "Secure":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          {getStatusIcon()}
          <div>
            <p className="text-2xl font-bold">{getSecurityStatus()}</p>
            <p className="text-sm text-muted-foreground">
              {data.totalIssues} {data.totalIssues === 1 ? "issue" : "issues"}{" "}
              detected
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-6">
          <div className="flex flex-col items-center p-2 bg-red-100 dark:bg-red-900/20 rounded-md">
            <span className="text-red-500 font-bold text-xl">
              {data.severities.high}
            </span>
            <span className="text-xs text-muted-foreground">High</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-md">
            <span className="text-yellow-500 font-bold text-xl">
              {data.severities.medium}
            </span>
            <span className="text-xs text-muted-foreground">Medium</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-green-100 dark:bg-green-900/20 rounded-md">
            <span className="text-green-500 font-bold text-xl">
              {data.severities.low}
            </span>
            <span className="text-xs text-muted-foreground">Low</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
