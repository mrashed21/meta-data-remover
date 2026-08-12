"use client";

import { motion } from "motion/react";
import {
  Settings2,
  CheckCircle2,
  Circle,
  Shield,
  ShieldCheck,
  Image as ImageIcon,
  Video,
  Music,
  Play,
  Loader2,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ProcessingOptions, PrivacyMode } from "@/lib/types";

interface ControlPanelProps {
  options: ProcessingOptions;
  onOptionsChange: (options: ProcessingOptions) => void;
  onProcess: () => void;
  isProcessing: boolean;
  fileCount: number;
}

export function ControlPanel({
  options,
  onOptionsChange,
  onProcess,
  isProcessing,
  fileCount,
}: ControlPanelProps) {

  const updatePrivacyMode = (mode: PrivacyMode) => {
    // If branding is selected, we MUST use advanced mode (server-side)
    // because fast mode (client canvas) cannot inject EXIF data.
    onOptionsChange({
      ...options,
      privacyMode: mode,
      mode: mode === "clean-branding" ? "advanced" : options.mode,
    });
  };

  const toggleOptimize = (enabled: boolean) => {
    onOptionsChange({
      ...options,
      quality: enabled ? 80 : 95,
      // We could also toggle resizing here if desired
    });
  };

  const isOptimized = options.quality < 95;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="overflow-hidden border-border/50 bg-card/30 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings2 className="w-5 h-5 text-primary" />
            Processing Settings
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          
          {/* Privacy Modes */}
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Processing Mode
            </Label>
            <div className="grid gap-2">
              <button
                onClick={() => updatePrivacyMode("privacy-clean")}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left ${
                  options.privacyMode === "privacy-clean"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card/50 text-muted-foreground hover:border-zinc-600 hover:text-foreground"
                }`}
              >
                {options.privacyMode === "privacy-clean" ? (
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                ) : (
                  <Shield className="w-5 h-5 shrink-0" />
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Privacy Clean</span>
                  <span className="text-[10px] opacity-70">Strictly remove all identifying metadata</span>
                </div>
              </button>

              <button
                onClick={() => updatePrivacyMode("clean-branding")}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left ${
                  options.privacyMode === "clean-branding"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card/50 text-muted-foreground hover:border-zinc-600 hover:text-foreground"
                }`}
              >
                {options.privacyMode === "clean-branding" ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 shrink-0" />
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Clean + Branding</span>
                  <span className="text-[10px] opacity-70">Remove metadata & inject Author/Creator tags</span>
                </div>
              </button>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Image Settings */}
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Image Rules
            </Label>
            <div className="space-y-2">
              <ChecklistItem checked label="Remove EXIF" />
              <ChecklistItem checked label="Remove GPS" />
              <ChecklistItem checked label="Remove device info" />
              <ChecklistItem checked label="Preserve dimensions" />
              <ChecklistItem checked={!isOptimized} label="Preserve quality" />
              <ChecklistItem 
                checked={isOptimized} 
                interactive 
                onChange={() => toggleOptimize(!isOptimized)}
                label="Optimize file size" 
              />
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Video Settings */}
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" /> Video Rules
            </Label>
            <div className="space-y-2">
              <ChecklistItem checked label="Remove metadata" />
              <ChecklistItem checked label="Preserve resolution" />
              <ChecklistItem checked label="Preserve audio" />
              <ChecklistItem 
                checked={isOptimized} 
                interactive 
                onChange={() => toggleOptimize(!isOptimized)}
                label="Optimize file size" 
              />
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Audio Settings */}
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" /> Audio Rules
            </Label>
            <div className="space-y-2">
              <ChecklistItem checked label="Remove metadata" />
              <ChecklistItem checked label="Preserve audio quality" />
              <ChecklistItem 
                checked={isOptimized} 
                interactive 
                onChange={() => toggleOptimize(!isOptimized)}
                label="Optimize file size" 
              />
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Process Button */}
          <Button
            variant="default"
            size="lg"
            className="w-full h-12 text-sm font-semibold tracking-wide"
            onClick={onProcess}
            disabled={isProcessing || fileCount === 0}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                PROCESSING...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" fill="currentColor" />
                PROCESS {fileCount > 0 ? `${fileCount} FILE${fileCount > 1 ? "S" : ""}` : ""}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ChecklistItem({ 
  checked, 
  label, 
  interactive,
  onChange 
}: { 
  checked: boolean; 
  label: string;
  interactive?: boolean;
  onChange?: () => void;
}) {
  return (
    <div 
      className={`flex items-center gap-2.5 text-sm ${interactive ? "cursor-pointer select-none group" : "opacity-80"}`}
      onClick={interactive ? onChange : undefined}
    >
      <div className={`flex items-center justify-center w-4 h-4 rounded-sm border transition-colors ${
        checked 
          ? "bg-primary border-primary text-primary-foreground" 
          : "border-muted-foreground/30 bg-transparent group-hover:border-muted-foreground/50"
      }`}>
        {checked && <Check className="w-3 h-3 stroke-[3]" />}
      </div>
      <span className={checked ? "text-foreground font-medium" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}
