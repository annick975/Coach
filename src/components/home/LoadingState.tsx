// src/components/home/LoadingState.tsx
import { Progress } from "@/components/ui/progress";

interface LoadingStateProps {
  progress: number;
}

export default function LoadingState({ progress }: LoadingStateProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-center text-muted-foreground">
          {progress < 100
            ? `Scanning repository... ${progress}%`
            : "Scan complete! Redirecting to results..."}
        </p>
      </div>

      <div className="flex flex-col space-y-2">
        {progress >= 20 && (
          <p className="text-xs text-muted-foreground">Cloning repository...</p>
        )}
        {progress >= 40 && (
          <p className="text-xs text-muted-foreground">
            Analyzing code structure...
          </p>
        )}
        {progress >= 60 && (
          <p className="text-xs text-muted-foreground">
            Identifying vulnerabilities...
          </p>
        )}
        {progress >= 80 && (
          <p className="text-xs text-muted-foreground">Generating report...</p>
        )}
      </div>
    </div>
  );
}
