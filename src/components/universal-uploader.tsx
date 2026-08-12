"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "motion/react";
import { Upload, ImagePlus, X, FileImage, FileVideo, FileAudio, Edit2, Trash2 } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { ALL_SUPPORTED_TYPES, getMediaType } from "@/lib/media-types";
import { validateBatch } from "@/lib/validators";
import type { MediaFile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { EmptyQueue } from "@/components/ui/empty-state";

interface UniversalUploaderProps {
  files: MediaFile[];
  onFilesAdded: (files: File[]) => void;
  onFileRemove: (id: string) => void;
  onClearAll: () => void;
  onFileEdit?: (id: string) => void;
  disabled?: boolean;
}

export function UniversalUploader({
  files,
  onFilesAdded,
  onFileRemove,
  onClearAll,
  onFileEdit,
  disabled = false,
}: UniversalUploaderProps) {
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      // Handle file rejections from react-dropzone (e.g. wrong mime type generally)
      if (fileRejections.length > 0) {
        toast({
          title: "Invalid files detected",
          description: `Some files were rejected before validation.`,
          variant: "error",
        });
      }

      if (acceptedFiles.length === 0) return;

      // Run our strict universal validation (size limits per type, exact extensions, dupes)
      const { valid, errors } = validateBatch(acceptedFiles, files);

      // Show errors as toasts
      errors.forEach(({ file, error }) => {
        toast({
          title: error.code === "UNSUPPORTED_FILE" && error.message.includes("already in the queue") 
            ? "Duplicate file" 
            : "Upload failed",
          description: error.message,
          variant: "error",
        });
      });

      // Pass valid files to parent
      if (valid.length > 0) {
        onFilesAdded(valid);
        toast({
          title: "Files added",
          description: `Successfully queued ${valid.length} file${valid.length > 1 ? "s" : ""}.`,
          variant: "success",
        });
      }
    },
    [files, onFilesAdded, toast]
  );

  // Construct accept object for react-dropzone from our registry
  const acceptRegistry = ALL_SUPPORTED_TYPES.reduce((acc, curr) => {
    if (!acc[curr.mime]) {
      acc[curr.mime] = [];
    }
    acc[curr.mime].push(...curr.extensions);
    return acc;
  }, {} as Record<string, string[]>);

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } =
    useDropzone({
      onDrop,
      accept: acceptRegistry,
      disabled,
      multiple: true,
      noClick: files.length > 0, // Disable click to upload if we already have files (use dedicated button instead)
    });

  return (
    <div className="space-y-6">
      {/* ─── Dropzone Area ──────────────────────────────────────────────────────── */}
      <motion.div
        whileHover={!disabled && files.length === 0 ? { scale: 1.005 } : undefined}
        whileTap={!disabled && files.length === 0 ? { scale: 0.995 } : undefined}
      >
        <div
          {...getRootProps()}
          className={cn(
            "relative rounded-2xl border-2 border-dashed transition-all duration-300 group overflow-hidden",
            files.length === 0 ? "p-8 sm:p-16 text-center cursor-pointer" : "p-4 sm:p-6",
            isDragActive && !isDragReject && "border-success bg-success/5 scale-[1.01]",
            isDragReject && "border-destructive bg-destructive/10",
            !isDragActive && !isDragReject && "border-border bg-card hover:border-zinc-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />

          {/* Background glow effect */}
          <div
            className={cn(
              "absolute inset-0 opacity-0 transition-opacity duration-500",
              isDragActive && "opacity-100"
            )}
          >
            <div className="absolute inset-0 bg-[oklch(0.55_0.27_293/0.05)]" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center">
            {files.length === 0 ? (
              <AnimatePresence mode="wait">
                {isDragActive && !isDragReject ? (
                  <motion.div
                    key="drag-active"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center text-success shadow-lg shadow-success/20">
                      <ImagePlus className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-medium text-success">
                      Drop to queue files
                    </p>
                  </motion.div>
                ) : isDragReject ? (
                  <motion.div
                    key="drag-reject"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center text-destructive">
                      <X className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-medium text-destructive">
                      Unsupported file type
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="drag-idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full"
                  >
                    <EmptyQueue />
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">
                      {isDragActive ? "Drop files here" : "Add more files"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Images (50MB), Videos (500MB), Audio (100MB)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={open} disabled={disabled}>
                    Browse Files
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onClearAll} className="text-destructive hover:text-destructive hover:bg-destructive/10" disabled={disabled || files.length === 0}>
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ─── Queue Preview Grid (Temporary until Sprint 05) ────────────────────── */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
          >
            {files.map((mediaFile, index) => {
              const Icon = mediaFile.mediaType === "video" ? FileVideo : mediaFile.mediaType === "audio" ? FileAudio : FileImage;
              
              return (
                <motion.div
                  key={mediaFile.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: Math.min(index * 0.05, 0.5) }}
                  className="relative group rounded-xl overflow-hidden border border-border bg-card aspect-square shadow-sm"
                >
                  {/* Thumbnail / Icon */}
                  {mediaFile.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaFile.preview}
                      alt={mediaFile.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/30">
                      <Icon className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}

                  {/* Info Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-xs font-medium text-white truncate" title={mediaFile.file.name}>
                        {mediaFile.file.name}
                      </p>
                      <p className="text-[10px] text-zinc-400 uppercase">
                        {mediaFile.mediaType} • {formatFileSize(mediaFile.file.size)}
                      </p>
                    </div>
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {mediaFile.mediaType === "image" && onFileEdit && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="w-7 h-7 shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileEdit(mediaFile.id);
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="w-7 h-7 shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFileRemove(mediaFile.id);
                      }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Status Overlay */}
                  {mediaFile.status === "processing" && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] font-semibold text-brand">Processing...</span>
                    </div>
                  )}
                  {mediaFile.status === "done" && (
                    <div className="absolute top-2 left-2">
                      <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center shadow-md">
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
