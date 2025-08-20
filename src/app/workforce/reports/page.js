'use client';
import { ImageCropper } from "@/components/ImageCropper";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function WorkforceReportForm() {
    const [shortText, setShortText] = useState("");
    const [elaboratedText, setElaboratedText] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [elaborateLoading, setElaborateLoading] = useState(false);

    const [managers, setManagers] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedManager, setSelectedManager] = useState("");
    const [selectedClient, setSelectedClient] = useState("");
    const [managerClients, setManagerClients] = useState([])
    const [userId, setUserId] = useState(null)

    //image cropper
    // ...inside WorkforceReportForm component
    const [showCropper, setShowCropper] = useState(false);
    const [tempPreview, setTempPreview] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setTempPreview(url);
        setShowCropper(true);
    };

    // when cropper returns blob
    const handleCropDone = (blob) => {
        const croppedFile = new File([blob], `report-${Date.now()}.jpg`, { type: "image/jpeg" });
        setImageFile(croppedFile);
        setPreviewUrl(URL.createObjectURL(croppedFile));
        setShowCropper(false);
        // revoke the temp url to avoid leaks
        URL.revokeObjectURL(tempPreview);
        setTempPreview(null);
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        URL.revokeObjectURL(tempPreview);
        setTempPreview(null);
    };

    useEffect(() => {
        const fetchClients = async () => {
            try {

                if (selectedManager) {
                    const manClientsRes = await fetch("/api/manager/getclients/", {
                        method: "POST",
                        body: JSON.stringify({ id: selectedManager })
                    });
                    const manClientsData = await manClientsRes.json();
                    if (manClientsData.success) {
                        setManagerClients(manClientsData.clients);
                    }
                    else {
                        console.log(manClientsData.message)
                    }
                }
            } catch (error) {

                console.error("Error loading clients:", err);
            }
        }
        fetchClients()

    }, [selectedManager])





    // Fetch managers and clients from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const resManagers = await fetch("/api/superadmin/managers/list");
                const managersData = await resManagers.json();
                setManagers(managersData);

                const resClients = await fetch("/api/superadmin/clients/list");
                const clientsData = await resClients.json();
                setClients(clientsData);

                const idRes = await fetch("/api/auth/getuserid");
                const idData = await idRes.json();
                setUserId(idData);
                console.log(userId)
            } catch (err) {
                console.error("Error loading managers/clients:", err);
            }
        };
        fetchData();
    }, []);

    // Capture image
    // const handleImageChange = (e) => {
    //     setImageFile(e.target.files[0]);
    // };

    // Get elaborated text from Cohere
    const generateElaboration = async () => {
        if (!shortText) return alert("Please enter short text first.");
        setElaborateLoading(true);
        try {
            const res = await fetch("/api/elaborate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shortText }),
            });
            const data = await res.json();
            console.log(data)
            setElaboratedText(data.elaboratedText || "");
        } catch (err) {
            console.error(err);
        }
        setElaborateLoading(false);
    };

    // Submit report
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!shortText || !imageFile || !selectedManager || !selectedClient) {
            toast.error("some fields are missing")
            return
        }
        setLoading(true);

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);

        const cloudinaryRes = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME}/image/upload`,
            { method: "POST", body: formData }
        );
        const cloudinaryData = await cloudinaryRes.json();
        const imageUrl = cloudinaryData.secure_url;

        // Save report in DB
        const res = await fetch("/api/superadmin/workforce/report-submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                workforce_id: userId?.id,
                manager_id: selectedManager,
                client_id: selectedClient,
                short_text: shortText,
                elaborated_text: elaboratedText,
                image_url: imageUrl,
            }),
        });

        if (res.ok) {
            alert("Report submitted successfully!");
            setShortText("");
            setElaboratedText("");
            setImageFile(null);
            setSelectedManager("");
            setSelectedClient("");
        } else {
            alert("Failed to submit report.");
        }

        setLoading(false);
    };


    return (
        <div>
            <Navbar />
            <form
                onSubmit={handleSubmit}
                className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4"
            >
                <div className="bg-gray-900/60 backdrop-blur-lg p-8 rounded-xl shadow-lg w-full max-w-lg border border-gray-700 text-white">
                    <h2 className="text-2xl font-bold mb-6 text-green-400">Submit Report</h2>

                    {/* Manager Selection */}
                    <label className="block mb-2 font-medium">Select Manager</label>
                    <select
                        value={selectedManager}
                        onChange={(e) => setSelectedManager(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                    >
                        <option value="">-- Select Manager --</option>
                        {managers.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>

                    {/* Client Selection */}
                    <label className="block mb-2 font-medium">Select Client</label>
                    <select
                        disabled={!selectedManager}
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                    >
                        <option value="">-- Select Client -- </option>
                        {managerClients.length > 0 && managerClients.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    {/* Short Text */}
                    <label className="block mb-2 font-medium">Short Text</label>
                    <textarea
                        value={shortText}
                        onChange={(e) => setShortText(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                        rows={3}
                    />

                    {/* Generate Elaborated Text */}
                    <button
                        type="button"
                        onClick={generateElaboration}
                        className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-4 py-2 rounded-lg mb-4 w-full font-semibold"
                    >
                        {elaborateLoading ? "Generating..." : "Generate Elaborated Text"}
                    </button>

                    {/* Elaborated Text */}
                    <label className="block mb-2 font-medium">Elaborated Text</label>
                    <textarea
                        value={elaboratedText}
                        onChange={(e) => setElaboratedText(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                        rows={4}
                    />

                    {/* Image Capture */}
                    <label className="block mb-2 font-medium">Image (Capture from Camera)</label>
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageChange}
                        className="mb-4 block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 
                 file:rounded-lg file:border-0 file:text-sm file:font-semibold
                 file:bg-green-500 file:text-white hover:file:bg-green-600"
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-600 transition-colors text-white px-4 py-3 rounded-lg w-full font-semibold shadow-md disabled:opacity-50"
                    >
                        {loading ? "Submitting..." : "Submit Report"}
                    </button>
                </div>
            </form>
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
