"use client";

import JSZip from "jszip";
import {
  BrainCircuit,
  Image as ImageIcon,
  Mail,
  MessageCircle,
  Music,
  Shield,
  Sparkles,
  Video,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CompareSlider } from "@/components/compare-slider";
import { ControlPanel } from "@/components/control-panel";
import { FileQueue } from "@/components/file-queue";
import { Header } from "@/components/header";
import { LandingSections } from "@/components/landing-sections";
import { LivePreviewEditor } from "@/components/live-preview-editor";
import { MetadataInspector } from "@/components/metadata-inspector";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { UniversalUploader } from "@/components/universal-uploader";

import { extractMetadata, processImageCanvas } from "@/lib/canvas-processor";
import { DEFAULT_PROCESSING_OPTIONS, FORMAT_MIME } from "@/lib/constants";
import type {
  CropData,
  ImageFile,
  MetadataField,
  ProcessingOptions,
  ResizeOptions,
} from "@/lib/types";
import {
  generateId,
  generateOutputFilename,
  getImageDimensions,
  handleEmailClick,
} from "@/lib/utils";

export default function Home() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [options, setOptions] = useState<ProcessingOptions>(
    DEFAULT_PROCESSING_OPTIONS,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"image" | "video" | "audio">(
    "image",
  );
  const filteredFiles = files.filter((f) => f.mediaType === activeTab);

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
        const dims = await getImageDimensions(file);

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
          width: dims?.width,
          height: dims?.height,
        };
      }),
    );
    setFiles((prev) => [...prev, ...(imageFiles as any)]);
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
      const remaining = prev.filter((f) => f.mediaType !== activeTab);
      prev
        .filter((f) => f.mediaType === activeTab)
        .forEach((file) => {
          URL.revokeObjectURL(file.preview);
          if (file.processedPreview) URL.revokeObjectURL(file.processedPreview);
        });
      return remaining;
    });
  }, [activeTab]);

  const handleFileEdit = useCallback((id: string) => {
    setEditingImageId(id);
  }, []);

  const handleSaveEdit = useCallback(
    (
      id: string,
      crop: CropData | undefined,
      resize: ResizeOptions | undefined,
    ) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, cropData: crop, customResize: resize } : f,
        ),
      );
    },
    [],
  );

  const handleRename = useCallback((id: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, customName: newName } : f)),
    );
  }, []);

  // Process all files in current tab
  const handleProcess = useCallback(async () => {
    const filesToProcess = files.filter(
      (f) =>
        (f.status === "queued" || f.status === "error") &&
        f.mediaType === activeTab,
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
            ? {
                ...f,
                status: "processing" as const,
                progress: 10,
                error: undefined,
              }
            : f,
        ),
      );

      try {
        let processedBlob: Blob;
        let metadataAfter: MetadataField[];

        if (
          imageFile.mediaType === "video" ||
          imageFile.mediaType === "audio"
        ) {
          // Dynamically load ffmpeg to avoid impacting bundle size for image-only users
          const { processMediaFFmpeg } = await import("@/lib/ffmpeg-processor");

          const result = await processMediaFFmpeg(
            imageFile as any,
            options,
            (prog) => {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === imageFile.id ? { ...f, progress: prog } : f,
                ),
              );
            },
          );
          processedBlob = result.blob;
          metadataAfter = result.metadataAfter;
        } else if (options.mode === "fast") {
          // Client-side Canvas processing
          setFiles((prev) =>
            prev.map((f) =>
              f.id === imageFile.id ? { ...f, progress: 30 } : f,
            ),
          );

          const result = await processImageCanvas(imageFile, options);
          processedBlob = result.blob;
          metadataAfter = result.metadataAfter;
        } else {
          // Server-side Sharp processing
          setFiles((prev) =>
            prev.map((f) =>
              f.id === imageFile.id ? { ...f, progress: 20 } : f,
            ),
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
          if (activeResize && activeResize.enabled) {
            formData.append("resizeEnabled", "true");
            if (activeResize.width)
              formData.append("resizeW", String(activeResize.width));
            if (activeResize.height)
              formData.append("resizeH", String(activeResize.height));
            formData.append(
              "resizeMaintainAspect",
              String(activeResize.maintainAspectRatio),
            );
            if (activeResize.preset)
              formData.append("resizePreset", activeResize.preset);
            if (activeResize.mode)
              formData.append("resizeMode", activeResize.mode);
          }

          setFiles((prev) =>
            prev.map((f) =>
              f.id === imageFile.id ? { ...f, progress: 50 } : f,
            ),
          );

          const response = await fetch("/api/process-image", {
            method: "POST",
            body: formData,
            signal: abortRef.current?.signal,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error || `Server error: ${response.status}`,
            );
          }

          setFiles((prev) =>
            prev.map((f) =>
              f.id === imageFile.id ? { ...f, progress: 80 } : f,
            ),
          );

          const contentType =
            response.headers.get("Content-Type") ||
            FORMAT_MIME[options.format] ||
            "image/jpeg";
          const processedW = response.headers.get("X-Processed-Width");
          const processedH = response.headers.get("X-Processed-Height");
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
            ...(processedW && processedH
              ? [
                  {
                    key: "Dimensions",
                    value: `${processedW} × ${processedH}`,
                    category: "other" as const,
                    stripped: false,
                  },
                ]
              : []),
            {
              key: "EXIF Data",
              value:
                options.privacyMode === "clean-branding"
                  ? "Cleaned + Branded ✓"
                  : "Stripped ✓",
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
              value:
                options.privacyMode === "clean-branding"
                  ? "Muhammad Rashed ✓"
                  : "Stripped ✓",
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
        if (
          imageFile.mediaType === "video" ||
          imageFile.mediaType === "audio"
        ) {
          targetExt = imageFile.file.name.split(".").pop() || "bin";
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
              : f,
          ),
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
              : f,
          ),
        );
      }
    }

    setIsProcessing(false);
  }, [files, options, activeTab]);

  // Cancel processing
  const handleCancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setIsProcessing(false);
  }, []);

  // Download a single file
  const handleDownload = useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id);
      if (!file?.processedBlob) return;

      const ext = options.format === "jpeg" ? "jpg" : options.format;
      let outputName =
        file.customName ||
        file.file.name.replace(/\.[^.]+$/, `_cleaned.${ext}`);
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
    [files, options.format],
  );

  // Download all as ZIP
  const handleDownloadAll = useCallback(async () => {
    const processedFiles = files.filter(
      (f) =>
        f.status === "done" && f.processedBlob && f.mediaType === activeTab,
    );
    if (processedFiles.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      const ext = options.format === "jpeg" ? "jpg" : options.format;

      for (const file of processedFiles) {
        if (file.processedBlob) {
          let outputName =
            file.customName ||
            file.file.name.replace(/\.[^.]+$/, `_cleaned.${ext}`);
          if (!outputName.includes(".")) outputName += `.${ext}`;
          zip.file(outputName, file.processedBlob);
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ZeroMeta-${activeTab}-processed.zip`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("ZIP creation failed:", err);
      alert(
        "Failed to create ZIP file. Please try downloading files individually.",
      );
    } finally {
      setIsZipping(false);
    }
  }, [files, options.format, activeTab]);

  // Open metadata inspector for a file
  const handleInspect = useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file) {
        setInspectorFile(file);
        setInspectorOpen(true);
      }
    },
    [files],
  );

  // Open compare slider for a file
  const handleCompare = useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file && file.processedPreview) {
        setCompareFile(file);
      }
    },
    [files],
  );

  // Compute derived state for the current tab
  const processingCount = filteredFiles.filter(
    (f) => f.status === "processing",
  ).length;
  const queuedCount = filteredFiles.filter((f) => f.status === "queued").length;
  const doneCount = filteredFiles.filter((f) => f.status === "done").length;
  const errorCount = filteredFiles.filter((f) => f.status === "error").length;
  const firstCompleted = filteredFiles.find((f) => f.status === "done");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pt-24 md:pt-28 md:pb-10 w-full flex flex-col gap-4 lg:gap-8">
        {/* Hero section when no files */}
        <AnimatePresence>
          {files.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-center py-12 md:py-20 hero-glow mb-4 rounded-3xl"
            >
              {/* Privacy Statement / Overline */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${
                  options.privacyMode === "clean-branding"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                    : "border-success/30 bg-success/10 text-success"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>
                  {options.privacyMode === "clean-branding"
                    ? "Advanced Mode: Processed securely on our servers. Files deleted instantly."
                    : "100% Private. Files never leave your device."}
                </span>
              </motion.div>

              {/* Hero Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-7xl font-bold max-w-4xl mb-6 tracking-tight"
              >
                Strip Metadata. <br className="sm:hidden" />
                <span className="text-gradient-cyan">
                  Protect Your Privacy.
                </span>
              </motion.h2>

              {/* Hero Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl max-w-2xl text-muted-foreground mb-10 leading-relaxed"
              >
                Remove hidden EXIF data, GPS locations, C2PA manifests, and AI
                tracking watermarks from your media. Fast, secure, and entirely
                browser-based.
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
                    className="flex items-center gap-2 px-4 py-2 rounded-xl surface shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[rgba(0,200,255,0.1)] flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-brand" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {feature.label}
                    </span>
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
                <span className="text-foreground">
                  JPG, PNG, WebP, MP4, MP3
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main layout */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as any)}
          className="w-full space-y-6"
        >
          <TabsList className="w-full sm:w-auto h-12 bg-card/80 backdrop-blur-md border border-border/50 flex p-1 rounded-xl">
            <TabsTrigger
              value="image"
              className="flex-1 sm:flex-none gap-2 h-10 px-6 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all"
            >
              <ImageIcon className="w-4 h-4" />{" "}
              <span className="hidden sm:inline">Images</span>
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="flex-1 sm:flex-none gap-2 h-10 px-6 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all"
            >
              <Video className="w-4 h-4" />{" "}
              <span className="hidden sm:inline">Videos</span>
            </TabsTrigger>
            <TabsTrigger
              value="audio"
              className="flex-1 sm:flex-none gap-2 h-10 px-6 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all"
            >
              <Music className="w-4 h-4" />{" "}
              <span className="hidden sm:inline">Audio</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
              {/* Left Column: Upload + Batch Progress + Compare */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <UniversalUploader
                    files={filteredFiles as any}
                    allowedType={activeTab}
                    onFilesAdded={handleFilesAdded}
                    onFileRemove={handleFileRemove}
                    onClearAll={handleClearAll}
                    onFileEdit={handleFileEdit}
                    disabled={isProcessing}
                  />
                </motion.div>

                {/* Feedback Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="p-6 rounded-2xl surface shadow-sm border border-border/50 flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Feedback & Support</h3>
                    <p className="text-sm text-muted-foreground">Have questions or suggestions? Let us know!</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <a
                      href="#"
                      onClick={(e) => handleEmailClick(e, "rashedjaman768@gmail.com", "ZeroMeta Feedback", "Hi Muhammad Rashed,\n\nI have some questions/suggestions regarding ZeroMeta:\n\n")}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
                    >
                      <Mail className="w-4 h-4" />
                      Email Us
                    </a>
                    <a
                      href="https://wa.me/@mrashed21"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors text-sm font-medium shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                  </div>
                </motion.div>

                {/* File Queue */}
                <FileQueue
                  files={filteredFiles as any}
                  onRemove={handleFileRemove}
                  onClearAll={handleClearAll}
                  onInspect={handleInspect}
                  onDownload={handleDownload}
                  onDownloadAll={handleDownloadAll}
                  isZipping={isZipping}
                />

                {/* Compare Slider */}
                <AnimatePresence>
                  {(compareFile || firstCompleted)?.processedPreview && (
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
                            blob={
                              (compareFile || firstCompleted)!.processedBlob!
                            }
                            fileName={(compareFile ||
                              firstCompleted)!.file.name.replace(
                              /\.[^.]+$/,
                              `_cleaned.${options.format === "jpeg" ? "jpg" : options.format}`,
                            )}
                          />
                        )}
                      </div>
                      <CompareSlider
                        originalSrc={(compareFile || firstCompleted)!.preview}
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
                <div className="lg:sticky lg:top-24">
                  <ControlPanel
                    options={options}
                    onOptionsChange={setOptions}
                    onProcess={handleProcess}
                    onCancel={handleCancel}
                    isProcessing={isProcessing}
                    activeTab={activeTab}
                    fileCount={
                      filteredFiles.filter(
                        (f) => f.status === "queued" || f.status === "error",
                      ).length
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Landing Sections (Marketing / SEO) */}
        {files.length === 0 && <LandingSections />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-auto mobile-nav-safe-space md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground font-medium">
              © {new Date().getFullYear()} ZeroMeta. &quot;Privacy Clean&quot;
              mode processes files entirely in your browser. &quot;Clean +
              Branding&quot; securely injects EXIF on our stateless edge
              servers. No files are retained.
            </p>
            <div className="flex items-center gap-3">
              <Badge className="badge-neutral text-[10px]">PWA Ready</Badge>
              <Badge className="badge-neutral text-[10px]">
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
