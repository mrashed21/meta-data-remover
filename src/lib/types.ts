export type ProcessingMode = "fast" | "advanced";

export type OutputFormat = "jpeg" | "png" | "webp";

export interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
}

export interface ProcessingOptions {
  mode: ProcessingMode;
  format: OutputFormat;
  quality: number;       // 80-100
  microCrop: number;     // 0-5 px
  colorShift: number;    // -1 to +1 percent
  noiseInjection: number; // 0 to 1 percent
  globalResize: ResizeOptions;
}

export type FileStatus = "queued" | "processing" | "done" | "error";

export interface MetadataField {
  key: string;
  value: string;
  category: "camera" | "location" | "ai" | "software" | "other";
  stripped: boolean;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: FileStatus;
  progress: number;
  processedBlob: Blob | null;
  processedPreview: string | null;
  metadataBefore: MetadataField[];
  metadataAfter: MetadataField[];
  error?: string;
  cropData?: CropData;
  customResize?: ResizeOptions;
  customName?: string;
}
