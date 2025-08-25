"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function WorkforceWeeklyReport() {
  const [workforceId, setWorkforceId] = useState();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fileLink, setFileLink] = useState("");
  const [fileType, setFileType] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientId, setClientId] = useState("");

  const getWorkforceInfo = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/workforce/client-info`, {
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.workforce) {
          setWorkforceId(data.workforce.id);
          setClientId(data.workforce.client_id);
          setClientName(data.workforce.client_name);
        }
      }
    } catch (error) {
      console.error("Error fetching workforce info:", error);
    }
  };

  useEffect(() => {
    getWorkforceInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    if (!clientId) {
      setMessage("No client assigned. Please contact your manager.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Step 1: Upload file to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PDFPRESET);
      formData.append("public_id", `workforce_reports/${Date.now()}.pdf`);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME}/raw/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadData = await uploadRes.json();

      if (uploadData.secure_url) {
        const fileUrl = uploadData.secure_url;
        setFileLink(fileUrl);
        setFileType(file.type);

        // Step 2: Send URL to API for DB insert
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/workforce/send-weekly-report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdfUrl: fileUrl,
          }),
          credentials: "include",
        });

        const data = await res.json();
        if (data.success) {
          setMessage("✅ Weekly report uploaded successfully!");
          setFile(null);
          // Reset file input
          const fileInput = document.getElementById("file-upload");
          if (fileInput) fileInput.value = "";
        } else {
          setMessage(`❌ ${data.error || "Upload failed."}`);
        }
      } else {
        setMessage("❌ File upload failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <h2 className="text-2xl font-bold mb-6 text-center">Upload Weekly Report</h2>

      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-lg"
      >
        {/* Client Info */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Client</label>
          <div className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white">
            {clientName || "Loading..."}
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Upload File</label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-2 bg-gray-700 text-white rounded file:mr-4 file:py-2 file:px-4 
                     file:rounded-lg file:border-0 file:text-sm file:font-semibold
                     file:bg-green-500 file:text-white hover:file:bg-green-600"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-semibold disabled:bg-gray-500"
        >
          {loading ? "Uploading..." : "Submit Weekly Report"}
        </button>
      </form>

      {/* Preview & Download */}
      {fileLink && (
        <div className="max-w-3xl mx-auto mt-6 bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Uploaded File</h3>

          {/* If PDF, show preview */}
          {fileType === "application/pdf" ? (
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(fileLink)}&embedded=true`}
              style={{ width: '100%', height: '600px' }}
              frameBorder="0"
            />
          ) : (
            <p className="text-gray-300 mb-2">Preview not available for this file type.</p>
          )}

          <a
            href={fileLink}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white px-4 py-2 rounded mt-3 inline-block"
          >
            Download File
          </a>
        </div>
      )}

      {message && <p className="text-center mt-4">{message}</p>}
    </div>
  );
}