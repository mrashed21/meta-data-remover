"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Crop as CropIcon, Maximize, Loader2, Save } from "lucide-react";
import type { ImageFile, ProcessingOptions, CropData, ResizeOptions } from "@/lib/types";

interface LivePreviewEditorProps {
  image: ImageFile | null;
  options: ProcessingOptions;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (imageId: string, crop: CropData | undefined, resize: ResizeOptions | undefined) => void;
}

export function LivePreviewEditor({
  image,
  options,
  open,
  onOpenChange,
  onSave,
}: LivePreviewEditorProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [resizeWidth, setResizeWidth] = useState<string>("");
  const [resizeHeight, setResizeHeight] = useState<string>("");
  const [maintainAspect, setMaintainAspect] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset state when a new image is loaded
  useEffect(() => {
    if (image) {
      if (image.cropData) {
        setCrop({
          unit: "px",
          x: image.cropData.x,
          y: image.cropData.y,
          width: image.cropData.width,
          height: image.cropData.height,
        });
        setCompletedCrop({
          unit: "px",
          x: image.cropData.x,
          y: image.cropData.y,
          width: image.cropData.width,
          height: image.cropData.height,
        });
      } else {
        setCrop(undefined);
        setCompletedCrop(undefined);
      }

      if (image.customResize) {
        setResizeWidth(image.customResize.width?.toString() || "");
        setResizeHeight(image.customResize.height?.toString() || "");
        setMaintainAspect(image.customResize.maintainAspectRatio);
      } else {
        setResizeWidth("");
        setResizeHeight("");
        setMaintainAspect(true);
      }
    }
  }, [image]);

  const handleWidthChange = (val: string) => {
    setResizeWidth(val);
    if (maintainAspect && imgRef.current && val !== "") {
      const ratio = imgRef.current.naturalHeight / imgRef.current.naturalWidth;
      setResizeHeight(Math.round(parseInt(val) * ratio).toString());
    }
  };

  const handleHeightChange = (val: string) => {
    setResizeHeight(val);
    if (maintainAspect && imgRef.current && val !== "") {
      const ratio = imgRef.current.naturalWidth / imgRef.current.naturalHeight;
      setResizeWidth(Math.round(parseInt(val) * ratio).toString());
    }
  };

  const handleSave = () => {
    if (!image) return;

    let finalCrop: CropData | undefined;
    if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0) {
      // Calculate scale in case the image was displayed smaller than its natural size
      const scaleX = imgRef.current ? imgRef.current.naturalWidth / imgRef.current.width : 1;
      const scaleY = imgRef.current ? imgRef.current.naturalHeight / imgRef.current.height : 1;
      
      finalCrop = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY,
      };
    }

    let finalResize: ResizeOptions | undefined;
    if (resizeWidth !== "" || resizeHeight !== "") {
      finalResize = {
        width: resizeWidth !== "" ? parseInt(resizeWidth) : undefined,
        height: resizeHeight !== "" ? parseInt(resizeHeight) : undefined,
        maintainAspectRatio: maintainAspect,
      };
    }

    onSave(image.id, finalCrop, finalResize);
    onOpenChange(false);
  };

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="w-5 h-5 text-violet-400" />
            Live Preview & Edit
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          {/* Main Preview Area */}
          <div className="md:col-span-2 space-y-4">
            <div className="relative bg-zinc-950 border rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                className="max-h-[600px] w-full flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={image.preview}
                  alt="Edit preview"
                  className="max-h-[600px] object-contain"
                />
              </ReactCrop>
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-6">
            {/* Resize Controls */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-zinc-300">
                <Maximize className="w-4 h-4" />
                Custom Resize
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Width (px)</Label>
                  <Input
                    type="number"
                    placeholder="Auto"
                    value={resizeWidth}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="bg-zinc-900/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Height (px)</Label>
                  <Input
                    type="number"
                    placeholder="Auto"
                    value={resizeHeight}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="bg-zinc-900/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label className="text-xs text-zinc-400">Constrain Proportions</Label>
                <Switch
                  checked={maintainAspect}
                  onCheckedChange={setMaintainAspect}
                />
              </div>
            </div>

            <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs text-violet-300">
              <p className="mb-2"><strong>Tip:</strong> Draw a box on the image to crop. Leave width/height blank to keep original size.</p>
              <p>Your edits will be applied on top of the active {options.mode === "fast" ? "Fast Mode" : "AI Bypass"} processing pipeline.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
