/**
 * metadata-config.ts
 *
 * Central configuration for metadata processing.
 *
 * Contains:
 *  - Default processing options for image / video / audio
 *  - Default branding configuration (mrashed21 / Muhammad Rashed)
 *  - EXIF field category mappings
 *  - Known metadata tags to strip per media type
 *
 * Sprint 10 will use DEFAULT_BRANDING_CONFIG for Mode B injection.
 * Sprint 12 settings UI will use DEFAULT_*_OPTIONS as initial state.
 */

import type {
  BrandingConfig,
  ImageProcessingOptions,
  VideoProcessingOptions,
  AudioProcessingOptions,
  PrivacyMode,
} from "./types";

// =============================================================================
// Privacy mode defaults
// =============================================================================

/** The default privacy mode on first load */
export const DEFAULT_PRIVACY_MODE: PrivacyMode = "privacy-clean";

// =============================================================================
// Branding configuration — Mode B (Sprint 10)
// =============================================================================

/**
 * Default branding metadata injected when Mode B ("clean-branding") is active.
 * These fields are added to the output file's metadata after stripping.
 *
 * Source: Muhammad Rashed / mrashed21 developer identity.
 * Per plan.md Sprint 10 requirements.
 */
export const DEFAULT_BRANDING_CONFIG: BrandingConfig = {
  creator:  "Muhammad Rashed",
  author:   "Muhammad Rashed",
  software: "ZeroMeta",
  keywords: ["mrashed21", "muhammad rashed"],
};

// =============================================================================
// Default processing options per media type
// =============================================================================

/**
 * Default image processing options.
 * All privacy-protective flags are ON by default.
 * Lossy operations (colorShift, noiseInjection) are OFF by default.
 * Dimensions are preserved — NEVER silently downscaled.
 */
export const DEFAULT_IMAGE_OPTIONS: ImageProcessingOptions = {
  removeExif:           true,
  removeGps:            true,
  removeIptc:           true,
  removeXmp:            true,
  preserveOrientation:  true,   // rotate correctly, strip Orientation tag
  preserveDimensions:   true,   // CRITICAL: never downscale
  outputFormat:         "jpeg",
  outputQuality:        95,     // high quality; no silent lossy compression
  microCrop:            0,      // disabled by default
  colorShift:           0,      // disabled by default
  noiseInjection:       0,      // disabled by default
};

/**
 * Default video processing options.
 * Remux (stream-copy) is always preferred over re-encode.
 * Per plan.md Sprint 08: "remux / stream-copy first".
 */
export const DEFAULT_VIDEO_OPTIONS: VideoProcessingOptions = {
  removeMetadata:    true,
  preserveResolution: true,
  preserveAudio:     true,
  forceReencode:     false,  // remux first; only re-encode when necessary
};

/**
 * Default audio processing options.
 * All ID3/metadata fields are stripped by default.
 * Audio quality (codec, bitrate, sample rate) is preserved.
 */
export const DEFAULT_AUDIO_OPTIONS: AudioProcessingOptions = {
  removeId3Tags:        true,
  removeArtist:         true,
  removeAlbum:          true,
  removeTitle:          true,
  removeComment:        true,
  removeEncoder:        true,
  preserveAudioQuality: true,
};

// =============================================================================
// EXIF field category mappings
// =============================================================================

/** EXIF / IPTC / XMP tags that reveal GPS / location data */
export const GPS_TAGS = new Set([
  "GPSLatitude",
  "GPSLongitude",
  "GPSAltitude",
  "GPSLatitudeRef",
  "GPSLongitudeRef",
  "GPSAltitudeRef",
  "GPSTimeStamp",
  "GPSDateStamp",
  "GPSImgDirection",
  "GPSImgDirectionRef",
  "GPSSpeed",
  "GPSSpeedRef",
  "GPSTrack",
  "GPSTrackRef",
  "GPSMapDatum",
  "GPSDestLatitude",
  "GPSDestLongitude",
  "GPSDestBearing",
  "GPS",
]);

