import type {
  FileStatus,
  MediaFile,
  MediaType,
  MetadataField,
  ProcessingError,
  ProcessingErrorCode,
  SupportedMimeType,
} from "./types";
import { generateId } from "./utils";

/** Maximum allowed file size per media type (bytes) */
export const MAX_FILE_SIZE: Record<MediaType, number> = {
  image: 50 * 1024 * 1024, // 50 MB
  video: 500 * 1024 * 1024, // 500 MB
  audio: 100 * 1024 * 1024, // 100 MB
};

export const SUPPORTED_IMAGE_TYPES: SupportedMimeType[] = [
  {
    mime: "image/jpeg",
    mediaType: "image",
    extensions: [".jpg", ".jpeg"],
    label: "JPEG",
  },
  { mime: "image/png", mediaType: "image", extensions: [".png"], label: "PNG" },
  {
    mime: "image/webp",
    mediaType: "image",
    extensions: [".webp"],
    label: "WebP",
  },
  { mime: "image/gif", mediaType: "image", extensions: [".gif"], label: "GIF" },
];

export const SUPPORTED_VIDEO_TYPES: SupportedMimeType[] = [
  { mime: "video/mp4", mediaType: "video", extensions: [".mp4"], label: "MP4" },
  {
    mime: "video/quicktime",
    mediaType: "video",
    extensions: [".mov"],
    label: "MOV",
  },
  {
    mime: "video/webm",
    mediaType: "video",
    extensions: [".webm"],
    label: "WebM",
  },
  {
    mime: "video/x-matroska",
    mediaType: "video",
    extensions: [".mkv"],
    label: "MKV",
  },
];

export const SUPPORTED_AUDIO_TYPES: SupportedMimeType[] = [
  {
    mime: "audio/mpeg",
    mediaType: "audio",
    extensions: [".mp3"],
    label: "MP3",
  },
  { mime: "audio/wav", mediaType: "audio", extensions: [".wav"], label: "WAV" },
  { mime: "audio/mp4", mediaType: "audio", extensions: [".m4a"], label: "M4A" },
  { mime: "audio/aac", mediaType: "audio", extensions: [".aac"], label: "AAC" },
  {
    mime: "audio/flac",
    mediaType: "audio",
    extensions: [".flac"],
    label: "FLAC",
  },
  { mime: "audio/ogg", mediaType: "audio", extensions: [".ogg"], label: "OGG" },
];

/** Flat registry of all supported media types */
export const ALL_SUPPORTED_TYPES: SupportedMimeType[] = [
  ...SUPPORTED_IMAGE_TYPES,
  ...SUPPORTED_VIDEO_TYPES,
  ...SUPPORTED_AUDIO_TYPES,
];

/** Fast lookup map: mime → SupportedMimeType */
const MIME_MAP = new Map<string, SupportedMimeType>(
  ALL_SUPPORTED_TYPES.map((t) => [t.mime, t]),
);

export function getMediaType(file: File): MediaType | null {
  const entry = MIME_MAP.get(file.type);
  return entry?.mediaType ?? null;
}

/** Returns true if the MIME string is in the supported registry. */
export function isSupportedMimeType(mime: string): boolean {
  return MIME_MAP.has(mime);
}

/** Returns the registry entry for a MIME string, or undefined. */
export function getSupportedType(mime: string): SupportedMimeType | undefined {
  return MIME_MAP.get(mime);
}

/** Returns true if the file's size is within the limit for its media type. */
export function isWithinSizeLimit(file: File, mediaType: MediaType): boolean {
  return file.size <= MAX_FILE_SIZE[mediaType];
}

/** Returns true if the file has content (non-zero size). */
export function isNonEmptyFile(file: File): boolean {
  return file.size > 0;
}

export function createMediaFile(
  file: File,
  mediaType: MediaType,
  metadataBefore: MetadataField[] = [],
): MediaFile {
  return {
    id: generateId(),
    file,
    mediaType,
    preview: null, // caller sets this after URL.createObjectURL
    status: "queued" as FileStatus,
    progress: 0,
    result: null,
    metadataBefore,
  };
}

export function createProcessingError(
  code: ProcessingErrorCode,
  message: string,
  technical?: string,
): ProcessingError {
  return { code, message, technical };
}

/** Format a file size in bytes to a human-readable string (KB / MB / GB). */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/** Return the file extension (lower-cased, with dot) for a filename. */
export function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}

/** Return the base filename without extension. */
export function getBasename(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(0, dot) : filename;
}
