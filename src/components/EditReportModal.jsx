"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { ImageCropper } from "./ImageCropper";

export default function EditReportModal({ report, onClose, onUpdated }) {
  const [shortText, setShortText] = useState(report.short_text);
  const [elaboratedText, setElaboratedText] = useState(report.elaboratedText || "");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(report.image_url);
    const [imageFile, setImageFile] = useState(null);

  //cropper
  // ...inside WorkforceReportForm component
const [showCropper, setShowCropper] = useState(false);
const [tempPreview, setTempPreview] = useState(null);
const [previewUrl, setPreviewUrl] = useState(image);

// const handleImageChange = (e) => {
//   const file = e.target.files?.[0];
//   if (!file) return;
//   const url = URL.createObjectURL(file);
//   setTempPreview(url);
//   setShowCropper(true);
// };

// when cropper returns blob
const handleCropDone = async (blob) => {
  try {
    const croppedFile = new File([blob], `report-${Date.now()}.jpg`, { type: "image/jpeg" });
    setPreviewUrl(URL.createObjectURL(croppedFile));
    setShowCropper(false);
    URL.revokeObjectURL(tempPreview);
    setTempPreview(null);

    // ✅ Upload cropped image to Cloudinary
    const formData = new FormData();
    formData.append("file", croppedFile);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    if (data.secure_url) {
      setImage(data.secure_url); // ✅ Use cropped image URL
      toast.success("Cropped image uploaded!");
    } else {
      toast.error("Failed to upload cropped image");
    }
  } catch (error) {
    console.error(error);
    toast.error("Error uploading image");
  }
};


const handleCropCancel = () => {
  setShowCropper(false);
  URL.revokeObjectURL(tempPreview);
  setTempPreview(null);
};


  const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  setTempPreview(url);
  setShowCropper(true);

  };

  const handleGenerateElaborated = async () => {
    if (!shortText.trim()) {
      toast.error("Please enter short text first!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/elaborate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortText: shortText }),
      });

      const data = await res.json();
      if (res.ok) {
        setElaboratedText(data.elaboratedText);
        toast.success("Elaborated text generated!");
      } else {
        toast.error(data.error || "Failed to generate text");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while generating text");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/workforce/reports/${report.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        short_text: shortText,
        elaborated_text: elaboratedText,
        image_url: image,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Report updated and resubmitted!");
      onClose();
      onUpdated();
    } else {
      toast.error(data.error || "Failed to update report");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded w-full max-w-lg text-white">
        <h2 className="text-xl font-bold mb-4">Edit Report</h2>

        {/* Short Text */}
        <input
          type="text"
          value={shortText}
          onChange={(e) => setShortText(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-gray-700"
          placeholder="Short Text"
        />

        {/* Generate Button */}
        <button
          className="bg-green-600 px-4 py-2 mb-3 rounded w-full"
          onClick={handleGenerateElaborated}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Elaborated Text"}
        </button>

        {/* Elaborated Text */}
        <textarea
          value={elaboratedText}
          onChange={(e) => setElaboratedText(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-gray-700"
          rows={4}
          placeholder="Elaborated Text"
        />

        {/* Image Preview */}
        {previewUrl && <img src={previewUrl} alt="Preview" className="w-32 mb-3 rounded" />}

        {/* Image Upload */}
        <input
          type="file"
          accept="image/*"
          capture="camera"
          onChange={handleImageChange}
          className="mb-3"
        />

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <button className="bg-gray-600 px-4 py-2 rounded" onClick={onClose}>Cancel</button>
          <button className="bg-blue-600 px-4 py-2 rounded" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
      {showCropper && tempPreview && (
  <ImageCropper
    src={tempPreview}
    onCancel={handleCropCancel}
    onDone={handleCropDone}
  />
)}

    </div>
  );
}