/** EXIF tags that reveal camera / device information */
export const CAMERA_TAGS = new Set([
  "Make",
  "Model",
  "Software",
  "LensMake",
  "LensModel",
  "LensInfo",
  "FocalLength",
  "FocalLengthIn35mmFormat",
  "Aperture",
  "FNumber",
  "ShutterSpeedValue",
  "ExposureTime",
  "ISOSpeedRatings",
  "ISO",
  "ExposureMode",
  "ExposureProgram",
  "WhiteBalance",
  "Flash",
  "MeteringMode",
  "Saturation",
  "Sharpness",
  "Contrast",
  "SceneCaptureType",
  "BodySerialNumber",
  "LensSerialNumber",
  "CameraOwnerName",
]);

/** Tags indicating AI-generated or AI-processed content */
export const AI_TAGS = new Set([
  "C2PA",
  "c2pa",
  "SynthID",
  "synthid",
  "StableDiffusion",
  "AUTOMATIC1111",
  "MidJourney",
  "midjourney",
  "DALL-E",
  "StabilityAI",
  "Generator",
  "AIGenerator",
  "GenerativeModel",
]);

/** Software / editor tags */
export const SOFTWARE_TAGS = new Set([
  "Software",
  "ProcessingSoftware",
  "CreatorTool",
  "HistorySoftwareAgent",
  "WriterName",
  "Photoshop",
  "XMPToolkit",
  "AdobePhotoshop",
]);

/** IPTC fields to strip */
export const IPTC_TAGS = new Set([
  "By-line",
  "By-lineTitle",
  "Caption-Abstract",
  "City",
  "Contact",
  "ContentLocationCode",
  "ContentLocationName",
  "Country-PrimaryLocationCode",
  "Country-PrimaryLocationName",
  "Credit",
  "DateCreated",
  "Headline",
  "Keywords",
  "ObjectName",
  "OriginalTransmissionReference",
  "Province-State",
  "Source",
  "SpecialInstructions",
  "Sub-location",
  "SupplementalCategories",
  "TimeCreated",
  "Writer-Editor",
]);

/** Audio ID3 tags to strip */
export const ID3_TAGS_TO_STRIP = [
  "title",
  "artist",
  "album",
  "albumartist",
  "comment",
  "composer",
  "genre",
  "date",
  "year",
  "track",
  "disc",
  "encoder",
  "encoded_by",
  "copyright",
  "description",
  "grouping",
  "lyrics",
  "TXXX",  // custom text frames
  "COMM",  // comments
  "USLT",  // unsynchronized lyrics
  "APIC",  // attached picture (cover art removes identity data)
] as const;

/** Video metadata keys to strip (FFmpeg tag names) */
export const VIDEO_METADATA_KEYS_TO_STRIP = [
  "title",
  "author",
  "artist",
  "album",
  "comment",
  "description",
  "encoder",
  "handler_name",
  "vendor_id",
  "creation_time",
  "location",
  "com.apple.quicktime.location.ISO6709",
  "com.apple.quicktime.make",
  "com.apple.quicktime.model",
  "com.apple.quicktime.software",
  "com.apple.quicktime.creationdate",
] as const;

// =============================================================================
// Metadata field category helper
// =============================================================================

export type MetadataCategory = "camera" | "location" | "ai" | "software" | "other";

/**
 * Determine the display category for a metadata field key.
 * Used by the metadata inspector to colour-code fields.
 */
export function categorizeMetadataField(key: string): MetadataCategory {
  if (GPS_TAGS.has(key) || key.toLowerCase().includes("gps") || key.toLowerCase().includes("location")) {
    return "location";
  }
  if (AI_TAGS.has(key) || key.toLowerCase().includes("ai") || key.toLowerCase().includes("synthid") || key.toLowerCase().includes("c2pa")) {
    return "ai";
  }
  if (SOFTWARE_TAGS.has(key) || key.toLowerCase().includes("software") || key.toLowerCase().includes("tool")) {
    return "software";
  }
  if (CAMERA_TAGS.has(key)) {
    return "camera";
  }
  return "other";
}
