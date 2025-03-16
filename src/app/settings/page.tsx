// src/app/settings/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [excludedFiles, setExcludedFiles] = useState(
    "node_modules/,dist/,.env"
  );
  const [excludedExtensions, setExcludedExtensions] = useState(
    ".test.js,.min.js,.d.ts"
  );
  const [scanDepth, setScanDepth] = useState(3);

  const handleSaveSettings = () => {
    // In a real app, you would save these settings to localStorage or an API
    console.log("Settings saved");
  };

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scan Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="excluded-files">
                Excluded Paths (comma separated)
              </Label>
              <Input
                id="excluded-files"
                value={excludedFiles}
                onChange={(e) => setExcludedFiles(e.target.value)}
                placeholder="node_modules/,dist/"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excluded-extensions">
                Excluded File Extensions (comma separated)
              </Label>
              <Input
                id="excluded-extensions"
                value={excludedExtensions}
                onChange={(e) => setExcludedExtensions(e.target.value)}
                placeholder=".min.js,.test.js"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scan-depth">Maximum Directory Depth</Label>
              <Input
                id="scan-depth"
                type="number"
                min={1}
                max={10}
                value={scanDepth}
                onChange={(e) => setScanDepth(parseInt(e.target.value))}
              />
            </div>

            <Button onClick={handleSaveSettings} className="w-full mt-4">
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
