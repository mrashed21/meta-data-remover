"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  Archive,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  FileImage,
  Eye,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatFileSize } from "@/lib/utils";
import type { ImageFile } from "@/lib/types";

interface BatchProgressProps {
  files: ImageFile[];
  onDownload: (id: string) => void;
  onDownloadAll: () => void;
  onInspect: (id: string) => void;
  onCompare: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
  isZipping: boolean;
}

const statusConfig = {
  queued: {
    icon: Clock,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    label: "Queued",
  },
  processing: {
    icon: Loader2,
    color: "text-foreground",
    bg: "bg-muted",
    label: "Processing",
  },
  done: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    label: "Done",
  },
  error: {
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: "Error",
  },
};

export function BatchProgress({
  files,
  onDownload,
  onDownloadAll,
  onInspect,
  onCompare,
  onRename,
  isZipping,
}: BatchProgressProps) {
  const completedCount = files.filter((f) => f.status === "done").length;
  const hasCompleted = completedCount > 0;
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");

  if (files.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileImage className="w-4 h-4 text-foreground" />
              Batch Progress
              <Badge variant="secondary" className="ml-1">
                {completedCount}/{files.length}
              </Badge>
            </CardTitle>
            {hasCompleted && files.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadAll}
                disabled={isZipping}
                className="gap-1.5"
              >
                {isZipping ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Archive className="w-3.5 h-3.5" />
                )}
                {isZipping ? "Zipping..." : "Download All ZIP"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <AnimatePresence>
            {files.map((file, index) => {
              const config = statusConfig[file.status];
              const StatusIcon = config.icon;
              const isEditing = editingNameId === file.id;

              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border border-border ${config.bg} transition-colors`}
                >
                  {/* Thumbnail */}
                  <div className="w-10 h-10 rounded-md overflow-hidden border border-border shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <Input
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          onBlur={() => {
                            if (onRename && editNameValue.trim()) {
                              onRename(file.id, editNameValue.trim());
                            }
                            setEditingNameId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              if (onRename && editNameValue.trim()) {
                                onRename(file.id, editNameValue.trim());
                              }
                              setEditingNameId(null);
                            } else if (e.key === "Escape") {
                              setEditingNameId(null);
                            }
                          }}
                          className="h-6 text-xs w-48"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-sm text-foreground truncate cursor-pointer hover:underline" onClick={() => {
                            setEditingNameId(file.id);
                            setEditNameValue(file.customName || file.file.name);
                          }} title="Click to rename">
                            {file.customName || file.file.name}
                          </p>
                          <button onClick={() => {
                            setEditingNameId(file.id);
                            setEditNameValue(file.customName || file.file.name);
                          }} className="text-muted-foreground hover:text-foreground">
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {!isEditing && (
                        <StatusIcon
                          className={`w-3.5 h-3.5 shrink-0 ${config.color} ${
                            file.status === "processing" ? "animate-spin" : ""
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {formatFileSize(file.file.size)}
                      </span>
                      {file.status === "done" && file.processedBlob && (
                        <>
                          <span className="text-[10px] text-muted-foreground">→</span>
                          <span className="text-[10px] text-emerald-500">
                            {formatFileSize(file.processedBlob.size)}
                          </span>
                        </>
                      )}
                      {file.error && (
                        <span className="text-[10px] text-destructive truncate">
                          {file.error}
                        </span>
                      )}
                    </div>
                    {file.status === "processing" && (
                      <Progress value={file.progress} className="mt-1.5 h-1" />
                    )}
                  </div>

                  {/* Actions */}
                  {file.status === "done" && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 hover:bg-background/50"
                        onClick={() => onInspect(file.id)}
                        title="Inspect metadata"
                      >
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 hover:bg-background/50"
                        onClick={() => onCompare(file.id)}
                        title="Compare before/after"
                      >
                        <FileImage className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 hover:bg-background/50"
                        onClick={() => onDownload(file.id)}
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5 text-foreground" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
