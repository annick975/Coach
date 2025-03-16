// src/components/results/AIFixButton.tsx
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface AIFixButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export default function AIFixButton({ onClick, isLoading }: AIFixButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size="lg"
      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating Fixes...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate AI Fixes
        </>
      )}
    </Button>
  );
}
