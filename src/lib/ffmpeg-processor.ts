import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import type { MediaFile, MetadataField, ProcessingOptions } from "./types";

// Keep a singleton instance of FFmpeg to avoid reloading the heavy WASM core
let ffmpegInstance: FFmpeg | null = null;

/**
 * Initializes and returns the FFmpeg instance.
 * Automatically loads the WASM core and worker from the CDN.
 */
async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  const ffmpeg = new FFmpeg();
  
  // Note: We use the default unpkg CDN to load the core to avoid hosting it locally for now.
  // In a strict production environment without external network access, 
  // you would serve these files directly from your public directory.
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
  
  ffmpeg.on("log", ({ message }) => {
    // console.log("[FFmpeg]", message);
  });

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  ffmpegInstance = ffmpeg;
  return ffmpegInstance;
}

/**
 * Helper to bypass CORS issues by loading the CDN files into local Blobs
 */
async function toBlobURL(url: string, mimeType: string): Promise<string> {
  const resp = await fetch(url);
  const blob = await resp.blob();
  return URL.createObjectURL(new Blob([blob], { type: mimeType }));
}

/**
 * Processes a video or audio file entirely in the browser using FFmpeg.wasm.
 * Strips all metadata by doing a direct stream copy (remuxing) to avoid re-encoding.
 */
export async function processMediaFFmpeg(
  mediaFile: MediaFile,
  options: ProcessingOptions,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob; metadataAfter: MetadataField[] }> {
  const ffmpeg = await getFFmpeg();
  
  // Set up progress tracking
  const progressHandler = ({ progress, time }: { progress: number; time: number }) => {
    // progress is 0 to 1
    if (onProgress) {
      onProgress(Math.round(progress * 100));
    }
  };
  ffmpeg.on("progress", progressHandler);

  try {
    const file = mediaFile.file;
    const isAudio = mediaFile.mediaType === "audio";
    const ext = file.name.split('.').pop()?.toLowerCase() || (isAudio ? 'mp3' : 'mp4');
    const inputName = `input.${ext}`;
    const outputName = `output.${ext}`;

    // 1. Write the user's file to FFmpeg's virtual file system
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // 2. Build FFmpeg command arguments
    // -map_metadata -1 : Strips all global metadata (ID3, MP4 atoms, etc)
    // -fflags +bitexact : Helps ensure no extraneous data is written
    const args = [
      "-i", inputName,
      "-map_metadata", "-1",
    ];

    if (isAudio) {
      // Audio only: copy audio stream, drop video (cover art)
      args.push("-vn", "-c:a", "copy");
    } else {
      // Video: copy both streams
      args.push("-c:v", "copy", "-c:a", "copy");
    }

    args.push("-fflags", "+bitexact", outputName);

    // Run the FFmpeg command
    await ffmpeg.exec(args);

    // 3. Read the result back from the virtual file system
    const data = await ffmpeg.readFile(outputName);
    
    // Clean up virtual filesystem to free memory
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    // 4. Create output Blob
    // TypeScript's DOM lib is overly strict about SharedArrayBuffer not being a BlobPart.
    // At runtime, browsers handle Uint8Array perfectly fine.
    const uint8Array = data as Uint8Array;
    const blob = new Blob([uint8Array as any], { type: file.type });

    // 5. Build Metadata Report
    const metadataAfter: MetadataField[] = [
      { key: "File Name", value: file.name, category: "other", stripped: false },
      { key: "File Size", value: `${(blob.size / (1024 * 1024)).toFixed(2)} MB`, category: "other", stripped: false },
      { key: "MIME Type", value: file.type, category: "other", stripped: false },
    ];

    if (!isAudio) {
      metadataAfter.push({ key: "Video Stream", value: "Preserved (Stream Copy)", category: "other", stripped: false });
    }
    
    metadataAfter.push(
      { key: "Audio Stream", value: "Preserved (Stream Copy)", category: "other", stripped: false },
      { key: isAudio ? "ID3 Tags / Metadata" : "Global Metadata", value: "Stripped ✓", category: "camera", stripped: true },
      { key: "Cover Art / Posters", value: "Stripped ✓", category: "other", stripped: true },
      { key: "Title / Comments", value: "Stripped ✓", category: "other", stripped: true }
    );

    return { blob, metadataAfter };
  } finally {
    // Make sure we unbind the progress listener so we don't leak listeners
    ffmpeg.off("progress", progressHandler);
  }
}
