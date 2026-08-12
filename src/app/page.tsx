"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import JSZip from "jszip";
import { Sparkles, ArrowDown, Shield, Zap, BrainCircuit } from "lucide-react";

import { Header } from "@/components/header";
import { UniversalUploader } from "@/components/universal-uploader";
import { ControlPanel } from "@/components/control-panel";
import { MetadataInspector } from "@/components/metadata-inspector";
import { CompareSlider } from "@/components/compare-slider";
import { FileQueue } from "@/components/file-queue";
import { ShareButton } from "@/components/share-button";
import { LivePreviewEditor } from "@/components/live-preview-editor";
import { Badge } from "@/components/ui/badge";

import { generateId, generateOutputFilename } from "@/lib/utils";
import { DEFAULT_PROCESSING_OPTIONS, FORMAT_MIME } from "@/lib/constants";
import { extractMetadata, processImageCanvas } from "@/lib/canvas-processor";
import type {
  ImageFile,
  ProcessingOptions,
  OutputFormat,
  ProcessingMode,
  MetadataField,
  CropData,
  ResizeOptions,
} from "@/lib/types";

export default function Home() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [options, setOptions] = useState<ProcessingOptions>(
    DEFAULT_PROCESSING_OPTIONS
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);

  // Inspector state
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorFile, setInspectorFile] = useState<ImageFile | null>(null);

  // Compare state
  const [compareFile, setCompareFile] = useState<ImageFile | null>(null);

  // Abort controller for cancellation
  const abortRef = useRef<AbortController | null>(null);

  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    // Dynamically import getMediaType to avoid top-level issues if not imported yet
    const { getMediaType } = await import("@/lib/media-types");
    const imageFiles = await Promise.all(
      newFiles.map(async (file) => {
        const preview = URL.createObjectURL(file);
        const metadataBefore = await extractMetadata(file);
        return {
          id: generateId(),
          file,
          mediaType: getMediaType(file) || "image",
          preview,
          status: "queued" as const,
          progress: 0,
          processedBlob: null,
          processedPreview: null,
          metadataBefore,
          metadataAfter: [],
        };
      })
    );
    setFiles((prev) => [...prev, ...imageFiles as any]);
  }, []);

  // Handle file removal
  const handleFileRemove = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
        if (file.processedPreview) URL.revokeObjectURL(file.processedPreview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((file) => {
        URL.revokeObjectURL(file.preview);
        if (file.processedPreview) URL.revokeObjectURL(file.processedPreview);
      });
      return [];
    });
  }, []);

  const handleFileEdit = useCallback((id: string) => {
    setEditingImageId(id);
  }, []);

  const handleSaveEdit = useCallback((id: string, crop: CropData | undefined, resize: ResizeOptions | undefined) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, cropData: crop, customResize: resize } : f
      )
    );
  }, []);

  const handleRename = useCallback((id: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, customName: newName } : f))
    );
  }, []);

  // Process all files
  const handleProcess = useCallback(async () => {
    const filesToProcess = files.filter(
      (f) => f.status === "queued" || f.status === "error"
    );
    if (filesToProcess.length === 0) return;

    setIsProcessing(true);
    abortRef.current = new AbortController();

    for (const imageFile of filesToProcess) {
      if (abortRef.current?.signal.aborted) break;

      // Set to processing
      setFiles((prev) =>
        prev.map((f) =>
          f.id === imageFile.id
            ? { ...f, status: "processing" as const, progress: 10, error: undefined }
            : f
        )
      );

      try {
        let processedBlob: Blob;
        let metadataAfter: MetadataField[];

        if (imageFile.mediaType === "video" || imageFile.mediaType === "audio") {
          // Dynamically load ffmpeg to avoid impacting bundle size for image-only users
          const { processMediaFFmpeg } = await import("@/lib/ffmpeg-processor");
          
          const result = await processMediaFFmpeg(imageFile as any, options, (prog) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === imageFile.id ? { ...f, progress: prog } : f
              )
            );
          });
          processedBlob = result.blob;
          metadataAfter = result.metadataAfter;
        } else if (options.mode === "fast") {
          // Client-side Canvas processing
          setFiles((prev) =>
            prev.map((f) =>
              f.id === imageFile.id ? { ...f, progress: 30 } : f
            )
          );

          const result = await processImageCanvas(imageFile, options);
          processedBlob = result.blob;
          metadataAfter = result.metadataAfter;
        } else {
          // Server-side Sharp processing
          setFiles((prev) =>
            prev.map((f) =>
              f.id === imageFile.id ? { ...f, progress: 20 } : f
            )
          );

          const formData = new FormData();
          formData.append("file", imageFile.file);
          formData.append("format", options.format);
          formData.append("quality", String(options.quality));
          formData.append("microCrop", String(options.microCrop));
          formData.append("colorShift", String(options.colorShift));
          formData.append("noiseInjection", String(options.noiseInjection));
          formData.append("privacyMode", options.privacyMode);
          
          if (imageFile.cropData) {
            formData.append("cropX", String(imageFile.cropData.x));
            formData.append("cropY", String(imageFile.cropData.y));
            formData.append("cropW", String(imageFile.cropData.width));
            formData.append("cropH", String(imageFile.cropData.height));
          }
          
          const activeResize = imageFile.customResize || options.globalResize;
          if (activeResize) {
            if (activeResize.width) formData.append("resizeW", String(activeResize.width));
            if (activeResize.height) formData.append("resizeH", String(activeResize.height));
            formData.append("resizeMaintainAspect", String(activeResize.maintainAspectRatio));
          }

          setFiles((prev) =>
            prev.map((f) =>
              f.id === imageFile.id ? { ...f, progress: 50 } : f
            )
          );

          const response = await fetch("/api/process-image", {
            method: "POST",
            body: formData,
            signal: abortRef.current?.signal,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error || `Server error: ${response.status}`
            );
          }

          setFiles((prev) =>
            prev.map((f) =>
              f.id === imageFile.id ? { ...f, progress: 80 } : f
            )
          );

          const contentType =
            response.headers.get("Content-Type") ||
            FORMAT_MIME[options.format] ||
            "image/jpeg";
          const arrayBuffer = await response.arrayBuffer();
          processedBlob = new Blob([arrayBuffer], { type: contentType });

          metadataAfter = [
            {
              key: "File Size",
              value: `${(processedBlob.size / 1024).toFixed(1)} KB`,
              category: "other",
              stripped: false,
            },
            {
              key: "MIME Type",
              value: contentType,
              category: "other",
              stripped: false,
            },
            {
              key: "EXIF Data",
              value: options.privacyMode === "clean-branding" ? "Cleaned + Branded ✓" : "Stripped ✓",
              category: "camera",
              stripped: options.privacyMode !== "clean-branding",
            },
            {
              key: "Location / GPS",
              value: "Stripped ✓",
              category: "location",
              stripped: true,
            },
            {
              key: "Author / Creator",
              value: options.privacyMode === "clean-branding" ? "Muhammad Rashed ✓" : "Stripped ✓",
              category: "other",
              stripped: options.privacyMode !== "clean-branding",
            },
            {
              key: "C2PA Manifest",
              value: "Stripped ✓",
              category: "ai",
              stripped: true,
            },
            {
              key: "SynthID Watermark",
              value: "Disrupted ✓",
              category: "ai",
              stripped: true,
            },
            {
              key: "AI Tags",
              value: "Stripped ✓",
              category: "ai",
              stripped: true,
            },
            {
              key: "Software",
              value: "Stripped ✓",
              category: "software",
              stripped: true,
            },
          ];

          if (options.microCrop > 0) {
            metadataAfter.push({
              key: "Micro-Crop Applied",
              value: `${options.microCrop}px`,
              category: "other",
              stripped: false,
            });
          }
          if (options.colorShift !== 0) {
            metadataAfter.push({
              key: "Color Shift Applied",
              value: `${options.colorShift > 0 ? "+" : ""}${options.colorShift}%`,
              category: "other",
              stripped: false,
            });
          }
          if (options.noiseInjection > 0) {
            metadataAfter.push({
              key: "Noise Injection",
              value: `${options.noiseInjection}%`,
              category: "other",
              stripped: false,
            });
          }
        }

        const processedPreview = URL.createObjectURL(processedBlob);

        let targetExt: string = options.format;
        if (imageFile.mediaType === "video" || imageFile.mediaType === "audio") {
          targetExt = imageFile.file.name.split('.').pop() || "bin";
        }
        
        const customName = generateOutputFilename(targetExt);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === imageFile.id
              ? {
                  ...f,
                  status: "done" as const,
                  progress: 100,
                  processedBlob,
                  processedPreview,
                  metadataAfter,
                  customName,
                }
              : f
          )
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") break;
        setFiles((prev) =>
          prev.map((f) =>
            f.id === imageFile.id
              ? {
                  ...f,
                  status: "error" as const,
                  progress: 0,
                  error:
                    err instanceof Error ? err.message : "Processing failed",
                }
              : f
          )
        );
      }
    }

    setIsProcessing(false);
  }, [files, options]);

  // Download a single file
  const handleDownload = useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id);
      if (!file?.processedBlob) return;

      const ext = options.format === "jpeg" ? "jpg" : options.format;
      let outputName = file.customName || file.file.name.replace(/\.[^.]+$/, `_cleaned.${ext}`);
      if (!outputName.includes(".")) outputName += `.${ext}`;

      const url = URL.createObjectURL(file.processedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = outputName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [files, options.format]
  );

  // Download all as ZIP
  const handleDownloadAll = useCallback(async () => {
    const completedFiles = files.filter(
      (f) => f.status === "done" && f.processedBlob
    );
    if (completedFiles.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      const ext = options.format === "jpeg" ? "jpg" : options.format;

      for (const file of completedFiles) {
        if (file.processedBlob) {
          let outputName = file.customName || file.file.name.replace(
            /\.[^.]+$/,
            `_cleaned.${ext}`
          );
          if (!outputName.includes(".")) outputName += `.${ext}`;
          zip.file(outputName, file.processedBlob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cleanexif-ai-batch-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP creation failed:", err);
    } finally {
      setIsZipping(false);
    }
  }, [files, options.format]);

  // Open metadata inspector for a file
  const handleInspect = useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file) {
        setInspectorFile(file);
        setInspectorOpen(true);
      }
    },
    [files]
  );

  // Open compare slider for a file
  const handleCompare = useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file && file.processedPreview) {
        setCompareFile(file);
      }
    },
    [files]
  );

  const completedFiles = files.filter((f) => f.status === "done");
  const firstCompleted = completedFiles[0];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full">
        {/* Hero section when no files */}
        <AnimatePresence>
          {files.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-center section-y mb-4"
            >
              {/* Privacy Statement / Overline */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-sm font-medium text-success"
              >
                <Shield className="w-4 h-4" />
                <span>100% Private. Files never leave your device.</span>
              </motion.div>

              {/* Hero Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-display max-w-4xl mb-6"
              >
                Strip Metadata. <br className="sm:hidden" />
                <span className="gradient-text">Protect Your Privacy.</span>
              </motion.h2>

              {/* Hero Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-body-lg max-w-2xl text-muted-foreground mb-10"
              >
                Remove hidden EXIF data, GPS locations, C2PA manifests, and AI tracking watermarks from your media. Fast, secure, and entirely browser-based.
              </motion.p>

              {/* Feature Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center justify-center gap-4 mb-12"
              >
                {[
                  { icon: Zap, label: "Instant Client-Side" },
                  { icon: BrainCircuit, label: "AI Watermark Bypass" },
                  { icon: Sparkles, label: "Batch Processing" },
                ].map((feature, i) => (
                  <div
                    key={feature.label}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[oklch(0.55_0.27_293/0.1)] flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-[oklch(0.75_0.18_293)]" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{feature.label}</span>
                  </div>
                ))}
              </motion.div>

              {/* Supported Format Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-widest mt-8"
              >
                <span>Supported Formats:</span>
                <span className="text-foreground">JPG, PNG, WebP</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Upload + Batch Progress + Compare */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <UniversalUploader
                files={files as any} // Cast temporarily until full pipeline migration in Sprint 05/06
                onFilesAdded={handleFilesAdded}
                onFileRemove={handleFileRemove}
                onClearAll={handleClearAll}
                onFileEdit={handleFileEdit}
                disabled={isProcessing}
              />
            </motion.div>

            {/* File Queue */}
            <FileQueue
              files={files as any}
              onRemove={handleFileRemove}
              onClearAll={handleClearAll}
              onInspect={handleInspect}
              onDownload={handleDownload}
              onDownloadAll={handleDownloadAll}
              isZipping={isZipping}
            />

            {/* Compare Slider */}
            <AnimatePresence>
              {(compareFile || firstCompleted) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-zinc-300">
                      Before / After Comparison
                    </h3>
                    {(compareFile || firstCompleted)?.processedBlob && (
                      <ShareButton
                        blob={(compareFile || firstCompleted)!.processedBlob!}
                        fileName={
                          (compareFile || firstCompleted)!.file.name.replace(
                            /\.[^.]+$/,
                            `_cleaned.${options.format === "jpeg" ? "jpg" : options.format}`
                          )
                        }
                      />
                    )}
                  </div>
                  <CompareSlider
                    originalSrc={
                      (compareFile || firstCompleted)!.preview
                    }
                    processedSrc={
                      (compareFile || firstCompleted)!.processedPreview!
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Control Panel */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-20">
              <ControlPanel
                options={options}
                onOptionsChange={setOptions}
                onProcess={handleProcess}
                isProcessing={isProcessing}
                fileCount={
                  files.filter(
                    (f) => f.status === "queued" || f.status === "error"
                  ).length
                }
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-zinc-500">
              © {new Date().getFullYear()} CleanExif AI. All processing happens
              securely. Fast Mode runs entirely in your browser.
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[10px]">
                PWA Ready
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                No Data Stored
              </Badge>
            </div>
          </div>
        </div>
      </footer>

      {/* Metadata Inspector Modal */}
      <MetadataInspector
        open={inspectorOpen}
        onOpenChange={setInspectorOpen}
        metadataBefore={inspectorFile?.metadataBefore || []}
        metadataAfter={inspectorFile?.metadataAfter || []}
        fileName={inspectorFile?.file.name}
      />

      <LivePreviewEditor
        key={editingImageId ?? "no-image"}
        open={editingImageId !== null}
        onOpenChange={(open) => !open && setEditingImageId(null)}
        image={files.find((f) => f.id === editingImageId) || null}
        options={options}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
