import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Settings as SettingsIcon, 
  Zap, 
  Bell, 
  Shield,
  Sliders
} from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [interviewThreshold, setInterviewThreshold] = useState([7]);
  const [takehomeThreshold, setTakehomeThreshold] = useState([4]);

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="px-8 py-4">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure AI routing policies and preferences
          </p>
        </div>
      </header>

      <div className="p-8 max-w-3xl">
        {/* AI Routing Policies */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">AI Routing Policies</h2>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Interview Threshold (Score)</Label>
                <span className="text-sm font-mono text-primary">{interviewThreshold[0]}/10</span>
              </div>
              <Slider
                value={interviewThreshold}
                onValueChange={setInterviewThreshold}
                max={10}
                min={1}
                step={0.5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Candidates scoring above this threshold are routed directly to interviews.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Take-home Threshold (Score)</Label>
                <span className="text-sm font-mono text-primary">{takehomeThreshold[0]}/10</span>
              </div>
              <Slider
                value={takehomeThreshold}
                onValueChange={setTakehomeThreshold}
                max={10}
                min={1}
                step={0.5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Candidates scoring between this and the interview threshold receive take-home assignments.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-reject below threshold</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automatically reject candidates below take-home threshold
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </section>

        {/* AI Preferences */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">AI Preferences</h2>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-source candidates</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automatically find and add candidates from GitHub
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-screen new candidates</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Run AI screening on newly sourced candidates
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Learn from overrides</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Adjust policies based on recruiter feedback
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>High-score candidates</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Alert when a candidate scores 9+
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Screening complete</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Notify when batch screening finishes
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Policy updates</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Alert when AI adjusts routing thresholds
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
