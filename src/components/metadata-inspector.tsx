"use client";

import { motion } from "motion/react";
import { FileSearch, ShieldCheck, ShieldAlert, MapPin, Camera, Cpu, Code } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { MetadataField } from "@/lib/types";

interface MetadataInspectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metadataBefore: MetadataField[];
  metadataAfter: MetadataField[];
  fileName?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  camera: <Camera className="w-3.5 h-3.5" />,
  location: <MapPin className="w-3.5 h-3.5" />,
  ai: <Cpu className="w-3.5 h-3.5" />,
  software: <Code className="w-3.5 h-3.5" />,
  other: <FileSearch className="w-3.5 h-3.5" />,
};

const categoryColors: Record<string, string> = {
  camera: "text-blue-400",
  location: "text-red-400",
  ai: "text-purple-400",
  software: "text-amber-400",
  other: "text-zinc-400",
};

export function MetadataInspector({
  open,
  onOpenChange,
  metadataBefore,
  metadataAfter,
  fileName,
}: MetadataInspectorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-violet-400" />
            Metadata Inspector
          </DialogTitle>
          {fileName && (
            <DialogDescription className="truncate">
              {fileName}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* Before Column */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider">
                Before — Raw
              </h3>
            </div>
            <div className="space-y-1.5">
              {metadataBefore.length > 0 ? (
                metadataBefore.map((field, index) => (
                  <motion.div
                    key={`before-${field.key}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-start justify-between gap-2 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={categoryColors[field.category] || "text-zinc-400"}>
                        {categoryIcons[field.category]}
                      </span>
                      <span className="text-xs text-zinc-400 truncate">
                        {field.key}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-zinc-200 font-mono">
                        {field.value}
                      </span>
                      <Badge
                        variant="destructive"
                        className="text-[10px] px-1.5 py-0"
                      >
                        Exposed
                      </Badge>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-zinc-500 text-center py-8">
                  No metadata detected
                </p>
              )}
            </div>
          </div>

          {/* Divider (desktop) */}
          <Separator orientation="vertical" className="hidden md:block absolute left-1/2 top-24 bottom-6" />

          {/* After Column */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                After — Cleaned
              </h3>
            </div>
            <div className="space-y-1.5">
              {metadataAfter.length > 0 ? (
                metadataAfter.map((field, index) => (
                  <motion.div
                    key={`after-${field.key}-${index}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-start justify-between gap-2 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={categoryColors[field.category] || "text-zinc-400"}>
                        {categoryIcons[field.category]}
                      </span>
                      <span className="text-xs text-zinc-400 truncate">
                        {field.key}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-zinc-200 font-mono">
                        {field.value}
                      </span>
                      {field.stripped ? (
                        <Badge
                          variant="success"
                          className="text-[10px] px-1.5 py-0"
                        >
                          Stripped
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          Clean
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-zinc-500 text-center py-8">
                  Process image to see results
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
