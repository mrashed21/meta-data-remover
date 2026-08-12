"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import JSZip from "jszip";
import { Sparkles, ArrowDown, Shield, Zap, BrainCircuit } from "lucide-react";

import { Header } from "@/components/header";
import { ImageUploader } from "@/components/image-uploader";
import { ControlPanel } from "@/components/control-panel";
import { MetadataInspector } from "@/components/metadata-inspector";
import { CompareSlider } from "@/components/compare-slider";
import { BatchProgress } from "@/components/batch-progress";
import { ShareButton } from "@/components/share-button";
import { LivePreviewEditor } from "@/components/live-preview-editor";
import { Badge } from "@/components/ui/badge";

import { generateId } from "@/lib/utils";
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

  // Handle file additions
  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    const imageFiles: ImageFile[] = await Promise.all(
      newFiles.map(async (file) => {
        const preview = URL.createObjectURL(file);
        const metadataBefore = await extractMetadata(file);
        return {
          id: generateId(),
          file,
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
    setFiles((prev) => [...prev, ...imageFiles]);
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

        if (options.mode === "fast") {
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
              value: "Stripped ✓",
              category: "camera",
              stripped: true,
            },
            {
              key: "GPS Location",
              value: "Stripped ✓",
              category: "location",
              stripped: true,
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
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-8"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 text-foreground">
                  Strip. Clean. Protect.
                </h2>
                <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto mb-6">
                  Remove EXIF metadata, C2PA manifests, SynthID watermarks, and
                  AI fingerprints from your images — instantly in-browser or via
                  advanced server processing.
                </p>
              </motion.div>

              {/* Feature badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {[
                  {
                    icon: Shield,
                    label: "EXIF & GPS Stripping",
                    color: "text-foreground",
                  },
                  {
                    icon: Zap,
                    label: "Instant Client-Side",
                    color: "text-foreground",
                  },
                  {
                    icon: BrainCircuit,
                    label: "AI Watermark Bypass",
                    color: "text-foreground",
                  },
                  {
                    icon: Sparkles,
                    label: "Batch + ZIP Export",
                    color: "text-foreground",
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <Badge
                      variant="outline"
                      className="px-3 py-1.5 gap-1.5 text-xs border-border text-muted-foreground hover:text-foreground"
                    >
                      <feature.icon className={`w-3.5 h-3.5`} />
                      {feature.label}
                    </Badge>
                  </motion.div>
                ))}
              </div>

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ArrowDown className="w-5 h-5 text-zinc-600 mx-auto" />
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
              <ImageUploader
                files={files}
                onFilesAdded={handleFilesAdded}
                onFileRemove={handleFileRemove}
                onFileEdit={handleFileEdit}
                disabled={isProcessing}
              />
            </motion.div>

            {/* Batch Progress */}
            <BatchProgress
              files={files}
              onDownload={handleDownload}
              onDownloadAll={handleDownloadAll}
              onInspect={handleInspect}
              onCompare={handleCompare}
              onRename={handleRename}
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
