import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import type { MediaFile, MetadataField, ProcessingOptions } from "./types";

let ffmpegInstance: FFmpeg | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  const ffmpeg = new FFmpeg();

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

  ffmpeg.on("log", ({ message }) => {});

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  ffmpegInstance = ffmpeg;
  return ffmpegInstance;
}

async function toBlobURL(url: string, mimeType: string): Promise<string> {
  const resp = await fetch(url);
  const blob = await resp.blob();
  return URL.createObjectURL(new Blob([blob], { type: mimeType }));
}

export async function processMediaFFmpeg(
  mediaFile: MediaFile,
  options: ProcessingOptions,
  onProgress?: (progress: number) => void,
): Promise<{ blob: Blob; metadataAfter: MetadataField[] }> {
  const ffmpeg = await getFFmpeg();

  const progressHandler = ({
    progress,
    time,
  }: {
    progress: number;
    time: number;
  }) => {
    // progress is 0 to 1
    if (onProgress) {
      onProgress(Math.round(progress * 100));
    }
  };
  ffmpeg.on("progress", progressHandler);

  try {
    const file = mediaFile.file;
    const isAudio = mediaFile.mediaType === "audio";
    const ext =
      file.name.split(".").pop()?.toLowerCase() || (isAudio ? "mp3" : "mp4");
    const inputName = `input.${ext}`;
    const outputName = `output.${ext}`;

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    const args = ["-i", inputName, "-map_metadata", "-1"];

    if (isAudio) {
      args.push("-vn", "-c:a", "copy");
    } else {
      args.push("-c:v", "copy", "-c:a", "copy");
    }

    args.push("-fflags", "+bitexact", outputName);

    await ffmpeg.exec(args);

    const data = await ffmpeg.readFile(outputName);

    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    const uint8Array = data as Uint8Array;
    const blob = new Blob([uint8Array as any], { type: file.type });

    const metadataAfter: MetadataField[] = [
      {
        key: "File Name",
        value: file.name,
        category: "other",
        stripped: false,
      },
      {
        key: "File Size",
        value: `${(blob.size / (1024 * 1024)).toFixed(2)} MB`,
        category: "other",
        stripped: false,
      },
      {
        key: "MIME Type",
        value: file.type,
        category: "other",
        stripped: false,
      },
    ];

    if (!isAudio) {
      metadataAfter.push({
        key: "Video Stream",
        value: "Preserved (Stream Copy)",
        category: "other",
        stripped: false,
      });
    }

    metadataAfter.push(
      {
        key: "Audio Stream",
        value: "Preserved (Stream Copy)",
        category: "other",
        stripped: false,
      },
      {
        key: isAudio ? "ID3 Tags / Metadata" : "Global Metadata",
        value: "Stripped ✓",
        category: "camera",
        stripped: true,
      },
      {
        key: "Cover Art / Posters",
        value: "Stripped ✓",
        category: "other",
        stripped: true,
      },
      {
        key: "Title / Comments",
        value: "Stripped ✓",
        category: "other",
        stripped: true,
      },
    );

    return { blob, metadataAfter };
  } finally {
    ffmpeg.off("progress", progressHandler);
  }
}
