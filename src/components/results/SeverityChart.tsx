// src/components/results/SeverityChart.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


interface SeverityChartProps {
  data: {
    high: number;
    medium: number;
    low: number;
  };
}

export default function SeverityChart({ data }: SeverityChartProps) {
  // Calculate percentages for the chart
  const total = data.high + data.medium + data.low;
  const highPercent = Math.round((data.high / total) * 100) || 0;
  const mediumPercent = Math.round((data.medium / total) * 100) || 0;
  const lowPercent = Math.round((data.low / total) * 100) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Severity Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Simple bar chart */}
          <div className="h-8 w-full flex rounded-md overflow-hidden">
            {data.high > 0 && (
              <div 
                className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${highPercent}%` }}
              >
                {highPercent > 10 && `${data.high}`}
              </div>
            )}
            {data.medium > 0 && (
              <div 
                className="bg-yellow-500 h-full flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${mediumPercent}%` }}
              >
                {mediumPercent > 10 && `${data.medium}`}
              </div>
            )}
            {data.low > 0 && (
              <div 
                className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${lowPercent}%` }}
              >
                {lowPercent > 10 && `${data.low}`}
              </div>
            )}
          </div>

          {/* Legend */}
                 <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
              <span>High ({data.high})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm mr-2"></div>
              <span>Medium ({data.medium})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
              <span>Low ({data.low})</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )}
