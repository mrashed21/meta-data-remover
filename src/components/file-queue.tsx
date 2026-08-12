"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileImage,
  FileVideo,
  FileAudio,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Download,
  Trash2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatFileSize } from "@/lib/utils";
import type { MediaFile } from "@/lib/types";

// =============================================================================
// FileCard Component
// =============================================================================

interface FileCardProps {
  file: MediaFile;
  onRemove: (id: string) => void;
  onInspect: (id: string) => void;
  onDownload: (id: string) => void;
}

const statusConfig = {
  queued: {
    icon: Clock,
    color: "text-muted-foreground",
    bg: "bg-muted/30",
    label: "Waiting",
  },
  processing: {
    icon: Loader2,
    color: "text-brand",
    bg: "bg-[oklch(0.55_0.27_293/0.05)]",
    label: "Processing",
  },
  done: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
    label: "Completed",
  },
  error: {
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: "Failed",
  },
};

function FileCard({ file, onRemove, onInspect, onDownload }: FileCardProps) {
  const isDone = file.status === "done";
  const isProcessing = file.status === "processing";
  const isError = file.status === "error";
  const config = statusConfig[file.status];
  const StatusIcon = config.icon;

  const getMediaIcon = () => {
    switch (file.mediaType) {
      case "video": return <FileVideo className="w-8 h-8 text-muted-foreground/60" />;
      case "audio": return <FileAudio className="w-8 h-8 text-muted-foreground/60" />;
      default: return <FileImage className="w-8 h-8 text-muted-foreground/60" />;
    }
  };

  // The 'result' field belongs to MediaFile in Sprint 06+.
  // Meanwhile, we support 'processedBlob' for backward compatibility with ImageFile.
  const processedSize = file.result?.blob.size ?? (file as any).processedBlob?.size;
  const processedBlobExists = !!file.result?.blob || !!(file as any).processedBlob;

  return (
    <div className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-border ${config.bg} transition-colors overflow-hidden group`}>
      {/* ─── Progress Bar (Background) ─── */}
      {isProcessing && (
        <div 
          className="absolute inset-y-0 left-0 bg-brand/5 transition-all duration-300 ease-out z-0" 
          style={{ width: `${file.progress}%` }} 
        />
      )}

      {/* ─── Thumbnail / Icon ─── */}
      <div className="relative z-10 w-16 h-16 rounded-lg bg-card border border-border shrink-0 flex items-center justify-center overflow-hidden">
        {file.preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.preview} alt={file.file.name} className="w-full h-full object-cover" />
        ) : (
          getMediaIcon()
        )}
      </div>

      {/* ─── Details ─── */}
      <div className="relative z-10 flex-1 min-w-0 flex flex-col gap-1.5 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-foreground truncate" title={file.file.name}>
              {file.file.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="uppercase tracking-wider">{file.mediaType || "IMAGE"}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{formatFileSize(file.file.size)}</span>
              
              {/* Show size reduction if completed */}
              {isDone && processedSize && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-success font-medium flex items-center gap-1">
                    {formatFileSize(processedSize)}
                  </span>
                </>
              )}
            </div>
          </div>
          
          {/* Status Badge */}
          <Badge 
            variant="outline" 
            className={`shrink-0 gap-1.5 font-medium border-border bg-card/50 ${config.color}`}
          >
            <StatusIcon className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
            {config.label}
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div className="flex items-center gap-2 w-full max-w-xs">
            {isProcessing ? (
              <>
                <Progress value={file.progress} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground tabular-nums w-8">
                  {Math.round(file.progress)}%
                </span>
              </>
            ) : isError ? (
              <span className="text-xs text-destructive flex items-center gap-1">
                {file.error || "Processing failed"}
              </span>
            ) : isDone ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground border-dashed bg-transparent">
                  Metadata: Stripped
                </Badge>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">Ready to process</span>
            )}
          </div>

          {/* ─── Actions ─── */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {isDone && processedBlobExists && (
              <>
                <Button variant="outline" size="sm" onClick={() => onInspect(file.id)} className="gap-1.5 h-8 text-xs">
                  <FileText className="w-3.5 h-3.5" /> Inspect
                </Button>
                <Button size="sm" onClick={() => onDownload(file.id)} className="gap-1.5 h-8 text-xs bg-success text-success-foreground hover:bg-success/90">
                  <Download className="w-3.5 h-3.5" /> Save
                </Button>
              </>
            )}
            
            {/* Remove Button (disabled during processing to prevent errors) */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onRemove(file.id)}
              disabled={isProcessing}
              title="Remove file"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// FileQueue Component
// =============================================================================

interface FileQueueProps {
  files: MediaFile[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onInspect: (id: string) => void;
  onDownload: (id: string) => void;
  onDownloadAll?: () => void;
  isZipping?: boolean;
}

export function FileQueue({
  files,
  onRemove,
  onClearAll,
  onInspect,
  onDownload,
  onDownloadAll,
  isZipping,
}: FileQueueProps) {
  if (files.length === 0) return null;

  const completedCount = files.filter(f => f.status === "done").length;
  const isProcessing = files.some(f => f.status === "processing");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          File Queue
          <Badge variant="secondary" className="font-mono">{files.length}</Badge>
        </h3>
        
        <div className="flex items-center gap-2">
          {completedCount > 1 && onDownloadAll && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadAll}
              disabled={isZipping}
              className="gap-1.5 h-8 text-xs"
            >
              {isZipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {isZipping ? "Zipping..." : "Download All ZIP"}
            </Button>
          )}
          {files.length > 1 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearAll} 
              disabled={isProcessing}
              className="text-xs text-muted-foreground hover:text-destructive h-8"
            >
              Clear Queue
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {files.map((file) => (
            <motion.div
              key={file.id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <FileCard 
                file={file} 
                onRemove={onRemove} 
                onInspect={onInspect} 
                onDownload={onDownload} 
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
