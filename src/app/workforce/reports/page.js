'use client';
import { ImageCropper } from "@/components/ImageCropper";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Mic, MicOff } from "lucide-react";

export default function WorkforceReportForm() {
    const router = useRouter();
    const [shortText, setShortText] = useState("");
    const [elaboratedText, setElaboratedText] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imageFile2, setImageFile2] = useState(null);
    const [imageText, setImageText] = useState("");
    const [imageText2, setImageText2] = useState("");
    const [loading, setLoading] = useState(false);
    const [elaborateLoading, setElaborateLoading] = useState(false);

    const [managers, setManagers] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedManager, setSelectedManager] = useState("");
    const [selectedClient, setSelectedClient] = useState("");
    const [managerClients, setManagerClients] = useState([])
    const [userId, setUserId] = useState(null)
    const [clientName, setClientName] = useState("");
    
    // Report timing validation
    const [canSubmitReport, setCanSubmitReport] = useState(false);
    const [timingMessage, setTimingMessage] = useState("");
    const [checkingTiming, setCheckingTiming] = useState(false);
    
    // Weekly report fields
    const [weeklyReportFile, setWeeklyReportFile] = useState(null);
    const [weeklyReportLoading, setWeeklyReportLoading] = useState(false);
    //image cropper
    // ...inside WorkforceReportForm component
    const [showCropper, setShowCropper] = useState(false);
    const [tempPreview, setTempPreview] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewUrl2, setPreviewUrl2] = useState(null);
    const [currentImageType, setCurrentImageType] = useState(null); // 'before' or 'after'
    
    // Speech recognition states
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const [recognition, setRecognition] = useState(null);

    const handleImageChange = (e, imageType) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setTempPreview(url);
        setCurrentImageType(imageType);
        setShowCropper(true);
    };

    // when cropper returns blob
    const handleCropDone = (blob) => {
        const croppedFile = new File([blob], `report-${currentImageType}-${Date.now()}.jpg`, { type: "image/jpeg" });
        
        if (currentImageType === 'before') {
            setImageFile(croppedFile);
            setPreviewUrl(URL.createObjectURL(croppedFile));
        } else {
            setImageFile2(croppedFile);
            setPreviewUrl2(URL.createObjectURL(croppedFile));
        }
        
        setShowCropper(false);
        setCurrentImageType(null);
        // revoke the temp url to avoid leaks
        URL.revokeObjectURL(tempPreview);
        setTempPreview(null);
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        URL.revokeObjectURL(tempPreview);
        setTempPreview(null);
    };

    // Check if user can submit report for selected client
    const checkReportTiming = async (clientId) => {
        if (!clientId) {
            setCanSubmitReport(false);
            setTimingMessage("");
            return;
        }

        setCheckingTiming(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/workforce/check-report-timing`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientId }),
                credentials: "include",
            });

            const data = await res.json();
            
            if (res.ok) {
                setCanSubmitReport(data.canSubmit);
                setTimingMessage(data.message);
                
            } else {
                setCanSubmitReport(false);
                setTimingMessage(data.error || "Failed to check timing");
                toast.error(data.error || "Failed to check timing");
            }
        } catch (error) {
            console.error("Error checking timing:", error);
            setCanSubmitReport(false);
            setTimingMessage("Error checking report timing");
            toast.error("Error checking report timing");
        } finally {
            setCheckingTiming(false);
        }
    };

    useEffect(() => {
        const fetchClients = async () => {
            try {

                if (selectedManager) {
                    const manClientsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/manager/getclients/`, {
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

    // Check speech recognition support and initialize
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                setSpeechSupported(true);
                const recognitionInstance = new SpeechRecognition();
                recognitionInstance.continuous = false;
                recognitionInstance.interimResults = false;
                recognitionInstance.lang = 'en-US';
                
                recognitionInstance.onstart = () => {
                    setIsListening(true);
                };
                
                recognitionInstance.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    setShortText(prev => prev + (prev ? ' ' : '') + transcript);
                };
                
                recognitionInstance.onend = () => {
                    setIsListening(false);
                };
                
                recognitionInstance.onerror = (event) => {
                    setIsListening(false);
                    toast.error(`Speech recognition error: ${event.error}`);
                };
                
                setRecognition(recognitionInstance);
            } else {
                setSpeechSupported(false);
            }
        }
    }, []);





    // Fetch managers and clients from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const resManagers = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/superadmin/managers/list`);
                const managersData = await resManagers.json();
                setManagers(managersData);

                const resClients = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/superadmin/clients/list`);
                const clientsData = await resClients.json();
                setClients(clientsData);

                const idRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/getuserid`);
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
        if (!clientName) return alert("Please select a client first.");
        setElaborateLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/elaborate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shortText, clientName: clientName }),
            });
            const data = await res.json();
            console.log(data)
            setElaboratedText(data.elaboratedText || "");
        } catch (err) {
            console.error(err);
        }
        setElaborateLoading(false);
    };

    // Speech recognition functions
    const startListening = () => {
        if (recognition && speechSupported) {
            try {
                recognition.start();
                toast.success('Listening... Speak now!');
            } catch (error) {
                toast.error('Failed to start speech recognition');
            }
        } else {
            toast.error('Speech recognition not supported in this browser');
        }
    };

    const stopListening = () => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
        }
    };

         // Submit report
     const handleSubmit = async (e) => {
         e.preventDefault();
         if (!shortText || !imageFile || !selectedManager || !selectedClient) {
             toast.error("Some fields are missing")
             return
         }
         
         // Require weekly report when form is visible (on reporting days)
         if (canSubmitReport && !weeklyReportFile) {
             toast.error("Weekly report is required on reporting days")
             return
         }
        setLoading(true);

        try {
            // Upload first image to Cloudinary
            const formData = new FormData();
            formData.append("file", imageFile);
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);

            const cloudinaryRes = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME}/image/upload`,
                { method: "POST", body: formData }
            );
            const cloudinaryData = await cloudinaryRes.json();
            const imageUrl = cloudinaryData.secure_url;

            // Upload second image if exists
            let imageUrl2 = null;
            if (imageFile2) {
                const formData2 = new FormData();
                formData2.append("file", imageFile2);
                formData2.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);

                const cloudinaryRes2 = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME}/image/upload`,
                    { method: "POST", body: formData2 }
                );
                const cloudinaryData2 = await cloudinaryRes2.json();
                imageUrl2 = cloudinaryData2.secure_url;
            }

            // Upload weekly report if exists
            let weeklyReportUrl = null;
            if (weeklyReportFile) {
                setWeeklyReportLoading(true);
                const weeklyFormData = new FormData();
                weeklyFormData.append("file", weeklyReportFile);
                weeklyFormData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PDFPRESET);
                weeklyFormData.append("public_id", `workforce_weekly_reports/${Date.now()}_${weeklyReportFile.name}`);

                const weeklyUploadRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME}/raw/upload`,
                    { method: "POST", body: weeklyFormData }
                );
                const weeklyUploadData = await weeklyUploadRes.json();
                weeklyReportUrl = weeklyUploadData.secure_url;
                setWeeklyReportLoading(false);
            }

            // Save daily report in DB
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/superadmin/workforce/report-submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    workforce_id: userId?.id,
                    manager_id: selectedManager,
                    client_id: selectedClient,
                    short_text: shortText,
                    elaborated_text: elaboratedText,
                    image_url: imageUrl,
                    image_text: imageText,
                    image_url2: imageUrl2,
                    image_text2: imageText2,
                }),
            });

            // Submit weekly report if uploaded
            let weeklyReportSuccess = true;
            if (weeklyReportUrl) {
                const weeklyRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/workforce/send-weekly-report`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        pdfUrl: weeklyReportUrl,
                        report_id: (await res.json()).report_id,
                    }),
                    credentials: "include",
                });
                
                const weeklyData = await weeklyRes.json();
                if (!weeklyData.success) {
                    weeklyReportSuccess = false;
                    console.error("Weekly report submission failed:", weeklyData.error);
                }
            }

            if (res.ok) {
                if (weeklyReportSuccess) {
                    toast.success("Report submitted successfully!");
                    router.push("/workforce/status?pending=true");
                } else {
                    toast.success("Report submitted successfully! Weekly report submission failed.");
                }
                
                // Reset form
                setShortText("");
                setElaboratedText("");
                setImageFile(null);
                setImageFile2(null);
                setImageText("");
                setImageText2("");
                setPreviewUrl(null);
                setPreviewUrl2(null);
                setWeeklyReportFile(null);
                setSelectedManager("");
                setSelectedClient("");
                setCanSubmitReport(false);
                setTimingMessage("");
            } else {
                toast.error("Failed to submit daily report.");
            }
        } catch (error) {
            console.error("Error submitting report:", error);
            toast.error("An error occurred while submitting the report");
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
                        onChange={(e) => {
                            const clientId = e.target.value;
                            setSelectedClient(clientId);
                            setClientName(e.target.options[e.target.selectedIndex].text);
                            
                            // Reset form fields when client changes
                            setCanSubmitReport(false);
                            setTimingMessage("");
                            
                            // Check timing for new client
                            if (clientId) {
                                checkReportTiming(clientId);
                            }
                        }}
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                    >
                        <option value="">-- Select Client -- </option>
                        {managerClients.length > 0 && managerClients.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                                         </select>

                    
                    
                            {/* Short Text with Microphone */}
                    <label className="block mb-2 font-medium">Short Text</label>
                    <div className="relative mb-4">
                        <textarea
                            value={shortText}
                            onChange={(e) => setShortText(e.target.value)}
                            className="w-full p-3 pr-12 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            rows={3}
                            placeholder="Type your short text here or use the microphone..."
                        />
                        {speechSupported && (
                            <button
                                type="button"
                                onClick={isListening ? stopListening : startListening}
                                className={`absolute right-2 top-2 p-2 rounded-lg transition-colors ${
                                    isListening 
                                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                                title={isListening ? 'Stop listening' : 'Start voice input'}
                            >
                                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                            </button>
                        )}
                    </div>

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

                    {/* Before Image Section */}
                    <div className="mb-4">
                        
                        {previewUrl && (
                            <div className="mt-2">
                                <label className="block mb-2 font-medium">Title for Before Image</label>
                                <input
                                    type="text"
                                    placeholder="Enter title for before image"
                                    value={imageText}
                                    onChange={(e) => setImageText(e.target.value)}
                                    className="w-full mb-2 p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <img src={previewUrl} alt="Before" className="w-full h-32 object-cover rounded-lg mb-2" />
                            </div>
                        )}
                        <label className="block mb-2 font-medium">Before Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleImageChange(e, 'before')}
                            className="mb-2 block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 
                     file:rounded-lg file:border-0 file:text-sm file:font-semibold
                     file:bg-green-500 file:text-white hover:file:bg-green-600"
                        />
                        
                        {/* Preview and Title for Before Image */}
                    </div>

                    {/* After Image Section */}
                    <div className="my-8">
                    
                        {/* Preview and Title for After Image */}
                        {previewUrl2 && (
                            <div className="mt-">
                                <label className="block mb-2 font-medium">Title for After Image</label>
                                <input
                                    type="text"
                                    placeholder="Enter title for after image"
                                    value={imageText2}
                                    onChange={(e) => setImageText2(e.target.value)}
                                    className="w-full mb-2 p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <img src={previewUrl2} alt="After" className="w-full h-32 object-cover rounded-lg mb-2" />
                            </div>
                        )}
                        <label className="block mb-2 font-medium">After Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleImageChange(e, 'after')}
                            className="mb-2 block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 
                     file:rounded-lg file:border-0 file:text-sm file:font-semibold
                     file:bg-green-500 file:text-white hover:file:bg-green-600"
                        />
                        
                                                                                 </div>


                     {/* Weekly Report Section - Required on reporting days */}
                     {canSubmitReport && (
                     <div className="mb-6">
                         <label className="block mb-2 font-medium">
                             Weekly Report <span className="text-red-400">*</span>
                             <span className="text-sm text-gray-400 block">Required on reporting days</span>
                         </label>
                         <input
                             type="file"
                             accept=".pdf,.doc,.docx,.xls,.xlsx"
                             onChange={(e) => setWeeklyReportFile(e.target.files[0])}
                             className="mb-2 block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 
                      file:rounded-lg file:border-0 file:text-sm file:font-semibold
                      file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                             required
                         />
                         {weeklyReportFile && (
                             <div className="mt-2 p-3 bg-blue-900/30 border border-blue-600/50 rounded-lg">
                                 <p className="text-sm text-blue-300 flex items-center gap-2">
                                     📄 Selected: {weeklyReportFile.name} ({(weeklyReportFile.size / 1024 / 1024).toFixed(2)} MB)
                                 </p>
                             </div>
                         )}
                         <p className="mt-1 text-xs text-gray-400">
                             Supported formats: PDF, DOC, DOCX, XLS, XLSX (Max 10MB)
                         </p>
                     </div>
                     )}

                     {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || weeklyReportLoading}
                        className="bg-green-500 hover:bg-green-600 transition-colors text-white px-4 py-3 rounded-lg w-full font-semibold shadow-md disabled:opacity-50"
                    >
                        {loading 
                            ? "Submitting..." 
                            : "Submit"
                        }
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
