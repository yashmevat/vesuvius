"use client";

import { useState, useEffect } from "react";
import ManagerNavbar from "@/components/ManagerNavbar";

export default function UploadWeeklyReport() {
  const [managerId, setManagerId] = useState();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fileLink, setFileLink] = useState("");
  const [fileType, setFileType] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [clients, setClients] = useState([]);

  const getManagerId = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/getuserid`);
    const data = await res.json();
    setManagerId(data.id);
  };

  const getClients = async () => {
      const resClients = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/manager/getclients`,{
        method:"POST",
        body:JSON.stringify({id:managerId})
      });
      const clientsData = await resClients.json();
      setClients(clientsData.clients);
  };
  useEffect(()=>{
   if(managerId){

     getClients();
   }
  },[managerId])

  useEffect(() => {
    getManagerId();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // ✅ Step 1: Upload file to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PDFPRESET);
      formData.append("public_id", `reports/${Date.now()}.pdf`);


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

        // ✅ Step 2: Send URL to API for DB insert
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/manager/send-weekly-report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            managerId,
            selectedClient,
            pdfUrl: fileUrl,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setMessage("✅ Weekly report uploaded successfully!");
          setSelectedClient("");
          setFile(null);
        } else {
          setMessage(`❌ ${data.message || "Upload failed."}`);
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
      <ManagerNavbar />
      <h2 className="text-2xl font-bold mb-6 text-center">Upload Weekly Report</h2>

      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-lg"
      >
        {/* Client Dropdown */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Select Client</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
            required
          >
            <option value="">-- Select Client --</option>
            {clients && clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Upload File</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-2 bg-gray-700 text-white rounded"
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
