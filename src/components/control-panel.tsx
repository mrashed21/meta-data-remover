"use client";

import { motion } from "motion/react";
import {
  Zap,
  BrainCircuit,
  Settings2,
  Crop,
  Palette,
  Waves,
  Play,
  Loader2,
  Maximize,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SLIDER_CONFIG, FORMAT_LABELS } from "@/lib/constants";
import type { ProcessingOptions, OutputFormat, ProcessingMode } from "@/lib/types";

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
  const isAdvanced = options.mode === "advanced";

  const updateOption = <K extends keyof ProcessingOptions>(
    key: K,
    value: ProcessingOptions[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-foreground" />
              Control Panel
            </CardTitle>
            <Badge variant={isAdvanced ? "purple" : "secondary"}>
              {isAdvanced ? "Advanced" : "Fast"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Processing Mode Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => updateOption("mode", "fast" as ProcessingMode)}
              className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all duration-200 ${
                !isAdvanced
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"
              }`}
            >
              <Zap className="w-5 h-5" />
              <span className="text-xs font-medium">Fast Mode</span>
              <span className="text-[10px] opacity-70">Client-Side</span>
            </button>
            <button
              onClick={() => updateOption("mode", "advanced" as ProcessingMode)}
              className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all duration-200 ${
                isAdvanced
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"
              }`}
            >
              <BrainCircuit className="w-5 h-5" />
              <span className="text-xs font-medium">AI Bypass</span>
              <span className="text-[10px] opacity-70">Server-Side</span>
            </button>
          </div>

          <Separator />

          {/* Output Format */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-zinc-500">
              Output Format
            </Label>
            <Select
              value={options.format}
              onValueChange={(val) => updateOption("format", val as OutputFormat)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FORMAT_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quality Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wider text-zinc-500">
                Quality
              </Label>
              <span className="text-sm font-mono text-violet-400">
                {options.quality}%
              </span>
            </div>
            <Slider
              value={[options.quality]}
              onValueChange={([val]) => updateOption("quality", val)}
              min={SLIDER_CONFIG.quality.min}
              max={SLIDER_CONFIG.quality.max}
              step={SLIDER_CONFIG.quality.step}
            />
          </div>

          <Separator />

          {/* Global Resize */}
          <div className="space-y-4">
            <Label className="text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Maximize className="w-3 h-3" />
              Global Resize
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[10px] text-zinc-400">Width (px)</Label>
                <Input
                  type="number"
                  placeholder="Original"
                  value={options.globalResize.width || ""}
                  onChange={(e) =>
                    updateOption("globalResize", {
                      ...options.globalResize,
                      width: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="h-8 text-xs bg-zinc-900/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] text-zinc-400">Height (px)</Label>
                <Input
                  type="number"
                  placeholder="Original"
                  value={options.globalResize.height || ""}
                  onChange={(e) =>
                    updateOption("globalResize", {
                      ...options.globalResize,
                      height: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="h-8 text-xs bg-zinc-900/50"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-400">Constrain Proportions</Label>
              <Switch
                checked={options.globalResize.maintainAspectRatio}
                onCheckedChange={(checked) =>
                  updateOption("globalResize", {
                    ...options.globalResize,
                    maintainAspectRatio: checked,
                  })
                }
              />
            </div>
          </div>

          <Separator />

          {/* Advanced Controls */}
          <div className="space-y-4">
            <Label className="text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <BrainCircuit className="w-3 h-3" />
              AI Bypass Controls
              {!isAdvanced && (
                <Badge variant="outline" className="ml-auto text-[10px]">
                  Advanced Mode Only
                </Badge>
              )}
            </Label>

            {/* Privacy / Branding Mode */}
            <div className={`space-y-3 ${!isAdvanced ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-sm text-zinc-300">Privacy Mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">
                    {options.privacyMode === "clean-branding" ? "Clean + Branding" : "Privacy Clean"}
                  </span>
                  <Switch
                    checked={options.privacyMode === "clean-branding"}
                    onCheckedChange={(checked) =>
                      updateOption("privacyMode", checked ? "clean-branding" : "privacy-clean")
                    }
                  />
                </div>
              </div>
            </div>

            {/* Micro-Crop */}
            <div className={`space-y-3 ${!isAdvanced ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crop className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-sm text-zinc-300">Micro-Crop</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-foreground">
                    {options.microCrop}px
                  </span>
                  <Switch
                    checked={options.microCrop > 0}
                    onCheckedChange={(checked) =>
                      updateOption("microCrop", checked ? 2 : 0)
                    }
                  />
                </div>
              </div>
              {options.microCrop > 0 && isAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Slider
                    value={[options.microCrop]}
                    onValueChange={([val]) => updateOption("microCrop", val)}
                    min={SLIDER_CONFIG.microCrop.min}
                    max={SLIDER_CONFIG.microCrop.max}
                    step={SLIDER_CONFIG.microCrop.step}
                  />
                </motion.div>
              )}
            </div>

            {/* Color Shift */}
            <div className={`space-y-3 ${!isAdvanced ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-sm text-zinc-300">Color Shift</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-foreground">
                    {options.colorShift > 0 ? "+" : ""}
                    {options.colorShift.toFixed(1)}%
                  </span>
                  <Switch
                    checked={options.colorShift !== 0}
                    onCheckedChange={(checked) =>
                      updateOption("colorShift", checked ? 0.5 : 0)
                    }
                  />
                </div>
              </div>
              {options.colorShift !== 0 && isAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Slider
                    value={[options.colorShift]}
                    onValueChange={([val]) =>
                      updateOption("colorShift", parseFloat(val.toFixed(1)))
                    }
                    min={SLIDER_CONFIG.colorShift.min}
                    max={SLIDER_CONFIG.colorShift.max}
                    step={SLIDER_CONFIG.colorShift.step}
                  />
                </motion.div>
              )}
            </div>

            {/* Noise Injection */}
            <div className={`space-y-3 ${!isAdvanced ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Waves className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-sm text-zinc-300">Noise Injection</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-foreground">
                    {options.noiseInjection.toFixed(1)}%
                  </span>
                  <Switch
                    checked={options.noiseInjection > 0}
                    onCheckedChange={(checked) =>
                      updateOption("noiseInjection", checked ? 0.3 : 0)
                    }
                  />
                </div>
              </div>
              {options.noiseInjection > 0 && isAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Slider
                    value={[options.noiseInjection]}
                    onValueChange={([val]) =>
                      updateOption("noiseInjection", parseFloat(val.toFixed(1)))
                    }
                    min={SLIDER_CONFIG.noiseInjection.min}
                    max={SLIDER_CONFIG.noiseInjection.max}
                    step={SLIDER_CONFIG.noiseInjection.step}
                  />
                </motion.div>
              )}
            </div>
          </div>

          <Separator />

          {/* Process Button */}
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={onProcess}
            disabled={isProcessing || fileCount === 0}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Process {fileCount > 0 ? `${fileCount} Image${fileCount > 1 ? "s" : ""}` : "Images"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
