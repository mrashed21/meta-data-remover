import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/tiff"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    // Parse processing options
    const format = (formData.get("format") as string) || "jpeg";
    const quality = parseInt(formData.get("quality") as string) || 95;
    const microCrop = parseInt(formData.get("microCrop") as string) || 0;
    const colorShift = parseFloat(formData.get("colorShift") as string) || 0;
    const noiseInjection = parseFloat(formData.get("noiseInjection") as string) || 0;
    const privacyMode = (formData.get("privacyMode") as string) || "privacy-clean";

    const cropX = formData.has("cropX") ? parseFloat(formData.get("cropX") as string) : null;
    const cropY = formData.has("cropY") ? parseFloat(formData.get("cropY") as string) : null;
    const cropW = formData.has("cropW") ? parseFloat(formData.get("cropW") as string) : null;
    const cropH = formData.has("cropH") ? parseFloat(formData.get("cropH") as string) : null;

    const resizeW = formData.has("resizeW") ? parseInt(formData.get("resizeW") as string) : null;
    const resizeH = formData.has("resizeH") ? parseInt(formData.get("resizeH") as string) : null;
    const resizeMaintainAspect = formData.get("resizeMaintainAspect") === "true";

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Get original image metadata for response headers
    const originalMeta = await sharp(inputBuffer).metadata();

    // Start sharp pipeline — strip all metadata by NOT calling withMetadata()
    // Calling rotate() without arguments auto-rotates the image based on EXIF orientation 
    // so the visual orientation is preserved while the EXIF tag is stripped.
    let pipeline = sharp(inputBuffer, { failOn: "none" }).rotate();

    // 1. Apply user crop OR micro-crop
    let currentWidth = originalMeta.width || 0;
    let currentHeight = originalMeta.height || 0;

    // Adjust dimensions if EXIF orientation swaps width and height
    if (originalMeta.orientation && originalMeta.orientation >= 5) {
      currentWidth = originalMeta.height || 0;
      currentHeight = originalMeta.width || 0;
    }

    if (cropW !== null && cropH !== null && cropX !== null && cropY !== null) {
      pipeline = pipeline.extract({
        left: Math.round(cropX),
        top: Math.round(cropY),
        width: Math.round(cropW),
        height: Math.round(cropH),
      });
      currentWidth = Math.round(cropW);
      currentHeight = Math.round(cropH);
    } else if (microCrop > 0 && currentWidth && currentHeight) {
      const cropPx = Math.min(microCrop, Math.floor(Math.min(currentWidth, currentHeight) / 4));
      const newWidth = currentWidth - cropPx * 2;
      const newHeight = currentHeight - cropPx * 2;

      if (newWidth > 0 && newHeight > 0) {
        pipeline = pipeline.extract({
          left: cropPx,
          top: cropPx,
          width: newWidth,
          height: newHeight,
        });
        currentWidth = newWidth;
        currentHeight = newHeight;
      }
    }

    // 1.5 Apply user resize
    if (resizeW || resizeH) {
      pipeline = pipeline.resize({
        width: resizeW || undefined,
        height: resizeH || undefined,
        fit: resizeMaintainAspect && resizeW && resizeH ? "inside" : (resizeW && resizeH ? "fill" : "inside"),
        withoutEnlargement: true, // Crucial: Never accidentally upscale
      });
      if (resizeW) currentWidth = resizeW;
      if (resizeH) currentHeight = resizeH;
    }

    // 2. Apply brightness/contrast modulation (color shift)
    if (colorShift !== 0) {
      const brightnessFactor = 1 + colorShift / 100;
      pipeline = pipeline.modulate({
        brightness: brightnessFactor,
      });
      // Subtle contrast adjustment via linear
      const contrastFactor = 1 + (colorShift * 0.5) / 100;
      pipeline = pipeline.linear(contrastFactor, -(128 * (contrastFactor - 1)));
    }

    // 3. Apply micro-grain noise injection
    if (noiseInjection > 0 && currentWidth > 0 && currentHeight > 0) {
      const width = currentWidth;
      const height = currentHeight;

      if (width > 0 && height > 0) {
        // Generate noise buffer
        const channels = 3;
        const noiseBuffer = Buffer.alloc(width * height * channels);
        const intensity = noiseInjection * 2.55; // Scale to 0-2.55

        for (let i = 0; i < noiseBuffer.length; i++) {
          // Generate subtle noise centered at 128 (neutral gray)
          noiseBuffer[i] = Math.round(128 + (Math.random() - 0.5) * intensity);
        }

        const noiseImage = await sharp(noiseBuffer, {
          raw: { width, height, channels },
        })
          .png()
          .toBuffer();

        pipeline = pipeline.composite([
          {
            input: noiseImage,
            blend: "soft-light" as const,
            gravity: "northwest",
          },
        ]);
      }
    }

    // 4. Privacy / Branding Injection
    if (privacyMode === "clean-branding") {
      pipeline = pipeline.withMetadata({
        exif: {
          IFD0: {
            Artist: "Muhammad Rashed",
            Software: "mrashed21 Media Processor",
            ImageDescription: "mrashed21, muhammad rashed",
            Copyright: "Muhammad Rashed",
          }
        }
      });
    }

    // 5. Convert to target format and STRICTLY STRIP METADATA (or keep injected)
    let outputBuffer: Buffer;
    const formatMap = {
      jpeg: () => pipeline.jpeg({ quality, mozjpeg: true }), // NO withMetadata()
      jpg: () => pipeline.jpeg({ quality, mozjpeg: true }),
      png: () => pipeline.png({ quality: Math.round(quality), compressionLevel: 9 }),
      webp: () => pipeline.webp({ quality }),
      gif: () => pipeline.gif(),
    };

    const formatter = formatMap[format as keyof typeof formatMap];
    if (!formatter) {
      return NextResponse.json(
        { error: `Unsupported output format: ${format}` },
        { status: 400 }
      );
    }

    outputBuffer = await formatter().toBuffer();

    // Build response
    const mimeMap: Record<string, string> = {
      jpeg: "image/jpeg",
      jpg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };

    const extMap: Record<string, string> = {
      jpeg: "jpg",
      jpg: "jpg",
      png: "png",
      webp: "webp",
      gif: "gif",
    };

    const outputFilename = file.name.replace(
      /\.[^.]+$/,
      `_cleaned.${extMap[format] || "jpg"}`
    );

    return new NextResponse(outputBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": mimeMap[format] || "image/jpeg",
        "Content-Disposition": `attachment; filename="${outputFilename}"`,
        "X-Original-Size": String(file.size),
        "X-Processed-Size": String(outputBuffer.length),
        "X-Original-Width": String(originalMeta.width || 0),
        "X-Original-Height": String(originalMeta.height || 0),
      },
    });
  } catch (error) {
    console.error("Image processing error:", error);
    return NextResponse.json(
      {
        error: "Failed to process image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
