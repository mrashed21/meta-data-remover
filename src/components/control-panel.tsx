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
  onCancel?: () => void;
  isProcessing: boolean;
  activeTab: "image" | "video" | "audio";
  fileCount: number;
}

export function ControlPanel({
  options,
  onOptionsChange,
  onProcess,
  onCancel,
  isProcessing,
  activeTab,
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
      <Card className="surface-glass">
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
            <div className="grid gap-2" role="radiogroup" aria-label="Processing Mode">
              <button
                type="button"
                role="radio"
                aria-checked={options.privacyMode === "privacy-clean"}
                onClick={() => updatePrivacyMode("privacy-clean")}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
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
                type="button"
                role="radio"
                aria-checked={options.privacyMode === "clean-branding"}
                onClick={() => updatePrivacyMode("clean-branding")}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  options.privacyMode === "clean-branding"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card/50 text-muted-foreground hover:border-zinc-600 hover:text-foreground"
                }`}
              >
                {options.privacyMode === "clean-branding" ? (
                  <Check className="w-5 h-5 shrink-0" />
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

          {/* Image Settings */}
          {activeTab === "image" && (
            <>
              <Separator className="bg-border/50" />
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
            </>
          )}

          {/* Video Settings */}
          {activeTab === "video" && (
            <>
              <Separator className="bg-border/50" />
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
            </>
          )}

          {/* Audio Settings */}
          {activeTab === "audio" && (
            <>
              <Separator className="bg-border/50" />
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
            </>
          )}

          <Separator className="bg-border/50" />

          {/* Process Button */}
          {isProcessing ? (
            <Button
              className="w-full h-12 btn-secondary bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 hover:border-destructive/30"
              onClick={onCancel}
            >
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              CANCEL PROCESSING
            </Button>
          ) : (
            <Button
              className="w-full h-12 btn-primary"
              onClick={onProcess}
              disabled={fileCount === 0}
            >
              <Play className="w-4 h-4 mr-2" fill="currentColor" />
              PROCESS {fileCount > 0 ? `${fileCount} FILE${fileCount > 1 ? "S" : ""}` : ""}
            </Button>
          )}
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
  const Component = interactive ? "button" : "div";
  return (
    <Component
      type={interactive ? "button" : undefined}
      role={interactive ? "checkbox" : undefined}
      aria-checked={interactive ? checked : undefined}
      aria-disabled={!interactive}
      onClick={interactive ? onChange : undefined}
      className={`flex items-center gap-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm w-full text-left ${
        interactive ? "cursor-pointer select-none group" : "opacity-80"
      }`}
    >
      <div 
        className={`flex items-center justify-center w-4 h-4 rounded-sm border transition-colors shrink-0 ${
          checked 
            ? "bg-primary border-primary text-primary-foreground" 
            : "border-muted-foreground/30 bg-transparent group-hover:border-muted-foreground/50"
        }`}
        aria-hidden="true"
      >
        {checked && <Check className="w-3 h-3 stroke-[3]" />}
      </div>
      <span className={checked ? "text-foreground font-medium" : "text-muted-foreground"}>
        {label}
      </span>
    </Component>
  );
}
