import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

function getRadianAngle(deg) { return (deg * Math.PI) / 180; }

// returns a Blob from original image + crop + rotation
async function getCroppedImg(imageSrc, crop, rotation = 0) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // compute bounding box of rotated image
  const safeArea = Math.max(image.width, image.height) * 2;
  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);
  ctx.drawImage(image, (safeArea - image.width) / 2, (safeArea - image.height) / 2);

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // set canvas to crop size
  canvas.width = crop.width;
  canvas.height = crop.height;

  // draw the cropped area from the rotated image
  ctx.putImageData(
    data,
    Math.round(- (safeArea / 2) + image.width / 2 - crop.x),
    Math.round(- (safeArea / 2) + image.height / 2 - crop.y)
  );

  return await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
  });
}

export function ImageCropper({ src, onCancel, onDone }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDone = async () => {
    const blob = await getCroppedImg(src, croppedAreaPixels, rotation);
    onDone(blob);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-2xl p-4">
        <div className="relative h-[60vh] bg-black rounded-lg overflow-hidden">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={4/3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            restrictPosition={false}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="flex items-center gap-3">
            <span className="w-20 text-sm text-gray-300">Zoom</span>
            <input type="range" min={1} max={3} step={0.05}
              value={zoom} onChange={(e)=>setZoom(Number(e.target.value))} className="w-full" />
          </label>
          <label className="flex items-center gap-3">
            <span className="w-20 text-sm text-gray-300">Rotate</span>
            <input type="range" min={-180} max={180} step={1}
              value={rotation} onChange={(e)=>setRotation(Number(e.target.value))} className="w-full" />
          </label>
          <div className="flex justify-end gap-2 md:justify-end">
            <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600">Cancel</button>
            <button onClick={handleDone} className="px-4 py-2 rounded bg-green-600 hover:bg-green-500">Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
}
